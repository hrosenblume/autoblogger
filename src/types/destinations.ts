import type { Post } from './models'

/**
 * Result returned by a destination after handling an event
 */
export interface DestinationResult {
  /** Whether the operation succeeded */
  success: boolean
  /** External ID assigned by the destination (e.g., Prismic document ID) */
  externalId?: string
  /** Error message if the operation failed */
  error?: string
}

/**
 * A destination adapter that syncs posts to an external CMS or service.
 * 
 * Implement this interface to create custom adapters for Prismic, Contentful,
 * Sanity, or any other service.
 */
export interface Destination {
  /** Unique name for this destination (for logging/debugging) */
  name: string

  /**
   * Called when a post is published.
   * Should create or update the post in the external service.
   */
  onPublish(post: Post): Promise<DestinationResult>

  /**
   * Called when a post is unpublished (status changed from 'published' to 'draft').
   * Should archive or unpublish the post in the external service.
   */
  onUnpublish(post: Post): Promise<DestinationResult>

  /**
   * Called when a post is deleted.
   * Should remove the post from the external service.
   */
  onDelete(post: Post): Promise<DestinationResult>
}

/**
 * Event payload sent to webhooks
 */
export interface DestinationEvent {
  /** The type of event that occurred */
  type: 'publish' | 'unpublish' | 'delete'
  /** The post that triggered the event */
  post: Post
  /** When the event occurred */
  timestamp: string
}

/**
 * Configuration for the destination system
 */
export interface DestinationsConfig {
  /** Array of destination adapters to sync posts to */
  destinations?: Destination[]

  /** Webhook URLs to POST event payloads to */
  webhooks?: string[]

  /** Callback fired when a post is published */
  onPublish?: (post: Post) => Promise<void>

  /** Callback fired when a post is unpublished */
  onUnpublish?: (post: Post) => Promise<void>

  /** Callback fired when a post is deleted */
  onDelete?: (post: Post) => Promise<void>
}

/**
 * Aggregated results from all destinations
 */
export interface DispatchResult {
  /** Results from each destination adapter */
  destinations: Array<{ name: string; result: DestinationResult }>
  /** Results from webhook calls */
  webhooks: Array<{ url: string; success: boolean; error?: string }>
  /** Whether all operations succeeded */
  allSucceeded: boolean
}
