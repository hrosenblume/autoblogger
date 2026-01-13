'use client'

// Main dashboard component
export { AutobloggerDashboard } from './dashboard'
export type { AutobloggerDashboardProps } from './dashboard'

// Navbar (for custom integrations)
export { Navbar } from './components/Navbar'
export type { NavbarProps } from './components/Navbar'

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
export { useAIModels } from './hooks/useAIModels'
export { ModelSelector } from './components/ModelSelector'
export { ControlButton } from './components/ControlButton'

// Types from lib
export type { AIModelOption } from '../lib/models'
