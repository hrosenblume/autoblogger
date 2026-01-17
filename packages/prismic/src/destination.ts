import type { Destination, DestinationResult, Post } from 'autoblogger'
import { markdownToPrismicRichText } from 'autoblogger/rich-text'
import * as prismic from '@prismicio/client'

/**
 * Field mapping configuration for Prismic documents.
 * Maps autoblogger post fields to Prismic document fields.
 */
export interface FieldMapping {
  /** Prismic field for the post title (default: 'title') */
  title?: string
  /** Prismic field for the post subtitle (default: 'subtitle') */
  subtitle?: string
  /** Prismic field for the post content/body as rich text (default: 'body') */
  content?: string
  /** Prismic field for the slug/UID (default: 'uid') - always maps to Prismic UID */
  slug?: 'uid'
  /** Prismic field for SEO title (default: 'seo_title') */
  seoTitle?: string
  /** Prismic field for SEO description (default: 'seo_description') */
  seoDescription?: string
  /** Prismic field for publish date (default: 'publish_date') */
  publishDate?: string
  /** Custom field mappings for user-defined fields */
  custom?: Record<string, string>
}

/**
 * Configuration for the Prismic destination adapter.
 */
export interface PrismicDestinationConfig {
  /** Prismic repository name (e.g., 'my-repo') */
  repository: string
  /** Prismic write API token (from Settings > API & Security) */
  writeToken: string
  /** Prismic document type to create (e.g., 'blog_post') */
  documentType: string
  /** 
   * Sync mode: 
   * - 'full' (default): Syncs all content including markdown body as rich text
   * - 'stub': Syncs minimal reference data only (uid, title, autoblogger_id)
   */
  syncMode?: 'stub' | 'full'
  /** Field mapping configuration (optional, uses defaults) - only used in 'full' mode */
  fieldMapping?: FieldMapping
  /** Master locale for the repository (default: 'en-us') */
  masterLocale?: string
  /** Whether to auto-publish documents after creating/updating (default: false) */
  autoPublish?: boolean
  /** Custom document ID resolver (optional, uses post.id by default) */
  getDocumentId?: (post: Post) => string
  /** 
   * Callback after successful Prismic sync.
   * Use this to store the immutable Prismic document ID for resilient lookups.
   * The prismicDocumentId is Prismic's internal ID which cannot be edited by users.
   */
  onSyncComplete?: (post: Post, prismicDocumentId: string) => Promise<void>
  /**
   * Callback to get existing mapping for a post.
   * Used to determine if we should update an existing document or create a new one.
   * Returns the Prismic document ID and last known slug, or null if no mapping exists.
   */
  getExistingMapping?: (postId: string) => Promise<{
    prismicDocumentId: string
    lastKnownSlug: string | null
  } | null>
}

const DEFAULT_FIELD_MAPPING: Required<Omit<FieldMapping, 'custom'>> = {
  title: 'title',
  subtitle: 'subtitle',
  content: 'body',
  slug: 'uid',
  seoTitle: 'seo_title',
  seoDescription: 'seo_description',
  publishDate: 'publish_date',
}

/**
 * Create a Prismic Migration API client.
 */
function createMigrationClient(config: PrismicDestinationConfig) {
  const writeClient = prismic.createWriteClient(config.repository, {
    writeToken: config.writeToken,
  })
  return writeClient
}

/**
 * Map an autoblogger post to a minimal stub document.
 * Used in 'stub' sync mode where content lives in autoblogger,
 * and Prismic only stores references for collection slices.
 */
function mapPostToStub(post: Post): Record<string, unknown> {
  return {
    title: post.title,
    autoblogger_id: post.id,
  }
}

/**
 * Map an autoblogger post to full Prismic document data.
 * Used in 'full' sync mode where all content is synced to Prismic.
 */
function mapPostToDocument(
  post: Post,
  fieldMapping: FieldMapping
): Record<string, unknown> {
  const mapping = { ...DEFAULT_FIELD_MAPPING, ...fieldMapping }
  const data: Record<string, unknown> = {}

  // Title as rich text (Prismic expects array)
  if (mapping.title && post.title) {
    data[mapping.title] = [{ type: 'heading1', text: post.title, spans: [] }]
  }

  // Subtitle as rich text
  if (mapping.subtitle && post.subtitle) {
    data[mapping.subtitle] = [{ type: 'paragraph', text: post.subtitle, spans: [] }]
  }

  // Content as rich text (converted from markdown)
  if (mapping.content && post.markdown) {
    data[mapping.content] = markdownToPrismicRichText(post.markdown)
  }

  // SEO fields as key text
  if (mapping.seoTitle && post.seoTitle) {
    data[mapping.seoTitle] = post.seoTitle
  }

  if (mapping.seoDescription && post.seoDescription) {
    data[mapping.seoDescription] = post.seoDescription
  }

  // Publish date
  if (mapping.publishDate && post.publishedAt) {
    data[mapping.publishDate] = post.publishedAt.toISOString().split('T')[0]
  }

  // Custom field mappings
  if (fieldMapping.custom) {
    for (const [postField, prismicField] of Object.entries(fieldMapping.custom)) {
      const value = (post as Record<string, unknown>)[postField]
      if (value !== undefined && value !== null) {
        data[prismicField] = value
      }
    }
  }

  return data
}

/**
 * Create a Prismic destination adapter for autoblogger.
 * 
 * @example
 * ```ts
 * import { prismicDestination } from '@autoblogger/prismic'
 * 
 * export const cms = createAutoblogger({
 *   prisma,
 *   auth: { ... },
 *   destinations: [
 *     prismicDestination({
 *       repository: 'my-repo',
 *       writeToken: process.env.PRISMIC_WRITE_TOKEN!,
 *       documentType: 'blog_post',
 *     })
 *   ]
 * })
 * ```
 */
export function prismicDestination(config: PrismicDestinationConfig): Destination {
  const fieldMapping = config.fieldMapping || {}
  const masterLocale = config.masterLocale || 'en-us'
  const syncMode = config.syncMode || 'full'
  const getDocumentId = config.getDocumentId || ((post: Post) => `autoblogger-${post.id}`)

  return {
    name: `prismic:${config.repository}`,

    async onPublish(post: Post): Promise<DestinationResult> {
      try {
        const writeClient = createMigrationClient(config)
        const readClient = prismic.createClient(config.repository)
        const migration = prismic.createMigration()

        const documentId = getDocumentId(post)
        
        // Use stub or full document data based on sync mode
        const documentData = syncMode === 'stub' 
          ? mapPostToStub(post)
          : mapPostToDocument(post, fieldMapping)

        // Check if we have an existing mapping for this post
        const existingMapping = config.getExistingMapping 
          ? await config.getExistingMapping(post.id)
          : null

        let prismicDocumentId: string | undefined
        let existingDoc: any = null

        // Try to find existing document either by mapping or by UID
        if (existingMapping) {
          // We have a mapping - fetch by document ID
          try {
            existingDoc = await readClient.getByID(existingMapping.prismicDocumentId)
            prismicDocumentId = existingDoc?.id
          } catch (fetchError) {
            console.warn(
              `[prismic:${config.repository}] Document not found by mapping ID, will check by UID:`,
              fetchError instanceof Error ? fetchError.message : fetchError
            )
          }
        }
        
        // If no mapping or mapping lookup failed, try to find by UID (handles pre-existing documents)
        if (!existingDoc) {
          try {
            existingDoc = await readClient.getByUID(config.documentType, post.slug, {
              lang: masterLocale,
            })
            prismicDocumentId = existingDoc?.id
            console.log(`[prismic:${config.repository}] Found existing document by UID for post "${post.slug}"`)
          } catch {
            // Document doesn't exist by UID - will create new
          }
        }

        // Track the migration document so we can get its ID after migration
        let migrationDoc: any = null

        if (existingDoc) {
          // Update existing document with new data, UID, and title
          const updatedDoc = {
            ...existingDoc,
            uid: post.slug, // Update UID if slug changed
            data: {
              ...existingDoc.data,
              ...documentData, // Merge new data
            },
          }
          
          // Use updateDocument to update both the document and its display name
          migration.updateDocument(updatedDoc as any, post.title)
          console.log(`[prismic:${config.repository}] Updating existing document for post "${post.slug}"`)
        } else {
          // Create a new document
          migrationDoc = migration.createDocument(
            {
              type: config.documentType,
              uid: post.slug,
              lang: masterLocale,
              data: documentData,
            },
            post.title
          )
          console.log(`[prismic:${config.repository}] Creating new document for post "${post.slug}"`)
        }

        // Execute the migration
        await writeClient.migrate(migration, {
          reporter: () => {}, // Silent reporter
        })

        // After migration, get the document ID from the migration document
        // The migration API sets doc.document.id after creation
        if (config.onSyncComplete) {
          // For new documents, get ID from migration doc
          if (migrationDoc?.document?.id) {
            prismicDocumentId = migrationDoc.document.id
          }
          
          // Call the callback with the immutable Prismic document ID
          if (prismicDocumentId) {
            await config.onSyncComplete(post, prismicDocumentId)
            console.log(`[prismic:${config.repository}] Stored mapping for document ID: ${prismicDocumentId}`)
          } else {
            console.warn(`[prismic:${config.repository}] Could not get document ID after sync`)
          }
        }

        return {
          success: true,
          externalId: prismicDocumentId || documentId,
        }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error publishing to Prismic',
        }
      }
    },

    async onUnpublish(post: Post): Promise<DestinationResult> {
      // Prismic Migration API doesn't support unpublishing directly
      // The document will remain but won't be updated
      // For full unpublish support, use the Document API directly
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
      // For full delete support, use the Document API directly
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
