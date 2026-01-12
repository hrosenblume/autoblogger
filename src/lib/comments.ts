/**
 * Comment types and client-side API helpers for the editor commenting system.
 * Used for collaborative inline comments on posts.
 */

// Types matching Prisma schema + includes
export interface CommentUser {
  id: string
  name: string | null
  email: string
}

export interface CommentWithUser {
  id: string
  postId: string
  userId: string
  quotedText: string
  content: string
  parentId: string | null
  resolved: boolean
  createdAt: string
  updatedAt: string
  user: CommentUser
  replies?: CommentWithUser[]
}

export interface CreateCommentData {
  quotedText: string
  content: string
  parentId?: string
}

export interface SelectionState {
  text: string
  from: number
  to: number
  hasExistingComment?: boolean
}

// Permission helpers (compare by email since that's what we have in session)
export function canDeleteComment(
  comment: CommentWithUser,
  currentUserEmail: string,
  isAdmin: boolean
): boolean {
  return comment.user.email === currentUserEmail || isAdmin
}

export function canEditComment(
  comment: CommentWithUser,
  currentUserEmail: string
): boolean {
  return comment.user.email === currentUserEmail
}

// API client factory - creates functions bound to a specific API base path
export function createCommentsClient(apiBasePath: string = '/api/cms') {
  return {
    async fetchComments(postId: string): Promise<CommentWithUser[]> {
      const res = await fetch(`${apiBasePath}/posts/${postId}/comments`)
      if (!res.ok) throw new Error('Failed to fetch comments')
      const json = await res.json()
      return json.data || json
    },

    async createComment(
      postId: string,
      data: CreateCommentData
    ): Promise<CommentWithUser> {
      const res = await fetch(`${apiBasePath}/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to create comment')
      }
      const json = await res.json()
      return json.data || json
    },

    async updateComment(
      postId: string,
      commentId: string,
      content: string
    ): Promise<CommentWithUser> {
      const res = await fetch(`${apiBasePath}/posts/${postId}/comments/${commentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to update comment')
      }
      const json = await res.json()
      return json.data || json
    },

    async deleteComment(
      postId: string,
      commentId: string
    ): Promise<void> {
      const res = await fetch(`${apiBasePath}/posts/${postId}/comments/${commentId}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to delete comment')
      }
    },

    async toggleResolve(
      postId: string,
      commentId: string
    ): Promise<CommentWithUser> {
      const res = await fetch(`${apiBasePath}/posts/${postId}/comments/${commentId}/resolve`, {
        method: 'POST',
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to toggle resolve')
      }
      const json = await res.json()
      return json.data || json
    },

    async resolveAllComments(
      postId: string
    ): Promise<{ resolved: number }> {
      const res = await fetch(`${apiBasePath}/posts/${postId}/comments/resolve-all`, {
        method: 'POST',
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to resolve all comments')
      }
      const json = await res.json()
      return json.data || json
    },
  }
}
