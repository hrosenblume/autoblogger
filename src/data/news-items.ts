import { PostStatus } from '../types/models'

interface CreateNewsItemInput {
  topicId: string
  url: string
  title: string
  summary?: string
  publishedAt?: Date
}

export function createNewsItemsData(prisma: any) {
  return {
    async findPending() {
      return prisma.newsItem.findMany({
        where: { status: 'pending' },
        orderBy: { createdAt: 'desc' },
        include: { topic: true },
      })
    },

    async findByTopic(topicId: string) {
      return prisma.newsItem.findMany({
        where: { topicId },
        orderBy: { createdAt: 'desc' },
      })
    },

    async findById(id: string) {
      return prisma.newsItem.findUnique({
        where: { id },
        include: { topic: true, post: true },
      })
    },

    async create(data: CreateNewsItemInput) {
      // Check if URL already exists
      const existing = await prisma.newsItem.findUnique({
        where: { url: data.url },
      })
      
      if (existing) {
        return existing
      }

      return prisma.newsItem.create({ data })
    },

    async skip(id: string) {
      return prisma.newsItem.update({
        where: { id },
        data: { status: 'skipped' },
      })
    },

    async markGenerated(id: string, postId: string) {
      return prisma.newsItem.update({
        where: { id },
        data: { status: 'generated', postId },
      })
    },

    async delete(id: string) {
      return prisma.newsItem.delete({ where: { id } })
    },

    // This would be called by the auto-draft system
    async generateDraft(id: string, createPost: (data: any) => Promise<any>) {
      const newsItem = await prisma.newsItem.findUnique({
        where: { id },
        include: { topic: true },
      })

      if (!newsItem) throw new Error('News item not found')

      // Create draft post
      const post = await createPost({
        title: newsItem.title,
        markdown: newsItem.summary || '',
        status: PostStatus.SUGGESTED,
        sourceUrl: newsItem.url,
        topicId: newsItem.topicId,
      })

      // Mark as generated
      await prisma.newsItem.update({
        where: { id },
        data: { status: 'generated', postId: post.id },
      })

      return post
    },
  }
}
