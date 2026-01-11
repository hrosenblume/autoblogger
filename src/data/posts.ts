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

    async findAll(options?: { status?: string; orderBy?: any }) {
      return prisma.post.findMany({
        where: options?.status ? { status: options.status } : undefined,
        orderBy: options?.orderBy || { updatedAt: 'desc' },
        include: { tags: { include: { tag: true } } },
      })
    },

    async create(data: CreatePostInput) {
      const slug = data.slug 
        ? await generateUniqueSlug(prisma, data.slug)
        : await generateUniqueSlug(prisma, slugify(data.title))

      const post = await prisma.post.create({
        data: {
          ...data,
          slug,
          markdown: data.markdown || '',
          status: data.status || 'draft',
        },
      })

      if (hooks?.afterSave) {
        await hooks.afterSave(post)
      }

      return post
    },

    async update(id: string, data: UpdatePostInput) {
      // Auto-set publishedAt on first publish
      if (data.status === 'published') {
        const existing = await prisma.post.findUnique({ where: { id } })
        if (existing?.status !== 'published') {
          data.publishedAt = new Date()
          
          if (hooks?.beforePublish) {
            await hooks.beforePublish(existing)
          }
        }
      }

      // Handle slug uniqueness if slug is being changed
      if (data.slug) {
        data.slug = await generateUniqueSlug(prisma, data.slug, id)
      }

      const post = await prisma.post.update({
        where: { id },
        data,
      })

      if (hooks?.afterSave) {
        await hooks.afterSave(post)
      }

      return post
    },

    async delete(id: string) {
      return prisma.post.delete({ where: { id } })
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
