const MINUTE = 60_000, HOUR = 3_600_000, DAY = 86_400_000

/**
 * Format a date as relative time (e.g., "5m ago", "2h ago", "Yesterday")
 */
export function formatRelativeTime(isoDate: string): string {
  const date = new Date(isoDate)
  const diffMs = Date.now() - date.getTime()
  const mins = Math.floor(diffMs / MINUTE)
  const hours = Math.floor(diffMs / HOUR)
  const days = Math.floor(diffMs / DAY)
  
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days}d ago`
  return date.toLocaleDateString()
}

/**
 * Format a date for display
 */
export function formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === 'string' ? new Date(date) : date
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }
  
  return d.toLocaleDateString('en-US', options || defaultOptions)
}

/**
 * Format saved time for display (e.g., "just now", "5m ago", "2:30 PM")
 */
export function formatSavedTime(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffMs / MINUTE)
  
  // Show relative time for recent saves
  if (diffSecs < 10) return 'just now'
  if (diffSecs < 60) return `${diffSecs}s ago`
  if (diffMins < 60) return `${diffMins}m ago`
  
  // Show clock time for today
  const isToday = date.toDateString() === now.toDateString()
  if (isToday) {
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
  }
  
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

/**
 * Count words in text
 */
export function countWords(text?: string | null): number {
  if (!text) return 0
  return text.split(/\s+/).filter(Boolean).length
}

/**
 * Truncate text to a maximum length
 */
export function truncate(text: string, maxLength: number): string {
  // Strip markdown formatting for description
  const stripped = text
    .replace(/#+\s/g, '')
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/`/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\n+/g, ' ')
    .trim()
  
  if (stripped.length <= maxLength) return stripped
  
  return stripped.slice(0, maxLength - 3).trim() + '...'
}
