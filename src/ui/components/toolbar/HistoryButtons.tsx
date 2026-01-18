'use client'

import { useCallback } from 'react'
import type { Editor } from '@tiptap/react'
import type { RefObject } from 'react'
import { Undo2, Redo2, FileCode2 } from 'lucide-react'
import { ToolbarButton, Divider, SkeletonButton, toolbarButtonStyles } from './ToolbarButton'
import { RevisionHistoryDropdown } from '../RevisionHistoryDropdown'
import type { RevisionState } from '../../../lib/editor-types'

interface HistoryButtonsProps {
  editor?: Editor | null
  textareaRef?: RefObject<HTMLTextAreaElement | null>
  showMarkdown?: boolean
  setShowMarkdown?: (show: boolean) => void
  postSlug?: string
  revisions?: RevisionState
  aiGenerating?: boolean
  loading?: boolean
}

export function HistoryButtons({
  editor: editorProp,
  textareaRef,
  showMarkdown,
  setShowMarkdown,
  postSlug,
  revisions,
  aiGenerating,
  loading,
}: HistoryButtonsProps) {
  // Cast editor to any to support StarterKit commands
  const editor = editorProp as any
  
  const handleUndo = useCallback(() => {
    if (editor) {
      editor.chain().focus().undo().run()
    } else if (textareaRef?.current) {
      textareaRef.current.focus()
      document.execCommand('undo')
    }
  }, [editor, textareaRef])

  const handleRedo = useCallback(() => {
    if (editor) {
      editor.chain().focus().redo().run()
    } else if (textareaRef?.current) {
      textareaRef.current.focus()
      document.execCommand('redo')
    }
  }, [editor, textareaRef])

  // Skeleton state - render placeholders matching actual button layout
  if (loading) {
    return (
      <>
        {/* Undo, Redo */}
        <SkeletonButton />
        <SkeletonButton />
        {/* MD toggle */}
        <Divider />
        <SkeletonButton />
        {/* Revision dropdown */}
        <Divider />
        <SkeletonButton />
      </>
    )
  }

  return (
    <>
      {/* Undo/Redo */}
      <ToolbarButton
        onClick={handleUndo}
        disabled={aiGenerating || (editor ? !editor.can().undo() : false)}
        title="Undo (⌘Z)"
      >
        <Undo2 className={toolbarButtonStyles.iconSize} />
      </ToolbarButton>
      <ToolbarButton
        onClick={handleRedo}
        disabled={aiGenerating || (editor ? !editor.can().redo() : false)}
        title="Redo (⌘⇧Z)"
      >
        <Redo2 className={toolbarButtonStyles.iconSize} />
      </ToolbarButton>

      {/* Markdown/Rich Text mode toggle */}
      {setShowMarkdown && (
        <>
          <Divider />
          <ToolbarButton
            onClick={() => setShowMarkdown(!showMarkdown)}
            active={showMarkdown}
            disabled={aiGenerating}
            title={showMarkdown ? 'Switch to rich text editor' : 'Switch to markdown mode'}
          >
            <FileCode2 className={toolbarButtonStyles.iconSize} />
          </ToolbarButton>
        </>
      )}

      {/* Revision History */}
      {revisions && (
        <>
          <Divider />
          <RevisionHistoryDropdown
            revisions={revisions.list}
            loading={revisions.loading}
            previewLoading={revisions.previewLoading}
            disabled={aiGenerating || !postSlug}
            isPreviewMode={!!revisions.previewing}
            onOpen={revisions.fetch}
            onSelect={revisions.preview}
          />
        </>
      )}
    </>
  )
}
