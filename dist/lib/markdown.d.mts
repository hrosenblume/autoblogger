import * as marked from 'marked';

/**
 * Render markdown to HTML
 */
declare function renderMarkdown(markdown: string): string;
/**
 * Convert markdown to HTML with GFM and line breaks enabled.
 * Safe for client-side use in components like ChatPanel.
 */
declare function markdownToHtml(markdown: string): string;
/**
 * Parse markdown to tokens (AST)
 */
declare function parseMarkdown(markdown: string): marked.TokensList;
/**
 * Convert HTML to markdown
 */
declare function htmlToMarkdown(html: string): string;
/**
 * Count words in text (markdown or plain text)
 */
declare function wordCount(text: string): number;
/**
 * Generate URL-safe slug from title
 */
declare function generateSlug(title: string): string;
/**
 * Render markdown to sanitized HTML.
 * Safe for public-facing pages where user content is displayed.
 */
declare function renderMarkdownSanitized(markdown: string): string;

export { generateSlug, htmlToMarkdown, markdownToHtml, parseMarkdown, renderMarkdown, renderMarkdownSanitized, wordCount };
