'use client'

import { useState } from 'react'
import { ChevronDown, RotateCcw } from 'lucide-react'

interface CollapsibleTemplateProps {
  label: string
  value: string | null
  defaultValue: string
  onChange: (v: string) => void
  onReset: () => void
  placeholders: string
  disabled?: boolean
}

export function CollapsibleTemplate({ 
  label, 
  value, 
  defaultValue, 
  onChange, 
  onReset, 
  placeholders, 
  disabled 
}: CollapsibleTemplateProps) {
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
