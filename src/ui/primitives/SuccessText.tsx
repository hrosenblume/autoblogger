'use client'

import { useTheme } from '../hooks/useTheme'
import { getColor } from './colors'

interface SuccessTextProps {
  children: React.ReactNode
  className?: string
  /** Use muted variant (green-500 instead of green-600/400) */
  muted?: boolean
}

/**
 * Self-contained success text that doesn't rely on CSS variables.
 * Uses hardcoded colors with theme detection.
 */
export function SuccessText({ children, className = '', muted = false }: SuccessTextProps) {
  const { resolvedTheme } = useTheme()
  
  const colorName = muted ? 'successMuted' : 'success'
  
  return (
    <span 
      className={className}
      style={{ color: getColor(colorName, resolvedTheme) }}
    >
      {children}
    </span>
  )
}
