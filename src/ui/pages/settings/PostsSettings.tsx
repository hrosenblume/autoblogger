'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, MoreVertical, MoreHorizontal } from 'lucide-react'
import { useDashboardContext } from '../../context'
import { Skeleton } from '../../components/Skeleton'

interface PostWithRevisions {
  id: string
  title: string
  slug: string
  status: string
  updatedAt: string
  _count?: { revisions: number }
}

const POSTS_PER_PAGE = 25

export function PostsSettings() {
  const { apiBasePath, navigate, sharedData } = useDashboardContext()
  const postUrlPattern = sharedData?.settings?.postUrlPattern ?? '/e/{slug}'
  const getPostUrl = (slug: string) => postUrlPattern.replace('{slug}', slug)
  const [posts, setPosts] = useState<PostWithRevisions[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [menuOpen, setMenuOpen] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    fetch(`${apiBasePath}/posts?all=1&page=${currentPage}&limit=${POSTS_PER_PAGE}&includeRevisionCount=1`)
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(res => {
        setPosts(res.data || [])
        setTotalCount(res.total ?? res.data?.length ?? 0)
        setTotalPages(Math.ceil((res.total ?? res.data?.length ?? 0) / POSTS_PER_PAGE))
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [apiBasePath, currentPage])

  async function handleDelete(post: PostWithRevisions) {
    if (!confirm(`Delete "${post.title || 'Untitled'}"? This will also delete all revisions.`)) return
    const res = await fetch(`${apiBasePath}/posts/${post.id}`, { method: 'DELETE' })
    if (res.ok) {
      setPosts(posts.filter(p => p.id !== post.id))
      setTotalCount(c => c - 1)
    }
    setMenuOpen(null)
  }

  function getStatusBadgeClasses(status: string) {
    if (status === 'published') return 'bg-primary text-primary-foreground'
    if (status === 'deleted') return 'bg-destructive text-destructive-foreground'
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

  if (loading && posts.length === 0) return <Skeleton className="h-32" />

  return (
    <div>
      <div className="flex items-end justify-between gap-4 mb-6 md:mb-8">
        <div className="shrink-0">
          <h1 className="text-lg font-bold">Posts</h1>
          <p className="text-sm text-muted-foreground mt-1">{totalCount} total post{totalCount !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex items-center gap-4">
          <PaginationControls position="top" />
          <button
            onClick={() => navigate('/editor')}
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium h-10 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            New Post
          </button>
        </div>
      </div>

      {posts.length === 0 ? (
        <div className="py-8 text-center text-muted-foreground">No posts yet.</div>
      ) : (
        <>
          <div className="hidden md:block rounded-md border">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b">
                <tr className="border-b">
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Title</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Slug</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Revisions</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Updated</th>
                  <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {posts.map(post => (
                  <tr key={post.id} className="border-b">
                    <td className="p-4 align-middle">
                      <span className="block truncate max-w-[200px]">{post.title || 'Untitled'}</span>
                    </td>
                    <td className="p-4 align-middle">
                      <span className="block truncate max-w-[250px] text-muted-foreground font-mono">{post.slug}</span>
                    </td>
                    <td className="p-4 align-middle">
                      <span className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold ${getStatusBadgeClasses(post.status)}`}>
                        {post.status}
                      </span>
                    </td>
                    <td className="p-4 align-middle text-muted-foreground">{post._count?.revisions ?? 0}</td>
                    <td className="p-4 align-middle text-muted-foreground">{new Date(post.updatedAt).toLocaleDateString()}</td>
                    <td className="p-4 align-middle text-right">
                      <div className="relative inline-block">
                        <button
                          onClick={() => setMenuOpen(menuOpen === post.id ? null : post.id)}
                          className="inline-flex items-center justify-center rounded-md h-8 w-8 hover:bg-accent text-muted-foreground"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>
                        {menuOpen === post.id && (
                          <div className="absolute right-0 top-full mt-1 bg-popover border border-border rounded-md shadow-md z-50 min-w-[8rem] py-1">
                            <button
                              onClick={() => { navigate(`/editor/${post.slug}`); setMenuOpen(null) }}
                              className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none w-full text-left hover:bg-accent"
                            >
                              Edit
                            </button>
                            {post.status === 'published' && (
                              <a
                                href={getPostUrl(post.slug)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none w-full text-left hover:bg-accent"
                                onClick={() => setMenuOpen(null)}
                              >
                                View
                              </a>
                            )}
                            <div className="-mx-1 my-1 h-px bg-muted" />
                            <button
                              onClick={() => handleDelete(post)}
                              className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none w-full text-left text-destructive hover:bg-accent"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden divide-y rounded-md border bg-background">
            {posts.map(post => (
              <div key={post.id} className="flex items-center justify-between gap-4 px-4 py-5">
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-medium truncate">{post.title || 'Untitled'}</span>
                    <span className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold shrink-0 ${getStatusBadgeClasses(post.status)}`}>
                      {post.status}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {post.slug} · {post._count?.revisions ?? 0} rev · {new Date(post.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="relative">
                  <button
                    onClick={() => setMenuOpen(menuOpen === post.id ? null : post.id)}
                    className="inline-flex items-center justify-center rounded-md h-8 w-8 hover:bg-accent text-muted-foreground"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>
                  {menuOpen === post.id && (
                    <div className="absolute right-0 top-full mt-1 bg-popover border border-border rounded-md shadow-md z-50 min-w-[8rem] py-1">
                      <button
                        onClick={() => { navigate(`/editor/${post.slug}`); setMenuOpen(null) }}
                        className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none w-full text-left hover:bg-accent"
                      >
                        Edit
                      </button>
                      {post.status === 'published' && (
                        <a
                          href={getPostUrl(post.slug)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none w-full text-left hover:bg-accent"
                          onClick={() => setMenuOpen(null)}
                        >
                          View
                        </a>
                      )}
                      <div className="-mx-1 my-1 h-px bg-muted" />
                      <button
                        onClick={() => handleDelete(post)}
                        className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none w-full text-left text-destructive hover:bg-accent"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <PaginationControls position="bottom" />
    </div>
  )
}
