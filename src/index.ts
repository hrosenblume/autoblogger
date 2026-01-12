// Server-safe exports (no React imports)
export { createAutoblogger } from './server'
export { createAPIHandler } from './api'
export { validateSchema } from './schema'

// Data access types
export type { Post, Revision, Comment, Tag, PostTag, AISettings, TopicSubscription, NewsItem } from './types'

// Utilities
export { renderMarkdown, parseMarkdown, htmlToMarkdown } from './lib/markdown'
export { getSeoValues } from './lib/seo'
export { formatDate, truncate } from './lib/format'

// Comment utilities (for advanced integrations)
export { createCommentsClient, canEditComment, canDeleteComment } from './lib/comments'
export type { CommentWithUser, CreateCommentData, SelectionState } from './lib/comments'
export { CommentMark, addCommentMark, removeCommentMark, applyCommentMarks, scrollToComment } from './lib/comment-mark'

// Types (server-safe only)
export type { 
  AutobloggerServerConfig as AutobloggerConfig, 
  StylesConfig,
  AutobloggerServer as Autoblogger,
  Session,
} from './server'

// UI-related types (client-side, contains React types)
export type { CustomFieldProps, CustomFieldConfig } from './config'
