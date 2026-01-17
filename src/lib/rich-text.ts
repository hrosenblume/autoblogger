/**
 * Rich text conversion utilities for CMS adapters.
 * Converts markdown to Prismic, Contentful, and Sanity rich text formats.
 */

import { marked, type Token, type Tokens } from 'marked'

// =============================================================================
// Prismic Rich Text
// =============================================================================

export interface PrismicSpan {
  type: 'strong' | 'em' | 'hyperlink'
  start: number
  end: number
  data?: { url: string }
}

export interface PrismicRichTextNode {
  type: string
  text?: string
  spans?: PrismicSpan[]
  items?: PrismicRichTextNode[]
  alt?: string
  url?: string
  dimensions?: { width: number; height: number }
}

/**
 * Convert markdown to Prismic rich text format.
 * @see https://prismic.io/docs/rich-text
 */
export function markdownToPrismicRichText(markdown: string): PrismicRichTextNode[] {
  const tokens = marked.lexer(markdown)
  const result: PrismicRichTextNode[] = []

  function processInlineTokens(tokens: Token[]): { text: string; spans: PrismicSpan[] } {
    let text = ''
    const spans: PrismicSpan[] = []

    for (const token of tokens) {
      if (token.type === 'text') {
        text += token.text
      } else if (token.type === 'strong') {
        const start = text.length
        const inner = processInlineTokens(token.tokens || [])
        text += inner.text
        spans.push({ type: 'strong', start, end: text.length })
        spans.push(...inner.spans.map((s) => ({ ...s, start: s.start + start, end: s.end + start })))
      } else if (token.type === 'em') {
        const start = text.length
        const inner = processInlineTokens(token.tokens || [])
        text += inner.text
        spans.push({ type: 'em', start, end: text.length })
        spans.push(...inner.spans.map((s) => ({ ...s, start: s.start + start, end: s.end + start })))
      } else if (token.type === 'link') {
        const start = text.length
        const inner = processInlineTokens(token.tokens || [])
        text += inner.text
        spans.push({ type: 'hyperlink', start, end: text.length, data: { url: token.href } })
        spans.push(...inner.spans.map((s) => ({ ...s, start: s.start + start, end: s.end + start })))
      } else if (token.type === 'codespan') {
        text += token.text
      } else if (token.type === 'br') {
        text += '\n'
      }
    }

    return { text, spans }
  }

  for (const token of tokens) {
    if (token.type === 'heading') {
      const { text, spans } = processInlineTokens(token.tokens || [])
      result.push({
        type: `heading${token.depth}`,
        text,
        spans,
      })
    } else if (token.type === 'paragraph') {
      const { text, spans } = processInlineTokens(token.tokens || [])
      result.push({
        type: 'paragraph',
        text,
        spans,
      })
    } else if (token.type === 'list') {
      const listType = token.ordered ? 'o-list-item' : 'list-item'
      for (const item of token.items) {
        const { text, spans } = processInlineTokens(item.tokens || [])
        result.push({
          type: listType,
          text,
          spans,
        })
      }
    } else if (token.type === 'blockquote') {
      // Flatten blockquote content
      for (const child of token.tokens || []) {
        if (child.type === 'paragraph') {
          const { text, spans } = processInlineTokens((child as Tokens.Paragraph).tokens || [])
          result.push({
            type: 'preformatted',
            text,
            spans,
          })
        }
      }
    } else if (token.type === 'code') {
      result.push({
        type: 'preformatted',
        text: token.text,
        spans: [],
      })
    } else if (token.type === 'image') {
      result.push({
        type: 'image',
        url: token.href,
        alt: token.text || '',
      })
    } else if (token.type === 'hr') {
      // Prismic doesn't have a native HR, skip or add empty paragraph
    }
  }

  return result
}

// =============================================================================
// Contentful Rich Text
// =============================================================================

export interface ContentfulNode {
  nodeType: string
  content?: ContentfulNode[]
  value?: string
  data?: Record<string, unknown>
  marks?: Array<{ type: string }>
}

export interface ContentfulDocument {
  nodeType: 'document'
  data: Record<string, unknown>
  content: ContentfulNode[]
}

/**
 * Convert markdown to Contentful rich text format.
 * @see https://www.contentful.com/developers/docs/concepts/rich-text/
 */
export function markdownToContentfulRichText(markdown: string): ContentfulDocument {
  const tokens = marked.lexer(markdown)
  const content: ContentfulNode[] = []

  function processInlineTokens(tokens: Token[]): ContentfulNode[] {
    const nodes: ContentfulNode[] = []

    for (const token of tokens) {
      if (token.type === 'text') {
        nodes.push({
          nodeType: 'text',
          value: token.text,
          marks: [],
          data: {},
        })
      } else if (token.type === 'strong') {
        const inner = processInlineTokens(token.tokens || [])
        for (const node of inner) {
          if (node.nodeType === 'text') {
            node.marks = [...(node.marks || []), { type: 'bold' }]
          }
          nodes.push(node)
        }
      } else if (token.type === 'em') {
        const inner = processInlineTokens(token.tokens || [])
        for (const node of inner) {
          if (node.nodeType === 'text') {
            node.marks = [...(node.marks || []), { type: 'italic' }]
          }
          nodes.push(node)
        }
      } else if (token.type === 'link') {
        nodes.push({
          nodeType: 'hyperlink',
          content: processInlineTokens(token.tokens || []),
          data: { uri: token.href },
        })
      } else if (token.type === 'codespan') {
        nodes.push({
          nodeType: 'text',
          value: token.text,
          marks: [{ type: 'code' }],
          data: {},
        })
      } else if (token.type === 'br') {
        nodes.push({
          nodeType: 'text',
          value: '\n',
          marks: [],
          data: {},
        })
      }
    }

    return nodes
  }

  for (const token of tokens) {
    if (token.type === 'heading') {
      content.push({
        nodeType: `heading-${token.depth}`,
        content: processInlineTokens(token.tokens || []),
        data: {},
      })
    } else if (token.type === 'paragraph') {
      content.push({
        nodeType: 'paragraph',
        content: processInlineTokens(token.tokens || []),
        data: {},
      })
    } else if (token.type === 'list') {
      const listType = token.ordered ? 'ordered-list' : 'unordered-list'
      content.push({
        nodeType: listType,
        content: token.items.map((item: Tokens.ListItem) => ({
          nodeType: 'list-item',
          content: [
            {
              nodeType: 'paragraph',
              content: processInlineTokens(item.tokens || []),
              data: {},
            },
          ],
          data: {},
        })),
        data: {},
      })
    } else if (token.type === 'blockquote') {
      content.push({
        nodeType: 'blockquote',
        content: (token.tokens || [])
          .filter((t): t is Tokens.Paragraph => t.type === 'paragraph')
          .map((t) => ({
            nodeType: 'paragraph',
            content: processInlineTokens(t.tokens || []),
            data: {},
          })),
        data: {},
      })
    } else if (token.type === 'code') {
      // Contentful doesn't have a native code block, use paragraph with code marks
      content.push({
        nodeType: 'paragraph',
        content: [
          {
            nodeType: 'text',
            value: token.text,
            marks: [{ type: 'code' }],
            data: {},
          },
        ],
        data: {},
      })
    } else if (token.type === 'hr') {
      content.push({
        nodeType: 'hr',
        content: [],
        data: {},
      })
    }
    // Note: Contentful images require asset references, not inline URLs
  }

  return {
    nodeType: 'document',
    data: {},
    content,
  }
}

// =============================================================================
// Sanity Portable Text
// =============================================================================

export interface PortableTextSpan {
  _type: 'span'
  _key: string
  text: string
  marks?: string[]
}

export interface PortableTextBlock {
  _type: 'block'
  _key: string
  style: string
  markDefs?: Array<{ _type: string; _key: string; href?: string }>
  children: PortableTextSpan[]
  listItem?: 'bullet' | 'number'
  level?: number
}

export type PortableTextNode = PortableTextBlock | { _type: 'image'; _key: string; asset: { url: string }; alt?: string }

let keyCounter = 0
function generateKey(): string {
  return `k${++keyCounter}`
}

/**
 * Convert markdown to Sanity Portable Text format.
 * @see https://www.sanity.io/docs/block-content
 */
export function markdownToPortableText(markdown: string): PortableTextNode[] {
  keyCounter = 0 // Reset for consistent output
  const tokens = marked.lexer(markdown)
  const result: PortableTextNode[] = []

  function processInlineTokens(
    tokens: Token[],
    markDefs: PortableTextBlock['markDefs']
  ): PortableTextSpan[] {
    const spans: PortableTextSpan[] = []

    for (const token of tokens) {
      if (token.type === 'text') {
        spans.push({
          _type: 'span',
          _key: generateKey(),
          text: token.text,
          marks: [],
        })
      } else if (token.type === 'strong') {
        const inner = processInlineTokens(token.tokens || [], markDefs)
        for (const span of inner) {
          span.marks = [...(span.marks || []), 'strong']
        }
        spans.push(...inner)
      } else if (token.type === 'em') {
        const inner = processInlineTokens(token.tokens || [], markDefs)
        for (const span of inner) {
          span.marks = [...(span.marks || []), 'em']
        }
        spans.push(...inner)
      } else if (token.type === 'link') {
        const linkKey = generateKey()
        markDefs?.push({ _type: 'link', _key: linkKey, href: token.href })
        const inner = processInlineTokens(token.tokens || [], markDefs)
        for (const span of inner) {
          span.marks = [...(span.marks || []), linkKey]
        }
        spans.push(...inner)
      } else if (token.type === 'codespan') {
        spans.push({
          _type: 'span',
          _key: generateKey(),
          text: token.text,
          marks: ['code'],
        })
      } else if (token.type === 'br') {
        spans.push({
          _type: 'span',
          _key: generateKey(),
          text: '\n',
          marks: [],
        })
      }
    }

    return spans
  }

  function getStyle(token: Token): string {
    if (token.type === 'heading') {
      return `h${token.depth}`
    }
    if (token.type === 'blockquote') {
      return 'blockquote'
    }
    return 'normal'
  }

  for (const token of tokens) {
    if (token.type === 'heading' || token.type === 'paragraph') {
      const markDefs: PortableTextBlock['markDefs'] = []
      const children = processInlineTokens(token.tokens || [], markDefs)
      result.push({
        _type: 'block',
        _key: generateKey(),
        style: getStyle(token),
        markDefs,
        children: children.length ? children : [{ _type: 'span', _key: generateKey(), text: '', marks: [] }],
      })
    } else if (token.type === 'list') {
      const listItem = token.ordered ? 'number' : 'bullet'
      for (const item of token.items) {
        const markDefs: PortableTextBlock['markDefs'] = []
        const children = processInlineTokens(item.tokens || [], markDefs)
        result.push({
          _type: 'block',
          _key: generateKey(),
          style: 'normal',
          listItem,
          level: 1,
          markDefs,
          children: children.length ? children : [{ _type: 'span', _key: generateKey(), text: '', marks: [] }],
        })
      }
    } else if (token.type === 'blockquote') {
      for (const child of token.tokens || []) {
        if (child.type === 'paragraph') {
          const markDefs: PortableTextBlock['markDefs'] = []
          const children = processInlineTokens((child as Tokens.Paragraph).tokens || [], markDefs)
          result.push({
            _type: 'block',
            _key: generateKey(),
            style: 'blockquote',
            markDefs,
            children: children.length ? children : [{ _type: 'span', _key: generateKey(), text: '', marks: [] }],
          })
        }
      }
    } else if (token.type === 'code') {
      result.push({
        _type: 'block',
        _key: generateKey(),
        style: 'normal',
        markDefs: [],
        children: [
          {
            _type: 'span',
            _key: generateKey(),
            text: token.text,
            marks: ['code'],
          },
        ],
      })
    } else if (token.type === 'image') {
      result.push({
        _type: 'image',
        _key: generateKey(),
        asset: { url: token.href },
        alt: token.text || undefined,
      })
    }
  }

  return result
}
