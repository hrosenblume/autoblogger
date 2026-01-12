export function createTagsData(prisma: any) {
  return {
    async findAll() {
      return prisma.tag.findMany({
        orderBy: { name: 'asc' },
        include: {
          _count: { select: { posts: true } },
        },
      })
    },

    async findAllWithCounts() {
      return prisma.tag.findMany({
        orderBy: { name: 'asc' },
        include: {
          _count: { select: { posts: true } },
        },
      })
    },

    async count() {
      return prisma.tag.count()
    },

    async findById(id: string) {
      return prisma.tag.findUnique({
        where: { id },
        include: { posts: { include: { post: true } } },
      })
    },

    async findByName(name: string) {
      return prisma.tag.findUnique({ where: { name } })
    },

    async create(name: string) {
      return prisma.tag.create({ data: { name } })
    },

    async update(id: string, name: string) {
      return prisma.tag.update({ where: { id }, data: { name } })
    },

    async delete(id: string) {
      return prisma.tag.delete({ where: { id } })
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
