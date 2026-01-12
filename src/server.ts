// Server-safe exports - no React imports
import { createPostsData } from './data/posts'
import { createCommentsData } from './data/comments'
import { createTagsData } from './data/tags'
import { createRevisionsData } from './data/revisions'
import { createAISettingsData } from './data/ai-settings'
import { createTopicsData } from './data/topics'
import { createNewsItemsData } from './data/news-items'
import { createUsersData } from './data/users'
import type { Post } from './types'

// Session type - user provides their own
export interface Session {
  user?: {
    id?: string
    email?: string
    name?: string
    role?: string
    [key: string]: unknown
  }
  [key: string]: unknown
}

// Style configuration (no React)
export interface StylesConfig {
  container?: string
  title?: string
  subtitle?: string
  byline?: string
  prose?: string
}

// Server-safe config (no React types)
export interface AutobloggerServerConfig {
  prisma: unknown

  auth: {
    getSession: () => Promise<Session | null>
    isAdmin: (session: Session | null) => boolean
    canPublish: (session: Session | null) => boolean
  }

  ai?: {
    anthropicKey?: string
    openaiKey?: string
  }

  storage?: {
    upload: (file: File) => Promise<{ url: string }>
  }

  comments?: {
    mode: 'authenticated' | 'public' | 'disabled'
  }

  styles?: StylesConfig

  hooks?: {
    beforePublish?: (post: Post) => Promise<void>
    afterSave?: (post: Post) => Promise<void>
  }
}

// Default styles
const DEFAULT_STYLES: Required<StylesConfig> = {
  container: 'max-w-ab-content mx-auto px-ab-content-padding',
  title: 'text-ab-title font-bold',
  subtitle: 'text-ab-h2 text-muted-foreground',
  byline: 'text-sm text-muted-foreground',
  prose: 'prose dark:prose-invert max-w-none',
}

// Autoblogger server instance type
export interface AutobloggerServer {
  config: AutobloggerServerConfig & { styles: Required<StylesConfig> }
  posts: ReturnType<typeof createPostsData>
  comments: ReturnType<typeof createCommentsData>
  tags: ReturnType<typeof createTagsData>
  revisions: ReturnType<typeof createRevisionsData>
  aiSettings: ReturnType<typeof createAISettingsData>
  topics: ReturnType<typeof createTopicsData>
  newsItems: ReturnType<typeof createNewsItemsData>
  users: ReturnType<typeof createUsersData>
}

// Create autoblogger server instance
export function createAutoblogger(config: AutobloggerServerConfig): AutobloggerServer {
  const prisma = config.prisma as any
  
  const mergedStyles: Required<StylesConfig> = {
    ...DEFAULT_STYLES,
    ...config.styles,
  }

  return {
    config: {
      ...config,
      styles: mergedStyles,
    },
    posts: createPostsData(prisma, config.hooks),
    comments: createCommentsData(prisma, config.comments),
    tags: createTagsData(prisma),
    revisions: createRevisionsData(prisma),
    aiSettings: createAISettingsData(prisma),
    topics: createTopicsData(prisma),
    newsItems: createNewsItemsData(prisma),
    users: createUsersData(prisma),
  }
}
