'use client'

import { cn } from '../../lib/cn'

interface SkeletonProps {
  className?: string
}

/**
 * Base skeleton component with pulse animation.
 */
export function Skeleton({ className }: SkeletonProps) {
  return <div className={cn('animate-pulse bg-muted rounded', className)} />
}

/**
 * Skeleton for text content with multiple lines.
 */
export function SkeletonText({ 
  lines = 1, 
  className 
}: { 
  lines?: number
  className?: string 
}) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton 
          key={i} 
          className={cn(
            'h-4',
            // Make last line shorter for more natural look
            i === lines - 1 && lines > 1 ? 'w-3/4' : 'w-full'
          )} 
        />
      ))}
    </div>
  )
}

/**
 * Skeleton for toolbar buttons.
 */
export function SkeletonButton({ className }: SkeletonProps) {
  return <Skeleton className={cn('h-8 w-8', className)} />
}

/**
 * Skeleton for cards/panels.
 */
export function SkeletonCard({ className }: SkeletonProps) {
  return <Skeleton className={cn('h-24 w-full rounded-lg', className)} />
}

/**
 * Skeleton for table rows.
 */
export function SkeletonTableRow({ columns = 4 }: { columns?: number }) {
  return (
    <tr>
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  )
}
