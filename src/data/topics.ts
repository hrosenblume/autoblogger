interface CreateTopicInput {
  name: string
  keywords?: string[]
  rssFeeds?: string[]
  isActive?: boolean
  useKeywordFilter?: boolean
  frequency?: string
  maxPerPeriod?: number
  essayFocus?: string
}

interface UpdateTopicInput {
  name?: string
  keywords?: string[]
  rssFeeds?: string[]
  isActive?: boolean
  useKeywordFilter?: boolean
  frequency?: string
  maxPerPeriod?: number
  essayFocus?: string
  lastRunAt?: Date
}

export function createTopicsData(prisma: any) {
  return {
    async findAll() {
      return prisma.topicSubscription.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          _count: { select: { posts: true, newsItems: true } },
        },
      })
    },

    async findActive() {
      return prisma.topicSubscription.findMany({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' },
      })
    },

    async findById(id: string) {
      return prisma.topicSubscription.findUnique({
        where: { id },
        include: { posts: true, newsItems: true },
      })
    },

    async create(data: CreateTopicInput) {
      return prisma.topicSubscription.create({
        data: {
          name: data.name,
          keywords: JSON.stringify(data.keywords || []),
          rssFeeds: JSON.stringify(data.rssFeeds || []),
          isActive: data.isActive ?? true,
          useKeywordFilter: data.useKeywordFilter ?? true,
          frequency: data.frequency || 'daily',
          maxPerPeriod: data.maxPerPeriod || 3,
          essayFocus: data.essayFocus,
        },
      })
    },

    async update(id: string, data: UpdateTopicInput) {
      const updateData: any = { ...data }
      
      if (data.keywords) {
        updateData.keywords = JSON.stringify(data.keywords)
      }
      if (data.rssFeeds) {
        updateData.rssFeeds = JSON.stringify(data.rssFeeds)
      }

      return prisma.topicSubscription.update({
        where: { id },
        data: updateData,
      })
    },

    async delete(id: string) {
      return prisma.topicSubscription.delete({ where: { id } })
    },

    async markRun(id: string) {
      return prisma.topicSubscription.update({
        where: { id },
        data: { lastRunAt: new Date() },
      })
    },
  }
}
