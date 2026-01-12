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

export { htmlToMarkdown, markdownToHtml, parseMarkdown, renderMarkdown };
