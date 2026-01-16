'use client'

import { useState, useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { useAutobloggerTheme } from '../hooks/useTheme'
import { cn } from '../../lib/cn'

interface AutobloggerPortalProps {
  children: ReactNode
  /** Additional classes for the portal container */
  className?: string
  /** Custom styles for the portal container */
  style?: React.CSSProperties
}

/**
 * Portal component that renders children to document.body while maintaining
 * autoblogger theme context (including dark mode).
 * 
 * Use this instead of raw createPortal to ensure portaled content
 * respects the current theme.
 */
export function AutobloggerPortal({ children, className, style }: AutobloggerPortalProps) {
  const { resolvedTheme } = useAutobloggerTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  // The wrapper provides theme context (CSS variables + dark class) for portaled content.
  // Children use position:fixed so they position themselves relative to the viewport.
  return createPortal(
    <div 
      className={cn('autoblogger', resolvedTheme === 'dark' && 'dark', className)}
      style={style}
    >
      {children}
    </div>,
    document.body
  )
}
