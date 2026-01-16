import { marked, Renderer } from 'marked'
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
 * Custom renderer that adds Tailwind classes to HTML elements.
 * Used for rendering markdown in places where external CSS isn't loaded.
 */
function createStyledRenderer(): Renderer {
  const renderer = new Renderer()
  
  renderer.heading = function(this: Renderer, text: string, level: number): string {
    const classes: Record<number, string> = {
      1: 'text-[22px] leading-tight font-bold mb-4',
      2: 'text-lg leading-snug font-bold mt-6 mb-3',
      3: 'text-base leading-snug font-bold mt-4 mb-2',
      4: 'text-sm leading-snug font-semibold mt-3 mb-1',
      5: 'text-sm leading-snug font-semibold mt-2 mb-1',
      6: 'text-sm leading-snug font-medium mt-2 mb-1',
    }
    return `<h${level} class="${classes[level] || ''}">${text}</h${level}>\n`
  }
  
  renderer.paragraph = function(this: Renderer, text: string): string {
    return `<p class="mb-3 leading-relaxed">${text}</p>\n`
  }
  
  renderer.list = function(this: Renderer, body: string, ordered: boolean): string {
    const tag = ordered ? 'ol' : 'ul'
    const listClass = ordered ? 'list-decimal' : 'list-disc'
    return `<${tag} class="${listClass} pl-5 mb-3 space-y-1">${body}</${tag}>\n`
  }
  
  renderer.listitem = function(this: Renderer, text: string): string {
    return `<li>${text}</li>\n`
  }
  
  renderer.code = function(this: Renderer, code: string, language: string | undefined): string {
    const escaped = code.replace(/</g, '&lt;').replace(/>/g, '&gt;')
    return `<pre class="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg overflow-x-auto mb-3 text-sm font-mono"><code class="language-${language || ''}">${escaped}</code></pre>\n`
  }
  
  renderer.codespan = function(this: Renderer, text: string): string {
    return `<code class="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm font-mono">${text}</code>`
  }
  
  renderer.blockquote = function(this: Renderer, quote: string): string {
    return `<blockquote class="border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic text-gray-600 dark:text-gray-400 my-3">${quote}</blockquote>\n`
  }
  
  renderer.hr = function(this: Renderer): string {
    return `<hr class="my-6 border-t border-gray-200 dark:border-gray-700" />\n`
  }
  
  renderer.link = function(this: Renderer, href: string, _title: string | null, text: string): string {
    return `<a href="${href}" class="text-blue-600 dark:text-blue-400 underline">${text}</a>`
  }
  
  renderer.image = function(this: Renderer, href: string, _title: string | null, text: string): string {
    return `<img src="${href}" alt="${text}" class="rounded-lg max-w-full my-3" />`
  }
  
  renderer.strong = function(this: Renderer, text: string): string {
    return `<strong class="font-semibold">${text}</strong>`
  }
  
  renderer.em = function(this: Renderer, text: string): string {
    return `<em class="italic">${text}</em>`
  }
  
  renderer.table = function(this: Renderer, header: string, body: string): string {
    return `<table class="w-full border-collapse mb-3"><thead>${header}</thead><tbody>${body}</tbody></table>\n`
  }
  
  renderer.tablerow = function(this: Renderer, content: string): string {
    return `<tr>${content}</tr>\n`
  }
  
  renderer.tablecell = function(this: Renderer, content: string, flags: { header: boolean; align: string | null }): string {
    const tag = flags.header ? 'th' : 'td'
    const headerClass = flags.header ? ' font-semibold bg-gray-50 dark:bg-gray-800' : ''
    const alignClass = flags.align ? ` text-${flags.align}` : ' text-left'
    return `<${tag} class="border border-gray-200 dark:border-gray-700 px-3 py-2${alignClass}${headerClass}">${content}</${tag}>`
  }
  
  return renderer
}

// Create a single instance of the styled renderer
const styledRenderer = createStyledRenderer()

/**
 * Convert markdown to HTML with inline Tailwind classes.
 * Use this for rendering in contexts where autoblogger.css isn't loaded.
 */
export function markdownToStyledHtml(markdown: string): string {
  return marked.parse(markdown, { 
    gfm: true, 
    breaks: true,
    renderer: styledRenderer,
  }) as string
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

// Add strikethrough support (GFM extension)
turndownService.addRule('strikethrough', {
  filter: (node: HTMLElement) => {
    const tagName = node.nodeName.toLowerCase()
    return tagName === 'del' || tagName === 's' || tagName === 'strike'
  },
  replacement: (content) => `~~${content}~~`
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
