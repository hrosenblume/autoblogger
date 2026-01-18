'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check } from 'lucide-react'
import type { AIModelOption } from '../../lib/models'

interface ModelSelectorProps {
  models: AIModelOption[]
  selectedModel: string
  onModelChange: (id: string) => void
  currentModel?: AIModelOption
}

export function ModelSelector({
  models,
  selectedModel,
  onModelChange,
  currentModel,
}: ModelSelectorProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const displayModel = currentModel ?? models.find(m => m.id === selectedModel)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-1 px-2.5 py-1 text-sm font-medium rounded-full bg-muted text-muted-foreground transition-colors"
      >
        {displayModel?.name || 'Select model'}
        <ChevronDown className="w-3 h-3 opacity-60" />
      </button>
      {open && (
        <div className="absolute bottom-full left-0 mb-1 min-w-[180px] bg-popover border border-border rounded-lg shadow-lg z-[100] py-1">
          {models.map(model => (
            <button
              key={model.id}
              onClick={() => { onModelChange(model.id); setOpen(false) }}
              className="w-full px-3 py-2 text-left text-sm hover:bg-accent flex items-center justify-between"
            >
              <span>{model.name}</span>
              {selectedModel === model.id && <Check className="w-4 h-4" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
