'use client'

import { useState, useRef, useEffect } from 'react'
import { Loader2, History } from 'lucide-react'
import { formatRelativeTime } from '../../lib/format'
import type { RevisionSummary } from '../../lib/editor-types'

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
  const menuRef = useRef<HTMLDivElement>(null)

  // Close on click outside
  useEffect(() => {
    if (!open) return
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [open])

  const handleToggle = () => {
    if (!open) onOpen()
    setOpen(!open)
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={handleToggle}
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
      
      {open && (
        <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50 w-64 max-h-80 overflow-y-auto">
          <div className="px-3 py-2 text-sm font-medium border-b border-gray-200 dark:border-gray-700">
            Revision History
          </div>
          
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
              <button
                key={rev.id}
                onClick={() => {
                  onSelect(rev.id)
                  setOpen(false)
                }}
                className="w-full px-3 py-2.5 md:px-2 md:py-1.5 min-h-[44px] md:min-h-0 text-left rounded-sm hover:bg-accent cursor-default"
              >
                <div className="flex flex-col">
                  <span className="text-sm truncate">{rev.title || 'Untitled'}</span>
                  <span className="text-xs text-gray-500">
                    {formatRelativeTime(rev.createdAt)}
                  </span>
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}
