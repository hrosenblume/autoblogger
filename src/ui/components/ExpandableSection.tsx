'use client'

import { useState, ReactNode } from 'react'

interface ExpandableSectionProps {
  /** Section title displayed in the header */
  title: string
  /** Optional summary text displayed on the right side of the header */
  summary?: string
  /** Whether the section is expanded by default */
  defaultExpanded?: boolean
  /** Controlled expanded state (makes component controlled) */
  expanded?: boolean
  /** Callback when expanded state changes */
  onExpandedChange?: (expanded: boolean) => void
  /** Content to render when expanded */
  children: ReactNode
  /** Additional className for the container */
  className?: string
}

export function ExpandableSection({
  title,
  summary,
  defaultExpanded = false,
  expanded: controlledExpanded,
  onExpandedChange,
  children,
  className = '',
}: ExpandableSectionProps) {
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded)
  
  // Support both controlled and uncontrolled modes
  const isControlled = controlledExpanded !== undefined
  const isExpanded = isControlled ? controlledExpanded : internalExpanded
  
  const handleToggle = () => {
    const newValue = !isExpanded
    if (!isControlled) {
      setInternalExpanded(newValue)
    }
    onExpandedChange?.(newValue)
  }

  return (
    <div className={className}>
      <button
        type="button"
        onClick={handleToggle}
        className="flex items-center justify-between gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-full"
      >
        <span className="flex items-center gap-2">
          <span>{title}</span>
          {summary && (
            <span className="text-xs text-muted-foreground/70">{summary}</span>
          )}
        </span>
        <svg 
          className={`h-4 w-4 shrink-0 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isExpanded && (
        <div className="mt-4 space-y-3">
          {children}
        </div>
      )}
    </div>
  )
}
