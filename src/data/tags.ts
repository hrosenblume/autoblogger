import { createCrudData } from './factory'

export function createTagsData(prisma: any) {
  const base = createCrudData(prisma, {
    model: 'tag',
    defaultOrderBy: { name: 'asc' },
    defaultInclude: { _count: { select: { posts: true } } },
  })

  return {
    ...base,

    // Alias for backward compatibility
    async findAllWithCounts() {
      return base.findAll()
    },

    async findByName(name: string) {
      return prisma.tag.findUnique({ where: { name } })
    },

    // Override create to accept string directly
    async create(name: string) {
      return prisma.tag.create({ data: { name } })
    },

    // Override update to accept name directly
    async update(id: string, name: string) {
      return prisma.tag.update({ where: { id }, data: { name } })
    },

    async addToPost(postId: string, tagId: string) {
      return prisma.postTag.create({
        data: { postId, tagId },
      })
    },

    async removeFromPost(postId: string, tagId: string) {
      return prisma.postTag.deleteMany({
        where: { postId, tagId },
      })
    },

    async getPostTags(postId: string) {
      const postTags = await prisma.postTag.findMany({
        where: { postId },
        include: { tag: true },
      })
      return postTags.map((pt: any) => pt.tag)
    },
  }
}
