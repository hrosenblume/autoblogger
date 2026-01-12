'use client'

import { useState } from 'react'
import { Loader2, History } from 'lucide-react'
import { formatRelativeTime } from '../../lib/format'
import type { RevisionSummary } from '../../lib/editor-types'
import { Dropdown, DropdownItem, DropdownLabel } from './Dropdown'

interface Props {
  revisions: RevisionSummary[]
  loading: boolean
  previewLoading: boolean
  disabled: boolean
  isPreviewMode: boolean
  onOpen: () => void
  onSelect: (id: string) => void
}

export function RevisionHistoryDropdown({
  revisions,
  loading,
  previewLoading,
  disabled,
  isPreviewMode,
  onOpen,
  onSelect,
}: Props) {
  const [open, setOpen] = useState(false)

  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen && !open) {
      onOpen()
    }
    setOpen(isOpen)
  }

  const trigger = (
    <button
      type="button"
      disabled={disabled || isPreviewMode || previewLoading}
      title={disabled ? 'Save post to enable history' : 'Revision history'}
      className="px-2.5 py-1.5 text-sm font-medium rounded transition-colors flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed text-gray-600 dark:text-gray-400"
    >
      {previewLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <History className="w-4 h-4" />
      )}
    </button>
  )

  return (
    <Dropdown
      trigger={trigger}
      open={open}
      onOpenChange={handleOpenChange}
      disabled={disabled || isPreviewMode || previewLoading}
      align="right"
      className="w-64 max-h-80 overflow-y-auto p-0"
    >
      <DropdownLabel>Revision History</DropdownLabel>
      <div className="border-t border-border" />
      
      {loading ? (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
        </div>
      ) : revisions.length === 0 ? (
        <div className="py-4 text-center text-sm text-gray-500">
          No revisions yet
        </div>
      ) : (
        revisions.map((rev) => (
          <DropdownItem key={rev.id} onClick={() => onSelect(rev.id)}>
            <div className="flex flex-col">
              <span className="text-sm truncate">{rev.title || 'Untitled'}</span>
              <span className="text-xs text-gray-500">
                {formatRelativeTime(rev.createdAt)}
              </span>
            </div>
          </DropdownItem>
        ))
      )}
    </Dropdown>
  )
}
