'use client'

import { useEffect, useMemo } from 'react'
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
      // Disable extensions we're replacing with styled versions
      heading: false,
      paragraph: false,
      bulletList: false,
      orderedList: false,
      listItem: false,
      code: false,
      codeBlock: false,
      blockquote: false,
      horizontalRule: false,
    }),
    // Styled heading with per-level classes
    StyledHeading.configure({ levels: [1, 2, 3] }),
    // Paragraph
    Paragraph.configure({
      HTMLAttributes: { class: 'mb-4 leading-relaxed' },
    }),
    // Lists
    BulletList.configure({
      HTMLAttributes: { class: 'list-disc pl-6 mb-4' },
    }),
    OrderedList.configure({
      HTMLAttributes: { class: 'list-decimal pl-6 mb-4' },
    }),
    ListItem.configure({
      HTMLAttributes: { class: 'mb-2' },
    }),
    // Inline code
    Code.configure({
      HTMLAttributes: { class: 'bg-gray-100 ab-dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm font-mono' },
    }),
    // Code block
    CodeBlock.configure({
      HTMLAttributes: { class: 'bg-gray-100 ab-dark:bg-gray-800 p-4 rounded-lg overflow-x-auto mb-4 text-sm font-mono' },
    }),
    // Blockquote
    Blockquote.configure({
      HTMLAttributes: { class: 'border-l-4 border-gray-300 ab-dark:border-gray-600 pl-4 italic text-gray-600 ab-dark:text-gray-400 my-4' },
    }),
    // Horizontal rule
    HorizontalRule.configure({
      HTMLAttributes: { class: 'my-8 border-t border-gray-200 ab-dark:border-gray-700' },
    }),
    // Placeholder
    Placeholder.configure({
      placeholder,
    }),
    // Link (already styled)
    Link.configure({
      openOnClick: false,
      HTMLAttributes: {
        class: 'text-blue-600 ab-dark:text-blue-400 underline',
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

  return <EditorContent editor={editor} />
}
