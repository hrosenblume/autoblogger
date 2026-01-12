'use client'

import { Plus, ChevronLeft, ChevronRight } from 'lucide-react'
import { Skeleton, SkeletonTableRow } from './Skeleton'

// ============================================
// TYPES
// ============================================

export interface Column<T> {
  /** Column key or accessor string */
  key: keyof T | string
  /** Column header text */
  header: string
  /** Custom render function */
  render?: (item: T) => React.ReactNode
  /** Column width class */
  className?: string
}

export interface SettingsListPageProps<T extends { id: string }> {
  /** Page title */
  title: string
  /** List of items to display */
  items: T[]
  /** Loading state */
  loading: boolean
  /** Table column definitions */
  columns: Column<T>[]
  /** Render function for mobile cards */
  renderMobileCard: (item: T, actions: React.ReactNode) => React.ReactNode
  /** Render function for row actions (dropdown menu) */
  renderActions: (item: T) => React.ReactNode
  /** Callback when Add button is clicked */
  onAdd?: () => void
  /** Add button label */
  addLabel?: string
  /** Message when no items */
  emptyMessage?: string
  /** Pagination (optional) */
  pagination?: {
    page: number
    totalPages: number
    onPageChange: (page: number) => void
  }
}

// ============================================
// COMPONENT
// ============================================

export function SettingsListPage<T extends { id: string }>({
  title,
  items,
  loading,
  columns,
  renderMobileCard,
  renderActions,
  onAdd,
  addLabel = 'Add',
  emptyMessage = 'No items yet',
  pagination,
}: SettingsListPageProps<T>) {
  // Loading skeleton
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-7 w-24" />
          {onAdd && <Skeleton className="h-9 w-20" />}
        </div>
        
        {/* Desktop skeleton */}
        <div className="hidden md:block border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                {columns.map((col, i) => (
                  <th key={i} className="px-4 py-3 text-left text-sm font-medium">
                    <Skeleton className="h-4 w-20" />
                  </th>
                ))}
                <th className="px-4 py-3 w-12" />
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4, 5].map(i => (
                <SkeletonTableRow key={i} columns={columns.length + 1} />
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile skeleton */}
        <div className="md:hidden space-y-2">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-20 w-full rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  // Get cell value helper
  const getCellValue = (item: T, col: Column<T>): React.ReactNode => {
    if (col.render) {
      return col.render(item)
    }
    const value = (item as any)[col.key]
    if (value === null || value === undefined) return '—'
    return String(value)
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{title}</h2>
        {onAdd && (
          <button
            onClick={onAdd}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            {addLabel}
          </button>
        )}
      </div>

      {/* Empty state */}
      {items.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          {emptyMessage}
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  {columns.map((col, i) => (
                    <th 
                      key={i} 
                      className={`px-4 py-3 text-left text-sm font-medium text-muted-foreground ${col.className || ''}`}
                    >
                      {col.header}
                    </th>
                  ))}
                  <th className="px-4 py-3 w-12" />
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item.id} className="border-b last:border-0 hover:bg-muted/50">
                    {columns.map((col, i) => (
                      <td key={i} className={`px-4 py-3 text-sm ${col.className || ''}`}>
                        {getCellValue(item, col)}
                      </td>
                    ))}
                    <td className="px-4 py-3 text-right">
                      {renderActions(item)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-2">
            {items.map(item => (
              <div key={item.id}>
                {renderMobileCard(item, renderActions(item))}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => pagination.onPageChange(pagination.page - 1)}
            disabled={pagination.page <= 1}
            className="p-2 rounded-md hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            onClick={() => pagination.onPageChange(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages}
            className="p-2 rounded-md hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  )
}
