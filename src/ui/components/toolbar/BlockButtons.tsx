'use client'

import type { Editor } from '@tiptap/react'
import type { RefObject } from 'react'
import { List, ListOrdered, Quote, Code2, Minus } from 'lucide-react'
import { ToolbarButton, SkeletonButton } from './ToolbarButton'
import { insertBlockAtCursor, insertAtCursor } from '../../../lib/markdown-helpers'

interface BlockButtonsProps {
  editor?: Editor | null
  textareaRef?: RefObject<HTMLTextAreaElement | null>
  markdown?: string
  onMarkdownChange?: (markdown: string) => void
  aiGenerating?: boolean
  loading?: boolean
}

export function BlockButtons({ editor: editorProp, textareaRef, markdown, onMarkdownChange, aiGenerating, loading }: BlockButtonsProps) {
  // Cast editor to any to support StarterKit commands
  const editor = editorProp as any
  // Skeleton state - render placeholders matching actual button layout
  if (loading) {
    return (
      <>
        {/* Bullet list, Numbered list */}
        <SkeletonButton />
        <SkeletonButton />
        {/* Blockquote, Code block, Horizontal rule */}
        <SkeletonButton />
        <SkeletonButton />
        <SkeletonButton />
      </>
    )
  }
  const isMarkdownMode = !editor && textareaRef && markdown !== undefined && onMarkdownChange

  const insertBlock = (prefix: string) => {
    if (textareaRef?.current && markdown !== undefined && onMarkdownChange) {
      insertBlockAtCursor(textareaRef.current, prefix, markdown, onMarkdownChange)
    }
  }

  const wrapSelection = (before: string, after: string) => {
    if (editor) return
    if (textareaRef?.current && markdown !== undefined && onMarkdownChange) {
      insertAtCursor(textareaRef.current, before, after, markdown, onMarkdownChange)
    }
  }

  const handleHorizontalRule = () => {
    if (editor) {
      editor.chain().focus().setHorizontalRule().run()
    } else if (isMarkdownMode && textareaRef?.current) {
      const textarea = textareaRef.current
      const start = textarea.selectionStart
      const newText = markdown!.substring(0, start) + '\n---\n' + markdown!.substring(start)
      onMarkdownChange!(newText)
      requestAnimationFrame(() => textarea.focus())
    }
  }

  return (
    <>
      {/* Lists */}
      <ToolbarButton
        onClick={() => editor ? editor.chain().focus().toggleBulletList().run() : insertBlock('- ')}
        active={editor?.isActive('bulletList')}
        disabled={aiGenerating}
        title="Bullet list"
      >
        <List className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor ? editor.chain().focus().toggleOrderedList().run() : insertBlock('1. ')}
        active={editor?.isActive('orderedList')}
        disabled={aiGenerating}
        title="Numbered list"
      >
        <ListOrdered className="w-4 h-4" />
      </ToolbarButton>

      {/* Block elements */}
      <ToolbarButton
        onClick={() => editor ? editor.chain().focus().toggleBlockquote().run() : insertBlock('> ')}
        active={editor?.isActive('blockquote')}
        disabled={aiGenerating}
        title="Blockquote"
      >
        <Quote className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor ? editor.chain().focus().toggleCodeBlock().run() : wrapSelection('```\n', '\n```')}
        active={editor?.isActive('codeBlock')}
        disabled={aiGenerating}
        title="Code block"
      >
        <Code2 className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton onClick={handleHorizontalRule} disabled={aiGenerating} title="Horizontal rule">
        <Minus className="w-4 h-4" />
      </ToolbarButton>
    </>
  )
}
