import { P as Post } from './seo-DUb5WwP3.js';
export { A as AISettings, C as Comment, N as NewsItem, a as PostTag, R as Revision, T as Tag, b as TopicSubscription, g as getSeoValues } from './seo-DUb5WwP3.js';
export { htmlToMarkdown, parseMarkdown, renderMarkdown } from './lib/markdown.js';
import { Mark, Editor } from '@tiptap/core';
import { ComponentType } from 'react';
import 'marked';

interface PostHooks {
    beforePublish?: (post: Post) => Promise<void>;
    afterSave?: (post: Post) => Promise<void>;
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
declare function createPostsData(prisma: any, hooks?: PostHooks): {
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
    findAll(): Promise<any>;
    findAllWithCounts(): Promise<any>;
    count(): Promise<any>;
    findById(id: string): Promise<any>;
    findByName(name: string): Promise<any>;
    create(name: string): Promise<any>;
    update(id: string, name: string): Promise<any>;
    delete(id: string): Promise<any>;
    addToPost(postId: string, tagId: string): Promise<any>;
    removeFromPost(postId: string, tagId: string): Promise<any>;
    getPostTags(postId: string): Promise<any>;
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
    count(): Promise<any>;
    findAll(): Promise<any>;
    findById(id: string): Promise<any>;
    findByEmail(email: string): Promise<any>;
    create(data: CreateUserInput): Promise<any>;
    update(id: string, data: UpdateUserInput): Promise<any>;
    delete(id: string): Promise<any>;
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
    };
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

interface CustomFieldProps<T = unknown> {
    value: T;
    onChange: (value: T) => void;
    post: Post;
    disabled?: boolean;
}
interface CustomFieldConfig {
    name: string;
    label?: string;
    component: ComponentType<CustomFieldProps<unknown>>;
    position?: 'footer' | 'sidebar';
}

export { type AutobloggerServer as Autoblogger, type AutobloggerServerConfig as AutobloggerConfig, CommentMark, type CommentWithUser, type CreateCommentData, type CustomFieldConfig, type CustomFieldProps, Post, type SelectionState, type Session, type StylesConfig, addCommentMark, applyCommentMarks, canDeleteComment, canEditComment, createAPIHandler, createAutoblogger, createCommentsClient, formatDate, removeCommentMark, scrollToComment, truncate, validateSchema };
