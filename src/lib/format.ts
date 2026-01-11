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
