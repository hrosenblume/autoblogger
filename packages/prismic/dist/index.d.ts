import { Post, Destination } from 'autoblogger';

/**
 * Field mapping configuration for Prismic documents.
 * Maps autoblogger post fields to Prismic document fields.
 */
interface FieldMapping {
    /** Prismic field for the post title (default: 'title') */
    title?: string;
    /** Prismic field for the post subtitle (default: 'subtitle') */
    subtitle?: string;
    /** Prismic field for the post content/body as rich text (default: 'body') */
    content?: string;
    /** Prismic field for the slug/UID (default: 'uid') - always maps to Prismic UID */
    slug?: 'uid';
    /** Prismic field for SEO title (default: 'seo_title') */
    seoTitle?: string;
    /** Prismic field for SEO description (default: 'seo_description') */
    seoDescription?: string;
    /** Prismic field for publish date (default: 'publish_date') */
    publishDate?: string;
    /** Custom field mappings for user-defined fields */
    custom?: Record<string, string>;
}
/**
 * Configuration for the Prismic destination adapter.
 */
interface PrismicDestinationConfig {
    /** Prismic repository name (e.g., 'my-repo') */
    repository: string;
    /** Prismic write API token (from Settings > API & Security) */
    writeToken: string;
    /** Prismic document type to create (e.g., 'blog_post') */
    documentType: string;
    /**
     * Sync mode:
     * - 'full' (default): Syncs all content including markdown body as rich text
     * - 'stub': Syncs minimal reference data only (uid, title, autoblogger_id)
     */
    syncMode?: 'stub' | 'full';
    /** Field mapping configuration (optional, uses defaults) - only used in 'full' mode */
    fieldMapping?: FieldMapping;
    /** Master locale for the repository (default: 'en-us') */
    masterLocale?: string;
    /** Whether to auto-publish documents after creating/updating (default: false) */
    autoPublish?: boolean;
    /** Custom document ID resolver (optional, uses post.id by default) */
    getDocumentId?: (post: Post) => string;
    /**
     * Callback after successful Prismic sync.
     * Use this to store the immutable Prismic document ID for resilient lookups.
     * The prismicDocumentId is Prismic's internal ID which cannot be edited by users.
     */
    onSyncComplete?: (post: Post, prismicDocumentId: string) => Promise<void>;
    /**
     * Callback to get existing mapping for a post.
     * Used to determine if we should update an existing document or create a new one.
     * Returns the Prismic document ID and last known slug, or null if no mapping exists.
     */
    getExistingMapping?: (postId: string) => Promise<{
        prismicDocumentId: string;
        lastKnownSlug: string | null;
    } | null>;
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
declare function prismicDestination(config: PrismicDestinationConfig): Destination;

export { type FieldMapping, type PrismicDestinationConfig, prismicDestination };
