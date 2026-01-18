'use client'

import { useState, useEffect, useCallback, useRef, useMemo, type Dispatch, type SetStateAction } from 'react'
import { toast } from 'sonner'
import type { CustomFieldConfig } from '../types'

interface Tag {
  id: string
  name: string
}

export interface Post {
  id?: string
  title: string
  subtitle: string
  slug: string
  markdown: string
  status: 'draft' | 'published'
  tags?: Tag[]
  updatedAt?: string
  publishedAt?: string | null
  [key: string]: unknown
}

export interface UsePostOptions {
  slug?: string
  apiBasePath: string
  fields: CustomFieldConfig[]
  /** Called when a post is saved or published to update shared state */
  onUpdate?: (post: Post) => void
  /** Called when navigation is needed (e.g., after first save) */
  onNavigate?: (path: string, options?: { skipConfirmation?: boolean; replace?: boolean }) => void
}

export interface UsePostReturn {
  post: Post
  setPost: Dispatch<SetStateAction<Post>>
  loading: boolean
  saving: boolean
  savingAs: 'draft' | 'published' | null
  hasUnsavedChanges: boolean
  lastSaved: Date | null
  originalSlug: string | null
  wasPublished: boolean
  save: (silent?: boolean) => Promise<void>
  publish: () => Promise<void>
  unpublish: () => Promise<void>
  /** Ref for auto-save callbacks (avoids stale closures) */
  saveRef: React.RefObject<(silent?: boolean) => Promise<void>>
}

const DEFAULT_POST: Post = {
  title: '',
  subtitle: '',
  slug: '',
  markdown: '',
  status: 'draft',
  tags: [],
}

/**
 * Hook for managing post state, save, publish, and auto-save logic.
 * Extracted from EditorPage for reusability and testability.
 */
export function usePost({
  slug,
  apiBasePath,
  fields,
  onUpdate,
  onNavigate,
}: UsePostOptions): UsePostReturn {
  const [post, setPost] = useState<Post>(DEFAULT_POST)
  const [loading, setLoading] = useState(!!slug)
  const [saving, setSaving] = useState(false)
  const [savingAs, setSavingAs] = useState<'draft' | 'published' | null>(null)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  
  // Track original slug for redirect warning (when editing slug of previously-published post)
  const [originalSlug, setOriginalSlug] = useState<string | null>(null)
  const [wasPublished, setWasPublished] = useState(false)
  
  // Track saved content for unsaved changes detection
  const savedContent = useRef<string>('')
  
  // Ref for save function to avoid stale closures in auto-save
  const saveRef = useRef<(silent?: boolean) => Promise<void>>(() => Promise.resolve())

  // Helper to stringify with sorted keys (JSON.stringify is key-order sensitive)
  const stableStringify = useCallback((obj: Record<string, unknown>) => 
    JSON.stringify(obj, Object.keys(obj).sort()), [])

  // Compute hasUnsavedChanges directly
  const hasUnsavedChanges = useMemo(() => {
    const { id: _id, slug: _slug, status: _status, createdAt: _ca, updatedAt: _ua, publishedAt: _pa, tags: _tags, ...contentFields } = post
    const current = stableStringify(contentFields)
    
    // For new posts (savedContent is empty), any content is unsaved
    if (savedContent.current === '') {
      return current !== "{}"
    }
    // For existing posts, compare against saved content
    return current !== savedContent.current
  }, [post, stableStringify])

  // Load post if editing existing
  useEffect(() => {
    if (!slug) {
      setLoading(false)
      return
    }
    
    fetch(`${apiBasePath}/posts`)
      .then(r => r.json())
      .then(d => {
        const found = d.data?.find((p: Post) => p.slug === slug)
        if (found) {
          setPost(found)
          // Track all content fields for unsaved changes detection
          const { id: _id, slug: _slug, status: _status, createdAt: _ca, updatedAt: _ua, publishedAt: _pa, tags: _tags, ...contentFields } = found
          savedContent.current = stableStringify(contentFields)
          // Initialize lastSaved from post's updatedAt
          if (found.updatedAt) {
            setLastSaved(new Date(found.updatedAt))
          }
          // Track original slug and publication status for redirect warning
          setOriginalSlug(found.slug)
          setWasPublished(!!found.publishedAt)
        }
        setLoading(false)
      })
      .catch((err) => {
        console.error('Failed to load post:', err)
        setLoading(false)
      })
  }, [slug, apiBasePath, stableStringify])

  // Save post
  const save = useCallback(async (silent = false) => {
    // Confirm before updating published posts (unless silent auto-save)
    if (!silent && post.status === 'published') {
      if (!confirm('Update the published post?')) return
    }
    
    if (!silent) {
      setSaving(true)
      setSavingAs('draft')
    }
    
    try {
      const method = post.id ? 'PATCH' : 'POST'
      const url = post.id ? `${apiBasePath}/posts/${post.id}` : `${apiBasePath}/posts`
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: post.title || 'Untitled Draft',
          subtitle: post.subtitle || null,
          slug: post.slug || undefined,
          markdown: post.markdown,
          status: post.status,
          tagIds: post.tags?.map(t => t.id),
          ...Object.fromEntries(fields.map(f => [f.name, post[f.name]]))
        }),
      })
      
      const data = await res.json()
      if (data.data) {
        // Merge API response into existing post
        setPost(prev => ({ ...prev, ...data.data }))
        // Track all content fields for unsaved changes detection
        const mergedPost = { ...post, ...data.data }
        const { id: _id, slug: _slug, status: _status, createdAt: _ca, updatedAt: _ua, publishedAt: _pa, tags: _tags, ...contentFields } = mergedPost
        savedContent.current = stableStringify(contentFields)
        setLastSaved(new Date())
        // Update shared data
        onUpdate?.(data.data)
        if (!post.id && data.data.slug) {
          // Replace history so back button goes to dashboard
          onNavigate?.(`/editor/${data.data.slug}`, { skipConfirmation: true, replace: true })
        }
      }
    } catch (err) {
      console.error('Save failed:', err)
      if (!silent) {
        toast.error('Failed to save post')
      }
      throw err
    } finally {
      if (!silent) {
        setSaving(false)
        setSavingAs(null)
      }
    }
  }, [post, apiBasePath, fields, stableStringify, onUpdate, onNavigate])

  // Keep saveRef updated
  useEffect(() => {
    saveRef.current = save
  }, [save])

  // Publish post
  const publish = useCallback(async () => {
    if (!confirm('Publish this essay?')) return
    
    setSaving(true)
    setSavingAs('published')
    
    try {
      const method = post.id ? 'PATCH' : 'POST'
      const url = post.id ? `${apiBasePath}/posts/${post.id}` : `${apiBasePath}/posts`

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: post.title || 'Untitled',
          subtitle: post.subtitle || null,
          slug: post.slug || undefined,
          markdown: post.markdown,
          status: 'published',
          tagIds: post.tags?.map(t => t.id),
          ...Object.fromEntries(fields.map(f => [f.name, post[f.name]]))
        }),
      })

      if (res.ok) {
        const data = await res.json()
        if (data.data) {
          setPost(prev => ({ ...prev, ...data.data }))
          onUpdate?.(data.data)
          // Track saved content
          const { id: _id, slug: _slug, status: _status, createdAt: _ca, updatedAt: _ua, publishedAt: _pa, tags: _tags, ...contentFields } = { ...post, ...data.data }
          savedContent.current = stableStringify(contentFields)
        }
        toast.success('Post published successfully!')
        onNavigate?.('/', { skipConfirmation: true })
      } else {
        toast.error('Failed to publish post')
      }
    } catch (err) {
      console.error('Publish failed:', err)
      toast.error('Failed to publish post')
    } finally {
      setSaving(false)
      setSavingAs(null)
    }
  }, [post, apiBasePath, fields, stableStringify, onUpdate, onNavigate])

  // Unpublish post
  const unpublish = useCallback(async () => {
    if (!post.id) return
    if (!confirm('Unpublish this essay?')) return
    
    try {
      const res = await fetch(`${apiBasePath}/posts/${post.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'draft' }),
      })
      
      if (res.ok) {
        setPost(prev => ({ ...prev, status: 'draft' }))
        toast.success('Post unpublished')
      } else {
        toast.error('Failed to unpublish post')
      }
    } catch (err) {
      console.error('Unpublish failed:', err)
      toast.error('Failed to unpublish post')
    }
  }, [post.id, apiBasePath])

  // Auto-save drafts (3s debounce)
  useEffect(() => {
    if (!post.id || post.status === 'published' || !hasUnsavedChanges) return
    
    const timeout = setTimeout(() => {
      saveRef.current(true)
    }, 3000)
    
    return () => clearTimeout(timeout)
  }, [post.id, post.status, post.title, post.subtitle, post.markdown, hasUnsavedChanges])

  // Warn on browser navigation with unsaved changes
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [hasUnsavedChanges])

  return {
    post,
    setPost,
    loading,
    saving,
    savingAs,
    hasUnsavedChanges,
    lastSaved,
    originalSlug,
    wasPublished,
    save,
    publish,
    unpublish,
    saveRef,
  }
}
