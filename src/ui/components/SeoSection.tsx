'use client'

import { useState } from 'react'
import { ExpandableSection } from './ExpandableSection'

interface Post {
  title?: string
  subtitle?: string
  seoTitle?: string | null
  seoDescription?: string | null
  seoKeywords?: string | null
  noIndex?: boolean
}

interface SeoSectionProps {
  post: Post
  onFieldChange: (name: string, value: unknown) => void
  disabled?: boolean
}

export function SeoSection({
  post,
  onFieldChange,
  disabled = false,
}: SeoSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const handleChange = (field: string, value: string | boolean) => {
    onFieldChange(field, value === '' ? null : value)
  }

  const getSummary = () => {
    const hasTitle = !!post.seoTitle
    const hasDesc = !!post.seoDescription
    const hasKeywords = !!post.seoKeywords
    const isNoIndex = post.noIndex

    if (!hasTitle && !hasDesc && !hasKeywords && !isNoIndex) {
      return 'default'
    }

    const parts: string[] = []
    if (hasTitle) parts.push('title')
    if (hasDesc) parts.push('description')
    if (hasKeywords) parts.push('keywords')
    if (isNoIndex) parts.push('noindex')

    return parts.join(', ')
  }

  return (
    <ExpandableSection
      title="SEO Settings"
      summary={getSummary()}
      expanded={isExpanded}
      onExpandedChange={setIsExpanded}
    >
      <div className="space-y-1">
        <label className="text-xs text-muted-foreground">Title</label>
        <input
          type="text"
          value={post.seoTitle || ''}
          onChange={(e) => handleChange('seoTitle', e.target.value)}
          placeholder={post.title || 'Page title for search engines'}
          disabled={disabled}
          className="w-full h-8 px-3 text-sm border border-border rounded-md bg-transparent placeholder-muted-foreground/50 disabled:opacity-50"
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs text-muted-foreground">Description</label>
        <textarea
          value={post.seoDescription || ''}
          onChange={(e) => handleChange('seoDescription', e.target.value)}
          placeholder={post.subtitle || 'Brief description for search results'}
          disabled={disabled}
          rows={2}
          className="w-full px-3 py-2 text-sm border border-border rounded-md bg-transparent placeholder-muted-foreground/50 resize-none disabled:opacity-50"
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs text-muted-foreground">Keywords</label>
        <input
          type="text"
          value={post.seoKeywords || ''}
          onChange={(e) => handleChange('seoKeywords', e.target.value)}
          placeholder="keyword1, keyword2, keyword3"
          disabled={disabled}
          className="w-full h-8 px-3 text-sm border border-border rounded-md bg-transparent placeholder-muted-foreground/50 disabled:opacity-50"
        />
      </div>

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={post.noIndex || false}
          onChange={(e) => handleChange('noIndex', e.target.checked)}
          disabled={disabled}
          className="h-4 w-4 rounded border-border"
        />
        <span className="text-sm text-muted-foreground">
          Hide from search engines (noindex)
        </span>
      </label>
    </ExpandableSection>
  )
}
