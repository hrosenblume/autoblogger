import type { Post } from '../types'
import { PostStatus } from '../types/models'
import type { DestinationDispatcher } from '../destinations'
import { createPrismicDestination } from '../destinations/prismic'

interface PostHooks {
  beforePublish?: (post: Post) => Promise<void>
  afterSave?: (post: Post) => Promise<void>
  /** Called when a slug changes on a post that was previously published. Used to create redirects. */
  onSlugChange?: (data: { postId: string; oldSlug: string; newSlug: string }) => Promise<void>
}

interface CreatePostInput {
  title: string
  subtitle?: string
  slug?: string
  markdown?: string
  status?: string
  [key: string]: unknown
}

interface UpdatePostInput {
  title?: string
  subtitle?: string
  slug?: string
  markdown?: string
  status?: string
  publishedAt?: Date
  [key: string]: unknown
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

async function generateUniqueSlug(prisma: any, baseSlug: string, excludeId?: string): Promise<string> {
  let slug = baseSlug
  let counter = 1
  
  while (true) {
    const existing = await prisma.post.findFirst({
      where: {
        slug,
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
      },
    })
    
    if (!existing) return slug
    
    counter++
    slug = `${baseSlug}-${counter}`
  }
}

/**
 * Fire the dynamic Prismic destination if enabled in IntegrationSettings.
 * This runs in the background and does not block the main response.
 */
async function fireDynamicPrismicDestination(
  prisma: any, 
  post: Post, 
  event: 'publish' | 'unpublish' | 'delete',
  envWriteToken?: string
): Promise<void> {
  try {
    // Check if Prismic integration is enabled in DB
    const settings = await prisma.integrationSettings.findUnique({
      where: { id: 'default' },
    })

    if (!settings?.prismicEnabled || !settings?.prismicRepository) {
      return // Prismic not enabled or not configured
    }

    // Use DB token or fall back to env token passed from host app config
    const writeToken = settings.prismicWriteToken || envWriteToken
    if (!writeToken) {
      console.warn('[autoblogger] Prismic enabled but no write token configured')
      return
    }

    // Create dynamic Prismic destination from DB settings
    const prismicDest = createPrismicDestination({
      repository: settings.prismicRepository,
      writeToken: writeToken,
      documentType: settings.prismicDocumentType || 'autoblog',
      syncMode: (settings.prismicSyncMode as 'stub' | 'full') || 'stub',
      masterLocale: settings.prismicLocale || 'en-us',
      autoRename: settings.prismicAutoRename ?? false,
    })

    // Fire the appropriate event
    if (event === 'publish') {
      await prismicDest.onPublish(post)
    } else if (event === 'unpublish') {
      await prismicDest.onUnpublish(post)
    } else if (event === 'delete') {
      await prismicDest.onDelete(post)
    }
  } catch (error) {
    console.error('[autoblogger] Failed to fire dynamic Prismic destination:', error)
  }
}

export function createPostsData(prisma: any, hooks?: PostHooks, dispatcher?: DestinationDispatcher, prismicEnvToken?: string) {
  return {
    async count(where?: { status?: string }) {
      return prisma.post.count({ where })
    },

    async findPublished() {
      return prisma.post.findMany({
        where: { status: PostStatus.PUBLISHED },
        orderBy: { publishedAt: 'desc' },
      })
    },

    async findBySlug(slug: string) {
      return prisma.post.findUnique({
        where: { slug },
        include: { tags: { include: { tag: true } } },
      })
    },

    async findById(id: string) {
      return prisma.post.findUnique({
        where: { id },
        include: { tags: { include: { tag: true } } },
      })
    },

    async findDrafts() {
      return prisma.post.findMany({
        where: { status: PostStatus.DRAFT },
        orderBy: { updatedAt: 'desc' },
      })
    },

    async findAll(options?: { 
      status?: string
      orderBy?: any
      skip?: number
      take?: number
      includeRevisionCount?: boolean
    }) {
      return prisma.post.findMany({
        where: options?.status ? { status: options.status } : undefined,
        orderBy: options?.orderBy || { updatedAt: 'desc' },
        include: { 
          tags: { include: { tag: true } },
          ...(options?.includeRevisionCount ? { _count: { select: { revisions: true } } } : {}),
        },
        skip: options?.skip,
        take: options?.take,
      })
    },

    async create(data: CreatePostInput) {
      // Extract tagIds before passing to Prisma
      const { tagIds, ...postData } = data as CreatePostInput & { tagIds?: string[] }
      
      const slug = postData.slug 
        ? await generateUniqueSlug(prisma, postData.slug)
        : await generateUniqueSlug(prisma, slugify(postData.title))

      const post = await prisma.post.create({
        data: {
          ...postData,
          slug,
          markdown: postData.markdown || '',
          status: postData.status || PostStatus.DRAFT,
        },
      })

      // Create tag associations if provided
      if (tagIds?.length) {
        await prisma.postTag.createMany({
          data: tagIds.map((tagId: string) => ({ postId: post.id, tagId })),
        })
      }

      // Fetch with tags included
      const result = await prisma.post.findUnique({
        where: { id: post.id },
        include: { tags: { include: { tag: true } } },
      })

      if (hooks?.afterSave) {
        await hooks.afterSave(result)
      }

      return result
    },

    async update(id: string, data: UpdatePostInput) {
      // Extract relation IDs, computed fields, and read-only fields before passing to Prisma
      const { 
        tagIds, 
        tags, 
        revisions, 
        topic,
        topicId,                    // Handle separately as relation
        id: _id,                    // Don't update the ID
        createdAt: _createdAt,      // Don't update createdAt
        wordCount: _wordCount,      // Computed field, don't save
        ...postData 
      } = data as UpdatePostInput & { 
        tagIds?: string[]
        tags?: unknown
        revisions?: unknown
        topic?: unknown
        topicId?: string | null
        id?: string
        createdAt?: Date
        wordCount?: number
      }
      
      // Track if this is a publish, unpublish, or update of published content
      let isPublishing = false
      let isUnpublishing = false
      let isUpdatingPublished = false

      // Fetch existing post to determine state changes
      const existing = await prisma.post.findUnique({ where: { id } })

      // Check if content that affects external destinations has changed
      // For code-configured destinations (full sync mode), check title, slug, and content
      const hasDestinationChanges = existing && (
        (postData.title !== undefined && postData.title !== existing.title) ||
        (postData.slug !== undefined && postData.slug !== existing.slug) ||
        (postData.markdown !== undefined && postData.markdown !== existing.markdown)
      )
      
      // For dynamic Prismic destination (stub mode), only slug and title changes matter
      // Content doesn't need to sync since it lives in autoblogger, not Prismic
      const hasSlugChange = existing && postData.slug !== undefined && postData.slug !== existing.slug
      const hasTitleChange = existing && postData.title !== undefined && postData.title !== existing.title

      // Auto-set publishedAt on first publish
      if (postData.status === PostStatus.PUBLISHED) {
        if (existing?.status !== PostStatus.PUBLISHED) {
          postData.publishedAt = new Date()
          isPublishing = true
          
          if (hooks?.beforePublish) {
            await hooks.beforePublish(existing)
          }
        } else if (hasDestinationChanges) {
          // Post is already published AND has content changes - sync to destinations
          isUpdatingPublished = true
        }
      } else if (postData.status === PostStatus.DRAFT) {
        // Check if unpublishing (from published to draft)
        if (existing?.status === PostStatus.PUBLISHED) {
          isUnpublishing = true
        }
      } else if (postData.status === undefined && existing?.status === PostStatus.PUBLISHED && hasDestinationChanges) {
        // Status not changing but post is published AND has changes - sync to destinations
        isUpdatingPublished = true
      }

      // Handle slug uniqueness if slug is being changed
      if (postData.slug) {
        postData.slug = await generateUniqueSlug(prisma, postData.slug, id)
      }

      // Build the update payload
      const updatePayload: any = { ...postData }

      // Handle topic relation properly using connect/disconnect syntax
      if (topicId !== undefined) {
        updatePayload.topic = topicId ? { connect: { id: topicId } } : { disconnect: true }
      }

      const post = await prisma.post.update({
        where: { id },
        data: updatePayload,
      })

      // Update tag associations if provided
      if (tagIds !== undefined) {
        // Delete existing tags and create new ones
        await prisma.postTag.deleteMany({ where: { postId: id } })
        if (tagIds.length) {
          await prisma.postTag.createMany({
            data: tagIds.map((tagId: string) => ({ postId: id, tagId })),
          })
        }
      }

      // Fetch with tags included
      const result = await prisma.post.findUnique({
        where: { id },
        include: { tags: { include: { tag: true } } },
      })

      if (hooks?.afterSave) {
        await hooks.afterSave(result)
      }

      // Check for slug change on a previously-published post (create redirect)
      const oldSlug = existing?.slug
      const newSlug = postData.slug
      const slugChanged = oldSlug && newSlug && newSlug !== oldSlug
      const wasPublished = existing?.publishedAt !== null
      if (slugChanged && wasPublished && hooks?.onSlugChange) {
        hooks.onSlugChange({
          postId: id,
          oldSlug,
          newSlug,
        }).catch((err) => {
          console.error('[autoblogger] Failed to handle slug change:', err)
        })
      }

      // Fire destination events after save
      if (isPublishing || isUnpublishing || isUpdatingPublished) {
        // Fire code-configured dispatcher (full sync mode - syncs on all content changes)
        if (dispatcher) {
          if (isPublishing || isUpdatingPublished) {
            // Both new publish and updates to published content use onPublish
            dispatcher.publish(result).catch((err) => {
              console.error('[autoblogger] Failed to dispatch publish event:', err)
            })
          } else if (isUnpublishing) {
            dispatcher.unpublish(result).catch((err) => {
              console.error('[autoblogger] Failed to dispatch unpublish event:', err)
            })
          }
        }
      }
      
      // Fire dynamic Prismic destination separately (stub mode - only on publish/unpublish/slug/title changes)
      // Don't sync on content-only saves - only when document needs to be created, UID updated, or name updated
      if (isPublishing || isUnpublishing || (isUpdatingPublished && (hasSlugChange || hasTitleChange))) {
        const event = isUnpublishing ? 'unpublish' : 'publish'
        fireDynamicPrismicDestination(prisma, result, event, prismicEnvToken)
      }

      return result
    },

    async delete(id: string) {
      // Get the post before deleting to pass to dispatcher
      const existing = await prisma.post.findUnique({
        where: { id },
        include: { tags: { include: { tag: true } } },
      })

      // Soft delete - set status to 'deleted' instead of removing
      const result = await prisma.post.update({ 
        where: { id },
        data: { status: PostStatus.DELETED },
      })

      // Fire delete event if the post was published
      if (existing?.status === PostStatus.PUBLISHED) {
        if (dispatcher) {
          dispatcher.delete(existing).catch((err) => {
            console.error('[autoblogger] Failed to dispatch delete event:', err)
          })
        }
        
        // Fire dynamic Prismic destination if enabled
        fireDynamicPrismicDestination(prisma, existing, 'delete', prismicEnvToken)
      }

      return result
    },

    async getPreviewUrl(id: string, basePath: string = '/e') {
      const token = crypto.randomUUID()
      const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

      const post = await prisma.post.update({
        where: { id },
        data: { previewToken: token, previewExpiry: expiry },
      })

      return `${basePath}/${post.slug}?preview=${token}`
    },

    async findByPreviewToken(token: string) {
      const post = await prisma.post.findFirst({
        where: {
          previewToken: token,
          previewExpiry: { gt: new Date() },
        },
      })
      return post
    },
  }
}
