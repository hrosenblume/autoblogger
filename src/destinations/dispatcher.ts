import type { Post } from '../types/models'
import type { Destination, DestinationResult, DestinationEvent, DispatchResult } from '../types/destinations'

export interface DispatcherConfig {
  destinations?: Destination[]
  webhooks?: string[]
  onPublish?: (post: Post) => Promise<void>
  onUnpublish?: (post: Post) => Promise<void>
  onDelete?: (post: Post) => Promise<void>
}

/**
 * Creates a destination dispatcher that fires events to adapters, webhooks, and callbacks.
 */
export function createDestinationDispatcher(config: DispatcherConfig) {
  const { destinations = [], webhooks = [], onPublish, onUnpublish, onDelete } = config

  /**
   * Fire a webhook with the event payload
   */
  async function fireWebhook(
    url: string,
    event: DestinationEvent
  ): Promise<{ url: string; success: boolean; error?: string }> {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      })

      if (!response.ok) {
        return {
          url,
          success: false,
          error: `HTTP ${response.status}: ${response.statusText}`,
        }
      }

      return { url, success: true }
    } catch (error) {
      return {
        url,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  /**
   * Fire a destination adapter
   */
  async function fireDestination(
    destination: Destination,
    method: 'onPublish' | 'onUnpublish' | 'onDelete',
    post: Post
  ): Promise<{ name: string; result: DestinationResult }> {
    try {
      const result = await destination[method](post)
      return { name: destination.name, result }
    } catch (error) {
      return {
        name: destination.name,
        result: {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      }
    }
  }

  /**
   * Dispatch an event to all destinations, webhooks, and callbacks
   */
  async function dispatch(
    type: 'publish' | 'unpublish' | 'delete',
    post: Post,
    callback?: (post: Post) => Promise<void>
  ): Promise<DispatchResult> {
    const event: DestinationEvent = {
      type,
      post,
      timestamp: new Date().toISOString(),
    }

    const method = type === 'publish' ? 'onPublish' : type === 'unpublish' ? 'onUnpublish' : 'onDelete'

    // Fire all destinations in parallel
    const destinationPromises = destinations.map((dest) => fireDestination(dest, method, post))

    // Fire all webhooks in parallel
    const webhookPromises = webhooks.map((url) => fireWebhook(url, event))

    // Fire the callback (if provided)
    const callbackPromise = callback ? callback(post).catch((err) => {
      console.error(`[autoblogger] ${type} callback error:`, err)
    }) : Promise.resolve()

    // Wait for all to complete
    const [destinationResults, webhookResults] = await Promise.all([
      Promise.all(destinationPromises),
      Promise.all(webhookPromises),
      callbackPromise,
    ])

    // Check if all succeeded
    const allSucceeded =
      destinationResults.every((r) => r.result.success) &&
      webhookResults.every((r) => r.success)

    // Log any failures
    for (const { name, result } of destinationResults) {
      if (!result.success) {
        console.error(`[autoblogger] Destination "${name}" failed:`, result.error)
      }
    }
    for (const { url, success, error } of webhookResults) {
      if (!success) {
        console.error(`[autoblogger] Webhook "${url}" failed:`, error)
      }
    }

    return {
      destinations: destinationResults,
      webhooks: webhookResults,
      allSucceeded,
    }
  }

  return {
    /**
     * Dispatch a publish event to all destinations
     */
    async publish(post: Post): Promise<DispatchResult> {
      return dispatch('publish', post, onPublish)
    },

    /**
     * Dispatch an unpublish event to all destinations
     */
    async unpublish(post: Post): Promise<DispatchResult> {
      return dispatch('unpublish', post, onUnpublish)
    },

    /**
     * Dispatch a delete event to all destinations
     */
    async delete(post: Post): Promise<DispatchResult> {
      return dispatch('delete', post, onDelete)
    },

    /**
     * Check if any destinations or webhooks are configured
     */
    get hasDestinations(): boolean {
      return destinations.length > 0 || webhooks.length > 0 || !!onPublish || !!onUnpublish || !!onDelete
    },
  }
}

export type DestinationDispatcher = ReturnType<typeof createDestinationDispatcher>
