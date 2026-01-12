'use client'

import { useState, useCallback, useEffect } from 'react'
import type { Editor } from '@tiptap/react'
import {
  CommentWithUser,
  SelectionState,
  createCommentsClient,
} from '../../lib/comments'
import {
  addCommentMark,
  removeCommentMark,
  applyCommentMarks,
  scrollToComment,
} from '../../lib/comment-mark'

export interface UseCommentsOptions {
  postId: string | null
  editor: Editor | null
  apiBasePath?: string
  onSave?: () => Promise<string | null> // Called to auto-save post, returns postId
}

export interface CommentsState {
  list: CommentWithUser[]
  loading: boolean
  activeId: string | null
  setActiveId: (id: string | null) => void
  selectedText: SelectionState | null
  setSelectedText: (selection: SelectionState | null) => void
  postId: string | null
  create: (content: string) => Promise<void>
  reply: (parentId: string, content: string) => Promise<void>
  edit: (commentId: string, content: string) => Promise<void>
  remove: (commentId: string) => Promise<void>
  resolve: (commentId: string) => Promise<void>
  resolveAll: () => Promise<void>
  scrollTo: (commentId: string) => void
  openCount: number
}

export function useComments({
  postId: initialPostId,
  editor,
  apiBasePath = '/api/cms',
  onSave,
}: UseCommentsOptions): CommentsState {
  const [postId, setPostId] = useState<string | null>(initialPostId)
  const [comments, setComments] = useState<CommentWithUser[]>([])
  const [loading, setLoading] = useState(false)
  const [activeCommentId, setActiveCommentId] = useState<string | null>(null)
  const [selectedText, setSelectedText] = useState<SelectionState | null>(null)

  const client = createCommentsClient(apiBasePath)

  // Update postId when it changes
  useEffect(() => {
    setPostId(initialPostId)
  }, [initialPostId])

  // Fetch comments when postId changes
  useEffect(() => {
    if (!postId) {
      setComments([])
      return
    }

    setLoading(true)
    client.fetchComments(postId)
      .then((data) => {
        setComments(data)
        // Apply comment marks to editor
        if (editor) {
          applyCommentMarks(editor, data)
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [postId, editor])

  // Create a new comment
  const createComment = useCallback(async (content: string) => {
    if (!selectedText) return

    // Auto-save the post first if it hasn't been saved yet
    let effectivePostId = postId
    if (!effectivePostId && onSave) {
      effectivePostId = await onSave()
      if (effectivePostId) {
        setPostId(effectivePostId)
      }
    }

    if (!effectivePostId) {
      console.error('Cannot create comment: no post ID')
      return
    }

    const comment = await client.createComment(effectivePostId, {
      quotedText: selectedText.text,
      content,
    })

    // Add highlight mark to editor
    if (editor) {
      addCommentMark(editor, comment.id, selectedText.from, selectedText.to)
    }

    // Add to list with empty replies array
    setComments((prev) => [{ ...comment, replies: [] }, ...prev])
    setSelectedText(null)
  }, [postId, selectedText, editor, onSave, client])

  // Reply to a comment
  const replyToComment = useCallback(async (parentId: string, content: string) => {
    if (!postId) return

    const reply = await client.createComment(postId, {
      quotedText: '',
      content,
      parentId,
    })

    // Add reply to parent's replies array
    setComments((prev) =>
      prev.map((c) =>
        c.id === parentId
          ? { ...c, replies: [...(c.replies || []), reply] }
          : c
      )
    )
  }, [postId, client])

  // Edit a comment
  const editComment = useCallback(async (commentId: string, content: string) => {
    if (!postId) return

    const updated = await client.updateComment(postId, commentId, content)

    // Update in list (could be top-level or reply)
    setComments((prev) =>
      prev.map((c) => {
        if (c.id === commentId) {
          return { ...c, ...updated }
        }
        // Check in replies
        if (c.replies) {
          return {
            ...c,
            replies: c.replies.map((r) =>
              r.id === commentId ? { ...r, ...updated } : r
            ),
          }
        }
        return c
      })
    )
  }, [postId, client])

  // Remove a comment
  const removeComment = useCallback(async (commentId: string) => {
    if (!postId) return

    await client.deleteComment(postId, commentId)

    // Remove highlight mark from editor
    if (editor) {
      removeCommentMark(editor, commentId)
    }

    // Remove from list (could be top-level or reply)
    setComments((prev) => {
      // Check if it's a top-level comment
      const isTopLevel = prev.some((c) => c.id === commentId)
      if (isTopLevel) {
        return prev.filter((c) => c.id !== commentId)
      }
      // It's a reply
      return prev.map((c) => ({
        ...c,
        replies: c.replies?.filter((r) => r.id !== commentId),
      }))
    })
  }, [postId, editor, client])

  // Resolve/unresolve a comment
  const resolveComment = useCallback(async (commentId: string) => {
    if (!postId) return

    const updated = await client.toggleResolve(postId, commentId)

    // Toggle highlight: remove when resolved, re-add when unresolved
    if (editor) {
      const comment = comments.find((c) => c.id === commentId)
      if (updated.resolved) {
        removeCommentMark(editor, commentId)
      } else if (comment && selectedText) {
        // Re-apply mark if unresolving
        addCommentMark(editor, commentId, selectedText.from, selectedText.to)
      }
    }

    // Update in list
    setComments((prev) =>
      prev.map((c) => (c.id === commentId ? { ...c, resolved: updated.resolved } : c))
    )
  }, [postId, editor, comments, selectedText, client])

  // Resolve all comments
  const resolveAllComments = useCallback(async () => {
    if (!postId) return

    await client.resolveAllComments(postId)

    // Remove all highlight marks
    if (editor) {
      comments.filter((c) => !c.resolved && !c.parentId).forEach((c) => {
        removeCommentMark(editor, c.id)
      })
    }

    // Update all comments to resolved
    setComments((prev) =>
      prev.map((c) => ({ ...c, resolved: true }))
    )
  }, [postId, editor, comments, client])

  // Scroll to a comment in the editor
  const scrollToCommentMark = useCallback((commentId: string) => {
    if (editor) {
      scrollToComment(editor, commentId)
    }
    setActiveCommentId(commentId)
  }, [editor])

  // Count open comments (non-resolved, non-replies)
  const openCount = comments.filter((c) => !c.resolved && !c.parentId).length

  return {
    list: comments,
    loading,
    activeId: activeCommentId,
    setActiveId: setActiveCommentId,
    selectedText,
    setSelectedText,
    postId,
    create: createComment,
    reply: replyToComment,
    edit: editComment,
    remove: removeComment,
    resolve: resolveComment,
    resolveAll: resolveAllComments,
    scrollTo: scrollToCommentMark,
    openCount,
  }
}
