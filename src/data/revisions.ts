export function createRevisionsData(prisma: any) {
  return {
    async findByPost(postId: string) {
      return prisma.revision.findMany({
        where: { postId },
        orderBy: { createdAt: 'desc' },
      })
    },

    async findById(id: string) {
      return prisma.revision.findUnique({ where: { id } })
    },

    async create(postId: string, data: { title?: string; subtitle?: string; markdown: string }) {
      return prisma.revision.create({
        data: { postId, ...data },
      })
    },

    async restore(revisionId: string) {
      const revision = await prisma.revision.findUnique({ where: { id: revisionId } })
      if (!revision) throw new Error('Revision not found')

      return prisma.post.update({
        where: { id: revision.postId },
        data: {
          title: revision.title,
          subtitle: revision.subtitle,
          markdown: revision.markdown,
        },
      })
    },

    async compare(revisionId1: string, revisionId2: string) {
      const [rev1, rev2] = await Promise.all([
        prisma.revision.findUnique({ where: { id: revisionId1 } }),
        prisma.revision.findUnique({ where: { id: revisionId2 } }),
      ])

      if (!rev1 || !rev2) throw new Error('Revision not found')

      return {
        older: rev1.createdAt < rev2.createdAt ? rev1 : rev2,
        newer: rev1.createdAt < rev2.createdAt ? rev2 : rev1,
      }
    },

    async pruneOldest(postId: string, keepCount: number) {
      const revisions = await prisma.revision.findMany({
        where: { postId },
        orderBy: { createdAt: 'desc' },
        skip: keepCount,
        select: { id: true },
      })

      if (revisions.length > 0) {
        await prisma.revision.deleteMany({
          where: { id: { in: revisions.map((r: any) => r.id) } },
        })
      }

      return revisions.length
    },

    async delete(id: string) {
      return prisma.revision.delete({ where: { id } })
    },
  }
}
