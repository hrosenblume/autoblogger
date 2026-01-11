import type { Post } from '../types'
import { truncate } from './format'

export interface SeoValues {
  title: string
  description: string
  keywords?: string | null
  noIndex: boolean
  ogImage?: string | null
}

/**
 * Get SEO values from a post with fallbacks
 */
export function getSeoValues(post: Post): SeoValues {
  return {
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.subtitle || truncate(post.markdown, 160),
    keywords: post.seoKeywords,
    noIndex: post.noIndex,
    ogImage: post.ogImage,
  }
}
