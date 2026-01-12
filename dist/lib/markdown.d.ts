import * as marked from 'marked';

/**
 * Render markdown to HTML
 */
declare function renderMarkdown(markdown: string): string;
/**
 * Parse markdown to tokens (AST)
 */
declare function parseMarkdown(markdown: string): marked.TokensList;
/**
 * Convert HTML to markdown
 */
declare function htmlToMarkdown(html: string): string;

export { htmlToMarkdown, parseMarkdown, renderMarkdown };
