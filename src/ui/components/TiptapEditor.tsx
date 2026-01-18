'use client'

import { useEffect, useMemo, useRef, useCallback } from 'react'
import { useEditor, EditorContent, Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Heading from '@tiptap/extension-heading'
import Paragraph from '@tiptap/extension-paragraph'
import BulletList from '@tiptap/extension-bullet-list'
import OrderedList from '@tiptap/extension-ordered-list'
import ListItem from '@tiptap/extension-list-item'
import Code from '@tiptap/extension-code'
import CodeBlock from '@tiptap/extension-code-block'
import Blockquote from '@tiptap/extension-blockquote'
import HorizontalRule from '@tiptap/extension-horizontal-rule'
import Placeholder from '@tiptap/extension-placeholder'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Strike from '@tiptap/extension-strike'
import Underline from '@tiptap/extension-underline'
import { renderMarkdown, htmlToMarkdown } from '../../lib/markdown'
import { CommentMark } from '../../lib/comment-mark'

// Inject placeholder CSS once (pseudo-elements can't use inline styles)
const PLACEHOLDER_STYLE_ID = 'tiptap-placeholder-css'
function injectPlaceholderStyles() {
  if (typeof document === 'undefined') return
  if (document.getElementById(PLACEHOLDER_STYLE_ID)) return
  const style = document.createElement('style')
  style.id = PLACEHOLDER_STYLE_ID
  style.textContent = `
    .ProseMirror p.is-editor-empty:first-child::before {
      content: attr(data-placeholder);
      color: #9ca3af;
      pointer-events: none;
      float: left;
      height: 0;
    }
    .dark .ProseMirror p.is-editor-empty:first-child::before {
      color: #6b7280;
    }
  `
  document.head.appendChild(style)
}

export interface SelectionState {
  hasSelection: boolean
  text: string
  from: number
  to: number
  hasExistingComment: boolean
}

interface TiptapEditorProps {
  content: string // markdown
  onChange: (markdown: string) => void
  placeholder?: string
  autoFocus?: boolean
  onEditorReady?: (editor: Editor) => void
  onSelectionChange?: (selection: SelectionState | null) => void
  onCommentClick?: (commentId: string) => void
  proseClasses?: string
}

const DEFAULT_PROSE_CLASSES = 'prose'

// Custom Heading extension with per-level Tailwind classes
const StyledHeading = Heading.extend({
  renderHTML({ node, HTMLAttributes }) {
    const level = node.attrs.level as 1 | 2 | 3
    const classes: Record<number, string> = {
      1: 'text-[22px] leading-tight font-bold mb-6',
      2: 'text-lg leading-snug font-bold mt-8 mb-4',
      3: 'text-base leading-snug font-bold mt-6 mb-3',
    }
    return [`h${level}`, { ...HTMLAttributes, class: classes[level] || '' }, 0]
  },
})

// Custom Strike extension with Cmd+Shift+X shortcut (standard in Google Docs, Word, etc.)
const CustomStrike = Strike.extend({
  addKeyboardShortcuts() {
    return {
      'Mod-Shift-x': () => this.editor.commands.toggleStrike(),
      'Mod-Shift-X': () => this.editor.commands.toggleStrike(),
    }
  },
})

// Custom BulletList with Cmd+Shift+8 shortcut (Google Docs standard)
const CustomBulletList = BulletList.extend({
  addKeyboardShortcuts() {
    return {
      'Mod-Shift-8': () => this.editor.commands.toggleBulletList(),
    }
  },
})

// Custom OrderedList with Cmd+Shift+7 shortcut (Google Docs standard)
const CustomOrderedList = OrderedList.extend({
  addKeyboardShortcuts() {
    return {
      'Mod-Shift-7': () => this.editor.commands.toggleOrderedList(),
    }
  },
})

// Custom Code with Cmd+E shortcut (Gmail, Slack, Notion standard)
const CustomCode = Code.extend({
  addKeyboardShortcuts() {
    return {
      'Mod-e': () => this.editor.commands.toggleCode(),
      'Mod-E': () => this.editor.commands.toggleCode(),
    }
  },
})

// Custom Blockquote with Cmd+Shift+B shortcut
const CustomBlockquote = Blockquote.extend({
  addKeyboardShortcuts() {
    return {
      'Mod-Shift-b': () => this.editor.commands.toggleBlockquote(),
      'Mod-Shift-B': () => this.editor.commands.toggleBlockquote(),
    }
  },
})

// Custom CodeBlock with Cmd+Shift+C shortcut
const CustomCodeBlock = CodeBlock.extend({
  addKeyboardShortcuts() {
    return {
      'Mod-Alt-c': () => this.editor.commands.toggleCodeBlock(),
      'Mod-Alt-C': () => this.editor.commands.toggleCodeBlock(),
    }
  },
})

export function TiptapEditor({ 
  content, 
  onChange, 
  placeholder = 'Start writing...',
  autoFocus = false,
  onEditorReady,
  onSelectionChange,
  onCommentClick,
  proseClasses = DEFAULT_PROSE_CLASSES,
}: TiptapEditorProps) {
  // Inject placeholder styles on mount
  useEffect(() => {
    injectPlaceholderStyles()
  }, [])

  // Convert initial content to HTML once
  const initialHtml = useMemo(() => content ? renderMarkdown(content) : '', [content])

  // Memoize extensions with inline Tailwind styles (no external CSS needed)
  const extensions = useMemo(() => [
    StarterKit.configure({
      // Disable extensions we're replacing with styled or custom versions
      heading: false,
      paragraph: false,
      bulletList: false,
      orderedList: false,
      listItem: false,
      code: false,
      codeBlock: false,
      blockquote: false,
      horizontalRule: false,
      strike: false, // Using custom Strike with Cmd+Shift+X shortcut
    }),
    // Styled heading with per-level classes
    StyledHeading.configure({ levels: [1, 2, 3] }),
    // Paragraph
    Paragraph.configure({
      HTMLAttributes: { class: 'mb-4 leading-relaxed' },
    }),
    // Lists with custom keyboard shortcuts (Cmd+Shift+8 for bullet, Cmd+Shift+7 for ordered)
    CustomBulletList.configure({
      HTMLAttributes: { class: 'list-disc pl-6 mb-4' },
    }),
    CustomOrderedList.configure({
      HTMLAttributes: { class: 'list-decimal pl-6 mb-4' },
    }),
    ListItem.configure({
      HTMLAttributes: { class: 'mb-2' },
    }),
    // Inline code with Cmd+E shortcut
    CustomCode.configure({
      HTMLAttributes: { class: 'bg-ab-neutral-subtle px-1.5 py-0.5 rounded text-sm font-mono' },
    }),
    // Code block with Cmd+Alt+C shortcut
    CustomCodeBlock.configure({
      HTMLAttributes: { class: 'bg-ab-neutral-subtle p-4 rounded-lg overflow-x-auto mb-4 text-sm font-mono' },
    }),
    // Blockquote with Cmd+Shift+B shortcut
    CustomBlockquote.configure({
      HTMLAttributes: { class: 'border-l-4 border-ab-neutral-border pl-4 italic text-ab-neutral-strong my-4' },
    }),
    // Horizontal rule
    HorizontalRule.configure({
      HTMLAttributes: { class: 'my-8 border-t border-ab-neutral-border' },
    }),
    // Strike with Cmd+Shift+X shortcut (Google Docs/Word standard)
    CustomStrike,
    // Underline with Cmd+U shortcut
    Underline,
    // Placeholder
    Placeholder.configure({
      placeholder,
    }),
    // Link (already styled) - Cmd+K is built-in
    Link.configure({
      openOnClick: false,
      HTMLAttributes: {
        class: 'text-ab-active underline',
      },
    }),
    // Image (already styled)
    Image.configure({
      HTMLAttributes: {
        class: 'rounded-lg max-w-full my-4',
      },
    }),
    // Comments
    CommentMark.configure({
      onCommentClick,
    }),
  ], [placeholder, onCommentClick])

  const editor = useEditor({
    immediatelyRender: false, // Prevent SSR hydration mismatch
    extensions,
    content: initialHtml,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      const markdown = htmlToMarkdown(html)
      onChange(markdown)
    },
    onSelectionUpdate: ({ editor }) => {
      if (!onSelectionChange) return
      
      const { from, to, empty } = editor.state.selection
      if (empty) {
        onSelectionChange(null)
      } else {
        const text = editor.state.doc.textBetween(from, to, ' ')
        
        // Check if selection contains any comment marks
        let hasExistingComment = false
        editor.state.doc.nodesBetween(from, to, (node) => {
          if (node.marks.some(mark => mark.type.name === 'comment')) {
            hasExistingComment = true
            return false // stop iteration
          }
        })
        
        onSelectionChange({
          hasSelection: true,
          text,
          from,
          to,
          hasExistingComment,
        })
      }
    },
    editorProps: {
      attributes: {
        class: `${proseClasses} min-h-[500px] outline-none`,
      },
      // Handle Tab key for list indentation
      handleKeyDown: (view, event) => {
        if (event.key === 'Tab') {
          // Let TipTap handle Tab for list indentation
          // This prevents Tab from navigating to other elements
          const { state, dispatch } = view
          const { $from } = state.selection
          
          // Check if we're in a list item
          const listItem = $from.node(-1)
          if (listItem && listItem.type.name === 'listItem') {
            // Prevent default tab behavior (focus change)
            event.preventDefault()
            return false // Let TipTap's default list handling take over
          }
        }
        return false
      },
    },
  })

  // Notify parent when editor is ready and auto-focus if requested
  useEffect(() => {
    if (editor) {
      if (onEditorReady) {
        onEditorReady(editor)
      }
      if (autoFocus) {
        // Small delay to ensure DOM is ready
        setTimeout(() => editor.commands.focus(), 0)
      }
    }
  }, [editor, onEditorReady, autoFocus])

  // Sync external content changes (e.g., loading saved post)
  useEffect(() => {
    if (editor && content !== undefined) {
      const currentMarkdown = htmlToMarkdown(editor.getHTML())
      // Only update if content is actually different to avoid cursor jumping
      if (currentMarkdown !== content) {
        const html = content ? renderMarkdown(content) : ''
        editor.commands.setContent(html, { emitUpdate: false })
      }
    }
  }, [editor, content])

  // Mobile selection preservation: save selection on touchstart before scroll can clear it
  const savedSelectionRef = useRef<{ from: number; to: number } | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleTouchStart = useCallback(() => {
    if (!editor) return
    const { from, to, empty } = editor.state.selection
    if (!empty) {
      // Save non-empty selections before scroll might clear them
      savedSelectionRef.current = { from, to }
    }
  }, [editor])

  const handleTouchEnd = useCallback(() => {
    if (!editor || !savedSelectionRef.current) return
    
    // Check if selection was lost (became empty/collapsed)
    const { empty } = editor.state.selection
    if (empty && savedSelectionRef.current) {
      const { from, to } = savedSelectionRef.current
      // Restore the selection after a brief delay to let scroll settle
      requestAnimationFrame(() => {
        if (editor && !editor.isDestroyed) {
          try {
            // Only restore if the positions are still valid
            const docSize = editor.state.doc.content.size
            if (from <= docSize && to <= docSize) {
              editor.commands.setTextSelection({ from, to })
            }
          } catch {
            // Selection positions may be invalid after content changes
          }
        }
      })
    }
    // Clear saved selection after touch ends
    savedSelectionRef.current = null
  }, [editor])

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <EditorContent editor={editor} />
    </div>
  )
}
