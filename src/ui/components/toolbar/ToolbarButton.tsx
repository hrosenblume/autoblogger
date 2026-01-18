'use client'

import { cn } from '../../../lib/cn'
import { Skeleton } from '../Skeleton'

/** Shared toolbar button styles - use this for any toolbar button */
export const toolbarButtonStyles = {
  base: 'px-3 py-2 md:px-2 md:py-1.5 text-sm font-medium rounded transition-colors shrink-0 flex items-center justify-center',
  interactive: 'active:bg-accent md:hover:bg-accent',
  disabled: 'disabled:opacity-50 disabled:cursor-not-allowed',
  active: 'bg-accent text-accent-foreground',
  inactive: 'text-muted-foreground',
  /** Icon size for toolbar icons - responsive: larger on mobile, smaller on desktop */
  iconSize: 'w-5 h-5 md:w-4 md:h-4',
}

/** Get complete toolbar button className */
export function getToolbarButtonClass(active?: boolean, disabled?: boolean) {
  return cn(
    toolbarButtonStyles.base,
    toolbarButtonStyles.interactive,
    toolbarButtonStyles.disabled,
    active && toolbarButtonStyles.active,
    !active && toolbarButtonStyles.inactive
  )
}

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
      className={getToolbarButtonClass(active, disabled)}
    >
      {children}
    </button>
  )
}

export function Divider() {
  return <div className="w-px h-7 bg-border mx-1.5 shrink-0" />
}

/** Skeleton placeholder for a toolbar button - matches ToolbarButton dimensions */
export function SkeletonButton() {
  return <Skeleton className="h-9 w-9 md:h-7 md:w-8 shrink-0" />
}
