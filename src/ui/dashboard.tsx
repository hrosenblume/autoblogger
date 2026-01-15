'use client'

import { useState, useEffect, type ReactNode } from 'react'
import { Save, Loader2 } from 'lucide-react'
import type { CustomFieldConfig, StylesConfig } from './types'
import { DashboardProvider, useDashboardContext, type Session, type EditorState, type EditHandler } from './context'
import { WriterDashboard } from './pages/WriterDashboard'
import { EditorPage } from './pages/EditorPage'
import { SettingsPage } from './pages/SettingsPage'
import { Navbar } from './components/Navbar'
import { ChatButton } from './components/ChatButton'
import { ChatPanel } from './components/ChatPanel'
import { ThemeProvider } from './components/ThemeProvider'
import { ChatProvider } from './hooks/useChat'
import { useDashboardKeyboard } from './hooks/useKeyboard'
import { useChatContextOptional } from './hooks/useChat'

interface AutobloggerDashboardProps {
  basePath?: string
  apiBasePath?: string
  styles?: StylesConfig
  fields?: CustomFieldConfig[]
  session?: Session | null
  onEditorStateChange?: (state: EditorState | null) => void
  onRegisterEditHandler?: (handler: EditHandler | null) => void
  onToggleView?: (currentPath: string, slug?: string) => void
  // Navbar props
  onSignOut?: () => void
  navbarRightSlot?: ReactNode
  // Chat props
  chatApiPath?: string
  historyApiPath?: string
  proseClasses?: string
  // Theme props
  /** Skip internal ThemeProvider when host app already provides one (e.g., next-themes) */
  skipThemeProvider?: boolean
}

export function AutobloggerDashboard({
  basePath = '/writer',
  apiBasePath = '/api/cms',
  styles,
  fields = [],
  session = null,
  onEditorStateChange,
  onRegisterEditHandler,
  onToggleView,
  onSignOut,
  navbarRightSlot,
  chatApiPath,
  historyApiPath,
  proseClasses,
  skipThemeProvider = false,
}: AutobloggerDashboardProps) {
  // Resolve default paths
  const resolvedChatApiPath = chatApiPath || `${apiBasePath}/ai/chat`
  const resolvedHistoryApiPath = historyApiPath || `${apiBasePath}/chat/history`

  // Wrapper component - either ThemeProvider or Fragment
  const ThemeWrapper = skipThemeProvider ? ({ children }: { children: React.ReactNode }) => <>{children}</> : ThemeProvider

  return (
    <ThemeWrapper>
      <ChatProvider 
        apiBasePath={apiBasePath}
        chatApiPath={resolvedChatApiPath}
        historyApiPath={resolvedHistoryApiPath}
      >
        <DashboardProvider basePath={basePath} apiBasePath={apiBasePath} styles={styles} fields={fields} session={session} onEditorStateChange={onEditorStateChange} onRegisterEditHandler={onRegisterEditHandler}>
          <DashboardLayout 
            basePath={basePath}
            onToggleView={onToggleView}
            onSignOut={onSignOut}
            navbarRightSlot={navbarRightSlot}
            proseClasses={proseClasses}
          />
        </DashboardProvider>
      </ChatProvider>
    </ThemeWrapper>
  )
}

interface DashboardLayoutProps {
  basePath: string
  onToggleView?: (currentPath: string, slug?: string) => void
  onSignOut?: () => void
  navbarRightSlot?: ReactNode
  proseClasses?: string
}

function DashboardLayout({ 
  basePath,
  onToggleView,
  onSignOut,
  navbarRightSlot,
  proseClasses,
}: DashboardLayoutProps) {
  const { currentPath, navigate, onEditorStateChange } = useDashboardContext()
  const [editorState, setEditorState] = useState<EditorState | null>(null)
  const chatContext = useChatContextOptional()

  // Extract slug from editor path
  const editorSlug = currentPath.startsWith('/editor/') 
    ? currentPath.replace('/editor/', '') 
    : currentPath === '/editor' ? undefined : undefined
  
  const isEditorPage = currentPath.startsWith('/editor')

  // Handle editor state changes - track internally AND forward to host app
  const handleEditorStateChange = (state: EditorState | null) => {
    setEditorState(state)
    onEditorStateChange?.(state)
  }

  // Sync essay context to chat when editor content changes
  const setEssayContext = chatContext?.setEssayContext
  useEffect(() => {
    if (!setEssayContext) return
    
    if (isEditorPage && editorState?.content) {
      // Set essay context when on editor page with content
      setEssayContext({
        title: editorState.content.title,
        subtitle: editorState.content.subtitle,
        markdown: editorState.content.markdown,
      })
    } else {
      // Clear essay context when leaving editor
      setEssayContext(null)
    }
  }, [isEditorPage, editorState?.content, setEssayContext])

  useDashboardKeyboard({
    basePath,
    onToggleView: onToggleView ? () => onToggleView(currentPath, editorSlug) : undefined,
    onToggleSettings: () => {
      if (currentPath.startsWith('/settings')) navigate('/')
      else navigate('/settings')
    },
    onNewPost: () => {
      if (currentPath === '/' || currentPath === '') navigate('/editor')
    },
    onEscape: () => {
      if (currentPath !== '/' && currentPath !== '') navigate('/')
    },
  })

  // Build the right slot with save button, chat button, and any custom slot from host app
  const rightSlotWithButtons = (
    <>
      {/* Save button - only show on editor page */}
      {isEditorPage && editorState && (
        <button
          type="button"
          onClick={() => editorState.onSave('draft')}
          disabled={!editorState.hasUnsavedChanges || !!editorState.savingAs}
          className="w-9 h-9 rounded-md border border-border hover:bg-accent text-muted-foreground flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Save"
          title={editorState.hasUnsavedChanges ? 'Save changes (⌘S)' : 'No unsaved changes'}
        >
          {editorState.savingAs ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
        </button>
      )}
      {/* Chat button - built-in, always available */}
      <ChatButton />
      {/* Extra slot from host app */}
      {navbarRightSlot}
    </>
  )

  return (
    <div className="autoblogger min-h-screen bg-background flex flex-col">
      <Navbar
        onSignOut={onSignOut}
        rightSlot={rightSlotWithButtons}
      />
      <main className="flex-1">
        <DashboardRouter path={currentPath} onEditorStateChange={handleEditorStateChange} />
      </main>
      {/* Chat Panel - built-in */}
      <ChatPanel proseClasses={proseClasses} />
    </div>
  )
}

function DashboardRouter({ path, onEditorStateChange }: { path: string; onEditorStateChange?: (state: EditorState | null) => void }) {
  // Strip query params from path for routing
  const pathWithoutQuery = path.split('?')[0]
  
  if (pathWithoutQuery === '/' || pathWithoutQuery === '') return <WriterDashboard />
  if (pathWithoutQuery.startsWith('/editor')) {
    const slug = pathWithoutQuery.replace('/editor/', '').replace('/editor', '')
    // Use path as key to force remount when navigating to same editor with different query params
    return <EditorPage key={path} slug={slug || undefined} onEditorStateChange={onEditorStateChange} />
  }
  if (pathWithoutQuery.startsWith('/settings')) return <SettingsPage subPath={pathWithoutQuery.replace('/settings', '')} />
  return <div className="max-w-4xl mx-auto px-6 py-8"><p className="text-muted-foreground">Page not found: {path}</p></div>
}

export type { AutobloggerDashboardProps }
