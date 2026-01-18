'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react'
import { useDashboardContext } from '../../context'
import { Skeleton } from '../../components/Skeleton'

interface CommentWithDetails {
  id: string
  content: string
  createdAt: string
  resolved: boolean
  deletedAt: string | null
  parentId: string | null
  post: { id: string; title: string; slug: string }
  user: { name: string | null; email: string }
}

const COMMENTS_PER_PAGE = 25

export function CommentsSettings() {
  const { apiBasePath, navigate } = useDashboardContext()
  const [comments, setComments] = useState<CommentWithDetails[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    setLoading(true)
    fetch(`${apiBasePath}/comments?page=${currentPage}&limit=${COMMENTS_PER_PAGE}`)
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(res => {
        setComments(res.data || [])
        setTotalCount(res.total ?? res.data?.length ?? 0)
        setTotalPages(res.totalPages || Math.ceil((res.total ?? res.data?.length ?? 0) / COMMENTS_PER_PAGE))
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [apiBasePath, currentPage])

  function getStatusBadge(comment: CommentWithDetails) {
    const isDeleted = comment.deletedAt !== null
    const isResolved = comment.resolved
    
    if (isDeleted) {
      return { label: 'deleted', classes: 'bg-destructive text-destructive-foreground' }
    }
    if (isResolved) {
      return { label: 'resolved', classes: 'bg-secondary text-secondary-foreground' }
    }
    return { label: 'active', classes: 'bg-primary text-primary-foreground' }
  }

  // Pagination component matching other settings pages
  const PaginationControls = ({ position }: { position: 'top' | 'bottom' }) => {
    if (totalPages <= 1) return null
    
    const getPageNumbers = () => {
      const pages: (number | 'ellipsis-start' | 'ellipsis-end')[] = []
      if (totalPages <= 7) {
        for (let i = 1; i <= totalPages; i++) pages.push(i)
      } else {
        pages.push(1)
        if (currentPage > 3) pages.push('ellipsis-start')
        const start = Math.max(2, currentPage - 1)
        const end = Math.min(totalPages - 1, currentPage + 1)
        for (let i = start; i <= end; i++) {
          if (!pages.includes(i)) pages.push(i)
        }
        if (currentPage < totalPages - 2) pages.push('ellipsis-end')
        if (!pages.includes(totalPages)) pages.push(totalPages)
      }
      return pages
    }

    const spacingClass = position === 'bottom' ? 'mt-4' : ''
    
    return (
      <nav role="navigation" aria-label="pagination" className={`mx-auto flex w-full justify-end ${spacingClass}`}>
        <ul className="flex flex-row items-center gap-1">
          <li>
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              aria-label="Go to previous page"
              className="inline-flex items-center justify-center gap-1 whitespace-nowrap rounded-md text-sm font-medium h-9 px-2.5 hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:block">Previous</span>
            </button>
          </li>
          {getPageNumbers().map((page) => 
            typeof page === 'string' ? (
              <li key={page}>
                <span aria-hidden className="flex h-9 w-9 items-center justify-center">
                  <MoreHorizontal className="h-4 w-4" />
                </span>
              </li>
            ) : (
              <li key={page}>
                <button
                  onClick={() => setCurrentPage(page)}
                  aria-current={page === currentPage ? 'page' : undefined}
                  className={`inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium h-9 w-9 ${
                    page === currentPage 
                      ? 'border border-input bg-background hover:bg-accent hover:text-accent-foreground' 
                      : 'hover:bg-accent hover:text-accent-foreground'
                  }`}
                >
                  {page}
                </button>
              </li>
            )
          )}
          <li>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              aria-label="Go to next page"
              className="inline-flex items-center justify-center gap-1 whitespace-nowrap rounded-md text-sm font-medium h-9 px-2.5 hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50"
            >
              <span className="hidden sm:block">Next</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </li>
        </ul>
      </nav>
    )
  }

  if (loading && comments.length === 0) return <Skeleton className="h-32" />

  return (
    <div>
      {/* Header - matches AdminPageHeader pattern */}
      <div className="flex items-end justify-between gap-4 mb-6 md:mb-8">
        <div className="shrink-0">
          <h1 className="text-lg font-bold">Comments</h1>
          <p className="text-sm text-muted-foreground mt-1">{totalCount} total comment{totalCount !== 1 ? 's' : ''}</p>
        </div>
        <PaginationControls position="top" />
      </div>

      {comments.length === 0 ? (
        <div className="py-8 text-center text-muted-foreground">No comments yet.</div>
      ) : (
        <>
          {/* Desktop Table - matches AdminTable */}
          <div className="hidden md:block rounded-md border">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b">
                <tr className="border-b">
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground max-w-[200px]">Post</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Author</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground max-w-[300px]">Comment</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Created</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                  <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {comments.map(comment => {
                  const status = getStatusBadge(comment)
                  const isReply = comment.parentId !== null
                  const commentIdToOpen = comment.parentId || comment.id
                  
                  return (
                    <tr key={comment.id} className="border-b">
                      <td className="p-4 align-middle">
                        <button
                          onClick={() => navigate(`/editor/${comment.post.slug}`)}
                          className="block truncate max-w-[200px] hover:underline text-left"
                        >
                          {comment.post.title || 'Untitled'}
                        </button>
                      </td>
                      <td className="p-4 align-middle text-muted-foreground">
                        {comment.user.name || comment.user.email}
                      </td>
                      <td className="p-4 align-middle">
                        <span className="block truncate max-w-[300px] text-muted-foreground">
                          {isReply && <span className="text-xs mr-1">↳</span>}
                          {comment.content.slice(0, 60)}{comment.content.length > 60 ? '...' : ''}
                        </span>
                      </td>
                      <td className="p-4 align-middle text-muted-foreground">
                        {new Date(comment.createdAt).toLocaleString()}
                      </td>
                      <td className="p-4 align-middle">
                        <span className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold ${status.classes}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="p-4 align-middle text-right">
                        <button
                          onClick={() => navigate(`/editor/${comment.post.slug}?comment=${commentIdToOpen}`)}
                          className="inline-flex items-center justify-center rounded-md text-sm font-medium h-8 px-3 hover:bg-accent text-muted-foreground hover:text-foreground"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile List - matches AdminTable mobile view */}
          <div className="md:hidden divide-y rounded-md border bg-background">
            {comments.map(comment => {
              const status = getStatusBadge(comment)
              const isReply = comment.parentId !== null
              const commentIdToOpen = comment.parentId || comment.id
              
              return (
                <div key={comment.id} className="flex items-center justify-between gap-4 px-4 py-5">
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">
                        {isReply && <span className="text-xs mr-1">↳</span>}
                        {comment.content.slice(0, 40)}{comment.content.length > 40 ? '...' : ''}
                      </span>
                      <span className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold shrink-0 ${status.classes}`}>
                        {status.label}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {comment.user.name || comment.user.email} · {new Date(comment.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => navigate(`/editor/${comment.post.slug}?comment=${commentIdToOpen}`)}
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium h-8 px-3 hover:bg-accent text-muted-foreground hover:text-foreground shrink-0"
                  >
                    View
                  </button>
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* Bottom Pagination */}
      <PaginationControls position="bottom" />
    </div>
  )
}
