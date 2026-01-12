'use client'

import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from 'react'
import type { CustomFieldConfig, StylesConfig } from './types'

export interface DashboardConfig {
  fields: CustomFieldConfig[]
  styles: Required<StylesConfig>
}

// Session info (provided by the host app)
export interface SessionUser {
  id?: string
  name?: string | null
  email?: string
  role?: string
}

export interface Session {
  user?: SessionUser
}

// Shared data fetched once by the provider
export interface SharedData {
  counts: Record<string, number>
  settings: { autoDraftEnabled: boolean }
  posts: unknown[]
  suggestedPosts: unknown[]
  aiSettings: { defaultModel: string; availableModels: unknown[] }
}

// Editor content for parent app integration (e.g., chat context)
export interface EditorContent {
  title: string
  subtitle: string
  markdown: string
}

// Edit command from parent app (e.g., AI agent mode)
export interface EditCommand {
  type: 'replace_all' | 'replace_section' | 'insert' | 'delete'
  title?: string
  subtitle?: string
  markdown?: string
  find?: string
  replace?: string
  position?: 'before' | 'after' | 'start' | 'end'
}

export type EditHandler = (edit: EditCommand) => boolean

// Editor state exposed to parent app
export interface EditorState {
  hasUnsavedChanges: boolean
  status: 'draft' | 'published'
  savingAs: 'draft' | 'published' | null
  onSave: (status: 'draft' | 'published') => void
  confirmLeave: () => boolean
  // Content for chat integration
  content: EditorContent
}

export interface DashboardContextValue {
  basePath: string
  apiBasePath: string
  styles: Required<StylesConfig>
  fields: CustomFieldConfig[]
  currentPath: string
  navigate: (path: string) => void
  goBack: () => void
  canGoBack: boolean
  config: DashboardConfig
  // Session
  session: Session | null
  // Shared data
  sharedData: SharedData | null
  sharedDataLoading: boolean
  refetchSharedData: () => Promise<void>
  // Editor state callback (for parent app integration)
  onEditorStateChange?: (state: EditorState | null) => void
  // Edit handler registration (for AI agent mode)
  onRegisterEditHandler?: (handler: EditHandler | null) => void
}

const DashboardContext = createContext<DashboardContextValue | null>(null)

export function useDashboardContext() {
  const ctx = useContext(DashboardContext)
  if (!ctx) throw new Error('useDashboardContext must be used within DashboardProvider')
  return ctx
}

const DEFAULT_STYLES: Required<StylesConfig> = {
  container: 'max-w-[680px] mx-auto px-6',
  title: 'text-2xl font-bold',
  subtitle: 'text-lg text-muted-foreground',
  byline: 'text-sm text-muted-foreground',
  prose: 'prose dark:prose-invert max-w-none',
}

function extractPath(pathname: string, basePath: string): string {
  const normalized = pathname.replace(/\/$/, '')
  const base = basePath.replace(/\/$/, '')
  if (normalized === base) return '/'
  if (normalized.startsWith(base + '/')) return normalized.slice(base.length) || '/'
  return '/'
}

interface DashboardProviderProps {
  basePath?: string
  apiBasePath?: string
  styles?: StylesConfig
  fields?: CustomFieldConfig[]
  session?: Session | null
  onEditorStateChange?: (state: EditorState | null) => void
  onRegisterEditHandler?: (handler: EditHandler | null) => void
  children: ReactNode
}

export function DashboardProvider({
  basePath = '/writer',
  apiBasePath = '/api/cms',
  styles,
  fields = [],
  session = null,
  onEditorStateChange,
  onRegisterEditHandler,
  children,
}: DashboardProviderProps) {
  const [currentPath, setCurrentPath] = useState('/')
  const [sharedData, setSharedData] = useState<SharedData | null>(null)
  const [sharedDataLoading, setSharedDataLoading] = useState(true)
  // Track navigation history within the dashboard
  const [historyDepth, setHistoryDepth] = useState(0)
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentPath(extractPath(window.location.pathname, basePath))
      const handlePopState = () => {
        setCurrentPath(extractPath(window.location.pathname, basePath))
        // Decrement history depth on back navigation
        setHistoryDepth(d => Math.max(0, d - 1))
      }
      window.addEventListener('popstate', handlePopState)
      return () => window.removeEventListener('popstate', handlePopState)
    }
  }, [basePath])

  const navigate = useCallback((path: string) => {
    const fullPath = path.startsWith('/') ? basePath + path : basePath + '/' + path
    window.history.pushState({}, '', fullPath)
    setCurrentPath(path.startsWith('/') ? path : '/' + path)
    // Increment history depth on navigation
    setHistoryDepth(d => d + 1)
  }, [basePath])

  const goBack = useCallback(() => {
    if (historyDepth > 0) {
      // We have navigation history, use browser back
      window.history.back()
    } else {
      // No history (user landed directly on subpage), navigate to root
      navigate('/')
    }
  }, [historyDepth, navigate])

  const canGoBack = historyDepth > 0

  // Fetch all shared data once on mount
  const fetchSharedData = useCallback(async () => {
    setSharedDataLoading(true)
    try {
      const [countsRes, settingsRes, postsRes, aiSettingsRes] = await Promise.all([
        fetch(`${apiBasePath}/admin/counts`).then(r => r.ok ? r.json() : null),
        fetch(`${apiBasePath}/settings`).then(r => r.ok ? r.json() : null),
        fetch(`${apiBasePath}/posts`).then(r => r.ok ? r.json() : null),
        fetch(`${apiBasePath}/ai/settings`).then(r => r.ok ? r.json() : null),
      ])

      const autoDraftEnabled = settingsRes?.data?.autoDraftEnabled ?? false
      
      // Fetch suggested posts only if autoDraft is enabled
      let suggestedPosts: unknown[] = []
      if (autoDraftEnabled) {
        const suggestedRes = await fetch(`${apiBasePath}/posts?status=suggested`).then(r => r.ok ? r.json() : null)
        suggestedPosts = suggestedRes?.data || []
      }

      setSharedData({
        counts: countsRes?.data || {},
        settings: { autoDraftEnabled },
        posts: postsRes?.data || [],
        suggestedPosts,
        aiSettings: {
          defaultModel: aiSettingsRes?.data?.defaultModel || 'claude-sonnet',
          availableModels: aiSettingsRes?.data?.availableModels || [],
        },
      })
    } catch (err) {
      console.error('Failed to fetch shared data:', err)
      setSharedData({
        counts: {},
        settings: { autoDraftEnabled: false },
        posts: [],
        suggestedPosts: [],
        aiSettings: { defaultModel: 'claude-sonnet', availableModels: [] },
      })
    } finally {
      setSharedDataLoading(false)
    }
  }, [apiBasePath])

  useEffect(() => {
    fetchSharedData()
  }, [fetchSharedData])

  const mergedStyles = useMemo<Required<StylesConfig>>(
    () => ({ ...DEFAULT_STYLES, ...styles }),
    [styles]
  )
  
  const config = useMemo<DashboardConfig>(
    () => ({ fields, styles: mergedStyles }),
    [fields, mergedStyles]
  )

  const contextValue = useMemo<DashboardContextValue>(() => ({
    basePath, 
    apiBasePath, 
    styles: mergedStyles, 
    fields, 
    currentPath, 
    navigate,
    goBack,
    canGoBack,
    config,
    session,
    sharedData,
    sharedDataLoading,
    refetchSharedData: fetchSharedData,
    onEditorStateChange,
    onRegisterEditHandler,
  }), [
    basePath,
    apiBasePath,
    mergedStyles,
    fields,
    currentPath,
    navigate,
    goBack,
    canGoBack,
    config,
    session,
    sharedData,
    sharedDataLoading,
    fetchSharedData,
    onEditorStateChange,
    onRegisterEditHandler,
  ])

  return (
    <DashboardContext.Provider value={contextValue}>
      {children}
    </DashboardContext.Provider>
  )
}

export { DashboardContext }
