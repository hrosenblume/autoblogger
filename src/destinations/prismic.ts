import type { Post } from '../types/models'
import type { Destination, DestinationResult } from '../types/destinations'

/**
 * Configuration for the Prismic destination adapter.
 */
export interface PrismicDestinationConfig {
  /** Prismic repository name (e.g., 'my-repo') */
  repository: string
  /** Prismic write API token (from Settings > API & Security) */
  writeToken: string
  /** Prismic document type to create (e.g., 'autoblog') */
  documentType: string
  /** 
   * Sync mode: 
   * - 'stub': Syncs minimal reference data only (uid)
   * - 'full': Syncs all content including markdown body as rich text
   */
  syncMode?: 'stub' | 'full'
  /** Master locale for the repository (default: 'en-us') */
  masterLocale?: string
  /** Custom document ID resolver (optional, uses post.id by default) */
  getDocumentId?: (post: Post) => string
  /** 
   * Whether to auto-update the Prismic document display name from the post title.
   * Default: false. When true, the document name in Prismic will be updated on publish.
   */
  autoRename?: boolean
}

/**
 * Map an autoblogger post to a minimal stub document.
 * Used in 'stub' sync mode where content lives in autoblogger,
 * and Prismic only stores references for collection slices.
 */
function mapPostToStub(_post: Post): Record<string, unknown> {
  // Empty data - only the UID matters, and it's set separately
  return {}
}

/**
 * Create a Prismic destination adapter for autoblogger.
 * 
 * This is an internal implementation used by the dynamic destination system.
 * For external use, import from '@autoblogger/prismic' package.
 */
export function createPrismicDestination(config: PrismicDestinationConfig): Destination {
  const masterLocale = config.masterLocale || 'en-us'
  const syncMode = config.syncMode || 'stub'
  const getDocumentId = config.getDocumentId || ((post: Post) => `autoblogger-${post.id}`)

  return {
    name: `prismic:${config.repository}`,

    async onPublish(post: Post): Promise<DestinationResult> {
      try {
        // Dynamic import to avoid requiring @prismicio/client as a dependency
        const prismic = await import('@prismicio/client')
        
        const writeClient = prismic.createWriteClient(config.repository, {
          writeToken: config.writeToken,
        })
        const readClient = prismic.createClient(config.repository)
        const migration = prismic.createMigration()

        const documentId = getDocumentId(post)
        
        // Use stub document data (minimal reference)
        const documentData = mapPostToStub(post)

        // Check for existing document by UID
        let existingDoc: any = null
        try {
          existingDoc = await readClient.getByUID(config.documentType, post.slug, {
            lang: masterLocale,
          })
        } catch {
          // Document doesn't exist - will create new
        }

        if (existingDoc) {
          // Update existing document
          const updatedDoc = {
            ...existingDoc,
            uid: post.slug,
            data: { ...existingDoc.data, ...documentData },
          }
          
          // Only update document name if autoRename is enabled
          if (config.autoRename) {
            migration.updateDocument(updatedDoc as any, post.title)
            console.log(`[prismic:${config.repository}] Updating document with new title for post "${post.slug}"`)
          } else {
            migration.updateDocument(updatedDoc as any)
            console.log(`[prismic:${config.repository}] Updating existing document for post "${post.slug}"`)
          }
        } else {
          // Create new document - ALWAYS use post.title as the document name
          migration.createDocument(
            {
              type: config.documentType,
              uid: post.slug,
              lang: masterLocale,
              data: documentData,
            } as any,
            post.title
          )
          console.log(`[prismic:${config.repository}] Creating new document for post "${post.slug}"`)
        }

        // Execute the migration
        await writeClient.migrate(migration, {
          reporter: () => {}, // Silent reporter
        })

        console.log(`[prismic:${config.repository}] Synced stub for post "${post.slug}"`)

        return {
          success: true,
          externalId: documentId,
        }
      } catch (error) {
        console.error(`[prismic:${config.repository}] Failed to sync post "${post.slug}":`, error)
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error publishing to Prismic',
        }
      }
    },

    async onUnpublish(post: Post): Promise<DestinationResult> {
      // Prismic Migration API doesn't support unpublishing directly
      // The document will remain but won't be updated
      console.warn(
        `[prismic:${config.repository}] Unpublish not fully supported via Migration API. ` +
        `Document for post "${post.slug}" will remain in Prismic.`
      )
      
      return {
        success: true,
        externalId: getDocumentId(post),
      }
    },

    async onDelete(post: Post): Promise<DestinationResult> {
      // Prismic Migration API doesn't support deletion directly
      console.warn(
        `[prismic:${config.repository}] Delete not fully supported via Migration API. ` +
        `Document for post "${post.slug}" will remain in Prismic.`
      )
      
      return {
        success: true,
        externalId: getDocumentId(post),
      }
    },
  }
}
