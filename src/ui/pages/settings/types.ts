/**
 * Shared types for settings pages
 */

export interface User {
  id: string
  email: string
  name: string | null
  role: string
  createdAt: string
}

export interface Tag {
  id: string
  name: string
  createdAt?: string
  _count?: { posts: number }
}

export interface Topic {
  id: string
  name: string
  isActive: boolean
  keywords: string
  rssFeeds: string
  frequency: string
  maxPerPeriod: number
  essayFocus: string | null
  useKeywordFilter: boolean
  lastRunAt: string | null
  _count?: { posts: number; newsItems: number }
}

export interface Revision {
  id: string
  postId: string
  title: string | null
  markdown: string
  createdAt: string
  post: { id: string; title: string; slug: string; markdown: string }
}
