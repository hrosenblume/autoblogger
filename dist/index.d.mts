import { P as Post } from './seo-DUb5WwP3.mjs';
export { A as AISettings, C as Comment, N as NewsItem, a as PostTag, R as Revision, T as Tag, b as TopicSubscription, g as getSeoValues } from './seo-DUb5WwP3.mjs';
import { ComponentType } from 'react';
export { generateSlug, htmlToMarkdown, markdownToHtml, parseMarkdown, renderMarkdown, renderMarkdownSanitized, wordCount } from './lib/markdown.mjs';
import { Mark, Editor } from '@tiptap/core';
import 'marked';

interface RssArticle {
    title: string;
    url: string;
    summary: string | null;
    publishedAt: Date | null;
}
/**
 * Fetch and parse multiple RSS feeds, combining all articles.
 */
declare function fetchRssFeeds(feedUrls: string[]): Promise<RssArticle[]>;

/**
 * Filter articles by keyword matching.
 * Case-insensitive substring match on title and summary.
 */
declare function filterByKeywords(articles: RssArticle[], keywords: string[]): RssArticle[];

interface GenerationResult {
    topicId: string;
    topicName: string;
    generated: number;
    skipped: number;
}
interface AutoDraftConfig {
    prisma: any;
    anthropicKey?: string;
    openaiKey?: string;
    /** Called after generating an essay, before creating the post. Return additional post fields. */
    onPostCreate?: (article: RssArticle, essay: {
        title: string;
        subtitle: string | null;
        markdown: string;
    }) => Record<string, unknown> | Promise<Record<string, unknown>>;
}
/**
 * Run auto-draft for one or all active topics.
 * @param config - Configuration including prisma client and API keys
 * @param topicId - Optional: run for a specific topic only
 * @param skipFrequencyCheck - If true, ignore frequency settings (for manual trigger)
 */
declare function runAutoDraft(config: AutoDraftConfig, topicId?: string, skipFrequencyCheck?: boolean): Promise<GenerationResult[]>;

/**
 * Result returned by a destination after handling an event
 */
interface DestinationResult {
    /** Whether the operation succeeded */
    success: boolean;
    /** External ID assigned by the destination (e.g., Prismic document ID) */
    externalId?: string;
    /** Error message if the operation failed */
    error?: string;
}
/**
 * A destination adapter that syncs posts to an external CMS or service.
 *
 * Implement this interface to create custom adapters for Prismic, Contentful,
 * Sanity, or any other service.
 */
interface Destination {
    /** Unique name for this destination (for logging/debugging) */
    name: string;
    /**
     * Called when a post is published.
     * Should create or update the post in the external service.
     */
    onPublish(post: Post): Promise<DestinationResult>;
    /**
     * Called when a post is unpublished (status changed from 'published' to 'draft').
     * Should archive or unpublish the post in the external service.
     */
    onUnpublish(post: Post): Promise<DestinationResult>;
    /**
     * Called when a post is deleted.
     * Should remove the post from the external service.
     */
    onDelete(post: Post): Promise<DestinationResult>;
}
/**
 * Event payload sent to webhooks
 */
interface DestinationEvent {
    /** The type of event that occurred */
    type: 'publish' | 'unpublish' | 'delete';
    /** The post that triggered the event */
    post: Post;
    /** When the event occurred */
    timestamp: string;
}
/**
 * Configuration for the destination system
 */
interface DestinationsConfig {
    /** Array of destination adapters to sync posts to */
    destinations?: Destination[];
    /** Webhook URLs to POST event payloads to */
    webhooks?: string[];
    /** Callback fired when a post is published */
    onPublish?: (post: Post) => Promise<void>;
    /** Callback fired when a post is unpublished */
    onUnpublish?: (post: Post) => Promise<void>;
    /** Callback fired when a post is deleted */
    onDelete?: (post: Post) => Promise<void>;
}
/**
 * Aggregated results from all destinations
 */
interface DispatchResult {
    /** Results from each destination adapter */
    destinations: Array<{
        name: string;
        result: DestinationResult;
    }>;
    /** Results from webhook calls */
    webhooks: Array<{
        url: string;
        success: boolean;
        error?: string;
    }>;
    /** Whether all operations succeeded */
    allSucceeded: boolean;
}

interface DispatcherConfig {
    destinations?: Destination[];
    webhooks?: string[];
    onPublish?: (post: Post) => Promise<void>;
    onUnpublish?: (post: Post) => Promise<void>;
    onDelete?: (post: Post) => Promise<void>;
}
/**
 * Creates a destination dispatcher that fires events to adapters, webhooks, and callbacks.
 */
declare function createDestinationDispatcher(config: DispatcherConfig): {
    /**
     * Dispatch a publish event to all destinations
     */
    publish(post: Post): Promise<DispatchResult>;
    /**
     * Dispatch an unpublish event to all destinations
     */
    unpublish(post: Post): Promise<DispatchResult>;
    /**
     * Dispatch a delete event to all destinations
     */
    delete(post: Post): Promise<DispatchResult>;
    /**
     * Check if any destinations or webhooks are configured
     */
    readonly hasDestinations: boolean;
};
type DestinationDispatcher = ReturnType<typeof createDestinationDispatcher>;

interface PostHooks {
    beforePublish?: (post: Post) => Promise<void>;
    afterSave?: (post: Post) => Promise<void>;
    /** Called when a slug changes on a post that was previously published. Used to create redirects. */
    onSlugChange?: (data: {
        postId: string;
        oldSlug: string;
        newSlug: string;
    }) => Promise<void>;
}
interface CreatePostInput {
    title: string;
    subtitle?: string;
    slug?: string;
    markdown?: string;
    status?: string;
    [key: string]: unknown;
}
interface UpdatePostInput {
    title?: string;
    subtitle?: string;
    slug?: string;
    markdown?: string;
    status?: string;
    publishedAt?: Date;
    [key: string]: unknown;
}
declare function createPostsData(prisma: any, hooks?: PostHooks, dispatcher?: DestinationDispatcher, prismicEnvToken?: string): {
    count(where?: {
        status?: string;
    }): Promise<any>;
    findPublished(): Promise<any>;
    findBySlug(slug: string): Promise<any>;
    findById(id: string): Promise<any>;
    findDrafts(): Promise<any>;
    findAll(options?: {
        status?: string;
        orderBy?: any;
        skip?: number;
        take?: number;
        includeRevisionCount?: boolean;
    }): Promise<any>;
    create(data: CreatePostInput): Promise<any>;
    update(id: string, data: UpdatePostInput): Promise<any>;
    delete(id: string): Promise<any>;
    getPreviewUrl(id: string, basePath?: string): Promise<string>;
    findByPreviewToken(token: string): Promise<any>;
};

/**
 * Comments data layer for autoblogger.
 * Supports both public blog comments (simple) and editor comments (with quotedText, replies, resolve).
 */
interface CommentsConfig {
    mode?: 'authenticated' | 'public' | 'disabled';
}
interface EditorComment {
    id: string;
    postId: string;
    userId: string;
    quotedText: string;
    content: string;
    parentId: string | null;
    resolved: boolean;
    createdAt: Date;
    updatedAt: Date;
    user: {
        id: string;
        name: string | null;
        email: string;
    };
    replies?: EditorComment[];
}
interface CreateEditorCommentInput {
    postId: string;
    quotedText: string;
    content: string;
    parentId?: string;
}
interface CreatePublicCommentInput {
    postId: string;
    content: string;
    authorId?: string;
    authorName?: string;
    authorEmail?: string;
}
declare function createCommentsData(prisma: any, config?: CommentsConfig): {
    count(): Promise<any>;
    findByPost(postId: string): Promise<any>;
    findAll(options?: {
        postId?: string;
        approved?: boolean;
        page?: number;
        limit?: number;
    }): Promise<{
        data: any;
        total: any;
        page: number;
        totalPages: number;
    }>;
    create(data: CreatePublicCommentInput): Promise<any>;
    approve(id: string): Promise<any>;
    delete(id: string): Promise<any>;
    getMode(): "authenticated" | "public" | "disabled";
    /**
     * Find all editor comments for a post with nested replies.
     */
    findEditorComments(postId: string, userId?: string): Promise<EditorComment[]>;
    /**
     * Create an editor comment (with quotedText and optional parentId for replies).
     */
    createEditorComment(postId: string, userId: string, data: CreateEditorCommentInput): Promise<EditorComment>;
    /**
     * Update a comment's content.
     */
    updateEditorComment(commentId: string, content: string, userId?: string): Promise<EditorComment>;
    /**
     * Soft delete a comment.
     */
    deleteEditorComment(commentId: string): Promise<void>;
    /**
     * Toggle resolved status.
     */
    toggleResolve(commentId: string): Promise<EditorComment>;
    /**
     * Resolve all open comments for a post.
     */
    resolveAll(postId: string): Promise<{
        resolved: number;
    }>;
};

declare function createTagsData(prisma: any): {
    findAllWithCounts(): Promise<unknown[]>;
    findByName(name: string): Promise<any>;
    create(name: string): Promise<any>;
    update(id: string, name: string): Promise<any>;
    addToPost(postId: string, tagId: string): Promise<any>;
    removeFromPost(postId: string, tagId: string): Promise<any>;
    getPostTags(postId: string): Promise<any>;
    findAll: (opts?: {
        skip?: number;
        take?: number;
        where?: Record<string, unknown>;
    }) => Promise<unknown[]>;
    findById: (id: string) => Promise<unknown>;
    count: (where?: Record<string, unknown>) => Promise<number>;
    delete: (id: string) => Promise<unknown>;
};

declare function createRevisionsData(prisma: any): {
    findAll(options?: {
        postId?: string;
        skip?: number;
        take?: number;
    }): Promise<any>;
    count(where?: {
        postId?: string;
    }): Promise<any>;
    findByPost(postId: string): Promise<any>;
    findById(id: string): Promise<any>;
    create(postId: string, data: {
        title?: string;
        subtitle?: string;
        markdown: string;
    }): Promise<any>;
    restore(revisionId: string): Promise<any>;
    compare(revisionId1: string, revisionId2: string): Promise<{
        older: any;
        newer: any;
    }>;
    pruneOldest(postId: string, keepCount: number): Promise<any>;
    delete(id: string): Promise<any>;
};

declare function createAISettingsData(prisma: any): {
    get(): Promise<any>;
    update(data: {
        rules?: string;
        chatRules?: string;
        rewriteRules?: string;
        autoDraftRules?: string;
        planRules?: string;
        defaultModel?: string;
        autoDraftWordCount?: number;
        generateTemplate?: string | null;
        chatTemplate?: string | null;
        rewriteTemplate?: string | null;
        autoDraftTemplate?: string | null;
        planTemplate?: string | null;
        expandPlanTemplate?: string | null;
        agentTemplate?: string | null;
        anthropicKey?: string | null;
        openaiKey?: string | null;
    }): Promise<any>;
};

interface CreateTopicInput {
    name: string;
    keywords?: string[];
    rssFeeds?: string[];
    isActive?: boolean;
    useKeywordFilter?: boolean;
    frequency?: string;
    maxPerPeriod?: number;
    essayFocus?: string;
}
interface UpdateTopicInput {
    name?: string;
    keywords?: string[];
    rssFeeds?: string[];
    isActive?: boolean;
    useKeywordFilter?: boolean;
    frequency?: string;
    maxPerPeriod?: number;
    essayFocus?: string;
    lastRunAt?: Date;
}
declare function createTopicsData(prisma: any): {
    findAll(): Promise<any>;
    count(): Promise<any>;
    findActive(): Promise<any>;
    findById(id: string): Promise<any>;
    create(data: CreateTopicInput): Promise<any>;
    update(id: string, data: UpdateTopicInput): Promise<any>;
    delete(id: string): Promise<any>;
    markRun(id: string): Promise<any>;
};

interface CreateNewsItemInput {
    topicId: string;
    url: string;
    title: string;
    summary?: string;
    publishedAt?: Date;
}
declare function createNewsItemsData(prisma: any): {
    findPending(): Promise<any>;
    findByTopic(topicId: string): Promise<any>;
    findById(id: string): Promise<any>;
    create(data: CreateNewsItemInput): Promise<any>;
    skip(id: string): Promise<any>;
    markGenerated(id: string, postId: string): Promise<any>;
    delete(id: string): Promise<any>;
    generateDraft(id: string, createPost: (data: any) => Promise<any>): Promise<any>;
};

interface CreateUserInput {
    email: string;
    name?: string;
    role?: string;
}
interface UpdateUserInput {
    name?: string;
    role?: string;
}
declare function createUsersData(prisma: any): {
    findByEmail(email: string): Promise<any>;
    create(data: CreateUserInput): Promise<any>;
    update(id: string, data: UpdateUserInput): Promise<any>;
    findAll: (opts?: {
        skip?: number;
        take?: number;
        where?: Record<string, unknown>;
    }) => Promise<unknown[]>;
    findById: (id: string) => Promise<unknown>;
    count: (where?: Record<string, unknown>) => Promise<number>;
    delete: (id: string) => Promise<unknown>;
};

interface Session {
    user?: {
        id?: string;
        email?: string;
        name?: string;
        role?: string;
        [key: string]: unknown;
    };
    [key: string]: unknown;
}

interface StylesConfig {
    container?: string;
    title?: string;
    subtitle?: string;
    byline?: string;
    prose?: string;
}
interface CustomFieldProps<T = unknown> {
    value: T;
    onChange: (value: T) => void;
    onFieldChange: (name: string, value: unknown) => void;
    post: Post;
    disabled?: boolean;
}
interface CustomFieldConfig {
    name: string;
    label?: string;
    component: ComponentType<CustomFieldProps<unknown>>;
    position?: 'footer' | 'sidebar';
}
interface AutobloggerServerConfig {
    prisma: unknown;
    auth: {
        getSession: () => Promise<Session | null>;
        isAdmin: (session: Session | null) => boolean;
        canPublish: (session: Session | null) => boolean;
    };
    ai?: {
        anthropicKey?: string;
        openaiKey?: string;
    };
    /** Prismic integration config (passed from host app) */
    prismic?: {
        /** Repository name (e.g., 'my-repo') - auto-fills the settings UI */
        repository?: string;
        /** Write API token from env */
        writeToken?: string;
    };
    storage?: {
        upload: (file: File) => Promise<{
            url: string;
        }>;
    };
    comments?: {
        mode: 'authenticated' | 'public' | 'disabled';
    };
    styles?: StylesConfig;
    hooks?: {
        beforePublish?: (post: Post) => Promise<void>;
        afterSave?: (post: Post) => Promise<void>;
        /** Called when a slug changes on a post that was previously published. Used to create redirects. */
        onSlugChange?: (data: {
            postId: string;
            oldSlug: string;
            newSlug: string;
        }) => Promise<void>;
        /** Called during auto-draft after generating essay, return extra fields for post creation */
        onAutoDraftPostCreate?: (article: RssArticle, essay: {
            title: string;
            subtitle: string | null;
            markdown: string;
        }) => Record<string, unknown> | Promise<Record<string, unknown>>;
    };
    /** Array of destination adapters to sync posts to (Prismic, Contentful, etc.) */
    destinations?: Destination[];
    /** Webhook URLs to POST event payloads to when posts are published/unpublished/deleted */
    webhooks?: string[];
    /** Callback fired when a post is published */
    onPublish?: (post: Post) => Promise<void>;
    /** Callback fired when a post is unpublished */
    onUnpublish?: (post: Post) => Promise<void>;
    /** Callback fired when a post is deleted */
    onDelete?: (post: Post) => Promise<void>;
}

interface AutobloggerServer {
    config: AutobloggerServerConfig & {
        styles: Required<StylesConfig>;
    };
    posts: ReturnType<typeof createPostsData>;
    comments: ReturnType<typeof createCommentsData>;
    tags: ReturnType<typeof createTagsData>;
    revisions: ReturnType<typeof createRevisionsData>;
    aiSettings: ReturnType<typeof createAISettingsData>;
    topics: ReturnType<typeof createTopicsData>;
    newsItems: ReturnType<typeof createNewsItemsData>;
    users: ReturnType<typeof createUsersData>;
    /** Handle an API request - convenience method for route handlers */
    handleRequest: (req: Request, path: string) => Promise<Response>;
    /** Auto-draft runner */
    autoDraft: {
        run: (topicId?: string, skipFrequencyCheck?: boolean) => Promise<GenerationResult[]>;
    };
}
declare function createAutoblogger(config: AutobloggerServerConfig): AutobloggerServer;

interface APIHandlerOptions {
    basePath?: string;
    onMutate?: (type: string, data: unknown) => Promise<void>;
}
type NextRequest = Request & {
    nextUrl: URL;
};
declare function createAPIHandler(cms: AutobloggerServer, options?: APIHandlerOptions): (req: NextRequest) => Promise<Response>;

interface SchemaValidationResult {
    valid: boolean;
    missingTables: string[];
}
declare function validateSchema(prisma: unknown): Promise<SchemaValidationResult>;

interface CrudOptions {
    model: string;
    defaultOrderBy?: Record<string, 'asc' | 'desc'>;
    defaultInclude?: Record<string, unknown>;
}
interface BaseCrud<T> {
    findAll: (opts?: {
        skip?: number;
        take?: number;
        where?: Record<string, unknown>;
    }) => Promise<T[]>;
    findById: (id: string) => Promise<T | null>;
    count: (where?: Record<string, unknown>) => Promise<number>;
    create: (data: Partial<T>) => Promise<T>;
    update: (id: string, data: Partial<T>) => Promise<T>;
    delete: (id: string) => Promise<T>;
}
/**
 * Create a base CRUD data layer for a Prisma model.
 * Use spread operator to extend with custom methods:
 *
 * ```typescript
 * const base = createCrudData(prisma, { model: 'tag', defaultOrderBy: { name: 'asc' } })
 * return {
 *   ...base,
 *   customMethod: async () => { ... }
 * }
 * ```
 */
declare function createCrudData<T>(prisma: any, options: CrudOptions): BaseCrud<T>;

/** Full model definition with provider details */
interface AIModel {
    id: string;
    name: string;
    provider: 'anthropic' | 'openai';
    modelId: string;
    description?: string;
    searchModel: 'native' | null;
}
declare const AI_MODELS: AIModel[];
declare function getModel(id: string): AIModel | undefined;
declare function getDefaultModel(): AIModel;
/**
 * Resolve a model ID, falling back to database default or hardcoded default.
 * Used by AI API routes to avoid duplicating model resolution logic.
 *
 * @param providedModelId - Optional model ID from request
 * @param getDefaultModelId - Async function to get default from DB (avoids Prisma import here)
 * @returns Resolved AIModel
 * @throws Error if model not found
 */
declare function resolveModel(providedModelId: string | undefined, getDefaultModelId: () => Promise<string | null>): Promise<AIModel>;

interface GenerateResult {
    text: string;
    inputTokens?: number;
    outputTokens?: number;
}
/**
 * Generate text using the specified model (non-streaming).
 * Used for search mode and other non-streaming requests.
 */
declare function generate(modelId: string, systemPrompt: string, userPrompt: string, options?: {
    anthropicKey?: string;
    openaiKey?: string;
    maxTokens?: number;
    useWebSearch?: boolean;
}): Promise<GenerateResult>;

/**
 * Build a system prompt for essay generation.
 */
declare function buildGeneratePrompt(options: {
    rules?: string;
    template?: string | null;
    wordCount?: number;
    styleExamples?: string;
}): string;
/**
 * Build a system prompt for chat interactions.
 */
declare function buildChatPrompt(options: {
    chatRules?: string;
    rules?: string;
    template?: string | null;
    essayContext?: {
        title: string;
        subtitle?: string;
        markdown: string;
    } | null;
    styleExamples?: string;
}): string;
/**
 * Build a system prompt for expanding a plan into a full essay.
 */
declare function buildExpandPlanPrompt(options: {
    rules?: string;
    template?: string | null;
    plan: string;
    styleExamples?: string;
}): string;
/**
 * Build a system prompt for plan/outline generation.
 */
declare function buildPlanPrompt(options: {
    planRules?: string;
    template?: string | null;
    styleExamples?: string;
}): string;
/**
 * Build a system prompt for text rewriting.
 */
declare function buildRewritePrompt(options: {
    rewriteRules?: string;
    rules?: string;
    template?: string | null;
    styleExamples?: string;
}): string;
/**
 * Build a system prompt for auto-drafting essays from news articles.
 */
declare function buildAutoDraftPrompt(options: {
    autoDraftRules?: string;
    rules?: string;
    template?: string | null;
    wordCount?: number;
    styleExamples?: string;
    topicName?: string;
    articleTitle?: string;
    articleSummary?: string;
    articleUrl?: string;
}): string;

/**
 * Default template for essay generation.
 * Placeholders: {{RULES}}, {{STYLE_EXAMPLES}}, {{WORD_COUNT}}
 */
declare const DEFAULT_GENERATE_TEMPLATE = "<system>\n<role>Expert essay writer creating engaging, thoughtful content</role>\n\n<critical>\nALWAYS output a complete essay. NEVER respond conversationally.\n- Do NOT ask questions or request clarification\n- Do NOT say \"Here is your essay\" or similar preamble\n- Do NOT explain what you're going to write\n- If the prompt is vague, make creative choices and proceed\n- Output ONLY the essay in markdown format\n</critical>\n\n<rules>\n{{RULES}}\n</rules>\n\n<style_reference>\n{{STYLE_EXAMPLES}}\n</style_reference>\n\n<constraints>\n<word_count>{{WORD_COUNT}}</word_count>\n</constraints>\n\n<output_format>\nCRITICAL: Your response MUST start with exactly this format:\n\nLine 1: # [Your Title Here]\nLine 2: *[Your subtitle here]*\nLine 3: (blank line)\nLine 4+: Essay body in markdown\n\n<title_guidelines>\n- Be SPECIFIC, not generic (avoid \"The Power of\", \"Why X Matters\", \"A Guide to\")\n- Include a concrete detail, angle, or unexpected element\n- Create curiosity or make a bold claim\n- 5-12 words ideal\n</title_guidelines>\n\n<subtitle_guidelines>\n- One sentence that hooks the reader\n- Tease the main argument or reveal a key insight\n- Create tension, curiosity, or promise value\n- Make readers want to continue reading\n</subtitle_guidelines>\n</output_format>\n</system>";
/**
 * Default template for chat interactions.
 * Placeholders: {{CHAT_RULES}}, {{RULES}}, {{STYLE_EXAMPLES}}, {{ESSAY_CONTEXT}}
 */
declare const DEFAULT_CHAT_TEMPLATE = "<system>\n<role>Helpful writing assistant for essay creation and editing</role>\n\n<chat_rules>\n{{CHAT_RULES}}\n</chat_rules>\n\n<writing_rules>\n{{RULES}}\n</writing_rules>\n\n<style_reference>\n{{STYLE_EXAMPLES}}\n</style_reference>\n\n<context>\n{{ESSAY_CONTEXT}}\n</context>\n\n<behavior>\n- Be concise and actionable\n- When suggesting edits, be specific about what to change\n- Match the author's voice and style when writing\n- Ask clarifying questions if the request is ambiguous\n</behavior>\n</system>";
/**
 * Default template for text rewriting.
 * Placeholders: {{REWRITE_RULES}}, {{RULES}}, {{STYLE_EXAMPLES}}
 */
declare const DEFAULT_REWRITE_TEMPLATE = "<system>\n<role>Writing assistant that improves text quality</role>\n\n<rewrite_rules>\n{{REWRITE_RULES}}\n</rewrite_rules>\n\n<writing_rules>\n{{RULES}}\n</writing_rules>\n\n<style_reference>\n{{STYLE_EXAMPLES}}\n</style_reference>\n\n<behavior>\n- Preserve the original meaning exactly\n- Improve clarity, flow, and readability\n- Fix grammar and punctuation issues\n- Maintain the author's voice and tone\n- Output only the improved text, no explanations\n</behavior>\n</system>";
/**
 * Default template for auto-drafting from news articles.
 * Placeholders: {{AUTO_DRAFT_RULES}}, {{RULES}}, {{STYLE_EXAMPLES}}, {{TOPIC_NAME}}, {{ARTICLE_TITLE}}, {{ARTICLE_SUMMARY}}, {{ARTICLE_URL}}, {{AUTO_DRAFT_WORD_COUNT}}
 */
declare const DEFAULT_AUTO_DRAFT_TEMPLATE = "<system>\n<role>Expert essay writer creating engaging content from news articles</role>\n\n<auto_draft_rules>\n{{AUTO_DRAFT_RULES}}\n</auto_draft_rules>\n\n<writing_rules>\n{{RULES}}\n</writing_rules>\n\n<style_reference>\n{{STYLE_EXAMPLES}}\n</style_reference>\n\n<source_article>\n<topic>{{TOPIC_NAME}}</topic>\n<title>{{ARTICLE_TITLE}}</title>\n<summary>{{ARTICLE_SUMMARY}}</summary>\n<url>{{ARTICLE_URL}}</url>\n</source_article>\n\n<constraints>\n<word_count>{{AUTO_DRAFT_WORD_COUNT}}</word_count>\n</constraints>\n\n<output_format>\nCRITICAL: Your response MUST start with exactly this format:\n\nLine 1: # [Your Title Here]\nLine 2: *[Your subtitle here]*\nLine 3: (blank line)\nLine 4+: Essay body in markdown\n\n<title_guidelines>\n- Be SPECIFIC about the news angle, not generic\n- Include a concrete detail or unexpected element\n- Create curiosity or make a bold claim\n- 5-12 words ideal\n</title_guidelines>\n\n<subtitle_guidelines>\n- One sentence that hooks the reader\n- Tease the main argument or unique perspective\n- Create tension, curiosity, or promise value\n</subtitle_guidelines>\n</output_format>\n</system>";
/**
 * Default template for essay outline generation.
 * Placeholders: {{PLAN_RULES}}, {{STYLE_EXAMPLES}}
 */
declare const DEFAULT_PLAN_TEMPLATE = "<system>\n<role>Writing assistant that creates essay outlines</role>\n\n<critical>\nWrap your ENTIRE response in <plan> tags. Output NOTHING outside the tags.\n</critical>\n\n<rules>\n{{PLAN_RULES}}\n</rules>\n\n<style_reference>\n{{STYLE_EXAMPLES}}\n</style_reference>\n</system>";
/**
 * Default rules for plan generation format.
 */
declare const DEFAULT_PLAN_RULES = "<format>\nSTRICT LIMIT: Maximum 3 bullets per section. Most sections should have 1-2 bullets.\n\n<plan>\n# Essay Title\n*One-line subtitle*\n\n## Section Name\n- Key point\n\n## Section Name\n- Key point\n- Another point\n\n## Section Name\n- Key point\n</plan>\n</format>\n\n<constraints>\n- 4-6 section headings (## lines)\n- 1-3 bullets per section \u2014 NEVER 4 or more\n- Bullets are short phrases, not sentences\n- No prose, no paragraphs, no explanations\n- When revising, output the complete updated plan\n</constraints>\n\n<title_guidelines>\n- Be SPECIFIC about the essay's angle\n- Include a concrete detail or unexpected element\n- Avoid generic patterns like \"The Power of\", \"Why X Matters\"\n- 5-12 words ideal\n</title_guidelines>\n\n<subtitle_guidelines>\n- One sentence that previews the main argument\n- Create curiosity or make a bold claim\n</subtitle_guidelines>";
/**
 * Default template for expanding outlines into full essays.
 * Placeholders: {{RULES}}, {{STYLE_EXAMPLES}}, {{PLAN}}
 */
declare const DEFAULT_EXPAND_PLAN_TEMPLATE = "<system>\n<role>Writing assistant that expands essay outlines into full drafts</role>\n\n<writing_rules>\n{{RULES}}\n</writing_rules>\n\n<style_reference>\n{{STYLE_EXAMPLES}}\n</style_reference>\n\n<plan_to_expand>\n{{PLAN}}\n</plan_to_expand>\n\n<output_format>\nCRITICAL: Your response MUST start with exactly this format:\n\nLine 1: # [Title from plan, refined if needed]\nLine 2: *[Subtitle from plan, refined if needed]*\nLine 3: (blank line)\nLine 4+: Essay body with ## section headings\n\n<requirements>\n- Use the section headers from the plan as H2 headings\n- Expand each section's bullet points into full paragraphs\n- Match the author's voice and style from the examples\n- Output ONLY markdown \u2014 no preamble, no \"Here is...\", no explanations\n</requirements>\n\n<title_refinement>\nIf the plan title is generic, improve it to be:\n- More specific and concrete\n- Curiosity-inducing or bold\n- 5-12 words\n</title_refinement>\n</output_format>\n</system>";

/**
 * Parse AI-generated markdown to extract title, subtitle, and body.
 *
 * Expects format:
 * # Title
 * *Subtitle*
 *
 * Body content...
 */
declare function parseGeneratedContent(markdown: string): {
    title: string;
    subtitle: string;
    body: string;
};

/**
 * Format a date for display
 */
declare function formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions): string;
/**
 * Truncate text to a maximum length
 */
declare function truncate(text: string, maxLength: number): string;

/**
 * Comment types and client-side API helpers for the editor commenting system.
 * Used for collaborative inline comments on posts.
 */
interface CommentUser {
    id: string;
    name: string | null;
    email: string;
}
interface CommentWithUser {
    id: string;
    postId: string;
    userId: string;
    quotedText: string;
    content: string;
    parentId: string | null;
    resolved: boolean;
    createdAt: string;
    updatedAt: string;
    user: CommentUser;
    replies?: CommentWithUser[];
}
interface CreateCommentData {
    quotedText: string;
    content: string;
    parentId?: string;
}
interface SelectionState {
    text: string;
    from: number;
    to: number;
    hasExistingComment?: boolean;
}
declare function canDeleteComment(comment: CommentWithUser, currentUserEmail: string, isAdmin: boolean): boolean;
declare function canEditComment(comment: CommentWithUser, currentUserEmail: string): boolean;
declare function createCommentsClient(apiBasePath?: string): {
    fetchComments(postId: string): Promise<CommentWithUser[]>;
    createComment(postId: string, data: CreateCommentData): Promise<CommentWithUser>;
    updateComment(postId: string, commentId: string, content: string): Promise<CommentWithUser>;
    deleteComment(postId: string, commentId: string): Promise<void>;
    toggleResolve(postId: string, commentId: string): Promise<CommentWithUser>;
    resolveAllComments(postId: string): Promise<{
        resolved: number;
    }>;
};

interface CommentMarkOptions {
    onCommentClick?: (commentId: string) => void;
}
declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        comment: {
            setComment: (commentId: string) => ReturnType;
            unsetComment: (commentId: string) => ReturnType;
        };
    }
}
declare const CommentMark: Mark<CommentMarkOptions, any>;
/**
 * Apply comment mark to the current selection
 */
declare function addCommentMark(editor: Editor, commentId: string, from: number, to: number): void;
/**
 * Remove comment mark from the document
 */
declare function removeCommentMark(editor: Editor, commentId: string): void;
/**
 * Re-apply comment marks based on quoted text matching.
 * Called when loading a post with existing comments.
 */
declare function applyCommentMarks(editor: Editor, comments: CommentWithUser[]): void;
/**
 * Scroll to a comment mark in the editor
 */
declare function scrollToComment(editor: Editor, commentId: string): void;

export { type AIModel, AI_MODELS, type AutoDraftConfig, type AutobloggerServer as Autoblogger, type AutobloggerServerConfig as AutobloggerConfig, type BaseCrud, CommentMark, type CommentWithUser, type CreateCommentData, type CrudOptions, type CustomFieldConfig, type CustomFieldProps, DEFAULT_AUTO_DRAFT_TEMPLATE, DEFAULT_CHAT_TEMPLATE, DEFAULT_EXPAND_PLAN_TEMPLATE, DEFAULT_GENERATE_TEMPLATE, DEFAULT_PLAN_RULES, DEFAULT_PLAN_TEMPLATE, DEFAULT_REWRITE_TEMPLATE, type Destination, type DestinationDispatcher, type DestinationEvent, type DestinationResult, type DestinationsConfig, type DispatchResult, type DispatcherConfig, type GenerationResult, Post, type RssArticle, type SelectionState, type Session, type StylesConfig, addCommentMark, applyCommentMarks, buildAutoDraftPrompt, buildChatPrompt, buildExpandPlanPrompt, buildGeneratePrompt, buildPlanPrompt, buildRewritePrompt, canDeleteComment, canEditComment, createAPIHandler, createAutoblogger, createCommentsClient, createCrudData, createDestinationDispatcher, fetchRssFeeds, filterByKeywords, formatDate, generate, getDefaultModel, getModel, parseGeneratedContent, removeCommentMark, resolveModel, runAutoDraft, scrollToComment, truncate, validateSchema };
