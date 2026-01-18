'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, MoreHorizontal, RotateCcw } from 'lucide-react'
import { useDashboardContext } from '../../context'
import { Skeleton } from '../../components/Skeleton'
import type { Revision } from './types'

const REVISIONS_PER_PAGE = 25

export function RevisionsSettings() {
  const { apiBasePath, navigate } = useDashboardContext()
  const [revisions, setRevisions] = useState<Revision[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    setLoading(true)
    fetch(`${apiBasePath}/revisions?page=${currentPage}&limit=${REVISIONS_PER_PAGE}`)
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(res => {
        setRevisions(res.data || [])
        setTotalCount(res.total ?? res.data?.length ?? 0)
        setTotalPages(res.totalPages || Math.ceil((res.total ?? res.data?.length ?? 0) / REVISIONS_PER_PAGE))
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [apiBasePath, currentPage])

  function getStatusBadgeClasses(isCurrent: boolean) {
    if (isCurrent) return 'bg-primary text-primary-foreground'
    return 'bg-secondary text-secondary-foreground'
  }

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

  if (loading && revisions.length === 0) return <Skeleton className="h-32" />

  return (
    <div>
      <div className="flex items-end justify-between gap-4 mb-6 md:mb-8">
        <div className="shrink-0">
          <h1 className="text-lg font-bold">Revisions</h1>
          <p className="text-sm text-muted-foreground mt-1">{totalCount} total revision{totalCount !== 1 ? 's' : ''}</p>
        </div>
        <PaginationControls position="top" />
      </div>

      {revisions.length === 0 ? (
        <div className="py-8 text-center text-muted-foreground">No revisions yet.</div>
      ) : (
        <>
          <div className="hidden md:block rounded-md border">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b">
                <tr className="border-b">
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Post</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Content Preview</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Created</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                  <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {revisions.map(revision => {
                  const isCurrent = revision.post.markdown === revision.markdown
                  return (
                    <tr key={revision.id} className="border-b">
                      <td className="p-4 align-middle">
                        <button
                          onClick={() => navigate(`/editor/${revision.post.slug}`)}
                          className="block truncate max-w-[200px] hover:underline text-left"
                        >
                          {revision.post.title || 'Untitled'}
                        </button>
                      </td>
                      <td className="p-4 align-middle">
                        <span className="block truncate max-w-[300px] text-muted-foreground">
                          {revision.markdown.slice(0, 80)}{revision.markdown.length > 80 ? '...' : ''}
                        </span>
                      </td>
                      <td className="p-4 align-middle text-muted-foreground">
                        {new Date(revision.createdAt).toLocaleString()}
                      </td>
                      <td className="p-4 align-middle">
                        <span className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold ${getStatusBadgeClasses(isCurrent)}`}>
                          {isCurrent ? 'current' : 'past'}
                        </span>
                      </td>
                      <td className="p-4 align-middle text-right">
                        <button
                          onClick={() => navigate(`/settings/revisions/${revision.id}`)}
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

          <div className="md:hidden divide-y rounded-md border bg-background">
            {revisions.map(revision => {
              const isCurrent = revision.post.markdown === revision.markdown
              return (
                <div key={revision.id} className="flex items-center justify-between gap-4 px-4 py-5">
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">{revision.post.title || 'Untitled'}</span>
                      <span className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold shrink-0 ${getStatusBadgeClasses(isCurrent)}`}>
                        {isCurrent ? 'current' : 'past'}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {revision.markdown.slice(0, 40)}{revision.markdown.length > 40 ? '...' : ''} · {new Date(revision.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => navigate(`/settings/revisions/${revision.id}`)}
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

      <PaginationControls position="bottom" />
    </div>
  )
}

interface RevisionDetail {
  id: string
  postId: string
  title: string | null
  subtitle: string | null
  markdown: string
  createdAt: string
  post: { id: string; title: string; slug: string; markdown: string }
}

export function RevisionDetail({ revisionId }: { revisionId: string }) {
  const { apiBasePath, navigate } = useDashboardContext()
  const [revision, setRevision] = useState<RevisionDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [restoring, setRestoring] = useState(false)

  useEffect(() => {
    fetch(`${apiBasePath}/revisions/${revisionId}`)
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(res => {
        setRevision(res.data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [apiBasePath, revisionId])

  async function handleRestore() {
    if (!revision) return
    if (!confirm('Restore this revision? This will replace the current post content.')) return
    
    setRestoring(true)
    const res = await fetch(`${apiBasePath}/revisions/${revisionId}/restore`, { method: 'POST' })
    if (res.ok) {
      navigate(`/editor/${revision.post.slug}`)
    }
    setRestoring(false)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-64" />
      </div>
    )
  }

  if (!revision) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => navigate('/settings/revisions')}
          className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
        >
          <ChevronLeft className="h-4 w-4" /> Back to Revisions
        </button>
        <p className="text-muted-foreground">Revision not found.</p>
      </div>
    )
  }

  const isCurrent = revision.post.markdown === revision.markdown

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <button
            onClick={() => navigate('/settings/revisions')}
            className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
          >
            <ChevronLeft className="h-4 w-4" /> Back to Revisions
          </button>
          <h2 className="text-lg font-semibold">Revision Detail</h2>
        </div>
        <div className="flex items-center gap-2">
          {isCurrent ? (
            <span className="inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold bg-primary text-primary-foreground">
              current
            </span>
          ) : (
            <button
              onClick={handleRestore}
              disabled={restoring}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium h-9 px-4 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              {restoring ? 'Restoring...' : 'Restore This Revision'}
            </button>
          )}
        </div>
      </div>

      <div className="rounded-lg border bg-card p-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Post</span>
          <button
            onClick={() => navigate(`/editor/${revision.post.slug}`)}
            className="text-sm hover:underline"
          >
            {revision.post.title || 'Untitled'}
          </button>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Title at revision</span>
          <span className="text-sm">{revision.title || '—'}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Created</span>
          <span className="text-sm">{new Date(revision.createdAt).toLocaleString()}</span>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-medium">Content</h3>
        <div className="rounded-lg border bg-muted/30 p-4 max-h-96 overflow-auto">
          <pre className="text-sm whitespace-pre-wrap font-mono">{revision.markdown}</pre>
        </div>
      </div>
    </div>
  )
}
