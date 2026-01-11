interface CommentsConfig {
  mode?: 'authenticated' | 'public' | 'disabled'
}

interface CreateCommentInput {
  postId: string
  content: string
  authorId?: string
  authorName?: string
  authorEmail?: string
}

export function createCommentsData(prisma: any, config?: CommentsConfig) {
  const mode = config?.mode || 'authenticated'

  return {
    async findByPost(postId: string) {
      if (mode === 'disabled') return []
      
      return prisma.comment.findMany({
        where: { postId, approved: true },
        orderBy: { createdAt: 'desc' },
      })
    },

    async findAll(options?: { postId?: string; approved?: boolean }) {
      if (mode === 'disabled') return []
      
      return prisma.comment.findMany({
        where: {
          ...(options?.postId ? { postId: options.postId } : {}),
          ...(options?.approved !== undefined ? { approved: options.approved } : {}),
        },
        orderBy: { createdAt: 'desc' },
        include: { post: { select: { id: true, title: true, slug: true } } },
      })
    },

    async create(data: CreateCommentInput) {
      if (mode === 'disabled') {
        throw new Error('Comments are disabled')
      }

      return prisma.comment.create({
        data: {
          ...data,
          approved: mode === 'authenticated', // Auto-approve for authenticated users
        },
      })
    },

    async approve(id: string) {
      return prisma.comment.update({
        where: { id },
        data: { approved: true },
      })
    },

    async delete(id: string) {
      return prisma.comment.delete({ where: { id } })
    },

    getMode() {
      return mode
    },
  }
}
