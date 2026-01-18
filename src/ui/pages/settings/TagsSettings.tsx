'use client'

import { useState, useEffect } from 'react'
import { MoreVertical } from 'lucide-react'
import { useDashboardContext } from '../../context'
import { Skeleton } from '../../components/Skeleton'
import type { Tag } from './types'

export function TagsSettings() {
  const { apiBasePath } = useDashboardContext()
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTag, setEditingTag] = useState<Tag | null>(null)
  const [tagName, setTagName] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [menuOpen, setMenuOpen] = useState<string | null>(null)

  useEffect(() => {
    fetchTags()
  }, [apiBasePath])

  async function fetchTags() {
    const res = await fetch(`${apiBasePath}/tags`)
    if (res.ok) {
      const json = await res.json()
      setTags(json.data || [])
    }
    setLoading(false)
  }

  function openCreateDialog() {
    setEditingTag(null)
    setTagName('')
    setError('')
    setDialogOpen(true)
  }

  function openEditDialog(tag: Tag) {
    setEditingTag(tag)
    setTagName(tag.name)
    setError('')
    setDialogOpen(true)
    setMenuOpen(null)
  }

  async function handleDelete(tag: Tag) {
    if (!confirm(`Delete tag "${tag.name}"? This will remove it from all posts.`)) return
    const res = await fetch(`${apiBasePath}/tags/${tag.id}`, { method: 'DELETE' })
    if (res.ok) {
      fetchTags()
    }
    setMenuOpen(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!tagName.trim()) {
      setError('Tag name is required')
      return
    }

    setSaving(true)
    setError('')

    const url = editingTag
      ? `${apiBasePath}/tags/${editingTag.id}`
      : `${apiBasePath}/tags`
    const method = editingTag ? 'PATCH' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: tagName.trim() }),
    })

    if (res.ok) {
      setDialogOpen(false)
      fetchTags()
    } else {
      const data = await res.json().catch(() => ({}))
      setError(data.error || 'Failed to save tag')
    }

    setSaving(false)
  }

  if (loading) return <Skeleton className="h-32" />

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 md:mb-8">
        <h2 className="text-lg font-semibold">Tags</h2>
        <button
          onClick={openCreateDialog}
          className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium h-10 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90"
        >
          Add Tag
        </button>
      </div>

      {tags.length === 0 ? (
        <div className="py-8 text-center text-muted-foreground">No tags yet. Create one to get started.</div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block rounded-md border">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b">
                <tr className="border-b">
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Name</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Posts</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Created</th>
                  <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {tags.map(tag => (
                  <tr key={tag.id} className="border-b">
                    <td className="p-4 align-middle">
                      <span className="block truncate max-w-[250px]">{tag.name}</span>
                    </td>
                    <td className="p-4 align-middle text-muted-foreground">{tag._count?.posts ?? 0}</td>
                    <td className="p-4 align-middle text-muted-foreground">
                      {tag.createdAt ? new Date(tag.createdAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="p-4 align-middle text-right">
                      <div className="relative inline-block">
                        <button
                          onClick={() => setMenuOpen(menuOpen === tag.id ? null : tag.id)}
                          className="inline-flex items-center justify-center rounded-md h-8 w-8 hover:bg-accent text-muted-foreground"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>
                        {menuOpen === tag.id && (
                          <div className="absolute right-0 top-full mt-1 bg-popover border border-border rounded-md shadow-md z-50 min-w-[8rem] py-1">
                            <button
                              onClick={() => openEditDialog(tag)}
                              className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none w-full text-left hover:bg-accent"
                            >
                              Edit
                            </button>
                            <div className="-mx-1 my-1 h-px bg-muted" />
                            <button
                              onClick={() => handleDelete(tag)}
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

          {/* Mobile List */}
          <div className="md:hidden divide-y rounded-md border bg-background">
            {tags.map(tag => (
              <div key={tag.id} className="flex items-center justify-between gap-4 px-4 py-5">
                <div className="min-w-0 flex-1 space-y-1.5">
                  <span className="font-medium truncate block">{tag.name}</span>
                  <p className="text-sm text-muted-foreground truncate">
                    {tag._count?.posts ?? 0} posts · Created {tag.createdAt ? new Date(tag.createdAt).toLocaleDateString() : '—'}
                  </p>
                </div>
                <div className="relative">
                  <button
                    onClick={() => setMenuOpen(menuOpen === tag.id ? null : tag.id)}
                    className="inline-flex items-center justify-center rounded-md h-8 w-8 hover:bg-accent text-muted-foreground"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>
                  {menuOpen === tag.id && (
                    <div className="absolute right-0 top-full mt-1 bg-popover border border-border rounded-md shadow-md z-50 min-w-[8rem] py-1">
                      <button
                        onClick={() => openEditDialog(tag)}
                        className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none w-full text-left hover:bg-accent"
                      >
                        Edit
                      </button>
                      <div className="-mx-1 my-1 h-px bg-muted" />
                      <button
                        onClick={() => handleDelete(tag)}
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

      {/* Dialog for Create/Edit */}
      {dialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="fixed inset-0 bg-black/80" 
            onClick={() => setDialogOpen(false)}
          />
          <div className="relative z-50 w-full max-w-sm bg-background border border-border rounded-lg shadow-lg">
            <div className="flex flex-col space-y-1.5 p-6">
              <h3 className="text-lg font-semibold leading-none tracking-tight">
                {editingTag ? 'Edit Tag' : 'Create Tag'}
              </h3>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="px-6 pb-4">
                <div className="space-y-2">
                  <label htmlFor="tagName" className="text-sm font-medium leading-none">Name</label>
                  <input
                    id="tagName"
                    type="text"
                    value={tagName}
                    onChange={(e) => setTagName(e.target.value)}
                    placeholder="e.g. technology"
                    autoFocus
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  />
                  {error && (
                    <p className="text-sm text-destructive">{error}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 p-6 pt-0">
                <button
                  type="button"
                  onClick={() => setDialogOpen(false)}
                  disabled={saving}
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium h-10 px-4 py-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium h-10 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingTag ? 'Save' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
