'use client'

import { cn } from '../../../lib/cn'
import { Skeleton } from '../Skeleton'

interface ToolbarButtonProps {
  onClick: () => void
  active?: boolean
  disabled?: boolean
  children: React.ReactNode
  title?: string
}

export function ToolbarButton({ onClick, active, disabled, children, title }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      tabIndex={-1}
      className={cn(
        'px-3 py-2 md:px-2.5 md:py-1.5 text-base md:text-sm font-medium rounded transition-colors shrink-0',
        'flex items-center justify-center min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0',
        'active:bg-accent md:hover:bg-accent',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        active && 'bg-accent text-accent-foreground',
        !active && 'text-muted-foreground'
      )}
    >
      {children}
    </button>
  )
}

export function Divider() {
  return <div className="w-px h-6 bg-border mx-1" />
}

/** Skeleton placeholder for a toolbar button - matches ToolbarButton dimensions */
export function SkeletonButton() {
  return <Skeleton className="h-7 w-7 shrink-0" />
}
