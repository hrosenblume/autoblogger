'use client'

import { useState } from 'react'
import { MoreHorizontal, Reply, Check, Trash2, Pencil } from 'lucide-react'
import { cn } from '../../lib/cn'
import { CommentWithUser, canEditComment, canDeleteComment } from '../../lib/comments'
import { Dropdown, DropdownItem, DropdownDivider } from './Dropdown'

// Simple relative time formatter
function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return date.toLocaleDateString()
}

interface CommentThreadProps {
  comment: CommentWithUser
  currentUserEmail: string
  isAdmin: boolean
  isActive: boolean
  onReply: (content: string) => Promise<void>
  onEdit: (content: string) => Promise<void>
  onDelete: () => Promise<void>
  onResolve: () => Promise<void>
  onClick: () => void
}

export function CommentThread({
  comment,
  currentUserEmail,
  isAdmin,
  isActive,
  onReply,
  onEdit,
  onDelete,
  onResolve,
  onClick,
}: CommentThreadProps) {
  const [isReplying, setIsReplying] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [replyContent, setReplyContent] = useState('')
  const [editContent, setEditContent] = useState(comment.content)
  const [loading, setLoading] = useState(false)

  const canEdit = canEditComment(comment, currentUserEmail)
  const canDelete = canDeleteComment(comment, currentUserEmail, isAdmin)
  const isOwn = comment.user.email === currentUserEmail

  const handleReply = async () => {
    if (!replyContent.trim()) return
    setLoading(true)
    try {
      await onReply(replyContent.trim())
      setReplyContent('')
      setIsReplying(false)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = async () => {
    if (!editContent.trim()) return
    setLoading(true)
    try {
      await onEdit(editContent.trim())
      setIsEditing(false)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Delete this comment?')) return
    setLoading(true)
    try {
      await onDelete()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick()
        }
      }}
      className={cn(
        'rounded-lg border p-3 transition-colors cursor-pointer',
        isActive
          ? 'border-yellow-400 bg-yellow-50/50 dark:border-yellow-600 dark:bg-yellow-900/20'
          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900',
        comment.resolved && 'opacity-60'
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 text-sm">
          <span className="font-medium">
            {isOwn ? 'You' : comment.user.name || comment.user.email.split('@')[0]}
          </span>
          <span className="text-gray-500 dark:text-gray-400">
            {formatRelativeTime(comment.createdAt)}
          </span>
          {comment.resolved && (
            <span className="inline-flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
              <Check className="w-3 h-3" />
              Resolved
            </span>
          )}
        </div>

        {/* Dropdown menu */}
        <div onClick={(e) => e.stopPropagation()}>
          <Dropdown
            trigger={
              <button
                type="button"
                className="w-6 h-6 rounded hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center text-gray-500"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
            }
            align="right"
            className="min-w-[140px]"
          >
            <DropdownItem onClick={onResolve}>
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4" />
                {comment.resolved ? 'Unresolve' : 'Resolve'}
              </span>
            </DropdownItem>
            {canEdit && (
              <DropdownItem onClick={() => setIsEditing(true)}>
                <span className="flex items-center gap-2">
                  <Pencil className="w-4 h-4" />
                  Edit
                </span>
              </DropdownItem>
            )}
            {canDelete && (
              <>
                <DropdownDivider />
                <DropdownItem onClick={handleDelete} destructive>
                  <span className="flex items-center gap-2">
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </span>
                </DropdownItem>
              </>
            )}
          </Dropdown>
        </div>
      </div>

      {/* Quoted text */}
      {comment.quotedText && (
        <div className="mb-2 px-2 py-1 bg-yellow-100/50 dark:bg-yellow-900/30 rounded text-sm italic text-gray-600 dark:text-gray-400 line-clamp-2">
          "{comment.quotedText}"
        </div>
      )}

      {/* Content */}
      {isEditing ? (
        <div className="space-y-2">
          <textarea
            value={editContent}
            onChange={(e) => {
              setEditContent(e.target.value)
              e.target.style.height = 'auto'
              e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                e.stopPropagation()
                handleEdit()
              }
              if (e.key === 'Escape') {
                e.stopPropagation()
                setIsEditing(false)
                setEditContent(comment.content)
              }
            }}
            onClick={(e) => e.stopPropagation()}
            className="w-full min-h-[60px] max-h-[120px] px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 resize-none text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setIsEditing(false)
                setEditContent(comment.content)
              }}
              disabled={loading}
              className="px-3 py-1.5 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                handleEdit()
              }}
              disabled={loading || !editContent.trim()}
              className="px-3 py-1.5 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              Save
            </button>
          </div>
        </div>
      ) : (
        <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
      )}

      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-3 pl-3 border-l-2 border-gray-200 dark:border-gray-700 space-y-3">
          {comment.replies.map((reply) => (
            <ReplyItem
              key={reply.id}
              reply={reply}
              currentUserEmail={currentUserEmail}
            />
          ))}
        </div>
      )}

      {/* Reply button / form */}
      {!isEditing && (
        <div className="mt-3">
          {isReplying ? (
            <div className="space-y-2">
              <textarea
                value={replyContent}
                onChange={(e) => {
                  setReplyContent(e.target.value)
                  e.target.style.height = 'auto'
                  e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    e.stopPropagation()
                    handleReply()
                  }
                  if (e.key === 'Escape') {
                    e.stopPropagation()
                    setIsReplying(false)
                    setReplyContent('')
                  }
                }}
                placeholder="Write a reply..."
                className="w-full min-h-[60px] max-h-[120px] px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 resize-none text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                onClick={(e) => e.stopPropagation()}
              />
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsReplying(false)
                    setReplyContent('')
                  }}
                  disabled={loading}
                  className="px-3 py-1.5 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleReply()
                  }}
                  disabled={loading || !replyContent.trim()}
                  className="px-3 py-1.5 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  Reply
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setIsReplying(true)
              }}
              className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <Reply className="w-3.5 h-3.5" />
              Reply
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// Simple reply display (no nested replies allowed)
function ReplyItem({
  reply,
  currentUserEmail,
}: {
  reply: CommentWithUser
  currentUserEmail: string
}) {
  const isOwn = reply.user.email === currentUserEmail

  return (
    <div className="text-sm">
      <div className="flex items-center gap-2 mb-1">
        <span className="font-medium">
          {isOwn ? 'You' : reply.user.name || reply.user.email.split('@')[0]}
        </span>
        <span className="text-gray-500 dark:text-gray-400 text-xs">
          {formatRelativeTime(reply.createdAt)}
        </span>
      </div>
      <p className="whitespace-pre-wrap text-gray-600 dark:text-gray-400">{reply.content}</p>
    </div>
  )
}
