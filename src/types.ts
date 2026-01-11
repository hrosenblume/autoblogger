// Re-export Prisma types when available
// These are placeholder types - actual types come from user's Prisma client

export interface Post {
  id: string
  title: string
  subtitle?: string | null
  slug: string
  markdown: string
  status: string
  createdAt: Date
  updatedAt: Date
  publishedAt?: Date | null
  seoTitle?: string | null
  seoDescription?: string | null
  seoKeywords?: string | null
  noIndex: boolean
  ogImage?: string | null
  previewToken?: string | null
  previewExpiry?: Date | null
  sourceUrl?: string | null
  topicId?: string | null
  // Custom fields added by user
  [key: string]: unknown
}

export interface Revision {
  id: string
  postId: string
  title?: string | null
  subtitle?: string | null
  markdown: string
  createdAt: Date
}

export interface Comment {
  id: string
  postId: string
  authorId?: string | null
  authorName?: string | null
  authorEmail?: string | null
  content: string
  approved: boolean
  createdAt: Date
}

export interface Tag {
  id: string
  name: string
  createdAt: Date
}

export interface PostTag {
  id: string
  postId: string
  tagId: string
  createdAt: Date
}

export interface AISettings {
  id: string
  rules: string
  chatRules: string
  rewriteRules?: string | null
  defaultModel: string
  generateTemplate?: string | null
  chatTemplate?: string | null
  rewriteTemplate?: string | null
  updatedAt: Date
}

export interface TopicSubscription {
  id: string
  name: string
  keywords: string
  rssFeeds: string
  isActive: boolean
  useKeywordFilter: boolean
  frequency: string
  maxPerPeriod: number
  essayFocus?: string | null
  lastRunAt?: Date | null
  createdAt: Date
  updatedAt: Date
}

export interface NewsItem {
  id: string
  topicId: string
  url: string
  title: string
  summary?: string | null
  publishedAt?: Date | null
  status: string
  postId?: string | null
  createdAt: Date
}
