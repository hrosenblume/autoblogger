/**
 * Semantic color constants for autoblogger UI primitives.
 * These are hardcoded values that replace CSS variables (--ab-*),
 * eliminating the need for host apps to import autoblogger.css for these colors.
 */

export const semanticColors = {
  success: { light: '#16a34a', dark: '#4ade80' },  // green-600 / green-400
  successMuted: { light: '#22c55e', dark: '#22c55e' },  // green-500
  warning: { light: '#d97706', dark: '#fbbf24' },  // amber-600 / amber-400
  active: { light: '#3b82f6', dark: '#60a5fa' },   // blue-500 / blue-400
  neutral: { light: '#6b7280', dark: '#9ca3af' },  // gray-500 / gray-400
  neutralStrong: { light: '#4b5563', dark: '#9ca3af' },  // gray-600 / gray-400
  neutralBorder: { light: '#e5e7eb', dark: '#374151' },  // gray-200 / gray-700
  neutralSubtle: { light: '#f3f4f6', dark: '#1f2937' },  // gray-100 / gray-800
  surfaceInput: { light: '#ffffff', dark: '#111827' },   // white / gray-900
  highlight: { light: '#fefce8', dark: 'rgba(113, 63, 18, 0.2)' },  // yellow-50
  highlightStrong: { light: '#fef9c3', dark: 'rgba(113, 63, 18, 0.3)' },  // yellow-100
  highlightBorder: { light: '#facc15', dark: '#ca8a04' },  // yellow-400 / yellow-600
  placeholder: { light: '#d1d5db', dark: '#374151' },  // gray-300 / gray-700
} as const

export type SemanticColorName = keyof typeof semanticColors
export type ResolvedTheme = 'light' | 'dark'

/**
 * Get a semantic color value for the given theme.
 */
export function getColor(name: SemanticColorName, theme: ResolvedTheme): string {
  return semanticColors[name][theme]
}

/**
 * Get a semantic color with opacity (returns rgba string).
 */
export function getColorWithOpacity(name: SemanticColorName, theme: ResolvedTheme, opacity: number): string {
  const hex = semanticColors[name][theme]
  
  // Handle rgba values (already have opacity capability)
  if (hex.startsWith('rgba')) {
    // Extract the rgb part and apply new opacity
    const match = hex.match(/rgba?\(([^)]+)\)/)
    if (match) {
      const parts = match[1].split(',').map(s => s.trim())
      if (parts.length >= 3) {
        return `rgba(${parts[0]}, ${parts[1]}, ${parts[2]}, ${opacity})`
      }
    }
    return hex
  }
  
  // Convert hex to rgba
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${opacity})`
}
