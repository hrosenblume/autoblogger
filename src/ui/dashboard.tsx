'use client'

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { CustomFieldConfig, StylesConfig } from '../config'

// Dashboard context
interface DashboardContextValue {
  basePath: string
  apiBasePath: string
  styles: Required<StylesConfig>
  fields: CustomFieldConfig[]
  currentPath: string
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
    // Get initial path
    if (typeof window !== 'undefined') {
      setCurrentPath(extractPath(window.location.pathname, basePath))
    }
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
  }

  return (
    <DashboardContext.Provider value={contextValue}>
      <DashboardLayout>
        <DashboardRouter path={currentPath} />
      </DashboardLayout>
    </DashboardContext.Provider>
  )
}

// Layout wrapper
function DashboardLayout({ children }: { children: ReactNode }) {
  const { basePath } = useDashboardContext()
  
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

// Placeholder pages - these will be expanded
function WriterPage() {
  const { apiBasePath, basePath } = useDashboardContext()
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

  if (loading) return <div>Loading...</div>

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Posts</h1>
        <a 
          href={`${basePath}/editor`}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
        >
          New Post
        </a>
      </div>
      <div className="space-y-2">
        {posts.map((post: any) => (
          <a
            key={post.id}
            href={`${basePath}/editor/${post.slug}`}
            className="block p-4 border rounded-lg hover:bg-accent"
          >
            <div className="font-medium">{post.title || 'Untitled'}</div>
            <div className="text-sm text-muted-foreground">
              {post.status} · {new Date(post.updatedAt).toLocaleDateString()}
            </div>
          </a>
        ))}
        {posts.length === 0 && (
          <p className="text-muted-foreground">No posts yet. Create your first one!</p>
        )}
      </div>
    </div>
  )
}

function EditorPage({ slug }: { slug?: string }) {
  const { apiBasePath, styles, fields } = useDashboardContext()
  const [post, setPost] = useState<any>(null)
  const [loading, setLoading] = useState(!!slug)

  useEffect(() => {
    if (slug) {
      fetch(`${apiBasePath}/posts?slug=${slug}`)
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

  if (loading) return <div>Loading...</div>
  if (!post) return <div>Post not found</div>

  return (
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
        <div key={field.name} className="mt-4">
          <field.component
            value={post[field.name]}
            onChange={(val) => setPost({ ...post, [field.name]: val })}
            post={post}
            disabled={false}
          />
        </div>
      ))}
    </article>
  )
}

function InboxPage() {
  const { apiBasePath } = useDashboardContext()
  const [items, setItems] = useState<any[]>([])

  useEffect(() => {
    // This would fetch from /api/cms/news-items?status=pending
    // For now, show placeholder
  }, [apiBasePath])

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Inbox</h1>
      <p className="text-muted-foreground">
        Suggested posts from RSS feeds will appear here.
      </p>
    </div>
  )
}

function SettingsPage({ subPath }: { subPath: string }) {
  const { basePath } = useDashboardContext()
  
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
            <a
              key={link.href}
              href={basePath + link.href}
              className="block p-4 border rounded-lg hover:bg-accent"
            >
              <div className="font-medium">{link.label}</div>
              <div className="text-sm text-muted-foreground">{link.description}</div>
            </a>
          ))}
        </div>
      </div>
    )
  }

  // Sub-settings pages would be rendered here
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">
        {subPath.replace('/', '').charAt(0).toUpperCase() + subPath.slice(2)} Settings
      </h1>
      <p className="text-muted-foreground">Settings page: {subPath}</p>
    </div>
  )
}

// Export for use

export type { AutobloggerDashboardProps, DashboardContextValue }
