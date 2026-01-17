import type { ComponentType } from 'react'
import type { Post } from './models'
import type { Session } from './session'
import type { RssArticle } from '../auto-draft'
import type { Destination } from './destinations'

// Style configuration for article rendering
export interface StylesConfig {
  container?: string
  title?: string
  subtitle?: string
  byline?: string
  prose?: string
}

// Default styles
export const DEFAULT_STYLES: Required<StylesConfig> = {
  container: 'max-w-ab-content mx-auto px-ab-content-padding',
  title: 'text-ab-title font-bold',
  subtitle: 'text-ab-h2 text-muted-foreground',
  byline: 'text-sm text-muted-foreground',
  prose: 'prose',
}

// Custom field component props (UI-only)
export interface CustomFieldProps<T = unknown> {
  value: T
  onChange: (value: T) => void
  onFieldChange: (name: string, value: unknown) => void  // Update any post field
  post: Post
  disabled?: boolean
}

// Custom field definition (UI-only)
export interface CustomFieldConfig {
  name: string
  label?: string
  component: ComponentType<CustomFieldProps<unknown>>
  position?: 'footer' | 'sidebar'
}

// Server-safe configuration (no React types)
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

  /** Prismic integration config (passed from host app) */
  prismic?: {
    /** Repository name (e.g., 'my-repo') - auto-fills the settings UI */
    repository?: string
    /** Write API token from env */
    writeToken?: string
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
    /** Called when a slug changes on a post that was previously published. Used to create redirects. */
    onSlugChange?: (data: { postId: string; oldSlug: string; newSlug: string }) => Promise<void>
    /** Called during auto-draft after generating essay, return extra fields for post creation */
    onAutoDraftPostCreate?: (article: RssArticle, essay: { title: string; subtitle: string | null; markdown: string }) => Record<string, unknown> | Promise<Record<string, unknown>>
  }

  // Destination adapters for syncing to external CMSs
  /** Array of destination adapters to sync posts to (Prismic, Contentful, etc.) */
  destinations?: Destination[]

  /** Webhook URLs to POST event payloads to when posts are published/unpublished/deleted */
  webhooks?: string[]

  /** Callback fired when a post is published */
  onPublish?: (post: Post) => Promise<void>

  /** Callback fired when a post is unpublished */
  onUnpublish?: (post: Post) => Promise<void>

  /** Callback fired when a post is deleted */
  onDelete?: (post: Post) => Promise<void>
}

// Full configuration with custom fields (includes React types)
export interface AutobloggerConfig extends AutobloggerServerConfig {
  fields?: CustomFieldConfig[]
}
