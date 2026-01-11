'use client'

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import type { CustomFieldConfig, StylesConfig } from '../config'
import { useDashboardKeyboard } from './hooks/useKeyboard'

// Dashboard context
interface DashboardContextValue {
  basePath: string
  apiBasePath: string
  styles: Required<StylesConfig>
  fields: CustomFieldConfig[]
  currentPath: string
  navigate: (path: string) => void
}

const DashboardContext = createContext<DashboardContextValue | null>(null)

export function useDashboardContext() {
  const ctx = useContext(DashboardContext)
  if (!ctx) throw new Error('useDashboardContext must be used within AutobloggerDashboard')
  return ctx
}

// Default styles
const DEFAULT_STYLES: Required<StylesConfig> = {
  container: 'max-w-ab-content mx-auto px-ab-content-padding',
  title: 'text-ab-title font-bold',
  subtitle: 'text-ab-h2 text-muted-foreground',
  byline: 'text-sm text-muted-foreground',
  prose: 'prose dark:prose-invert max-w-none',
}

// Safe path extraction
function extractPath(pathname: string, basePath: string): string {
  const normalized = pathname.replace(/\/$/, '')
  const base = basePath.replace(/\/$/, '')
  
  if (normalized === base) return '/'
  if (normalized.startsWith(base + '/')) {
    return normalized.slice(base.length) || '/'
  }
  return '/'
}

// Props
interface AutobloggerDashboardProps {
  basePath?: string
  apiBasePath?: string
  styles?: StylesConfig
  fields?: CustomFieldConfig[]
  children?: ReactNode
}

// Main dashboard component
export function AutobloggerDashboard({
  basePath = '/writer',
  apiBasePath = '/api/cms',
  styles,
  fields = [],
}: AutobloggerDashboardProps) {
  const [currentPath, setCurrentPath] = useState('/')
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentPath(extractPath(window.location.pathname, basePath))
      
      // Listen for navigation
      const handlePopState = () => {
        setCurrentPath(extractPath(window.location.pathname, basePath))
      }
      window.addEventListener('popstate', handlePopState)
      return () => window.removeEventListener('popstate', handlePopState)
    }
  }, [basePath])

  const navigate = useCallback((path: string) => {
    const fullPath = path.startsWith('/') ? basePath + path : basePath + '/' + path
    window.history.pushState({}, '', fullPath)
    setCurrentPath(path.startsWith('/') ? path : '/' + path)
  }, [basePath])

  const mergedStyles: Required<StylesConfig> = {
    ...DEFAULT_STYLES,
    ...styles,
  }

  const contextValue: DashboardContextValue = {
    basePath,
    apiBasePath,
    styles: mergedStyles,
    fields,
    currentPath,
    navigate,
  }

  return (
    <DashboardContext.Provider value={contextValue}>
      <DashboardLayout>
        <DashboardRouter path={currentPath} />
      </DashboardLayout>
    </DashboardContext.Provider>
  )
}

// Layout with keyboard shortcuts
function DashboardLayout({ children }: { children: ReactNode }) {
  const { basePath, currentPath, navigate } = useDashboardContext()
  
  // Scoped keyboard shortcuts - only work within dashboard
  useDashboardKeyboard({
    basePath,
    onToggleView: () => {
      // Toggle between writer list and editor
      if (currentPath.startsWith('/editor')) {
        navigate('/')
      }
    },
    onToggleSettings: () => {
      if (currentPath.startsWith('/settings')) {
        navigate('/')
      } else {
        navigate('/settings')
      }
    },
    onNewPost: () => {
      if (currentPath === '/' || currentPath === '') {
        navigate('/editor')
      }
    },
    onEscape: () => {
      if (currentPath !== '/' && currentPath !== '') {
        navigate('/')
      }
    },
  })
  
  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b px-4 py-3">
        <div className="flex items-center gap-4">
          <a href={basePath} className="font-semibold">Writer</a>
          <a href={`${basePath}/inbox`} className="text-muted-foreground hover:text-foreground">Inbox</a>
          <a href={`${basePath}/settings`} className="text-muted-foreground hover:text-foreground">Settings</a>
        </div>
      </nav>
      <main className="p-4">
        {children}
      </main>
    </div>
  )
}

// Simple router
function DashboardRouter({ path }: { path: string }) {
  if (path === '/' || path === '') {
    return <WriterPage />
  }
  if (path.startsWith('/editor')) {
    const slug = path.replace('/editor/', '').replace('/editor', '')
    return <EditorPage slug={slug || undefined} />
  }
  if (path === '/inbox') {
    return <InboxPage />
  }
  if (path.startsWith('/settings')) {
    return <SettingsPage subPath={path.replace('/settings', '')} />
  }
  return <div>Page not found: {path}</div>
}

// Placeholder pages
function WriterPage() {
  const { apiBasePath, basePath, navigate } = useDashboardContext()
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${apiBasePath}/posts`)
      .then(r => r.json())
      .then(d => {
        setPosts(d.data || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [apiBasePath])

  if (loading) return <div className="max-w-4xl mx-auto"><p>Loading...</p></div>

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Posts</h1>
        <button 
          onClick={() => navigate('/editor')}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90"
        >
          New Post
        </button>
      </div>
      <div className="space-y-2">
        {posts.map((post: any) => (
          <button
            key={post.id}
            onClick={() => navigate(`/editor/${post.slug}`)}
            className="block w-full text-left p-4 border rounded-lg hover:bg-accent"
          >
            <div className="font-medium">{post.title || 'Untitled'}</div>
            <div className="text-sm text-muted-foreground">
              {post.status} · {new Date(post.updatedAt).toLocaleDateString()}
            </div>
          </button>
        ))}
        {posts.length === 0 && (
          <p className="text-muted-foreground">No posts yet. Create your first one!</p>
        )}
      </div>
    </div>
  )
}

function EditorPage({ slug }: { slug?: string }) {
  const { apiBasePath, styles, fields, navigate } = useDashboardContext()
  const [post, setPost] = useState<any>(null)
  const [loading, setLoading] = useState(!!slug)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (slug) {
      fetch(`${apiBasePath}/posts`)
        .then(r => r.json())
        .then(d => {
          const found = d.data?.find((p: any) => p.slug === slug)
          setPost(found || { title: '', subtitle: '', markdown: '', status: 'draft' })
          setLoading(false)
        })
        .catch(() => setLoading(false))
    } else {
      setPost({ title: '', subtitle: '', markdown: '', status: 'draft' })
    }
  }, [slug, apiBasePath])

  const savePost = async () => {
    setSaving(true)
    try {
      const method = post.id ? 'PATCH' : 'POST'
      const url = post.id ? `${apiBasePath}/posts/${post.id}` : `${apiBasePath}/posts`
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(post),
      })
      
      const data = await res.json()
      if (data.data) {
        setPost(data.data)
        if (!post.id) {
          // Navigate to the new post's URL
          navigate(`/editor/${data.data.slug}`)
        }
      }
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="max-w-4xl mx-auto"><p>Loading...</p></div>
  if (!post) return <div className="max-w-4xl mx-auto"><p>Post not found</p></div>

  return (
    <div>
      <div className="max-w-4xl mx-auto mb-4 flex justify-between items-center">
        <button onClick={() => navigate('/')} className="text-muted-foreground hover:text-foreground">
          ← Back
        </button>
        <div className="flex gap-2">
          <button
            onClick={savePost}
            disabled={saving}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
      
      <article className={styles.container}>
        <input
          type="text"
          value={post.title}
          onChange={e => setPost({ ...post, title: e.target.value })}
          placeholder="Title"
          className={`${styles.title} w-full bg-transparent border-none outline-none`}
        />
        <input
          type="text"
          value={post.subtitle || ''}
          onChange={e => setPost({ ...post, subtitle: e.target.value })}
          placeholder="Subtitle (optional)"
          className={`${styles.subtitle} w-full bg-transparent border-none outline-none mt-2`}
        />
        <div className="mt-8">
          <textarea
            value={post.markdown}
            onChange={e => setPost({ ...post, markdown: e.target.value })}
            placeholder="Start writing..."
            className={`${styles.prose} w-full min-h-[400px] bg-transparent border-none outline-none resize-none`}
          />
        </div>
        
        {/* Custom fields */}
        {fields.map(field => (
          <div key={field.name} className="mt-4 pt-4 border-t">
            {field.label && <label className="block text-sm font-medium mb-2">{field.label}</label>}
            <field.component
              value={post[field.name]}
              onChange={(val) => setPost({ ...post, [field.name]: val })}
              post={post}
              disabled={saving}
            />
          </div>
        ))}
      </article>
    </div>
  )
}

function InboxPage() {
  const { apiBasePath, navigate } = useDashboardContext()
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch pending news items
    fetch(`${apiBasePath}/posts?status=suggested`)
      .then(r => r.json())
      .then(d => {
        setItems(d.data || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [apiBasePath])

  if (loading) return <div className="max-w-4xl mx-auto"><p>Loading...</p></div>

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Inbox</h1>
      {items.length === 0 ? (
        <p className="text-muted-foreground">
          No suggested posts. Configure RSS feeds in Topics settings to auto-generate drafts.
        </p>
      ) : (
        <div className="space-y-2">
          {items.map((item: any) => (
            <button
              key={item.id}
              onClick={() => navigate(`/editor/${item.slug}`)}
              className="block w-full text-left p-4 border rounded-lg hover:bg-accent"
            >
              <div className="font-medium">{item.title}</div>
              <div className="text-sm text-muted-foreground">
                {new Date(item.createdAt).toLocaleDateString()}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function SettingsPage({ subPath }: { subPath: string }) {
  const { basePath, navigate } = useDashboardContext()
  
  const settingsLinks = [
    { href: '/settings/ai', label: 'AI Settings', description: 'Configure AI models and rules' },
    { href: '/settings/topics', label: 'Topics', description: 'Manage RSS subscriptions' },
    { href: '/settings/tags', label: 'Tags', description: 'Manage post tags' },
    { href: '/settings/posts', label: 'Posts', description: 'Manage all posts' },
    { href: '/settings/users', label: 'Users', description: 'Manage user access' },
    { href: '/settings/revisions', label: 'Revisions', description: 'View revision history' },
  ]

  if (!subPath || subPath === '/') {
    return (
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Settings</h1>
        <div className="grid gap-4 sm:grid-cols-2">
          {settingsLinks.map(link => (
            <button
              key={link.href}
              onClick={() => navigate(link.href)}
              className="block w-full text-left p-4 border rounded-lg hover:bg-accent"
            >
              <div className="font-medium">{link.label}</div>
              <div className="text-sm text-muted-foreground">{link.description}</div>
            </button>
          ))}
        </div>
      </div>
    )
  }

  // Render specific settings page
  const pageName = subPath.replace('/', '').charAt(0).toUpperCase() + subPath.slice(2)
  
  return (
    <div className="max-w-4xl mx-auto">
      <button onClick={() => navigate('/settings')} className="text-muted-foreground hover:text-foreground mb-4">
        ← Back to Settings
      </button>
      <h1 className="text-2xl font-bold mb-6">{pageName} Settings</h1>
      <p className="text-muted-foreground">Settings page: {subPath}</p>
      {/* TODO: Implement individual settings pages */}
    </div>
  )
}

// Export types
export type { AutobloggerDashboardProps, DashboardContextValue }
