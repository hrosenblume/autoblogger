'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { useDashboardContext } from '../../context'

export function GeneralSettings() {
  const { apiBasePath, sharedData, refetchSharedData } = useDashboardContext()
  const [postUrlPattern, setPostUrlPattern] = useState(sharedData?.settings?.postUrlPattern ?? '/e/{slug}')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSave() {
    setSaving(true)
    setSaved(false)
    await fetch(`${apiBasePath}/settings`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postUrlPattern }),
    })
    setSaving(false)
    setSaved(true)
    await refetchSharedData()
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold">General Settings</h2>
        <p className="text-sm text-muted-foreground">Configure site-wide settings.</p>
      </div>

      {/* Post URL Pattern Card */}
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="p-6 space-y-4">
          <div>
            <h3 className="text-base font-medium">Post URLs</h3>
            <p className="text-sm text-muted-foreground">Configure the URL pattern for published posts.</p>
          </div>

          <div className="space-y-2">
            <label htmlFor="postUrlPattern" className="text-sm font-medium leading-none">
              URL Pattern
            </label>
            <input
              id="postUrlPattern"
              type="text"
              value={postUrlPattern}
              onChange={(e) => setPostUrlPattern(e.target.value)}
              placeholder="/e/{slug}"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <p className="text-sm text-muted-foreground">
              Use <code className="px-1 py-0.5 bg-muted rounded text-xs">{'{slug}'}</code> as a placeholder for the post slug. Example: <code className="px-1 py-0.5 bg-muted rounded text-xs">/blog/{'{slug}'}</code>
            </p>
          </div>
        </div>
      </div>

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
