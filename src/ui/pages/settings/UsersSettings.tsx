'use client'

import { useState, useEffect } from 'react'
import { MoreVertical } from 'lucide-react'
import { useDashboardContext } from '../../context'
import { Skeleton } from '../../components/Skeleton'
import type { User } from './types'

export function UsersSettings() {
  const { apiBasePath } = useDashboardContext()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [formEmail, setFormEmail] = useState('')
  const [formName, setFormName] = useState('')
  const [formRole, setFormRole] = useState('writer')
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)
  const [menuOpen, setMenuOpen] = useState<string | null>(null)

  useEffect(() => {
    fetch(`${apiBasePath}/users`)
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(res => { setUsers(res.data || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [apiBasePath])

  function resetForm() {
    setFormEmail('')
    setFormName('')
    setFormRole('writer')
    setFormError('')
    setEditingUser(null)
  }

  function openNewForm() {
    resetForm()
    setShowForm(true)
  }

  function openEditForm(user: User) {
    setEditingUser(user)
    setFormEmail(user.email)
    setFormName(user.name || '')
    setFormRole(user.role)
    setFormError('')
    setShowForm(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!formEmail) return
    setSaving(true)
    setFormError('')

    const url = editingUser ? `${apiBasePath}/users/${editingUser.id}` : `${apiBasePath}/users`
    const method = editingUser ? 'PATCH' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: formEmail, name: formName || null, role: formRole }),
    })

    if (res.ok) {
      const json = await res.json()
      if (editingUser) {
        setUsers(users.map(u => u.id === editingUser.id ? json.data : u))
      } else {
        setUsers([json.data, ...users])
      }
      setShowForm(false)
      resetForm()
    } else {
      const result = await res.json().catch(() => ({}))
      setFormError(result.error || `Failed to ${editingUser ? 'update' : 'create'} user`)
    }
    setSaving(false)
  }

  async function handleDeleteUser(id: string, email: string) {
    if (!confirm(`Delete user "${email}"?`)) return
    const res = await fetch(`${apiBasePath}/users/${id}`, { method: 'DELETE' })
    if (res.ok) setUsers(users.filter(u => u.id !== id))
    setMenuOpen(null)
  }

  function getRoleBadgeClasses(role: string) {
    if (role === 'admin') return 'bg-primary text-primary-foreground'
    if (role === 'drafter') return 'border border-border text-foreground'
    return 'bg-secondary text-secondary-foreground'
  }

  if (loading) return <Skeleton className="h-32" />

  return (
    <div className="space-y-6">
      {/* Add/Edit Form - shown as separate view like old interface */}
      {showForm ? (
        <div className="max-w-md">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">{editingUser ? 'Edit User' : 'Add User'}</h2>
          </div>

          {formError && (
            <div className="bg-destructive/10 text-destructive p-3 rounded-lg text-sm mb-4">
              {formError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium">Email *</label>
              <input
                type="email"
                id="email"
                value={formEmail}
                onChange={e => setFormEmail(e.target.value)}
                required
                placeholder={editingUser ? undefined : 'user@example.com'}
                className="w-full px-3 py-2 border border-input rounded-md bg-transparent"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-medium">Name</label>
              <input
                type="text"
                id="name"
                value={formName}
                onChange={e => setFormName(e.target.value)}
                placeholder={editingUser ? undefined : 'John Doe'}
                className="w-full px-3 py-2 border border-input rounded-md bg-transparent"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="role" className="block text-sm font-medium">Role</label>
              <select
                id="role"
                value={formRole}
                onChange={e => setFormRole(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md bg-transparent"
              >
                <option value="drafter">Drafter</option>
                <option value="writer">Writer</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="flex gap-4 pt-2">
              <button type="submit" disabled={saving} className="px-4 py-2 bg-primary text-primary-foreground rounded-md disabled:opacity-50">
                {saving ? (editingUser ? 'Saving...' : 'Creating...') : (editingUser ? 'Save Changes' : 'Create User')}
              </button>
              <button type="button" onClick={() => { setShowForm(false); resetForm() }} className="px-4 py-2 text-muted-foreground hover:text-foreground">
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Users</h2>
            <button onClick={openNewForm} className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm">
              Add User
            </button>
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block rounded-md border border-border">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Email</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Name</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Role</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Created</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.map(user => (
              <tr key={user.id}>
                <td className="px-4 py-3 text-sm max-w-[250px] truncate">{user.email}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground max-w-[150px] truncate">{user.name || '—'}</td>
                <td className="px-4 py-3 text-sm">
                  <span className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold ${getRoleBadgeClasses(user.role)}`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{new Date(user.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-right">
                  <div className="relative inline-block">
                    <button
                      onClick={() => setMenuOpen(menuOpen === user.id ? null : user.id)}
                      className="p-1.5 text-muted-foreground hover:text-foreground rounded hover:bg-accent"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>
                    {menuOpen === user.id && (
                      <div className="absolute right-0 top-full mt-1 bg-popover border border-border rounded-md shadow-md z-50 min-w-[100px] py-1">
                        <button
                          onClick={() => { openEditForm(user); setMenuOpen(null) }}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-accent"
                        >
                          Edit
                        </button>
                        <div className="h-px bg-border my-1" />
                        <button
                          onClick={() => handleDeleteUser(user.id, user.email)}
                          className="w-full px-3 py-2 text-left text-sm text-red-500 hover:bg-accent"
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
        {users.length === 0 && (
          <p className="p-8 text-center text-muted-foreground">No users yet. Add one to get started.</p>
        )}
      </div>

      {/* Mobile List */}
      <div className="md:hidden divide-y divide-border rounded-md border border-border bg-background">
        {users.map(user => (
          <div key={user.id} className="flex items-center justify-between gap-4 px-4 py-5">
            <div className="min-w-0 flex-1 space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="font-medium truncate">{user.email}</span>
                <span className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold ${getRoleBadgeClasses(user.role)}`}>
                  {user.role}
                </span>
              </div>
              <p className="text-sm text-muted-foreground truncate">
                {user.name || 'No name'} · Created {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="relative">
              <button
                onClick={() => setMenuOpen(menuOpen === user.id ? null : user.id)}
                className="p-1.5 text-muted-foreground hover:text-foreground rounded hover:bg-accent"
              >
                <MoreVertical className="h-4 w-4" />
              </button>
              {menuOpen === user.id && (
                <div className="absolute right-0 top-full mt-1 bg-popover border border-border rounded-md shadow-md z-50 min-w-[100px] py-1">
                  <button
                    onClick={() => { openEditForm(user); setMenuOpen(null) }}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-accent"
                  >
                    Edit
                  </button>
                  <div className="h-px bg-border my-1" />
                  <button
                    onClick={() => handleDeleteUser(user.id, user.email)}
                    className="w-full px-3 py-2 text-left text-sm text-red-500 hover:bg-accent"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
          {users.length === 0 && (
            <p className="p-8 text-center text-muted-foreground">No users yet. Add one to get started.</p>
          )}
        </div>
        </>
      )}
    </div>
  )
}
