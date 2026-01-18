'use client'

import { useTheme } from '../hooks/useTheme'
import { getColor } from './colors'

interface HighlightedQuoteProps {
  children: React.ReactNode
  className?: string
}

/**
 * Self-contained highlighted quote box for displaying quoted text.
 * Used in comments to show the text being commented on.
 */
export function HighlightedQuote({ children, className = '' }: HighlightedQuoteProps) {
  const { resolvedTheme } = useTheme()
  
  return (
    <div 
      className={`px-2 py-1 rounded text-sm italic line-clamp-2 ${className}`}
      style={{
        backgroundColor: getColor('highlightStrong', resolvedTheme),
        color: getColor('neutralStrong', resolvedTheme),
      }}
    >
      {children}
    </div>
  )
}
