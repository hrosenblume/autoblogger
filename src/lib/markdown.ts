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
