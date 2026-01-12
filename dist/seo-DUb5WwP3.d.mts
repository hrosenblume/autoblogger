interface Post {
    id: string;
    title: string;
    subtitle?: string | null;
    slug: string;
    markdown: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
    publishedAt?: Date | null;
    seoTitle?: string | null;
    seoDescription?: string | null;
    seoKeywords?: string | null;
    noIndex: boolean;
    ogImage?: string | null;
    previewToken?: string | null;
    previewExpiry?: Date | null;
    sourceUrl?: string | null;
    topicId?: string | null;
    [key: string]: unknown;
}
interface Revision {
    id: string;
    postId: string;
    title?: string | null;
    subtitle?: string | null;
    markdown: string;
    createdAt: Date;
}
interface Comment {
    id: string;
    postId: string;
    authorId?: string | null;
    authorName?: string | null;
    authorEmail?: string | null;
    content: string;
    approved: boolean;
    createdAt: Date;
}
interface Tag {
    id: string;
    name: string;
    createdAt: Date;
}
interface PostTag {
    id: string;
    postId: string;
    tagId: string;
    createdAt: Date;
}
interface AISettings {
    id: string;
    rules: string;
    chatRules: string;
    rewriteRules?: string | null;
    defaultModel: string;
    generateTemplate?: string | null;
    chatTemplate?: string | null;
    rewriteTemplate?: string | null;
    updatedAt: Date;
}
interface TopicSubscription {
    id: string;
    name: string;
    keywords: string;
    rssFeeds: string;
    isActive: boolean;
    useKeywordFilter: boolean;
    frequency: string;
    maxPerPeriod: number;
    essayFocus?: string | null;
    lastRunAt?: Date | null;
    createdAt: Date;
    updatedAt: Date;
}
interface NewsItem {
    id: string;
    topicId: string;
    url: string;
    title: string;
    summary?: string | null;
    publishedAt?: Date | null;
    status: string;
    postId?: string | null;
    createdAt: Date;
}

interface SeoValues {
    title: string;
    description: string;
    keywords?: string | null;
    noIndex: boolean;
    ogImage?: string | null;
}
/**
 * Get SEO values from a post with fallbacks
 */
declare function getSeoValues(post: Post): SeoValues;

export { type AISettings as A, type Comment as C, type NewsItem as N, type Post as P, type Revision as R, type SeoValues as S, type Tag as T, type PostTag as a, type TopicSubscription as b, getSeoValues as g };
