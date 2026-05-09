'use client'

import { useState, useEffect, useCallback } from 'react'
import { Copy, Loader2, Trash2, Ban } from 'lucide-react'
import { useDashboardContext } from '../../context'
import { Skeleton } from '../../components/Skeleton'
import { FormInput, FormButton } from '../../components/Form'

interface ApiKey {
  id: string
  name: string
  prefix: string
  ownerUserId: string | null
  createdAt: string
  lastUsedAt: string | null
  revokedAt: string | null
}

interface AuditEntry {
  id: string
  apiKeyId: string | null
  apiKeyName: string
  method: string
  path: string
  postId: string | null
  status: number
  ip: string | null
  userAgent: string | null
  createdAt: string
}

const PUBLIC_API_BASE = '/writer/api/v1'

export function ApiKeysSettings() {
  const { apiBasePath } = useDashboardContext()

  const [keys, setKeys] = useState<ApiKey[]>([])
  const [audit, setAudit] = useState<AuditEntry[]>([])
  const [auditTotal, setAuditTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  const [newKeyName, setNewKeyName] = useState('')
  const [creating, setCreating] = useState(false)
  const [createdPlaintext, setCreatedPlaintext] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadKeys = useCallback(async () => {
    const res = await fetch(`${apiBasePath}/api-keys`)
    if (!res.ok) return
    const json = await res.json()
    setKeys(json.data || [])
  }, [apiBasePath])

  const loadAudit = useCallback(async () => {
    const res = await fetch(`${apiBasePath}/api-keys/audit?limit=25`)
    if (!res.ok) return
    const json = await res.json()
    setAudit(json.data || [])
    setAuditTotal(json.total || 0)
  }, [apiBasePath])

  useEffect(() => {
    Promise.all([loadKeys(), loadAudit()]).finally(() => setLoading(false))
  }, [loadKeys, loadAudit])

  async function handleCreate() {
    if (!newKeyName.trim()) {
      setError('Please give the key a name.')
      return
    }
    setCreating(true)
    setError(null)
    try {
      const res = await fetch(`${apiBasePath}/api-keys`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newKeyName.trim() }),
      })
      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        throw new Error(json.error || 'Create failed')
      }
      const json = await res.json()
      setCreatedPlaintext(json.data.plaintext)
      setNewKeyName('')
      await loadKeys()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Create failed')
    } finally {
      setCreating(false)
    }
  }

  async function handleRevoke(id: string) {
    if (!confirm('Revoke this key? Calls using it will start failing immediately.')) return
    const res = await fetch(`${apiBasePath}/api-keys/${id}/revoke`, { method: 'POST' })
    if (res.ok) await loadKeys()
  }

  async function handleDelete(id: string) {
    if (!confirm('Permanently delete this key? Audit log entries will retain the key name.')) return
    const res = await fetch(`${apiBasePath}/api-keys/${id}`, { method: 'DELETE' })
    if (res.ok) await loadKeys()
  }

  async function copyToClipboard(text: string) {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // ignore — clipboard not available
    }
  }

  function formatDate(value: string | null) {
    if (!value) return '—'
    const d = new Date(value)
    return d.toLocaleString()
  }

  function statusLabel(key: ApiKey): { label: string; tone: 'active' | 'revoked' } {
    if (key.revokedAt) return { label: 'Revoked', tone: 'revoked' }
    return { label: 'Active', tone: 'active' }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-7 w-32" />
        <Skeleton className="h-32" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold">API Keys</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Bearer-token credentials for the public API at{' '}
          <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{PUBLIC_API_BASE}</code>.
          Each call is recorded in the audit log below.
        </p>
      </div>

      {/* Create form */}
      <section className="border border-border rounded-lg p-4 space-y-3">
        <div className="font-medium">Create a new key</div>
        <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
          <div className="flex-1">
            <FormInput
              label="Name"
              placeholder="e.g. Webflow ingest"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              disabled={creating}
            />
          </div>
          <FormButton onClick={handleCreate} loading={creating}>
            {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create key'}
          </FormButton>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </section>

      {/* One-time plaintext reveal */}
      {createdPlaintext && (
        <section className="border border-amber-500/40 bg-amber-500/5 rounded-lg p-4 space-y-3">
          <div className="font-medium">Copy this token now — you won't see it again.</div>
          <p className="text-sm text-muted-foreground">
            Store it somewhere safe (1Password, env var, etc.). The dashboard only shows the prefix from now on.
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 font-mono text-sm bg-background border border-border rounded px-3 py-2 break-all">
              {createdPlaintext}
            </code>
            <button
              type="button"
              onClick={() => copyToClipboard(createdPlaintext)}
              className="px-3 py-2 border border-border rounded hover:bg-accent flex items-center gap-1.5 text-sm"
            >
              <Copy className="w-3.5 h-3.5" />
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
          <button
            type="button"
            onClick={() => setCreatedPlaintext(null)}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            I've stored it — dismiss
          </button>
        </section>
      )}

      {/* Keys table */}
      <section>
        <h3 className="text-sm font-semibold mb-3">Existing keys</h3>
        {keys.length === 0 ? (
          <p className="text-sm text-muted-foreground">No keys yet. Create one above to get started.</p>
        ) : (
          <div className="border border-border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-muted-foreground">
                <tr>
                  <th className="text-left px-4 py-2 font-medium">Name</th>
                  <th className="text-left px-4 py-2 font-medium">Prefix</th>
                  <th className="text-left px-4 py-2 font-medium">Created</th>
                  <th className="text-left px-4 py-2 font-medium">Last used</th>
                  <th className="text-left px-4 py-2 font-medium">Status</th>
                  <th className="text-right px-4 py-2 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {keys.map((key) => {
                  const status = statusLabel(key)
                  return (
                    <tr key={key.id} className="border-t border-border">
                      <td className="px-4 py-2 font-medium">{key.name}</td>
                      <td className="px-4 py-2 font-mono text-xs">{key.prefix}…</td>
                      <td className="px-4 py-2 text-muted-foreground">{formatDate(key.createdAt)}</td>
                      <td className="px-4 py-2 text-muted-foreground">{formatDate(key.lastUsedAt)}</td>
                      <td className="px-4 py-2">
                        <span
                          className={
                            status.tone === 'active'
                              ? 'inline-flex items-center px-2 py-0.5 text-xs rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                              : 'inline-flex items-center px-2 py-0.5 text-xs rounded-full bg-muted text-muted-foreground'
                          }
                        >
                          {status.label}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-2 justify-end">
                          {!key.revokedAt && (
                            <button
                              type="button"
                              onClick={() => handleRevoke(key.id)}
                              className="text-xs px-2 py-1 border border-border rounded hover:bg-accent flex items-center gap-1"
                              title="Revoke"
                            >
                              <Ban className="w-3 h-3" /> Revoke
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDelete(key.id)}
                            className="text-xs px-2 py-1 border border-border rounded hover:bg-destructive/10 hover:text-destructive flex items-center gap-1"
                            title="Delete"
                          >
                            <Trash2 className="w-3 h-3" /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Quick reference */}
      <section className="border border-border rounded-lg p-4 space-y-3">
        <h3 className="text-sm font-semibold">Quick start</h3>
        <p className="text-sm text-muted-foreground">
          Once you have a key, every endpoint accepts it via the standard bearer header:
        </p>
        <pre className="text-xs bg-muted/50 border border-border rounded p-3 overflow-x-auto">
{`curl -H "Authorization: Bearer ab_live_…" \\
  ${PUBLIC_API_BASE}/posts

curl -H "Authorization: Bearer ab_live_…" \\
  -H "Content-Type: application/json" \\
  -d '{"title":"Hello","markdown":"# hi"}' \\
  ${PUBLIC_API_BASE}/posts

curl -H "Authorization: Bearer ab_live_…" \\
  -H "Content-Type: application/json" \\
  -d '{"prompt":"Essay about coffee","wordCount":600}' \\
  ${PUBLIC_API_BASE}/ai/generate`}
        </pre>
        <p className="text-xs text-muted-foreground">
          Full endpoint reference: posts CRUD + publish/unpublish/restore, tags, revisions, auto-draft, and every AI mode (generate, raw, plan, expand-plan, rewrite, chat, agent).
        </p>
      </section>

      {/* Audit log */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold">Recent activity</h3>
          <span className="text-xs text-muted-foreground">{auditTotal} total entries</span>
        </div>
        {audit.length === 0 ? (
          <p className="text-sm text-muted-foreground">No API calls yet.</p>
        ) : (
          <div className="border border-border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-muted-foreground">
                <tr>
                  <th className="text-left px-4 py-2 font-medium">When</th>
                  <th className="text-left px-4 py-2 font-medium">Key</th>
                  <th className="text-left px-4 py-2 font-medium">Method</th>
                  <th className="text-left px-4 py-2 font-medium">Path</th>
                  <th className="text-left px-4 py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {audit.map((entry) => (
                  <tr key={entry.id} className="border-t border-border">
                    <td className="px-4 py-2 text-muted-foreground whitespace-nowrap">{formatDate(entry.createdAt)}</td>
                    <td className="px-4 py-2">{entry.apiKeyName}</td>
                    <td className="px-4 py-2 font-mono text-xs">{entry.method}</td>
                    <td className="px-4 py-2 font-mono text-xs">{entry.path}</td>
                    <td className="px-4 py-2">
                      <span
                        className={
                          entry.status >= 400
                            ? 'text-destructive font-mono text-xs'
                            : 'text-emerald-700 dark:text-emerald-400 font-mono text-xs'
                        }
                      >
                        {entry.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
