'use client'

import { useState, useEffect } from 'react'
import { ChevronDown, ChevronLeft, ChevronRight, RotateCcw, Plus, Pencil, Trash2, Play, X, MoreVertical, MoreHorizontal, Loader2 } from 'lucide-react'
import { useDashboardContext } from '../context'

interface SettingsLink {
  path: string
  label: string
  description: string
  countKey?: string
}

interface User {
  id: string
  email: string
  name: string | null
  role: string
  createdAt: string
}

interface Tag {
  id: string
  name: string
  createdAt?: string
  _count?: { posts: number }
}

interface Topic {
  id: string
  name: string
  isActive: boolean
  keywords: string
  rssFeeds: string
  frequency: string
  maxPerPeriod: number
  essayFocus: string | null
  useKeywordFilter: boolean
  lastRunAt: string | null
  _count?: { posts: number; newsItems: number }
}

interface Revision {
  id: string
  postId: string
  title: string | null
  markdown: string
  createdAt: string
  post: { id: string; title: string; slug: string; markdown: string }
}


export function SettingsPage({ subPath }: { subPath: string }) {
  const { navigate, sharedData, sharedDataLoading } = useDashboardContext()
  const counts = sharedData?.counts || {}
  const autoDraftEnabled = sharedData?.settings?.autoDraftEnabled ?? false
  const loading = sharedDataLoading

  const allSettingsLinks: SettingsLink[] = [
    { path: '/settings/users', label: 'Users', description: 'Manage who can access the CMS', countKey: 'users' },
    { path: '/settings/posts', label: 'All Posts', description: 'Manage all posts', countKey: 'posts' },
    { path: '/settings/tags', label: 'Tags', description: 'Organize posts with tags', countKey: 'tags' },
    { path: '/settings/ai', label: 'AI Settings', description: 'Configure AI models and rules' },
    { path: '/settings/revisions', label: 'Revisions', description: 'View revision history' },
    { path: '/settings/comments', label: 'Comments', description: 'Manage post comments' },
    { path: '/settings/topics', label: 'Topics', description: 'RSS subscriptions for auto-draft', countKey: 'topics' },
  ]

  // Filter out Topics if autoDraftEnabled is off
  const settingsLinks = autoDraftEnabled 
    ? allSettingsLinks 
    : allSettingsLinks.filter(link => link.path !== '/settings/topics')

  // Main settings overview
  if (!subPath || subPath === '/') {
    if (loading) {
      return (
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="h-7 w-24 bg-muted rounded animate-pulse mb-6" />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="p-4 sm:p-6 border border-border rounded-lg">
                <div className="h-4 w-16 bg-muted rounded animate-pulse" />
                <div className="h-8 w-12 bg-muted rounded animate-pulse mt-2" />
              </div>
            ))}
          </div>
        </div>
      )
    }

    return (
      <div className="max-w-5xl mx-auto px-6 py-8">
        <h2 className="text-lg font-semibold pb-4 mb-6 border-b border-border">Settings</h2>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          {settingsLinks.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="p-4 sm:p-6 border border-border rounded-lg text-left hover:bg-accent transition-colors"
            >
              <p className="text-sm text-muted-foreground">{item.label}</p>
              {item.countKey ? (
                <p className="text-2xl font-bold mt-1">{counts[item.countKey] ?? 0}</p>
              ) : (
                <p className="text-sm text-muted-foreground mt-1">Configure →</p>
              )}
            </button>
          ))}
        </div>
      </div>
    )
  }

  // Sub-pages - each component renders its own header
  const pageName = subPath.slice(1) // Remove leading /
  
  // Handle revision detail page: /revisions/:id
  const revisionDetailMatch = pageName.match(/^revisions\/(.+)$/)
  
  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      {pageName === 'users' && <UsersSettingsContent />}
      {pageName === 'ai' && <AISettingsContent />}
      {pageName === 'tags' && <TagsSettingsContent />}
      {pageName === 'topics' && <TopicsSettingsContent />}
      {pageName === 'posts' && <PostsSettingsContent />}
      {pageName === 'revisions' && <RevisionsSettingsContent />}
      {revisionDetailMatch && <RevisionDetailContent revisionId={revisionDetailMatch[1]} />}
      {pageName === 'comments' && <CommentsSettingsContent />}
    </div>
  )
}

function UsersSettingsContent() {
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

  if (loading) return <div className="animate-pulse h-32 bg-muted rounded" />

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

function CollapsibleTemplate({ 
  label, 
  value, 
  defaultValue, 
  onChange, 
  onReset, 
  placeholders, 
  disabled 
}: { 
  label: string
  value: string | null
  defaultValue: string
  onChange: (v: string) => void
  onReset: () => void
  placeholders: string
  disabled?: boolean
}) {
  const [open, setOpen] = useState(false)
  const isCustom = value !== null
  const displayValue = value ?? defaultValue

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? '' : '-rotate-90'}`} />
        {isCustom ? `Edit prompt template (customized)` : `Edit prompt template`}
      </button>
      {open && (
        <div className="mt-2 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">Placeholders: {placeholders}</p>
            {isCustom && (
              <button type="button" onClick={onReset} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                <RotateCcw className="h-3 w-3" /> Reset to default
              </button>
            )}
          </div>
          <textarea
            value={displayValue}
            onChange={e => onChange(e.target.value)}
            rows={10}
            className="w-full px-3 py-2 border border-input rounded-md bg-transparent resize-none font-mono text-xs"
            disabled={disabled}
          />
        </div>
      )}
    </div>
  )
}

function AISettingsContent() {
  const { apiBasePath, navigate } = useDashboardContext()
  const [rules, setRules] = useState('')
  const [chatRules, setChatRules] = useState('')
  const [rewriteRules, setRewriteRules] = useState('')
  const [autoDraftRules, setAutoDraftRules] = useState('')
  const [planRules, setPlanRules] = useState('')
  const [autoDraftWordCount, setAutoDraftWordCount] = useState(800)
  const [autoDraftEnabled, setAutoDraftEnabled] = useState(false)
  const [defaultModel, setDefaultModel] = useState('claude-sonnet')
  const [models, setModels] = useState<{ id: string; name: string; description: string }[]>([])
  const [generateTemplate, setGenerateTemplate] = useState<string | null>(null)
  const [chatTemplate, setChatTemplate] = useState<string | null>(null)
  const [rewriteTemplate, setRewriteTemplate] = useState<string | null>(null)
  const [autoDraftTemplate, setAutoDraftTemplate] = useState<string | null>(null)
  const [planTemplate, setPlanTemplate] = useState<string | null>(null)
  const [expandPlanTemplate, setExpandPlanTemplate] = useState<string | null>(null)
  const [defaultGenerateTemplate, setDefaultGenerateTemplate] = useState('')
  const [defaultChatTemplate, setDefaultChatTemplate] = useState('')
  const [defaultRewriteTemplate, setDefaultRewriteTemplate] = useState('')
  const [defaultAutoDraftTemplate, setDefaultAutoDraftTemplate] = useState('')
  const [defaultPlanRules, setDefaultPlanRules] = useState('')
  const [defaultPlanTemplate, setDefaultPlanTemplate] = useState('')
  const [defaultExpandPlanTemplate, setDefaultExpandPlanTemplate] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch(`${apiBasePath}/ai/settings`).then(res => res.ok ? res.json() : Promise.reject()),
      fetch(`${apiBasePath}/settings`).then(res => res.ok ? res.json() : Promise.reject()),
    ])
      .then(([aiRes, settingsRes]) => {
        const data = aiRes.data || {}
        setRules(data.rules || '')
        setChatRules(data.chatRules || '')
        setRewriteRules(data.rewriteRules || '')
        setAutoDraftRules(data.autoDraftRules || '')
        setPlanRules(data.planRules || '')
        setAutoDraftWordCount(data.autoDraftWordCount ?? 800)
        setDefaultModel(data.defaultModel || 'claude-sonnet')
        setModels(data.availableModels || [
          { id: 'claude-sonnet', name: 'Sonnet 4.5', description: 'Fast, capable, best value' },
          { id: 'claude-opus', name: 'Opus 4.5', description: 'Highest quality, slower' },
          { id: 'gpt-5.2', name: 'GPT-5.2', description: 'Latest OpenAI flagship' },
          { id: 'gpt-5-mini', name: 'GPT-5 Mini', description: 'Fast and cost-efficient' },
        ])
        setGenerateTemplate(data.generateTemplate ?? null)
        setChatTemplate(data.chatTemplate ?? null)
        setRewriteTemplate(data.rewriteTemplate ?? null)
        setAutoDraftTemplate(data.autoDraftTemplate ?? null)
        setPlanTemplate(data.planTemplate ?? null)
        setExpandPlanTemplate(data.expandPlanTemplate ?? null)
        setDefaultGenerateTemplate(data.defaultGenerateTemplate || '')
        setDefaultChatTemplate(data.defaultChatTemplate || '')
        setDefaultRewriteTemplate(data.defaultRewriteTemplate || '')
        setDefaultAutoDraftTemplate(data.defaultAutoDraftTemplate || '')
        setDefaultPlanRules(data.defaultPlanRules || '')
        setDefaultPlanTemplate(data.defaultPlanTemplate || '')
        setDefaultExpandPlanTemplate(data.defaultExpandPlanTemplate || '')
        // Settings
        setAutoDraftEnabled(settingsRes.data?.autoDraftEnabled ?? false)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [apiBasePath])


  async function handleSave() {
    setSaving(true)
    setSaved(false)
    await Promise.all([
      fetch(`${apiBasePath}/ai/settings`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          rules, chatRules, rewriteRules, autoDraftRules, planRules, autoDraftWordCount, defaultModel,
          generateTemplate, chatTemplate, rewriteTemplate, autoDraftTemplate, planTemplate, expandPlanTemplate
        }),
      }),
      fetch(`${apiBasePath}/settings`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ autoDraftEnabled }),
      }),
    ])
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header - matches other settings pages */}
      <div>
        <h2 className="text-lg font-semibold">AI Settings</h2>
        <p className="text-sm text-muted-foreground">Configure your AI writing assistant.</p>
      </div>

      {/* Card container */}
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="p-6 space-y-6">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium leading-none shrink-0">Default Model</label>
            <div className="relative max-w-sm flex-1">
              <select
                value={defaultModel}
                onChange={e => setDefaultModel(e.target.value)}
                className="h-10 w-full appearance-none rounded-md border border-input bg-background pl-3 pr-10 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer"
              >
                {models.map(model => (
                  <option key={model.id} value={model.id}>{model.name} — {model.description}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium leading-none">Essay Writing Rules</label>
            <p className="text-sm text-muted-foreground">
              Style and format rules for generated essays. Applied when generating or rewriting content.
            </p>
            <textarea
              value={rules}
              onChange={e => setRules(e.target.value)}
              placeholder={`- Never use "utilize" — always say "use"
- Avoid passive voice
- Start with concrete scenes, not abstractions
- Short paragraphs (3-4 sentences max)
- Use em-dashes sparingly
- End with forward motion, not tidy conclusions`}
              className="flex min-h-[180px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-mono resize-none"
              disabled={saving}
            />
            <CollapsibleTemplate
              label="Generate"
              value={generateTemplate}
              defaultValue={defaultGenerateTemplate}
              onChange={setGenerateTemplate}
              onReset={() => setGenerateTemplate(null)}
              placeholders="{{RULES}}, {{STYLE_EXAMPLES}}"
              disabled={saving}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium leading-none">Chat Behavior Rules</label>
            <p className="text-sm text-muted-foreground">
              How the assistant should behave during brainstorming conversations. Controls personality and interaction style.
            </p>
            <textarea
              value={chatRules}
              onChange={e => setChatRules(e.target.value)}
              placeholder={`- Be direct and concise
- Push back on vague ideas
- Ask clarifying questions before drafting
- Challenge my assumptions`}
              className="flex min-h-[140px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-mono resize-none"
              disabled={saving}
            />
            <CollapsibleTemplate
              label="Chat"
              value={chatTemplate}
              defaultValue={defaultChatTemplate}
              onChange={setChatTemplate}
              onReset={() => setChatTemplate(null)}
              placeholders="{{RULES}}, {{CHAT_RULES}}, {{STYLE_EXAMPLES}}"
              disabled={saving}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium leading-none">Rewrite Rules</label>
            <p className="text-sm text-muted-foreground">
              Rules for cleaning up selected text with the rewrite tool.
            </p>
            <textarea
              value={rewriteRules}
              onChange={e => setRewriteRules(e.target.value)}
              placeholder={`- Keep the same meaning, improve clarity
- Maintain sentence length variety
- Remove filler words
- Don't add new ideas`}
              className="flex min-h-[140px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-mono resize-none"
              disabled={saving}
            />
            <CollapsibleTemplate
              label="Rewrite"
              value={rewriteTemplate}
              defaultValue={defaultRewriteTemplate}
              onChange={setRewriteTemplate}
              onReset={() => setRewriteTemplate(null)}
              placeholders="{{RULES}}, {{REWRITE_RULES}}, {{STYLE_EXAMPLES}}"
              disabled={saving}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium leading-none">Auto-Draft Rules</label>
            <p className="text-sm text-muted-foreground">
              Rules for generating essays from news articles via RSS feeds. Controls how topics are transformed into original essays.
            </p>
            <textarea
              value={autoDraftRules}
              onChange={e => setAutoDraftRules(e.target.value)}
              placeholder={`- Write original perspectives, don't summarize
- Take a contrarian angle when appropriate
- Include personal insights and experiences
- Focus on implications, not just facts`}
              className="flex min-h-[140px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-mono resize-none"
              disabled={saving}
            />
            <div className="flex items-center gap-4 pt-2">
              <div className="flex items-center gap-2">
                <label className="text-sm whitespace-nowrap">Target word count:</label>
                <input
                  type="number"
                  min={200}
                  max={3000}
                  value={autoDraftWordCount}
                  onChange={e => setAutoDraftWordCount(parseInt(e.target.value) || 800)}
                  className="flex h-10 w-24 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  disabled={saving}
                />
              </div>
            </div>
            <CollapsibleTemplate
              label="Auto-Draft"
              value={autoDraftTemplate}
              defaultValue={defaultAutoDraftTemplate}
              onChange={setAutoDraftTemplate}
              onReset={() => setAutoDraftTemplate(null)}
              placeholders="{{AUTO_DRAFT_RULES}}, {{AUTO_DRAFT_WORD_COUNT}}, {{RULES}}, {{STYLE_EXAMPLES}}, {{TOPIC_NAME}}, {{ARTICLE_TITLE}}, {{ARTICLE_SUMMARY}}, {{ARTICLE_URL}}"
              disabled={saving}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium leading-none">Plan Format Rules</label>
            <p className="text-sm text-muted-foreground">
              Rules for essay plan structure and format. Controls how outlines are organized in Plan mode.
            </p>
            <div className="flex items-center justify-end">
              {planRules && (
                <button
                  type="button"
                  onClick={() => setPlanRules('')}
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium h-7 px-2 hover:bg-accent hover:text-accent-foreground"
                >
                  <RotateCcw className="h-3 w-3 mr-1" />
                  Reset to default
                </button>
              )}
            </div>
            <textarea
              value={planRules || defaultPlanRules}
              onChange={e => setPlanRules(e.target.value)}
              className="flex min-h-[250px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-mono resize-none"
              disabled={saving}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium leading-none">Plan Mode Template</label>
            <p className="text-sm text-muted-foreground">
              Prompt template for Plan mode in chat. Controls the full system prompt.
            </p>
            <CollapsibleTemplate
              label="Plan"
              value={planTemplate}
              defaultValue={defaultPlanTemplate}
              onChange={setPlanTemplate}
              onReset={() => setPlanTemplate(null)}
              placeholders="{{PLAN_RULES}}, {{STYLE_EXAMPLES}}"
              disabled={saving}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium leading-none">Expand Plan Template</label>
            <p className="text-sm text-muted-foreground">
              Prompt template for expanding a plan outline into a full essay draft.
            </p>
            <CollapsibleTemplate
              label="Expand Plan"
              value={expandPlanTemplate}
              defaultValue={defaultExpandPlanTemplate}
              onChange={setExpandPlanTemplate}
              onReset={() => setExpandPlanTemplate(null)}
              placeholders="{{RULES}}, {{STYLE_EXAMPLES}}, {{PLAN}}"
              disabled={saving}
            />
          </div>

          {/* Auto-Draft Feature Toggle */}
          <div className="flex items-center justify-between py-4 border-t border-border">
            <div className="space-y-0.5">
              <label className="text-sm font-medium leading-none">Auto-Draft Feature</label>
              <p className="text-sm text-muted-foreground">
                Enable RSS topic subscriptions and automatic draft generation.
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={autoDraftEnabled}
              onClick={() => setAutoDraftEnabled(!autoDraftEnabled)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${autoDraftEnabled ? 'bg-primary' : 'bg-input'}`}
            >
              <span
                className={`pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform ${autoDraftEnabled ? 'translate-x-5' : 'translate-x-0'}`}
              />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium h-10 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50"
            >
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {saving ? 'Saving...' : 'Save'}
            </button>
            {saved && (
              <span className="text-sm text-green-600 dark:text-green-400">
                Saved!
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function TagsSettingsContent() {
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

  if (loading) return <div className="animate-pulse h-32 bg-muted rounded" />

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
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/80" 
            onClick={() => setDialogOpen(false)}
          />
          {/* Dialog */}
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

function TopicsSettingsContent() {
  const { apiBasePath } = useDashboardContext()
  const [topics, setTopics] = useState<Topic[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null)
  const [generating, setGenerating] = useState<string | null>(null)

  // Form state
  const [formName, setFormName] = useState('')
  const [formKeywords, setFormKeywords] = useState('')
  const [formFeeds, setFormFeeds] = useState('')
  const [formFrequency, setFormFrequency] = useState('daily')
  const [formMaxPerPeriod, setFormMaxPerPeriod] = useState(3)
  const [formEssayFocus, setFormEssayFocus] = useState('')
  const [formIsActive, setFormIsActive] = useState(true)

  useEffect(() => {
    fetchTopics()
  }, [apiBasePath])

  async function fetchTopics() {
    const res = await fetch(`${apiBasePath}/topics`)
    if (res.ok) {
      const json = await res.json()
      setTopics(json.data || [])
    }
    setLoading(false)
  }

  function resetForm() {
    setFormName('')
    setFormKeywords('')
    setFormFeeds('')
    setFormFrequency('daily')
    setFormMaxPerPeriod(3)
    setFormEssayFocus('')
    setFormIsActive(true)
  }

  function openEditForm(topic: Topic) {
    setEditingTopic(topic)
    setFormName(topic.name)
    setFormKeywords(JSON.parse(topic.keywords).join(', '))
    setFormFeeds(JSON.parse(topic.rssFeeds).join('\n'))
    setFormFrequency(topic.frequency)
    setFormMaxPerPeriod(topic.maxPerPeriod)
    setFormEssayFocus(topic.essayFocus || '')
    setFormIsActive(topic.isActive)
    setShowForm(true)
  }

  function openNewForm() {
    setEditingTopic(null)
    resetForm()
    setShowForm(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const data = {
      name: formName,
      keywords: formKeywords.split(',').map(k => k.trim()).filter(Boolean),
      rssFeeds: formFeeds.split('\n').map(f => f.trim()).filter(Boolean),
      frequency: formFrequency,
      maxPerPeriod: formMaxPerPeriod,
      essayFocus: formEssayFocus || null,
      isActive: formIsActive,
    }

    const url = editingTopic ? `${apiBasePath}/topics/${editingTopic.id}` : `${apiBasePath}/topics`
    const method = editingTopic ? 'PATCH' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (res.ok) {
      setShowForm(false)
      resetForm()
      setEditingTopic(null)
      fetchTopics()
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this topic? This will also delete associated news items.')) return
    const res = await fetch(`${apiBasePath}/topics/${id}`, { method: 'DELETE' })
    if (res.ok) setTopics(topics.filter(t => t.id !== id))
  }

  async function handleGenerate(topicId: string) {
    setGenerating(topicId)
    try {
      const res = await fetch(`${apiBasePath}/topics/${topicId}/generate`, { method: 'POST' })
      if (res.ok) {
        fetchTopics()
      }
    } finally {
      setGenerating(null)
    }
  }

  if (loading) return <div className="animate-pulse h-32 bg-muted rounded" />

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Topics</h2>
        <button onClick={openNewForm} className="flex items-center gap-1 px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-sm">
          <Plus className="h-4 w-4" /> New Topic
        </button>
      </div>
      <p className="text-muted-foreground text-sm -mt-2">RSS topic subscriptions for auto-generating draft posts.</p>

      {showForm && (
        <div className="border border-border rounded-lg p-4 space-y-4 bg-muted/30">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">{editingTopic ? 'Edit Topic' : 'New Topic'}</h3>
            <button onClick={() => { setShowForm(false); resetForm(); setEditingTopic(null) }} className="text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                value={formName}
                onChange={e => setFormName(e.target.value)}
                required
                className="w-full px-3 py-2 border border-input rounded-md bg-transparent"
                placeholder="e.g. School Lunch Policy"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Keywords (comma-separated)</label>
              <input
                type="text"
                value={formKeywords}
                onChange={e => setFormKeywords(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md bg-transparent"
                placeholder="school lunch, USDA, nutrition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">RSS Feed URLs (one per line)</label>
              <textarea
                value={formFeeds}
                onChange={e => setFormFeeds(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-input rounded-md bg-transparent resize-none font-mono text-sm"
                placeholder="https://example.com/feed.xml"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Frequency</label>
                <select
                  value={formFrequency}
                  onChange={e => setFormFrequency(e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded-md bg-transparent"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="hourly">Hourly</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Max per period</label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={formMaxPerPeriod}
                  onChange={e => setFormMaxPerPeriod(parseInt(e.target.value) || 3)}
                  className="w-full px-3 py-2 border border-input rounded-md bg-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Essay Focus (optional)</label>
              <textarea
                value={formEssayFocus}
                onChange={e => setFormEssayFocus(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-input rounded-md bg-transparent resize-none"
                placeholder="Specific angle or perspective for essays on this topic"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formIsActive}
                onChange={e => setFormIsActive(e.target.checked)}
              />
              <label htmlFor="isActive" className="text-sm">Active</label>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded-md">
                {editingTopic ? 'Update' : 'Create'}
              </button>
              <button type="button" onClick={() => { setShowForm(false); resetForm(); setEditingTopic(null) }} className="px-4 py-2 border border-input rounded-md">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
      
      <div className="border border-border rounded-lg divide-y divide-border">
        {topics.map(topic => {
          const keywords = JSON.parse(topic.keywords) as string[]
          const feeds = JSON.parse(topic.rssFeeds) as string[]
          return (
            <div key={topic.id} className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{topic.name}</p>
                    {!topic.isActive && <span className="text-xs bg-muted px-1.5 py-0.5 rounded">Paused</span>}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {keywords.slice(0, 3).join(', ')}{keywords.length > 3 && ` +${keywords.length - 3}`}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {feeds.length} feed{feeds.length !== 1 ? 's' : ''} · {topic.frequency} · {topic._count?.posts ?? 0} posts
                    {topic.lastRunAt && ` · Last run: ${new Date(topic.lastRunAt).toLocaleDateString()}`}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleGenerate(topic.id)}
                    disabled={generating !== null}
                    className="p-1.5 text-muted-foreground hover:text-foreground disabled:opacity-50"
                    title="Generate now"
                  >
                    <Play className={`h-4 w-4 ${generating === topic.id ? 'animate-pulse' : ''}`} />
                  </button>
                  <button onClick={() => openEditForm(topic)} className="p-1.5 text-muted-foreground hover:text-foreground">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleDelete(topic.id)} className="p-1.5 text-red-500 hover:text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )
        })}
        {topics.length === 0 && (
          <p className="p-4 text-muted-foreground text-center">No topics configured</p>
        )}
      </div>
    </div>
  )
}

interface PostWithRevisions {
  id: string
  title: string
  slug: string
  status: string
  updatedAt: string
  _count?: { revisions: number }
}

const POSTS_PER_PAGE = 25

function PostsSettingsContent() {
  const { apiBasePath, navigate } = useDashboardContext()
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

  // Pagination component matching blog's shadcn style
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

  if (loading && posts.length === 0) return <div className="animate-pulse h-32 bg-muted rounded" />

  return (
    <div>
      {/* Header - matches AdminPageHeader pattern */}
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
          {/* Desktop Table - matches AdminTable */}
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
                                href={`/e/${post.slug}`}
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

          {/* Mobile List - matches AdminTable mobile view */}
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
                          href={`/e/${post.slug}`}
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

      {/* Bottom Pagination */}
      <PaginationControls position="bottom" />
    </div>
  )
}

const REVISIONS_PER_PAGE = 25

function RevisionsSettingsContent() {
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

  // Pagination component matching blog's shadcn style
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

  if (loading && revisions.length === 0) return <div className="animate-pulse h-32 bg-muted rounded" />

  return (
    <div>
      {/* Header - matches AdminPageHeader pattern */}
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
          {/* Desktop Table - matches AdminTable */}
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

          {/* Mobile List - matches AdminTable mobile view */}
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

      {/* Bottom Pagination */}
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

function RevisionDetailContent({ revisionId }: { revisionId: string }) {
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
        <div className="h-6 w-32 bg-muted rounded animate-pulse" />
        <div className="h-64 bg-muted rounded animate-pulse" />
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
      {/* Header */}
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

      {/* Metadata */}
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

      {/* Content Preview */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Content</h3>
        <div className="rounded-lg border bg-muted/30 p-4 max-h-96 overflow-auto">
          <pre className="text-sm whitespace-pre-wrap font-mono">{revision.markdown}</pre>
        </div>
      </div>
    </div>
  )
}

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

function CommentsSettingsContent() {
  const { apiBasePath, navigate, basePath } = useDashboardContext()
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

  if (loading && comments.length === 0) return <div className="animate-pulse h-32 bg-muted rounded" />

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
