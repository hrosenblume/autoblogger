'use client'

import { useState, useCallback } from 'react'
import type { Post } from './usePost'

export interface Revision {
  id: string
  createdAt: string
  title: string | null
  subtitle: string | null
  markdown: string
  polyhedraShape?: string | null
}

export interface UseRevisionsOptions {
  postId: string | undefined
  apiBasePath: string
  /** Current post for stashing during preview */
  currentPost: Post
  /** Callback to update post state when previewing/restoring */
  onPostChange: (post: Post | ((prev: Post) => Post)) => void
  /** Callback to save post after restoring a revision */
  onSave: () => Promise<void>
}

export interface UseRevisionsReturn {
  list: Revision[]
  loading: boolean
  previewing: Revision | null
  /** Original post state before preview (for cancel) */
  originalPost: Post | null
  fetch: () => Promise<void>
  preview: (revisionId: string) => void
  cancel: () => void
  restore: () => Promise<void>
}

/**
 * Hook for managing revision history, preview, and restore logic.
 * Extracted from EditorPage for reusability and testability.
 */
export function useRevisions({
  postId,
  apiBasePath,
  currentPost,
  onPostChange,
  onSave,
}: UseRevisionsOptions): UseRevisionsReturn {
  const [list, setList] = useState<Revision[]>([])
  const [loading, setLoading] = useState(false)
  const [previewing, setPreviewing] = useState<Revision | null>(null)
  const [originalPost, setOriginalPost] = useState<Post | null>(null)

  // Fetch revisions for the post
  const fetch = useCallback(async () => {
    if (!postId) return
    
    setLoading(true)
    try {
      const res = await globalThis.fetch(`${apiBasePath}/revisions?postId=${postId}`)
      const data = await res.json()
      setList(data.data || [])
    } catch (err) {
      console.error('Failed to fetch revisions:', err)
    } finally {
      setLoading(false)
    }
  }, [postId, apiBasePath])

  // Preview a revision (temporarily apply it to the post)
  const preview = useCallback((revisionId: string) => {
    const revision = list.find(r => r.id === revisionId)
    if (!revision) return
    
    // Store original post state (only on first preview)
    if (!originalPost) {
      setOriginalPost({ ...currentPost })
    }
    
    setPreviewing(revision)
    onPostChange(prev => ({
      ...prev,
      title: revision.title || prev.title,
      subtitle: revision.subtitle || prev.subtitle,
      markdown: revision.markdown,
    }))
  }, [list, currentPost, originalPost, onPostChange])

  // Cancel revision preview (restore original post)
  const cancel = useCallback(() => {
    if (originalPost) {
      onPostChange(originalPost)
      setOriginalPost(null)
    }
    setPreviewing(null)
  }, [originalPost, onPostChange])

  // Restore revision (keep the preview content and save)
  const restore = useCallback(async () => {
    if (!previewing) return
    
    setOriginalPost(null)
    setPreviewing(null)
    // The post is already set to the revision content, just save it
    await onSave()
  }, [previewing, onSave])

  return {
    list,
    loading,
    previewing,
    originalPost,
    fetch,
    preview,
    cancel,
    restore,
  }
}
