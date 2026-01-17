'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import type { Editor } from '@tiptap/react'
import { toast } from 'sonner'
import { useDashboardContext, type EditCommand } from '../context'
import { EditorToolbar } from '../components/EditorToolbar'
import { TiptapEditor, type SelectionState } from '../components/TiptapEditor'
import { CommentsPanel } from '../components/CommentsPanel'
import { TagsSection } from '../components/TagsSection'
import { useComments } from '../hooks/useComments'
import { useChatContextOptional } from '../hooks/useChat'
import { formatSavedTime, countWords } from '../../lib/format'
import { Skeleton } from '../components/Skeleton'

interface Tag {
  id: string
  name: string
}

interface Post {
  id?: string
  title: string
  subtitle: string
  slug: string
  markdown: string
  status: 'draft' | 'published'
  tags?: Tag[]
  [key: string]: unknown
}

interface Revision {
  id: string
  createdAt: string
  title: string | null
  subtitle: string | null
  markdown: string
  polyhedraShape?: string | null
}

// Content skeleton matching the editor layout
function ContentSkeleton({ styles }: { styles: { container: string } }) {
  return (
    <div className={`${styles.container} pt-12 pb-24 mx-auto`}>
      <div className="space-y-2 mb-8">
        <Skeleton className="h-8 w-4/5" />
        <Skeleton className="h-5 w-3/5" />
        <div className="!mt-4">
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <div className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
    </div>
  )
}

// Auto-resizing textarea for title/subtitle
function AutoResizeTextarea({
  value,
  onChange,
  placeholder,
  disabled,
  className,
}: {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}) {
  const ref = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (ref.current) {
      ref.current.style.height = 'auto'
      ref.current.style.height = `${ref.current.scrollHeight}px`
    }
  }, [value])

  return (
    <textarea
      ref={ref}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      rows={1}
      onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault() }}
      className={`resize-none overflow-hidden ${className || ''}`}
    />
  )
}

interface EditorPageProps {
  slug?: string
  onEditorStateChange?: (state: import('../context').EditorState | null) => void
}

export function EditorPage({ slug, onEditorStateChange: onEditorStateChangeProp }: EditorPageProps) {
  const { apiBasePath, styles, fields, navigate, basePath, onRegisterEditHandler, sharedData, updateSharedPost } = useDashboardContext()
  const postUrlPattern = sharedData?.settings?.postUrlPattern ?? '/e/{slug}'
  // Extract prefix from pattern (everything before {slug})
  const urlPrefix = postUrlPattern.split('{slug}')[0]
  const chatContext = useChatContextOptional()
  // Extract stable references to avoid infinite loops in useEffects
  const chatAddMessage = chatContext?.addMessage
  const chatSelectedModel = chatContext?.selectedModel
  // Use prop callback (passed from DashboardLayout for internal save button)
  const onEditorStateChange = onEditorStateChangeProp
  const [post, setPost] = useState<Post>({
    title: '',
    subtitle: '',
    slug: '',
    markdown: '',
    status: 'draft',
    tags: [],
  })
  const [loading, setLoading] = useState(!!slug)
  const [saving, setSaving] = useState(false)
  const [savingAs, setSavingAs] = useState<'draft' | 'published' | null>(null)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [generating, setGenerating] = useState(false)
  const abortControllerRef = useRef<AbortController | null>(null)
  const savedContent = useRef<string>('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const hasTriggeredGeneration = useRef(false)
  
  // Rich text vs markdown mode
  const [showMarkdown, setShowMarkdown] = useState(false)
  const [editor, setEditor] = useState<Editor | null>(null)

  // Auto-resize markdown textarea to fit content
  useEffect(() => {
    if (showMarkdown && textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      // Use at least the viewport height minus header/footer space
      const minHeight = Math.max(400, window.innerHeight - 300)
      textareaRef.current.style.height = `${Math.max(minHeight, textareaRef.current.scrollHeight)}px`
    }
  }, [showMarkdown, post.markdown])

  // Revision state
  const [revisions, setRevisions] = useState<Revision[]>([])
  const [revisionsLoading, setRevisionsLoading] = useState(false)
  const [previewingRevision, setPreviewingRevision] = useState<Revision | null>(null)
  const [originalPost, setOriginalPost] = useState<Post | null>(null)
  
  // Track original slug for redirect warning (when editing slug of previously-published post)
  const [originalSlug, setOriginalSlug] = useState<string | null>(null)
  const [wasPublished, setWasPublished] = useState(false)

  // Helper to stringify with sorted keys (JSON.stringify is key-order sensitive)
  const stableStringify = useCallback((obj: Record<string, unknown>) => 
    JSON.stringify(obj, Object.keys(obj).sort()), [])
  
  // Compute hasUnsavedChanges directly instead of using state + effect (avoids timing issues)
  const hasUnsavedChanges = useMemo(() => {
    // While previewing a revision, no unsaved changes
    if (previewingRevision) return false
    
    const { id: _id, slug: _slug, status: _status, createdAt: _ca, updatedAt: _ua, publishedAt: _pa, tags: _tags, ...contentFields } = post
    const current = stableStringify(contentFields)
    
    // For new posts (savedContent is empty), any content is unsaved
    if (savedContent.current === '') {
      return current !== "{}"
    }
    // For existing posts, compare against saved content
    return current !== savedContent.current
  }, [post, previewingRevision, stableStringify])

  // Comments state
  const [commentsOpen, setCommentsOpen] = useState(false)
  
  // Get session info from context (if provided)
  const { session } = useDashboardContext()
  const currentUserEmail = session?.user?.email || ''
  const isAdmin = session?.user?.role === 'admin'

  // Define savePost and handlePublish early (before hooks that depend on them)
  const savePost = useCallback(async (silent = false) => {
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
        // Track all content fields for unsaved changes detection (merge current post with API response)
        const mergedPost = { ...post, ...data.data }
        const { id: _id, slug: _slug, status: _status, createdAt: _ca, updatedAt: _ua, publishedAt: _pa, tags: _tags, ...contentFields } = mergedPost
        savedContent.current = stableStringify(contentFields)
        setLastSaved(new Date())
        // hasUnsavedChanges is now computed via useMemo, no need to set it
        // Update shared data so dashboard shows the new/updated post
        updateSharedPost(data.data)
        if (!post.id && data.data.slug) {
          // Replace history so back button goes to dashboard, not blank editor
          navigate(`/editor/${data.data.slug}`, { skipConfirmation: true, replace: true })
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
  }, [post.id, post.title, post.subtitle, post.slug, post.markdown, post.status, post.tags, apiBasePath, fields, navigate, updateSharedPost])

  const handlePublish = useCallback(async () => {
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
          slug: post.slug || undefined, // API auto-generates from title if empty
          markdown: post.markdown,
          status: 'published',
          tagIds: post.tags?.map(t => t.id),
          ...Object.fromEntries(fields.map(f => [f.name, post[f.name]]))
        }),
      })

      if (res.ok) {
        const data = await res.json()
        if (data.data) {
          // Update local state with new post data (including generated slug and id)
          setPost(prev => ({ ...prev, ...data.data }))
          updateSharedPost(data.data)
          // Track saved content to clear unsaved changes state
          const { id: _id, slug: _slug, status: _status, createdAt: _ca, updatedAt: _ua, publishedAt: _pa, tags: _tags, ...contentFields } = { ...post, ...data.data }
          savedContent.current = stableStringify(contentFields)
        }
        toast.success('Post published successfully!')
        navigate('/', { skipConfirmation: true })
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
  }, [post, apiBasePath, fields, navigate, updateSharedPost, stableStringify])

  // Comments hook - handles all comment logic
  const comments = useComments({
    postId: post.id || null,
    editor,
    apiBasePath,
    onSave: async () => {
      // Auto-save the post and return the new post ID
      await savePost(true)
      return post.id || null
    },
  })

  // URL params for AI generation
  const [urlParams, setUrlParams] = useState<{
    idea?: string
    model?: string
    length?: string
    web?: string
    thinking?: string
    comment?: string
    fromPlan?: string
  }>({})

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      setUrlParams({
        idea: params.get('idea') || undefined,
        model: params.get('model') || undefined,
        length: params.get('length') || undefined,
        web: params.get('web') || undefined,
        thinking: params.get('thinking') || undefined,
        comment: params.get('comment') || undefined,
        fromPlan: params.get('fromPlan') || undefined,
      })
    }
  }, [])

  // Handle comment URL param - open panel and scroll to comment
  useEffect(() => {
    if (urlParams.comment && !comments.loading && comments.list.length > 0) {
      // Open the comments panel
      setCommentsOpen(true)
      // Set active comment and scroll to it
      comments.setActiveId(urlParams.comment)
      // Small delay to ensure panel is open before scrolling
      setTimeout(() => {
        comments.scrollTo(urlParams.comment!)
      }, 100)
    }
  }, [urlParams.comment, comments.loading, comments.list.length])

  // Load post if editing existing
  useEffect(() => {
    if (slug) {
      fetch(`${apiBasePath}/posts`)
        .then(r => r.json())
        .then(d => {
          const found = d.data?.find((p: Post) => p.slug === slug)
          if (found) {
            setPost(found)
            // Track all content fields for unsaved changes detection (excludes metadata like id, dates, status)
            const { id: _id, slug: _slug, status: _status, createdAt: _ca, updatedAt: _ua, publishedAt: _pa, tags: _tags, ...contentFields } = found
            savedContent.current = stableStringify(contentFields)
            // Initialize lastSaved from post's updatedAt so it shows "Saved X ago" not "Not saved yet"
            if (found.updatedAt) {
              setLastSaved(new Date(found.updatedAt))
            }
            // Track original slug and publication status for redirect warning
            setOriginalSlug(found.slug)
            setWasPublished(!!found.publishedAt)
          }
          setLoading(false)
        })
        .catch(() => setLoading(false))
    }
  }, [slug, apiBasePath])

  // hasUnsavedChanges is now computed via useMemo (see above), no effect needed

  // Report editor state to parent app (for navbar save button etc.)
  // Use refs for callbacks to avoid triggering effect re-runs
  const savePostRef = useRef(savePost)
  const handlePublishRef = useRef(handlePublish)
  const onEditorStateChangeRef = useRef(onEditorStateChange)
  useEffect(() => { savePostRef.current = savePost }, [savePost])
  useEffect(() => { handlePublishRef.current = handlePublish }, [handlePublish])
  useEffect(() => { onEditorStateChangeRef.current = onEditorStateChange }, [onEditorStateChange])
  
  useEffect(() => {
    if (!onEditorStateChangeRef.current) return

    const confirmLeave = () => {
      if (hasUnsavedChanges) {
        return confirm('You have unsaved changes. Leave anyway?')
      }
      return true
    }

    onEditorStateChangeRef.current({
      hasUnsavedChanges,
      status: post.status,
      savingAs,
      onSave: (status) => {
        if (status === 'draft') {
          savePostRef.current()
        } else {
          handlePublishRef.current()
        }
      },
      confirmLeave,
      // Include content for chat integration
      content: {
        title: post.title,
        subtitle: post.subtitle,
        markdown: post.markdown,
      },
    })

    return () => {
      onEditorStateChangeRef.current?.(null)
    }
  }, [hasUnsavedChanges, post.status, savingAs, post.title, post.subtitle, post.markdown])

  // Create edit handler for AI agent mode
  const handleEdit = useCallback((edit: EditCommand): boolean => {
    if (edit.type === 'replace_all') {
      setPost(prev => ({
        ...prev,
        title: edit.title ?? prev.title,
        subtitle: edit.subtitle ?? prev.subtitle,
        markdown: edit.markdown ?? prev.markdown,
      }))
      return true
    }

    if (edit.type === 'replace_section' && edit.find && edit.replace !== undefined) {
      // Use functional update to get current post state
      let found = false
      setPost(prev => {
        if (prev.markdown.includes(edit.find!)) {
          found = true
          return { ...prev, markdown: prev.markdown.replace(edit.find!, edit.replace!) }
        }
        return prev
      })
      return found
    }

    if (edit.type === 'insert' && edit.replace !== undefined) {
      if (edit.position === 'start') {
        setPost(prev => ({ ...prev, markdown: edit.replace + prev.markdown }))
        return true
      }
      if (edit.position === 'end') {
        setPost(prev => ({ ...prev, markdown: prev.markdown + edit.replace }))
        return true
      }
      if (edit.find) {
        let found = false
        setPost(prev => {
          if (prev.markdown.includes(edit.find!)) {
            found = true
            const idx = prev.markdown.indexOf(edit.find!)
            const insertPoint = edit.position === 'before' ? idx : idx + edit.find!.length
            return {
              ...prev,
              markdown: prev.markdown.slice(0, insertPoint) + edit.replace + prev.markdown.slice(insertPoint),
            }
          }
          return prev
        })
        return found
      }
      return false
    }

    if (edit.type === 'delete' && edit.find) {
      let found = false
      setPost(prev => {
        if (prev.markdown.includes(edit.find!)) {
          found = true
          return { ...prev, markdown: prev.markdown.replace(edit.find!, '') }
        }
        return prev
      })
      return found
    }

    return false
  }, [])

  // Register edit handler with dashboard context (for external use)
  useEffect(() => {
    if (!onRegisterEditHandler) return
    onRegisterEditHandler(handleEdit)
    return () => { onRegisterEditHandler(null) }
  }, [handleEdit, onRegisterEditHandler])

  // Register edit handler with chat context (for AI agent mode)
  const registerEditHandler = chatContext?.registerEditHandler
  useEffect(() => {
    if (!registerEditHandler) return
    registerEditHandler(handleEdit)
    return () => { registerEditHandler(null) }
  }, [handleEdit, registerEditHandler])

  // Expand plan into full essay - shared logic for both handler and URL param
  const expandPlanToEssay = useCallback(async (plan: string, wordCount: number = 800) => {
    // Don't expand if already generating or if there's content and user doesn't confirm
    if (generating) return
    if (post.title || post.subtitle || post.markdown) {
      if (!confirm('This will replace your current content with a new essay. Continue?')) {
        return
      }
    }

    // Create abort controller for this generation
    const abortController = new AbortController()
    abortControllerRef.current = abortController

    setGenerating(true)

    try {
      const res = await fetch(`${apiBasePath}/ai/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'expand_plan',
          plan,
          wordCount,
          model: chatSelectedModel,
        }),
        signal: abortController.signal,
      })

      if (!res.ok) {
        const error = await res.json().catch(() => ({ error: 'Generation failed' }))
        console.error('Plan expansion failed:', error)
        return
      }

      // Consume SSE stream with real-time title/subtitle parsing (same as idea generation)
      const reader = res.body?.getReader()
      if (!reader) return

      const decoder = new TextDecoder()
      let fullContent = ''
      let titleExtracted = false
      let subtitleExtracted = false
      let bodyStartIndex = 0

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const sseLines = chunk.split('\n')

        for (const line of sseLines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') continue
            try {
              const parsed = JSON.parse(data)
              if (parsed.text) {
                fullContent += parsed.text
                
                // Parse title as soon as first line is complete
                if (!titleExtracted && fullContent.includes('\n')) {
                  const firstLine = fullContent.split('\n')[0]
                  if (firstLine.startsWith('# ')) {
                    const title = firstLine.slice(2).trim()
                    setPost(prev => ({ ...prev, title }))
                    titleExtracted = true
                    bodyStartIndex = firstLine.length + 1
                  }
                }
                
                // Parse subtitle as soon as second line is complete
                if (titleExtracted && !subtitleExtracted) {
                  const afterTitle = fullContent.slice(bodyStartIndex)
                  if (afterTitle.includes('\n')) {
                    // Find first non-empty line (skip blank lines between title and subtitle)
                    const lines = afterTitle.split('\n')
                    let lineOffset = 0
                    let rawSubtitleLine = ''
                    for (let i = 0; i < lines.length - 1; i++) { // -1 to ensure there's a newline after
                      if (lines[i].trim()) {
                        rawSubtitleLine = lines[i]
                        break
                      }
                      lineOffset += lines[i].length + 1 // +1 for newline
                    }
                    
                    if (rawSubtitleLine) {
                      const subtitleLine = rawSubtitleLine.trim()
                      const italicMatch = subtitleLine.match(/^\*(.+)\*$/) || subtitleLine.match(/^_(.+)_$/)
                      if (italicMatch) {
                        const subtitle = italicMatch[1]
                        setPost(prev => ({ ...prev, subtitle }))
                        subtitleExtracted = true
                        bodyStartIndex += lineOffset + rawSubtitleLine.length + 1
                      } else {
                        // Non-italic line found - treat as body start
                        subtitleExtracted = true
                        bodyStartIndex += lineOffset // Start from this line
                      }
                    }
                  }
                }
                
                // Update markdown after title/subtitle are parsed
                if (titleExtracted) {
                  const bodyContent = fullContent.slice(bodyStartIndex).trim()
                  setPost(prev => ({ ...prev, markdown: bodyContent }))
                }
              }
            } catch {
              // Ignore parse errors for incomplete chunks
            }
          }
        }
      }
      
      // Final cleanup
      const finalBody = fullContent.slice(bodyStartIndex).trim()
      setPost(prev => ({
        ...prev,
        markdown: finalBody,
      }))
      
      // Add to chat history
      if (chatAddMessage) {
        chatContext.addMessage('assistant', '✓ Essay drafted from plan. You can now edit it or ask me questions about it.')
      }
    } catch (err) {
      // Don't log abort errors - they're expected when user cancels
      if (err instanceof Error && err.name === 'AbortError') {
        // Generation was cancelled, keep whatever was generated
        if (chatAddMessage) {
          chatContext.addMessage('assistant', '⏹ Generation stopped. You can continue editing what was generated.')
        }
      } else {
        console.error('Plan expansion error:', err)
      }
    } finally {
      setGenerating(false)
      abortControllerRef.current = null
    }
  }, [generating, post.title, post.subtitle, post.markdown, apiBasePath, chatAddMessage, chatSelectedModel])

  // Register expand plan handler for chat context
  useEffect(() => {
    if (!chatContext?.registerExpandPlanHandler) return

    chatContext.registerExpandPlanHandler(expandPlanToEssay)

    return () => {
      chatContext.registerExpandPlanHandler(null)
    }
  }, [chatContext, expandPlanToEssay])

  // Handle fromPlan URL param - load pending plan from sessionStorage and expand it
  const hasTriggeredPlanExpansion = useRef(false)
  useEffect(() => {
    if (urlParams.fromPlan && !slug && !loading && !hasTriggeredPlanExpansion.current) {
      hasTriggeredPlanExpansion.current = true
      
      // Get pending plan from sessionStorage
      const pendingPlan = sessionStorage.getItem('pendingPlan')
      if (pendingPlan) {
        sessionStorage.removeItem('pendingPlan')
        
        // Clear the URL param
        if (typeof window !== 'undefined') {
          window.history.replaceState({}, '', `${basePath}/editor`)
        }
        
        // Expand the plan
        expandPlanToEssay(pendingPlan, 800)
      }
    }
  }, [urlParams.fromPlan, slug, loading, basePath, expandPlanToEssay])

  // Auto-save drafts (3s debounce)
  // Deps include content fields to reset timer on each keystroke (debounce behavior)
  useEffect(() => {
    if (!post.id || post.status === 'published' || !hasUnsavedChanges || previewingRevision) return
    const timeout = setTimeout(() => savePostRef.current(true), 3000)
    return () => clearTimeout(timeout)
  }, [post.id, post.status, post.title, post.subtitle, post.markdown, hasUnsavedChanges, previewingRevision])

  // Warn on navigation with unsaved changes
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

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Cmd+S / Ctrl+S to save
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault()
        if (!saving && !generating && !previewingRevision && hasUnsavedChanges) {
          savePostRef.current()
        }
        return
      }
      
      if (e.key === 'Escape') {
        if (previewingRevision) {
          cancelRevisionPreview()
          e.stopImmediatePropagation()
          return
        }
        // If generating, stop the generation but stay on the page
        if (generating) {
          if (abortControllerRef.current) {
            abortControllerRef.current.abort()
          }
          e.stopImmediatePropagation()
          return
        }
        if (hasUnsavedChanges && !confirm('You have unsaved changes. Leave anyway?')) return
        navigate('/')
      }
    }
    window.addEventListener('keydown', handler, true) // Use capture to run before dashboard handler
    return () => window.removeEventListener('keydown', handler, true)
  }, [hasUnsavedChanges, saving, generating, navigate, previewingRevision])

  // Auto-generate from idea param
  useEffect(() => {
    if (urlParams.idea && !slug && !loading && !hasTriggeredGeneration.current) {
      // Check if there's existing content that would be overwritten
      if (post.title || post.subtitle || post.markdown) {
        if (!confirm('This will replace your current content. Continue?')) {
          hasTriggeredGeneration.current = true // Prevent re-triggering
          // Clear the URL params
          if (typeof window !== 'undefined') {
            window.history.replaceState({}, '', `${basePath}/editor`)
          }
          return
        }
      }
      
      hasTriggeredGeneration.current = true
      
      // Create abort controller for this generation
      const abortController = new AbortController()
      abortControllerRef.current = abortController
      
      setGenerating(true)

      // Store these values before clearing URL params
      const generationPrompt = urlParams.idea
      const wordCount = urlParams.length ? parseInt(urlParams.length) : 500

      // Clear the URL params immediately
      if (typeof window !== 'undefined') {
        window.history.replaceState({}, '', `${basePath}/editor`)
      }

      const runGenerate = async () => {
        try {
          const res = await fetch(`${apiBasePath}/ai/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              prompt: urlParams.idea,
              wordCount,
              model: urlParams.model,
              useWebSearch: urlParams.web === '1',
              useThinking: urlParams.thinking === '1',
            }),
            signal: abortController.signal,
          })

          if (!res.ok) {
            const error = await res.json().catch(() => ({ error: 'Generation failed' }))
            console.error('Generation failed:', error)
            return
          }

          // Consume SSE stream with real-time title/subtitle parsing
          const reader = res.body?.getReader()
          if (!reader) return

          const decoder = new TextDecoder()
          let fullContent = ''
          let titleExtracted = false
          let subtitleExtracted = false
          let bodyStartIndex = 0

          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            const chunk = decoder.decode(value, { stream: true })
            const sseLines = chunk.split('\n')

            for (const line of sseLines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6)
                if (data === '[DONE]') continue
                try {
                  const parsed = JSON.parse(data)
                  if (parsed.text) {
                    fullContent += parsed.text
                    
                    // Parse title as soon as first line is complete
                    if (!titleExtracted && fullContent.includes('\n')) {
                      const firstLine = fullContent.split('\n')[0]
                      if (firstLine.startsWith('# ')) {
                        const title = firstLine.slice(2).trim()
                        setPost(prev => ({ ...prev, title }))
                        titleExtracted = true
                        bodyStartIndex = firstLine.length + 1 // +1 for newline
                      }
                    }
                    
                    // Parse subtitle as soon as second line is complete
                    if (titleExtracted && !subtitleExtracted) {
                      const afterTitle = fullContent.slice(bodyStartIndex)
                      if (afterTitle.includes('\n')) {
                        // Find first non-empty line (skip blank lines between title and subtitle)
                        const lines = afterTitle.split('\n')
                        let lineOffset = 0
                        let rawSubtitleLine = ''
                        for (let i = 0; i < lines.length - 1; i++) { // -1 to ensure there's a newline after
                          if (lines[i].trim()) {
                            rawSubtitleLine = lines[i]
                            break
                          }
                          lineOffset += lines[i].length + 1 // +1 for newline
                        }
                        
                        if (rawSubtitleLine) {
                          const subtitleLine = rawSubtitleLine.trim()
                          const italicMatch = subtitleLine.match(/^\*(.+)\*$/) || subtitleLine.match(/^_(.+)_$/)
                          if (italicMatch) {
                            const subtitle = italicMatch[1]
                            setPost(prev => ({ ...prev, subtitle }))
                            subtitleExtracted = true
                            bodyStartIndex += lineOffset + rawSubtitleLine.length + 1
                          } else {
                            // Non-italic line found - treat as body start
                            subtitleExtracted = true
                            bodyStartIndex += lineOffset // Start from this line
                          }
                        }
                      }
                    }
                    
                    // Only update markdown AFTER title/subtitle are parsed to avoid "moving up" effect
                    // This ensures title goes directly to title field, not through markdown first
                    if (titleExtracted) {
                      const bodyContent = fullContent.slice(bodyStartIndex).trim()
                      setPost(prev => ({ ...prev, markdown: bodyContent }))
                    }
                  }
                } catch {
                  // Ignore parse errors for incomplete chunks
                }
              }
            }
          }
          
          // Final cleanup - ensure body doesn't include title/subtitle
          const finalBody = fullContent.slice(bodyStartIndex).trim()
          setPost(prev => ({
            ...prev,
            markdown: finalBody,
          }))
          
          // Add generation status to chat history (just a simple confirmation, not the full essay)
          if (chatAddMessage) {
            chatContext.addMessage('user', `Generate essay: ${generationPrompt}`)
            chatContext.addMessage('assistant', '✓ Essay generated successfully. You can now edit it in the editor or ask me questions about it.')
          }
        } catch (err) {
          // Don't log abort errors - they're expected when user cancels
          if (err instanceof Error && err.name === 'AbortError') {
            // Generation was cancelled, keep whatever was generated
            if (chatAddMessage) {
              chatContext.addMessage('user', `Generate essay: ${generationPrompt}`)
              chatContext.addMessage('assistant', '⏹ Generation stopped. You can continue editing what was generated.')
            }
          } else {
            console.error('Generation error:', err)
            // Add error message to chat if generation was interrupted
            if (chatAddMessage) {
              chatContext.addMessage('user', `Generate essay: ${generationPrompt}`)
              chatContext.addMessage('assistant', '⚠ Generation started but was interrupted. You can try again or continue editing what was generated.')
            }
          }
        } finally {
          setGenerating(false)
          abortControllerRef.current = null
        }
      }

      runGenerate()
    }
  }, [urlParams, slug, loading, apiBasePath, basePath, chatAddMessage])

  // Fetch revisions
  const fetchRevisions = useCallback(async () => {
    if (!post.id) return
    setRevisionsLoading(true)
    try {
      const res = await fetch(`${apiBasePath}/revisions?postId=${post.id}`)
      const data = await res.json()
      setRevisions(data.data || [])
    } catch (err) {
      console.error('Failed to fetch revisions:', err)
    } finally {
      setRevisionsLoading(false)
    }
  }, [post.id, apiBasePath])

  // Preview a revision
  const previewRevision = useCallback(async (revisionId: string) => {
    const revision = revisions.find(r => r.id === revisionId)
    if (!revision) return
    
    // Store original post state
    if (!originalPost) {
      setOriginalPost({ ...post })
    }
    
    setPreviewingRevision(revision)
    setPost(prev => ({
      ...prev,
      title: revision.title || prev.title,
      subtitle: revision.subtitle || prev.subtitle,
      markdown: revision.markdown,
    }))
  }, [revisions, post, originalPost])

  // Cancel revision preview
  const cancelRevisionPreview = useCallback(() => {
    if (originalPost) {
      setPost(originalPost)
      setOriginalPost(null)
    }
    setPreviewingRevision(null)
  }, [originalPost])

  // Restore revision
  const restoreRevision = useCallback(async () => {
    if (!previewingRevision) return
    setOriginalPost(null)
    setPreviewingRevision(null)
    // The post is already set to the revision content, just save it
    await savePost()
  }, [previewingRevision, savePost])

  const handleUnpublish = async () => {
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
  }

  const words = countWords(post.markdown)
  const isPublished = post.status === 'published'

  // Loading skeleton
  if (loading) {
    return (
      <div className="flex flex-col h-full">
        <EditorToolbar
          textareaRef={textareaRef}
          markdown=""
          onMarkdownChange={() => {}}
          loading={true}
        />
        <main className="flex-1 overflow-auto pb-20 pt-[41px]">
          <ContentSkeleton styles={styles} />
        </main>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Revision Preview Banner */}
      {previewingRevision && (
        <div className="bg-ab-warning/15 border-b border-ab-warning/30 px-4 py-2 flex items-center justify-between">
          <span className="text-sm text-ab-warning">
            Previewing revision from {new Date(previewingRevision.createdAt).toLocaleString()}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={cancelRevisionPreview}
              className="px-3 py-1 text-sm border border-ab-warning/40 rounded hover:bg-ab-warning/20"
            >
              Cancel
            </button>
            <button
              onClick={restoreRevision}
              className="px-3 py-1 text-sm bg-amber-600 text-white rounded hover:bg-amber-700"
            >
              Restore
            </button>
          </div>
        </div>
      )}

      {/* Toolbar */}
      {!previewingRevision && (
        <EditorToolbar
          editor={showMarkdown ? null : editor}
          textareaRef={showMarkdown ? textareaRef : undefined}
          markdown={post.markdown}
          onMarkdownChange={(md) => setPost(prev => ({ ...prev, markdown: md }))}
          showMarkdown={showMarkdown}
          setShowMarkdown={setShowMarkdown}
          aiGenerating={generating}
          postSlug={slug}
          revisions={post.id ? {
            list: revisions,
            loading: revisionsLoading,
            previewLoading: false,
            previewing: previewingRevision,
            fetch: fetchRevisions,
            preview: previewRevision,
            cancel: cancelRevisionPreview,
            restore: restoreRevision,
          } : undefined}
          apiBasePath={apiBasePath}
          hasSelection={!!comments.selectedText && !comments.selectedText.hasExistingComment}
          selectionHasComment={comments.selectedText?.hasExistingComment}
          onAddComment={() => setCommentsOpen(true)}
          commentsCount={comments.list.filter(c => !c.resolved).length}
          onViewComments={() => setCommentsOpen(true)}
        />
      )}

      {/* Editor Content - pt-[41px] accounts for fixed toolbar height when visible */}
      <main className={`flex-1 overflow-auto pb-20 overscroll-contain touch-pan-y ${!previewingRevision ? 'pt-[41px]' : ''}`}>
        <article className={`${styles.container} pt-12 pb-24 mx-auto`}>
          {/* Header - Title & Subtitle */}
          <header className="space-y-2 mb-8">
            {generating && !post.title ? (
              <Skeleton className="h-8 w-4/5" />
            ) : (
              <AutoResizeTextarea
                value={post.title}
                onChange={(val) => setPost(prev => ({ ...prev, title: val }))}
                placeholder="Title"
                disabled={generating || !!previewingRevision}
                className={`${styles.title} w-full bg-transparent border-none outline-none placeholder-ab-placeholder ${(generating || previewingRevision) ? 'opacity-60 cursor-not-allowed' : ''}`}
              />
            )}
            {generating && !post.subtitle ? (
              <Skeleton className="h-5 w-3/5" />
            ) : (
              <AutoResizeTextarea
                value={post.subtitle}
                onChange={(val) => setPost(prev => ({ ...prev, subtitle: val }))}
                placeholder="Subtitle"
                disabled={generating || !!previewingRevision}
                className={`${styles.subtitle} w-full bg-transparent border-none outline-none placeholder-ab-placeholder ${(generating || previewingRevision) ? 'opacity-60 cursor-not-allowed' : ''}`}
              />
            )}
            <div className="!mt-4">
              <span className={`${styles.byline} underline ${generating ? 'opacity-60' : ''}`}>
                {session?.user?.name || session?.user?.email || 'Author'}
              </span>
            </div>
          </header>

          {/* Body */}
          <div className="mt-8">
            {generating && !post.markdown ? (
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            ) : showMarkdown ? (
              <textarea
                ref={textareaRef}
                value={post.markdown}
                onChange={e => setPost(prev => ({ ...prev, markdown: e.target.value }))}
                placeholder="Start writing..."
                disabled={generating || !!previewingRevision}
                className={`${styles.prose} w-full bg-transparent border-none outline-none resize-none overflow-hidden placeholder-muted-foreground leading-relaxed font-mono text-sm ${(generating || previewingRevision) ? 'opacity-60 cursor-not-allowed' : ''}`}
              />
            ) : (
              <TiptapEditor
                content={post.markdown}
                onChange={(md) => setPost(prev => ({ ...prev, markdown: md }))}
                onEditorReady={setEditor}
                autoFocus={!slug}
                proseClasses={styles.prose}
                onSelectionChange={(sel: SelectionState | null) => {
                  if (sel?.hasSelection) {
                    comments.setSelectedText({
                      text: sel.text,
                      from: sel.from,
                      to: sel.to,
                      hasExistingComment: sel.hasExistingComment,
                    })
                  } else {
                    comments.setSelectedText(null)
                  }
                }}
                onCommentClick={(commentId: string) => {
                  comments.setActiveId(commentId)
                  setCommentsOpen(true)
                }}
              />
            )}
          </div>

          {/* Footer Metadata */}
          {!previewingRevision && (
            <div className="mt-12 pt-8 border-t border-border space-y-4">
              {/* URL */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground w-14">URL</span>
                  <span className="text-muted-foreground/70">{urlPrefix}</span>
                  {isPublished ? (
                    <span className="flex items-center gap-1.5 text-ab-neutral-strong">
                      {post.slug}
                      <svg className="w-3 h-3 text-muted-foreground/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </span>
                  ) : (
                    <input
                      type="text"
                      value={post.slug}
                      onChange={(e) => setPost(prev => ({ ...prev, slug: e.target.value }))}
                      placeholder="post-slug"
                      className="flex-1 bg-transparent border-none outline-none placeholder-muted-foreground text-ab-neutral-strong"
                    />
                  )}
                </div>
              </div>
              
              {/* Slug change warning for previously-published posts */}
              {wasPublished && originalSlug && post.slug !== originalSlug && !isPublished && (
                <div className="flex items-start gap-2 p-3 rounded-md bg-ab-warning/10 border border-ab-warning/30 text-sm">
                  <svg className="w-4 h-4 text-ab-warning mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div className="text-ab-warning">
                    <span className="font-medium">URL change detected.</span>
                    {' '}Existing links to <code className="px-1 py-0.5 bg-ab-warning/20 rounded text-xs">{urlPrefix}{originalSlug}</code> will automatically redirect to the new URL when you publish.
                  </div>
                </div>
              )}

              {/* Custom Fields (footer position) */}
              {fields.filter(f => f.position === 'footer').map(field => {
                const handleFieldChange = (name: string, value: unknown) => {
                  setPost(prev => ({ ...prev, [name]: value }))
                }
                
                // If no label, render component full-width (for section-style fields like SEO)
                if (!field.label) {
                  return (
                    <div key={field.name} className="text-sm">
                      <field.component
                        value={post[field.name] as any}
                        onChange={(val: unknown) => setPost(prev => ({ ...prev, [field.name]: val }))}
                        onFieldChange={handleFieldChange}
                        post={post as any}
                        disabled={saving || generating}
                      />
                    </div>
                  )
                }
                
                // With label, render inline row style
                return (
                  <div key={field.name} className="flex items-center justify-between text-sm gap-2">
                    <div className="flex items-center gap-2 flex-1">
                      <span className="text-muted-foreground w-14 flex-shrink-0">{field.label}</span>
                      <div className="flex-1">
                        <field.component
                          value={post[field.name] as any}
                          onChange={(val: unknown) => setPost(prev => ({ ...prev, [field.name]: val }))}
                          onFieldChange={handleFieldChange}
                          post={post as any}
                          disabled={saving || generating}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}

              {/* Tags */}
              <TagsSection
                tags={post.tags || []}
                onTagsChange={(tags) => setPost(prev => ({ ...prev, tags }))}
                apiBasePath={apiBasePath}
                disabled={saving || generating}
              />

              {/* Status */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Status</span>
                  <span className={isPublished ? "text-xs text-ab-success-muted" : "text-xs text-muted-foreground/70"}>
                    {isPublished ? 'Published' : 'Draft'}
                  </span>
                </div>
                
                {/* Publish/Unpublish/Update button */}
                {isPublished ? (
                  hasUnsavedChanges ? (
                    <button
                      onClick={() => savePost()}
                      disabled={saving || generating}
                      className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md hover:opacity-90 disabled:opacity-50 flex items-center gap-1"
                    >
                      {savingAs && (
                        <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                      )}
                      Update
                    </button>
                  ) : (
                    <button
                      onClick={handleUnpublish}
                      className="px-3 py-1.5 text-sm rounded-md border border-border text-muted-foreground hover:text-destructive hover:border-destructive/50 hover:bg-destructive/10 transition-colors"
                    >
                      Unpublish
                    </button>
                  )
                ) : (
                  <button
                    onClick={handlePublish}
                    disabled={saving || generating}
                    className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md hover:opacity-90 disabled:opacity-50 flex items-center gap-1"
                  >
                    {savingAs === 'published' && (
                      <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    )}
                    Publish
                  </button>
                )}
              </div>

              {/* Word count */}
              <div className="text-sm text-muted-foreground pt-2 border-t border-border">
                {words.toLocaleString()} words · ~{Math.ceil(words / 200)} min read
              </div>
            </div>
          )}
        </article>
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 border-t border-border px-4 py-3 bg-background touch-none">
        <div className="flex items-center justify-end text-sm text-muted-foreground">
          {generating ? (
            <button className="hover:text-foreground transition-colors">
              Press Esc to stop generating
            </button>
          ) : previewingRevision ? (
            <button 
              onClick={cancelRevisionPreview}
              className="hover:text-foreground transition-colors"
            >
              Press Esc to cancel
            </button>
          ) : isPublished && post.publishedAt ? (
            <span>Published {formatSavedTime(new Date(post.publishedAt as string))}</span>
          ) : lastSaved ? (
            <span>Saved {formatSavedTime(lastSaved)}</span>
          ) : (
            <span>Not saved yet</span>
          )}
        </div>
      </footer>

      {/* Comments Panel */}
      {currentUserEmail && (
        <CommentsPanel
          comments={comments.list}
          currentUserEmail={currentUserEmail}
          isAdmin={isAdmin}
          selectedText={comments.selectedText?.text ?? null}
          onCreateComment={comments.create}
          onReply={comments.reply}
          onEdit={comments.edit}
          onDelete={comments.remove}
          onResolve={comments.resolve}
          onCommentClick={comments.scrollTo}
          activeCommentId={comments.activeId}
          isOpen={commentsOpen}
          onClose={() => setCommentsOpen(false)}
          onClearSelection={() => comments.setSelectedText(null)}
        />
      )}
    </div>
  )
}
