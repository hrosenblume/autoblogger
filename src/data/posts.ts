import type { Post } from '../types'

interface PostHooks {
  beforePublish?: (post: Post) => Promise<void>
  afterSave?: (post: Post) => Promise<void>
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

export function createPostsData(prisma: any, hooks?: PostHooks) {
  return {
    async count(where?: { status?: string }) {
      return prisma.post.count({ where })
    },

    async findPublished() {
      return prisma.post.findMany({
        where: { status: 'published' },
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
        where: { status: 'draft' },
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
          status: postData.status || 'draft',
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
      // Extract tagIds and strip relation fields before passing to Prisma
      const { tagIds, tags, revisions, topic, ...postData } = data as UpdatePostInput & { 
        tagIds?: string[]
        tags?: unknown
        revisions?: unknown
        topic?: unknown
      }
      
      // Auto-set publishedAt on first publish
      if (postData.status === 'published') {
        const existing = await prisma.post.findUnique({ where: { id } })
        if (existing?.status !== 'published') {
          postData.publishedAt = new Date()
          
          if (hooks?.beforePublish) {
            await hooks.beforePublish(existing)
          }
        }
      }

      // Handle slug uniqueness if slug is being changed
      if (postData.slug) {
        postData.slug = await generateUniqueSlug(prisma, postData.slug, id)
      }

      const post = await prisma.post.update({
        where: { id },
        data: postData,
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

      return result
    },

    async delete(id: string) {
      // Soft delete - set status to 'deleted' instead of removing
      return prisma.post.update({ 
        where: { id },
        data: { status: 'deleted' },
      })
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
