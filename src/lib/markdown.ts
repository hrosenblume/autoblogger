import { marked } from 'marked'
import TurndownService from 'turndown'

// Configure marked for consistent rendering
marked.setOptions({
  gfm: true,
  breaks: false,
})

/**
 * Render markdown to HTML
 */
export function renderMarkdown(markdown: string): string {
  return marked.parse(markdown) as string
}

/**
 * Convert markdown to HTML with GFM and line breaks enabled.
 * Safe for client-side use in components like ChatPanel.
 */
export function markdownToHtml(markdown: string): string {
  return marked.parse(markdown, { gfm: true, breaks: true }) as string
}

/**
 * Parse markdown to tokens (AST)
 */
export function parseMarkdown(markdown: string) {
  return marked.lexer(markdown)
}

// Configure Turndown for HTML to markdown conversion
const turndownService = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
  bulletListMarker: '-',
})

/**
 * Convert HTML to markdown
 */
export function htmlToMarkdown(html: string): string {
  return turndownService.turndown(html)
}

/**
 * Count words in text (markdown or plain text)
 */
export function wordCount(text: string): number {
  if (!text) return 0
  return text.trim().split(/\s+/).filter(Boolean).length
}

/**
 * Generate URL-safe slug from title
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 60)
}

import sanitizeHtml from 'sanitize-html'

/**
 * Render markdown to sanitized HTML.
 * Safe for public-facing pages where user content is displayed.
 */
export function renderMarkdownSanitized(markdown: string): string {
  const html = renderMarkdown(markdown)
  return sanitizeHtml(html, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'h1', 'h2']),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      img: ['src', 'alt', 'title'],
      a: ['href', 'target', 'rel'],
    },
  })
}
