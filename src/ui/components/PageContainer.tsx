'use client'

import { cn } from '../../lib/cn'

interface PageContainerProps {
  children: React.ReactNode
  className?: string
}

/**
 * Shared page container with consistent max-width and padding.
 * Used by WriterDashboard, SettingsPage, and other full-page layouts.
 */
export function PageContainer({ children, className }: PageContainerProps) {
  return (
    <div className={cn('max-w-5xl mx-auto px-6 py-8', className)}>
      {children}
    </div>
  )
}
