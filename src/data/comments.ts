/**
 * Comments data layer for autoblogger.
 * Supports both public blog comments (simple) and editor comments (with quotedText, replies, resolve).
 */

interface CommentsConfig {
  mode?: 'authenticated' | 'public' | 'disabled'
}

// Editor comment with full features
interface EditorComment {
  id: string
  postId: string
  userId: string
  quotedText: string
  content: string
  parentId: string | null
  resolved: boolean
  createdAt: Date
  updatedAt: Date
  user: {
    id: string
    name: string | null
    email: string
  }
  replies?: EditorComment[]
}

interface CreateEditorCommentInput {
  postId: string
  quotedText: string
  content: string
  parentId?: string
}

// Simple public comment (for blog post comments)
interface CreatePublicCommentInput {
  postId: string
  content: string
  authorId?: string
  authorName?: string
  authorEmail?: string
}

export function createCommentsData(prisma: any, config?: CommentsConfig) {
  const mode = config?.mode || 'authenticated'

  return {
    async count() {
      if (mode === 'disabled') return 0
      return prisma.comment.count()
    },

    // Public blog comments (original simple system)
    async findByPost(postId: string) {
      if (mode === 'disabled') return []
      
      return prisma.comment.findMany({
        where: { postId, approved: true },
        orderBy: { createdAt: 'desc' },
      })
    },

    async findAll(options?: { postId?: string; approved?: boolean; page?: number; limit?: number }) {
      if (mode === 'disabled') return { data: [], total: 0, page: 1, totalPages: 1 }
      
      const page = options?.page || 1
      const limit = options?.limit || 25
      const skip = (page - 1) * limit

      const where = {
        ...(options?.postId ? { postId: options.postId } : {}),
        ...(options?.approved !== undefined ? { approved: options.approved } : {}),
      }

      const [comments, total] = await Promise.all([
        prisma.comment.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
          include: { 
            post: { select: { id: true, title: true, slug: true } },
            user: { select: { id: true, name: true, email: true } },
          },
        }),
        prisma.comment.count({ where }),
      ])

      return {
        data: comments,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      }
    },

    async create(data: CreatePublicCommentInput) {
      if (mode === 'disabled') {
        throw new Error('Comments are disabled')
      }

      return prisma.comment.create({
        data: {
          ...data,
          approved: mode === 'authenticated',
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

    // ========================================
    // Editor comments (with quotedText, replies, resolve)
    // ========================================

    /**
     * Find all editor comments for a post with nested replies.
     */
    async findEditorComments(postId: string, userId?: string): Promise<EditorComment[]> {
      if (mode === 'disabled') return []

      // Fetch all non-deleted comments for the post
      const allComments = await prisma.comment.findMany({
        where: {
          postId,
          deletedAt: null,
        },
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      })

      // Separate top-level and replies
      const topLevel = allComments.filter((c: any) => !c.parentId)
      const replies = allComments.filter((c: any) => c.parentId)

      // Attach replies to their parents
      return topLevel.map((comment: any) => ({
        ...comment,
        replies: replies.filter((r: any) => r.parentId === comment.id),
      }))
    },

    /**
     * Create an editor comment (with quotedText and optional parentId for replies).
     */
    async createEditorComment(
      postId: string,
      userId: string,
      data: CreateEditorCommentInput
    ): Promise<EditorComment> {
      if (mode === 'disabled') {
        throw new Error('Comments are disabled')
      }

      const comment = await prisma.comment.create({
        data: {
          postId,
          userId,
          quotedText: data.quotedText || '',
          content: data.content,
          parentId: data.parentId || null,
          resolved: false,
        },
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      })

      return { ...comment, replies: [] }
    },

    /**
     * Update a comment's content.
     */
    async updateEditorComment(
      commentId: string,
      content: string,
      userId?: string
    ): Promise<EditorComment> {
      const comment = await prisma.comment.update({
        where: { id: commentId },
        data: { content },
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      })

      return comment
    },

    /**
     * Soft delete a comment.
     */
    async deleteEditorComment(commentId: string): Promise<void> {
      // Check if the schema has deletedAt field
      const hasDeletedAt = await prisma.comment.findFirst({
        where: { id: commentId },
        select: { id: true },
      })

      if (hasDeletedAt) {
        // Try soft delete first, fall back to hard delete
        try {
          await prisma.comment.update({
            where: { id: commentId },
            data: { deletedAt: new Date() },
          })
        } catch {
          // Schema doesn't have deletedAt, do hard delete
          await prisma.comment.delete({ where: { id: commentId } })
        }
      }
    },

    /**
     * Toggle resolved status.
     */
    async toggleResolve(commentId: string): Promise<EditorComment> {
      const current = await prisma.comment.findUnique({
        where: { id: commentId },
        select: { resolved: true },
      })

      const comment = await prisma.comment.update({
        where: { id: commentId },
        data: { resolved: !current?.resolved },
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      })

      return comment
    },

    /**
     * Resolve all open comments for a post.
     */
    async resolveAll(postId: string): Promise<{ resolved: number }> {
      const result = await prisma.comment.updateMany({
        where: {
          postId,
          resolved: false,
          parentId: null, // Only top-level comments
        },
        data: { resolved: true },
      })

      return { resolved: result.count }
    },
  }
}
