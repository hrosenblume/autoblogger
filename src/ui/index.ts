'use client'

// Main dashboard component
export { AutobloggerDashboard } from './dashboard'
export type { AutobloggerDashboardProps } from './dashboard'

// Navbar (for custom integrations)
export { Navbar } from './components/Navbar'
export type { NavbarProps } from './components/Navbar'

// Theme toggle, provider, and hook
export { ThemeToggle } from './components/ThemeToggle'
export { ThemeProvider } from './components/ThemeProvider'
export { useAutobloggerTheme, useTheme } from './hooks/useTheme'

// Icons
export { ChatIcon, SunIcon, MoonIcon, ChevronLeftIcon } from './components/Icons'

// Context and types
export { useDashboardContext } from './context'
export type { Session, SessionUser, EditorState, EditorContent, EditCommand, EditHandler } from './context'

// Client-side types
export type { CustomFieldConfig, CustomFieldProps, StylesConfig } from './types'

// Comment components (for custom integrations)
export { CommentsPanel } from './components/CommentsPanel'
export { CommentThread } from './components/CommentThread'
export { useComments } from './hooks/useComments'
export type { CommentsState } from './hooks/useComments'

// Chat components and context
export { ChatProvider, useChatContext, useChatContextOptional, ChatContext } from './hooks/useChat'
export type { 
  Message as ChatMessage,
  EssayContext as ChatEssayContext,
  EssaySnapshot,
  ChatMode,
  EssayEdit,
  EditHandler as ChatEditHandler,
  ExpandPlanHandler,
} from './hooks/useChat'
export { ChatPanel } from './components/ChatPanel'
export { ChatButton } from './components/ChatButton'
export { useAIModels } from './hooks/useAIModels'
export { ModelSelector } from './components/ModelSelector'
export { ControlButton } from './components/ControlButton'

// Types from lib
export type { AIModelOption } from '../lib/models'

// Keyboard hook
export { useKeyboard, useDashboardKeyboard } from './hooks/useKeyboard'

// Keyboard shortcuts
export { SHORTCUTS } from './shortcuts'

// Global shortcuts for use outside dashboard
export { GlobalShortcuts } from './components/GlobalShortcuts'

// Expandable section component (for consistent collapsible UI)
export { ExpandableSection } from './components/ExpandableSection'

// SEO section component (for consistent SEO fields UI)
export { SeoSection } from './components/SeoSection'

