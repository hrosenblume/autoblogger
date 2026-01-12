// Server-safe exports - no React imports
import { createPostsData } from './data/posts'
import { createCommentsData } from './data/comments'
import { createTagsData } from './data/tags'
import { createRevisionsData } from './data/revisions'
import { createAISettingsData } from './data/ai-settings'
import { createTopicsData } from './data/topics'
import { createNewsItemsData } from './data/news-items'
import { createUsersData } from './data/users'
import type { AutobloggerServerConfig, StylesConfig } from './types/config'
import { DEFAULT_STYLES } from './types/config'

// Re-export types for backward compatibility
export type { Session } from './types/session'
export type { StylesConfig, AutobloggerServerConfig } from './types/config'

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
