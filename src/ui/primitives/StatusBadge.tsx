'use client'

import { useTheme } from '../hooks/useTheme'
import { getColor, getColorWithOpacity } from './colors'

export type BadgeStatus = 'draft' | 'published' | 'deleted' | 'suggested' | 'active' | 'resolved'

interface StatusBadgeProps {
  status: BadgeStatus
  className?: string
  children?: React.ReactNode
}

/**
 * Self-contained status badge that doesn't rely on CSS variables.
 * Uses hardcoded colors with theme detection.
 */
export function StatusBadge({ status, className = '', children }: StatusBadgeProps) {
  const { resolvedTheme } = useTheme()
  
  const getStyles = (): React.CSSProperties => {
    switch (status) {
      case 'draft':
      case 'suggested':
        return {
          backgroundColor: getColorWithOpacity('warning', resolvedTheme, 0.2),
          color: getColor('warning', resolvedTheme),
        }
      case 'published':
      case 'active':
        return {
          backgroundColor: getColorWithOpacity('success', resolvedTheme, 0.2),
          color: getColor('success', resolvedTheme),
        }
      case 'deleted':
        // Use destructive colors - these come from standard Tailwind theme
        return {
          backgroundColor: 'hsl(var(--destructive))',
          color: 'hsl(var(--destructive-foreground))',
        }
      case 'resolved':
        // Use secondary colors - these come from standard Tailwind theme
        return {
          backgroundColor: 'hsl(var(--secondary))',
          color: 'hsl(var(--secondary-foreground))',
        }
      default:
        return {}
    }
  }

  return (
    <span
      className={`text-xs px-1.5 py-0.5 rounded uppercase font-medium ${className}`}
      style={getStyles()}
    >
      {children ?? status}
    </span>
  )
}
