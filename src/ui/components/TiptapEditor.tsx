'use client'

import { useEffect, useMemo, useCallback } from 'react'
import { useEditor, EditorContent, Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import { renderMarkdown, htmlToMarkdown } from '../../lib/markdown'
import { CommentMark } from '../../lib/comment-mark'

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

const DEFAULT_PROSE_CLASSES = 'prose prose-gray dark:prose-invert max-w-none'

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
  // Convert initial content to HTML once
  const initialHtml = useMemo(() => content ? renderMarkdown(content) : '', [content])

  // Memoize extensions
  const extensions = useMemo(() => [
    StarterKit.configure({
      heading: {
        levels: [1, 2, 3],
      },
    }),
    Placeholder.configure({
      placeholder,
    }),
    Link.configure({
      openOnClick: false,
      HTMLAttributes: {
        class: 'text-blue-600 dark:text-blue-400 underline',
      },
    }),
    Image.configure({
      HTMLAttributes: {
        class: 'rounded-lg max-w-full',
      },
    }),
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
