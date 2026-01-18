'use client'

import type { RefObject } from 'react'
import type { Editor } from '@tiptap/react'
import { MessageSquarePlus, MessageSquare } from 'lucide-react'
import { ToolbarButton, Divider, SkeletonButton, toolbarButtonStyles } from './toolbar/ToolbarButton'
import { FormatButtons } from './toolbar/FormatButtons'
import { BlockButtons } from './toolbar/BlockButtons'
import { MediaButtons } from './toolbar/MediaButtons'
import { HistoryButtons } from './toolbar/HistoryButtons'
import type { RevisionState } from '../../lib/editor-types'

interface EditorToolbarProps {
  editor?: Editor | null
  // For markdown mode
  textareaRef?: RefObject<HTMLTextAreaElement | null>
  markdown?: string
  onMarkdownChange?: (markdown: string) => void
  // Mode toggle
  showMarkdown?: boolean
  setShowMarkdown?: (show: boolean) => void
  // Revision history
  postSlug?: string
  revisions?: RevisionState
  // AI generation state (disables all toolbar buttons during generation)
  aiGenerating?: boolean
  // Comments
  hasSelection?: boolean
  selectionHasComment?: boolean
  onAddComment?: () => void
  commentsCount?: number
  onViewComments?: () => void
  // Loading state
  loading?: boolean
  // API base path
  apiBasePath?: string
}

export function EditorToolbar({
  editor,
  textareaRef,
  markdown,
  onMarkdownChange,
  showMarkdown,
  setShowMarkdown,
  postSlug,
  revisions,
  aiGenerating,
  hasSelection,
  selectionHasComment,
  onAddComment,
  commentsCount,
  onViewComments,
  loading = false,
  apiBasePath = '/api/cms',
}: EditorToolbarProps) {
  // Toolbar is fixed below the navbar with iOS visual viewport transform
  // This keeps it visible during iOS selection handle dragging
  const toolbarClasses = "fixed left-0 right-0 z-40 flex items-center justify-start lg:justify-center gap-0.5 px-4 py-2 border-b border-border bg-background overflow-x-auto"
  
  // Navbar height: py-4 (32px) + h-10 (40px) + border (1px) = 73px
  const toolbarStyle = {
    top: '73px',
    transform: 'translate3d(0, var(--vv-top, 0px), 0)',
    willChange: 'transform' as const,
    backfaceVisibility: 'hidden' as const,
  }

  if (loading) {
    return (
      <div className={toolbarClasses} style={toolbarStyle}>
        <FormatButtons loading={true} />
        <Divider />
        <BlockButtons loading={true} />
        <Divider />
        <MediaButtons loading={true} />
        <Divider />
        <HistoryButtons loading={true} />
        {/* Comment buttons skeleton */}
        <Divider />
        <SkeletonButton />
        <SkeletonButton />
      </div>
    )
  }

  return (
    <div className={toolbarClasses} style={toolbarStyle}>
      <FormatButtons
        editor={editor}
        textareaRef={textareaRef}
        markdown={markdown}
        onMarkdownChange={onMarkdownChange}
        aiGenerating={aiGenerating}
        apiBasePath={apiBasePath}
      />

      <Divider />

      <BlockButtons
        editor={editor}
        textareaRef={textareaRef}
        markdown={markdown}
        onMarkdownChange={onMarkdownChange}
        aiGenerating={aiGenerating}
      />

      <Divider />

      <MediaButtons
        editor={editor}
        textareaRef={textareaRef}
        markdown={markdown}
        onMarkdownChange={onMarkdownChange}
        aiGenerating={aiGenerating}
        apiBasePath={apiBasePath}
      />

      <Divider />

      <HistoryButtons
        editor={editor}
        textareaRef={textareaRef}
        showMarkdown={showMarkdown}
        setShowMarkdown={setShowMarkdown}
        postSlug={postSlug}
        revisions={revisions}
        aiGenerating={aiGenerating}
      />

      {/* Comments - always visible */}
      <Divider />
      <ToolbarButton
        onClick={onAddComment ?? (() => {})}
        disabled={aiGenerating || !hasSelection || !onAddComment}
        title={
          hasSelection 
            ? 'New comment (⌘⌥M)' 
            : selectionHasComment 
              ? 'Text already has a comment' 
              : 'Select text to comment'
        }
      >
        <MessageSquarePlus className={toolbarButtonStyles.iconSize} />
      </ToolbarButton>
      <ToolbarButton
        onClick={onViewComments ?? (() => {})}
        disabled={aiGenerating || !onViewComments}
        title="View all comments"
      >
        <span className="flex items-center gap-1">
          <MessageSquare className={toolbarButtonStyles.iconSize} />
          {commentsCount !== undefined && commentsCount > 0 && (
            <span className="text-xs tabular-nums">{commentsCount}</span>
          )}
        </span>
      </ToolbarButton>
    </div>
  )
}
