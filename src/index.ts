// Server-safe exports (no React imports)
export { createAutoblogger } from './server'
export { createAPIHandler } from './api'
export { validateSchema } from './schema'

// Data layer factory
export { createCrudData } from './data/factory'
export type { CrudOptions, BaseCrud } from './data/factory'

// Data access types
export type { Post, Revision, Comment, Tag, PostTag, AISettings, TopicSubscription, NewsItem } from './types'

// AI exports
export {
  AI_MODELS,
  getModel,
  getDefaultModel,
  buildGeneratePrompt,
  buildChatPrompt,
  buildExpandPlanPrompt,
  buildPlanPrompt,
  buildRewritePrompt,
  buildAutoDraftPrompt,
  DEFAULT_GENERATE_TEMPLATE,
  DEFAULT_CHAT_TEMPLATE,
  DEFAULT_REWRITE_TEMPLATE,
  DEFAULT_AUTO_DRAFT_TEMPLATE,
  DEFAULT_PLAN_TEMPLATE,
  DEFAULT_PLAN_RULES,
  DEFAULT_EXPAND_PLAN_TEMPLATE,
  parseGeneratedContent,
  generate,
  resolveModel,
} from './ai'
export type { AIModel } from './ai'

// Utilities
export { renderMarkdown, parseMarkdown, htmlToMarkdown, markdownToHtml, wordCount, generateSlug, renderMarkdownSanitized } from './lib/markdown'
export { getSeoValues } from './lib/seo'
export { formatDate, truncate } from './lib/format'

// Auto-draft
export { runAutoDraft, fetchRssFeeds, filterByKeywords } from './auto-draft'
export type { RssArticle, GenerationResult, AutoDraftConfig } from './auto-draft'

// Comment utilities (for advanced integrations)
export { createCommentsClient, canEditComment, canDeleteComment } from './lib/comments'
export type { CommentWithUser, CreateCommentData, SelectionState } from './lib/comments'
export { CommentMark, addCommentMark, removeCommentMark, applyCommentMarks, scrollToComment } from './lib/comment-mark'

// Destination adapters
export { createDestinationDispatcher } from './destinations'
export type { DestinationDispatcher, DispatcherConfig } from './destinations'
export type { 
  Destination, 
  DestinationResult, 
  DestinationEvent, 
  DestinationsConfig,
  DispatchResult,
} from './types/destinations'

// Types (server-safe only)
export type { 
  AutobloggerServerConfig as AutobloggerConfig, 
  StylesConfig,
  AutobloggerServer as Autoblogger,
  Session,
} from './server'

// UI-related types (client-side, contains React types)
export type { CustomFieldProps, CustomFieldConfig } from './config'
