'use client'

import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { useDashboardContext } from '../../context'
import { Skeleton } from '../../components/Skeleton'

export function IntegrationsSettings() {
  const { apiBasePath, refetchSharedData } = useDashboardContext()
  
  // Prismic settings state
  const [prismicEnabled, setPrismicEnabled] = useState(false)
  const [prismicRepository, setPrismicRepository] = useState('')
  const [prismicWriteToken, setPrismicWriteToken] = useState('')
  const [prismicDocumentType, setPrismicDocumentType] = useState('autoblog')
  const [prismicSyncMode, setPrismicSyncMode] = useState('stub')
  const [prismicLocale, setPrismicLocale] = useState('en-us')
  const [prismicAutoRename, setPrismicAutoRename] = useState(false)
  const [hasWriteToken, setHasWriteToken] = useState(false)
  const [hasEnvToken, setHasEnvToken] = useState(false)
  const [configRepository, setConfigRepository] = useState<string | null>(null)
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`${apiBasePath}/settings/integrations`)
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(res => {
        const data = res.data?.prismic || {}
        setPrismicEnabled(data.enabled ?? false)
        setPrismicRepository(data.repository || data.configRepository || '')
        setConfigRepository(data.configRepository ?? null)
        setPrismicWriteToken(data.writeToken ?? '')
        setPrismicDocumentType(data.documentType ?? 'autoblog')
        setPrismicSyncMode(data.syncMode ?? 'stub')
        setPrismicLocale(data.locale ?? 'en-us')
        setPrismicAutoRename(data.autoRename ?? false)
        setHasWriteToken(data.hasWriteToken ?? false)
        setHasEnvToken(data.hasEnvToken ?? false)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [apiBasePath])

  async function handleSave() {
    setSaving(true)
    setSaved(false)
    setError('')

    const res = await fetch(`${apiBasePath}/settings/integrations`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prismicEnabled,
        prismicRepository,
        prismicWriteToken,
        prismicDocumentType,
        prismicSyncMode,
        prismicLocale,
        prismicAutoRename,
      }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error || 'Failed to save')
      setSaving(false)
      return
    }

    setSaving(false)
    setSaved(true)
    await refetchSharedData()
    setTimeout(() => setSaved(false), 2000)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-7 w-32" />
        <div className="rounded-lg border bg-card p-6 space-y-4">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold">CMS Integrations</h2>
        <p className="text-sm text-muted-foreground">Connect autoblogger to external CMS systems.</p>
      </div>

      {/* Prismic Integration Card */}
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="p-6 space-y-6">
          {/* Header with toggle */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-medium">Prismic</h3>
              <p className="text-sm text-muted-foreground">Sync posts to Prismic as stub documents.</p>
            </div>
            <button
              onClick={() => setPrismicEnabled(!prismicEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                prismicEnabled ? 'bg-foreground' : 'bg-muted'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-background transition-transform ${
                  prismicEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Settings fields - only show if enabled */}
          {prismicEnabled && (
            <div className="space-y-4 pt-4 border-t border-border">
              {/* Repository */}
              <div className="space-y-2">
                <label htmlFor="prismicRepository" className="text-sm font-medium leading-none">
                  Repository Name
                  {configRepository && prismicRepository === configRepository && (
                    <span className="ml-2 text-xs font-normal text-ab-success">
                      ✓ From config
                    </span>
                  )}
                </label>
                <input
                  id="prismicRepository"
                  type="text"
                  value={prismicRepository}
                  onChange={(e) => setPrismicRepository(e.target.value)}
                  placeholder={configRepository || "my-repo"}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
                <p className="text-sm text-muted-foreground">
                  {configRepository 
                    ? `Detected from your Prismic config. Change if needed.`
                    : <>Your Prismic repository name (e.g., <code className="px-1 py-0.5 bg-muted rounded text-xs">ordo-playground</code>)</>
                  }
                </p>
              </div>

              {/* Write Token */}
              <div className="space-y-2">
                <label htmlFor="prismicWriteToken" className="text-sm font-medium leading-none">
                  Write API Token
                  {hasEnvToken && (
                    <span className="ml-2 text-xs font-normal text-ab-success">
                      ✓ Using PRISMIC_WRITE_TOKEN from env
                    </span>
                  )}
                </label>
                <input
                  id="prismicWriteToken"
                  type="password"
                  value={prismicWriteToken}
                  onChange={(e) => setPrismicWriteToken(e.target.value)}
                  placeholder={hasEnvToken ? 'Using env var (optional override)' : hasWriteToken ? '••••••••••••' : 'Enter token'}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
                <p className="text-sm text-muted-foreground">
                  {hasEnvToken 
                    ? 'Token detected from PRISMIC_WRITE_TOKEN environment variable. Leave blank to use it, or enter a different token to override.'
                    : 'From Prismic Settings > API & Security > Repository Security'
                  }
                </p>
              </div>

              {/* Document Type */}
              <div className="space-y-2">
                <label htmlFor="prismicDocumentType" className="text-sm font-medium leading-none">
                  Document Type
                </label>
                <input
                  id="prismicDocumentType"
                  type="text"
                  value={prismicDocumentType}
                  onChange={(e) => setPrismicDocumentType(e.target.value)}
                  placeholder="autoblog"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
                <p className="text-sm text-muted-foreground">
                  The Prismic custom type to create for synced posts.
                </p>
              </div>

              {/* Sync Mode */}
              <div className="space-y-2">
                <label htmlFor="prismicSyncMode" className="text-sm font-medium leading-none">
                  Sync Mode
                </label>
                <select
                  id="prismicSyncMode"
                  value={prismicSyncMode}
                  onChange={(e) => setPrismicSyncMode(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="stub">Stub (minimal reference data)</option>
                  <option value="full">Full (sync all content)</option>
                </select>
                <p className="text-sm text-muted-foreground">
                  Stub mode creates minimal documents; content is fetched from autoblogger at render time.
                </p>
              </div>

              {/* Locale */}
              <div className="space-y-2">
                <label htmlFor="prismicLocale" className="text-sm font-medium leading-none">
                  Locale
                </label>
                <input
                  id="prismicLocale"
                  type="text"
                  value={prismicLocale}
                  onChange={(e) => setPrismicLocale(e.target.value)}
                  placeholder="en-us"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
                <p className="text-sm text-muted-foreground">
                  The master locale for your Prismic repository.
                </p>
              </div>

              {/* Auto-rename toggle */}
              <div className="flex items-center justify-between pt-2">
                <div>
                  <label htmlFor="prismicAutoRename" className="text-sm font-medium leading-none">
                    Auto-update Document Name
                  </label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Automatically update the Prismic document display name from the post title when publishing.
                  </p>
                </div>
                <button
                  id="prismicAutoRename"
                  onClick={() => setPrismicAutoRename(!prismicAutoRename)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    prismicAutoRename ? 'bg-foreground' : 'bg-muted'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-background transition-transform ${
                      prismicAutoRename ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Save Button */}
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
          <span className="text-sm text-ab-success">
            Saved!
          </span>
        )}
      </div>
    </div>
  )
}
