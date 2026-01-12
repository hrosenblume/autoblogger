'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { Globe, Brain, ArrowUp, ChevronDown, Check, X, Plus, Search, MoreVertical, ExternalLink } from 'lucide-react'
import { useDashboardContext } from '../context'
import { ControlButton } from '../components/ControlButton'
import { ModelSelector } from '../components/ModelSelector'
import { LENGTH_OPTIONS, DEFAULT_MODELS, type AIModelOption } from '../../lib/models'
import { formatRelativeTime } from '../../lib/format'

interface Post {
  id: string
  title: string
  slug: string
  status: 'draft' | 'published' | 'suggested' | 'deleted'
  wordCount?: number
  updatedAt: string
  publishedAt: string | null
}

interface SuggestedPost {
  id: string
  title: string
  subtitle: string | null
  slug: string
  sourceUrl: string | null
  createdAt: string
  topic: { id: string; name: string } | null
}

type TabType = 'all' | 'drafts' | 'published'

export function WriterDashboard() {
  const { apiBasePath, navigate, sharedData, sharedDataLoading } = useDashboardContext()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<TabType>('all')
  const [suggestedPosts, setSuggestedPosts] = useState<SuggestedPost[]>([])
  const [autoDraftEnabled, setAutoDraftEnabled] = useState(false)
  const [suggestedOpen, setSuggestedOpen] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  
  const [models, setModels] = useState<AIModelOption[]>(DEFAULT_MODELS)
  const [modelId, setModelId] = useState('claude-sonnet')
  const [length, setLength] = useState<number>(500)
  const [webEnabled, setWebEnabled] = useState(false)
  const [thinkingEnabled, setThinkingEnabled] = useState(false)
  const [lengthOpen, setLengthOpen] = useState(false)

  // Sync with shared data from context
  useEffect(() => {
    if (sharedData) {
      setPosts(sharedData.posts as Post[])
      setSuggestedPosts(sharedData.suggestedPosts as SuggestedPost[])
      setAutoDraftEnabled(sharedData.settings.autoDraftEnabled)
      if (sharedData.aiSettings.availableModels.length > 0) {
        setModels(sharedData.aiSettings.availableModels as AIModelOption[])
      }
      if (sharedData.aiSettings.defaultModel) {
        setModelId(sharedData.aiSettings.defaultModel)
      }
      setLoading(false)
    }
  }, [sharedData])

  // Also stop loading when sharedDataLoading becomes false (even if data is empty)
  useEffect(() => {
    if (!sharedDataLoading) {
      setLoading(false)
    }
  }, [sharedDataLoading])

  const currentModel = models.find(m => m.id === modelId)
  const draftCount = useMemo(() => posts.filter(p => p.status === 'draft').length, [posts])
  const publishedCount = useMemo(() => posts.filter(p => p.status === 'published').length, [posts])

  const filteredPosts = useMemo(() => {
    let result = posts.filter(p => p.status !== 'suggested' && p.status !== 'deleted')
    if (searchQuery) {
      result = result.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()))
    }
    if (activeTab === 'drafts') result = result.filter(p => p.status === 'draft')
    else if (activeTab === 'published') result = result.filter(p => p.status === 'published')
    return result.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  }, [posts, searchQuery, activeTab])

  async function handleDelete(id: string) {
    if (!confirm('Delete this post?')) return
    await fetch(`${apiBasePath}/posts/${id}`, { method: 'DELETE' })
    setPosts(posts.filter(p => p.id !== id))
  }

  async function handlePublish(id: string) {
    await fetch(`${apiBasePath}/posts/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'published' }),
    })
    setPosts(posts.map(p => p.id === id ? { ...p, status: 'published' as const } : p))
  }

  async function handleUnpublish(id: string) {
    await fetch(`${apiBasePath}/posts/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'draft' }),
    })
    setPosts(posts.map(p => p.id === id ? { ...p, status: 'draft' as const } : p))
  }

  async function handleAcceptSuggested(post: SuggestedPost) {
    setActionLoading(post.id)
    try {
      const res = await fetch(`${apiBasePath}/posts/${post.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'draft' }),
      })
      if (res.ok) navigate(`/editor/${post.slug}`)
    } finally {
      setActionLoading(null)
    }
  }

  async function handleRejectSuggested(post: SuggestedPost) {
    if (!confirm(`Reject "${post.title}"?`)) return
    setActionLoading(post.id)
    try {
      const res = await fetch(`${apiBasePath}/posts/${post.id}`, { method: 'DELETE' })
      if (res.ok) setSuggestedPosts(suggestedPosts.filter(p => p.id !== post.id))
    } finally {
      setActionLoading(null)
    }
  }

  function handleIdeaSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const idea = (formData.get('idea') as string)?.trim()
    if (idea) {
      const params = new URLSearchParams({
        idea,
        model: modelId,
        length: String(length),
        ...(webEnabled && { web: '1' }),
        ...(thinkingEnabled && { thinking: '1' })
      })
      navigate(`/editor?${params}`)
    }
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="mt-4 mb-8">
          <div className="h-6 w-48 bg-muted rounded animate-pulse mb-4" />
          <div className="h-24 w-full bg-muted rounded animate-pulse" />
        </div>
        <div className="flex border-b border-border mb-6 gap-4">
          <div className="h-10 w-16 bg-muted rounded animate-pulse" />
          <div className="h-10 w-20 bg-muted rounded animate-pulse" />
          <div className="h-10 w-24 bg-muted rounded animate-pulse" />
        </div>
        {[1,2,3,4,5].map(i => (
          <div key={i} className="h-16 bg-muted rounded animate-pulse mb-2" />
        ))}
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 pb-16">
      <button
        onClick={() => navigate('/editor')}
        className="sm:hidden fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg z-50 bg-primary text-primary-foreground flex items-center justify-center"
      >
        <Plus className="w-6 h-6" />
      </button>

      <div className="mt-4 mb-8">
        <h2 className="text-lg font-semibold mb-4">What's on your mind?</h2>
        <form onSubmit={handleIdeaSubmit}>
          <div className="relative">
            <textarea
              name="idea"
              placeholder="Describe your idea..."
              rows={3}
              className="w-full min-h-[100px] px-3 py-2 pr-14 border border-input rounded-md bg-transparent resize-none text-base focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring placeholder:text-muted-foreground"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  e.currentTarget.form?.requestSubmit()
                }
              }}
            />
            <button
              type="submit"
              className="absolute bottom-3 right-3 rounded-full w-10 h-10 bg-secondary text-secondary-foreground flex items-center justify-center hover:bg-secondary/80"
            >
              <ArrowUp className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <ControlButton onClick={() => setLengthOpen(!lengthOpen)}>
                {length} words
                <ChevronDown className="w-3.5 h-3.5" />
              </ControlButton>
              {lengthOpen && (
                <div className="absolute top-full left-0 mt-1 bg-popover border border-border rounded-md shadow-md z-50">
                  {LENGTH_OPTIONS.map(len => (
                    <button
                      key={len}
                      onClick={() => { setLength(len); setLengthOpen(false) }}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-accent flex items-center justify-between min-w-[120px]"
                    >
                      {len} words
                      {length === len && <Check className="w-4 h-4" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <ControlButton onClick={() => setWebEnabled(!webEnabled)} active={webEnabled} title="Search the web">
              <Globe className="w-4 h-4" />
            </ControlButton>
            
            <ControlButton onClick={() => setThinkingEnabled(!thinkingEnabled)} active={thinkingEnabled} title="Enable thinking mode">
              <Brain className="w-4 h-4" />
            </ControlButton>
            
            <ModelSelector models={models} selectedModel={modelId} onModelChange={setModelId} currentModel={currentModel} />
          </div>
        </form>
      </div>

      {autoDraftEnabled && (
        <section className="mb-8">
          <button onClick={() => setSuggestedOpen(!suggestedOpen)} className="flex items-center gap-2 text-lg font-semibold mb-4">
            <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${suggestedOpen ? '' : '-rotate-90'}`} />
            Suggested
            {suggestedPosts.length > 0 && (
              <span className="bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center">
                {suggestedPosts.length}
              </span>
            )}
          </button>
          {suggestedOpen && (
            suggestedPosts.length > 0 ? (
              <div className="space-y-2">
                {suggestedPosts.map(post => (
                  <div key={post.id} className="flex items-center justify-between gap-4 py-3 border-b border-border">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{post.title}</p>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        {post.topic && <span className="bg-muted px-2 py-0.5 rounded text-xs">{post.topic.name}</span>}
                        <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                        {post.sourceUrl && (
                          <a
                            href={post.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 hover:text-foreground"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <ExternalLink className="h-3 w-3" />
                            Source
                          </a>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleRejectSuggested(post)}
                        disabled={actionLoading === post.id}
                        className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-md"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleAcceptSuggested(post)}
                        disabled={actionLoading === post.id}
                        className="px-3 py-1.5 bg-primary text-primary-foreground rounded text-sm flex items-center gap-1"
                      >
                        <Check className="h-4 w-4" />
                        Accept
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">
                No suggested essays — configure topics to generate drafts
              </p>
            )
          )}
        </section>
      )}

      <div className="relative flex items-center justify-between border-b border-border mb-6">
        <div className={`flex ${searchOpen ? 'invisible sm:visible' : ''}`}>
          {(['all', 'drafts', 'published'] as TabType[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
                activeTab === tab ? 'border-foreground text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              <span className="text-muted-foreground ml-1">
                ({tab === 'all' ? posts.filter(p => p.status !== 'suggested' && p.status !== 'deleted').length : tab === 'drafts' ? draftCount : publishedCount})
              </span>
            </button>
          ))}
        </div>
        
        <div className={`flex items-center gap-2 pb-2 ${searchOpen ? 'absolute inset-x-0 sm:relative' : ''}`}>
          <button onClick={() => navigate('/editor')} className="hidden sm:flex p-2 text-muted-foreground hover:text-foreground rounded-md hover:bg-accent">
            <Plus className="w-4 h-4" />
          </button>
          {searchOpen ? (
            <div className="flex items-center gap-2 flex-1 sm:flex-initial">
              <input
                type="search"
                placeholder="Search..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                autoFocus
                className="flex-1 sm:w-48 px-3 py-1.5 text-base bg-background border border-border rounded-md outline-none focus-visible:border-ring"
              />
              <button onClick={() => { setSearchOpen(false); setSearchQuery('') }} className="p-2 text-muted-foreground hover:text-foreground sm:hidden">
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button onClick={() => setSearchOpen(true)} className="p-2 text-muted-foreground hover:text-foreground rounded-md hover:bg-accent">
              <Search className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <section>
        {filteredPosts.length > 0 ? (
          <div className="space-y-0">
            {filteredPosts.map(post => (
              <PostItem
                key={post.id}
                post={post}
                onNavigate={() => navigate(`/editor/${post.slug}`)}
                onDelete={() => handleDelete(post.id)}
                onPublish={() => handlePublish(post.id)}
                onUnpublish={() => handleUnpublish(post.id)}
                showStatus={activeTab === 'all'}
              />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground py-8 text-center">
            {searchQuery ? 'No matching articles' : 'No articles yet'}
          </p>
        )}
      </section>
    </div>
  )
}

// PostItem component matching the original design
interface PostItemProps {
  post: Post
  onNavigate: () => void
  onDelete: () => void
  onPublish: () => void
  onUnpublish: () => void
  showStatus?: boolean
}

function PostItem({ post, onNavigate, onDelete, onPublish, onUnpublish, showStatus }: PostItemProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close menu when clicking outside
  useEffect(() => {
    if (!menuOpen) return
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [menuOpen])

  return (
    <div className="flex items-center justify-between py-4 border-b border-border group">
      <div className="flex-1 min-w-0">
        <button onClick={onNavigate} className="block text-left w-full">
          <h3 className="font-medium truncate group-hover:text-muted-foreground">
            {post.title || 'Untitled'}
          </h3>
          <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
            {showStatus && (
              <span className={`text-xs px-1.5 py-0.5 rounded uppercase font-medium ${
                post.status === 'draft' 
                  ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                  : 'bg-green-500/20 text-green-600 dark:text-green-400'
              }`}>
                {post.status}
              </span>
            )}
            <span>{formatRelativeTime(post.updatedAt)}{post.wordCount ? ` · ${post.wordCount} words` : ''}</span>
          </p>
        </button>
      </div>
      
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="p-2 text-muted-foreground hover:text-foreground rounded-md hover:bg-accent"
        >
          <MoreVertical className="w-4 h-4" />
        </button>
        {menuOpen && (
          <div className="absolute right-0 top-full mt-1 bg-popover border border-border rounded-md shadow-lg z-50 min-w-[12rem] md:min-w-[8rem] p-1">
            <button
              onClick={() => { onNavigate(); setMenuOpen(false) }}
              className="w-full px-3 py-2.5 md:px-2 md:py-1.5 min-h-[44px] md:min-h-0 text-left text-sm rounded-sm hover:bg-accent cursor-default"
            >
              Edit
            </button>
            {post.status === 'draft' && (
              <button
                onClick={() => { onPublish(); setMenuOpen(false) }}
                className="w-full px-3 py-2.5 md:px-2 md:py-1.5 min-h-[44px] md:min-h-0 text-left text-sm rounded-sm hover:bg-accent cursor-default"
              >
                Publish
              </button>
            )}
            {post.status === 'published' && (
              <button
                onClick={() => { onUnpublish(); setMenuOpen(false) }}
                className="w-full px-3 py-2.5 md:px-2 md:py-1.5 min-h-[44px] md:min-h-0 text-left text-sm rounded-sm hover:bg-accent cursor-default"
              >
                Unpublish
              </button>
            )}
            <div className="h-px bg-border my-1" />
            <button
              onClick={() => { onDelete(); setMenuOpen(false) }}
              className="w-full px-3 py-2.5 md:px-2 md:py-1.5 min-h-[44px] md:min-h-0 text-left text-sm rounded-sm text-destructive hover:bg-accent cursor-default"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
