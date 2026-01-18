/**
 * Theme color constants for autoblogger
 * 
 * These values are the source of truth for theme colors.
 * The CSS file (autoblogger.css) uses the same values but can't import from TS.
 */

export const THEME_COLORS = {
  light: {
    background: '#ffffff',
  },
  dark: {
    background: 'hsl(240 10% 3.9%)',
  },
} as const

export type ThemeMode = keyof typeof THEME_COLORS

/** Get background color for a theme */
export const getThemeBackground = (theme: ThemeMode): string =>
  THEME_COLORS[theme].background
