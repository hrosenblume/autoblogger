/**
 * Predefined keyboard shortcuts for the dashboard.
 * These can be used with useKeyboard() hook.
 */
export const SHORTCUTS = {
  THEME_TOGGLE: { key: '.', metaKey: true, allowInInput: true },
  TOGGLE_VIEW: { key: '/', metaKey: true, allowInInput: true },  // essay↔editor, home↔writer
  SETTINGS: { key: ';', metaKey: true, allowInInput: true },  // toggle to/from /settings
  CHAT_TOGGLE: { key: 'k', metaKey: true, allowInInput: true },  // open/close chat panel
  NEW_ARTICLE: { key: 'n' },
  PREV: { key: 'ArrowLeft' },
  NEXT: { key: 'ArrowRight' },
  ESCAPE_BACK: { key: 'Escape', allowInInput: true },  // editor→writer
  TOGGLE_CHAT_MODE: { key: 'a', metaKey: true, shiftKey: true, allowInInput: true },  // Ask↔Agent mode
} as const

export type ShortcutKey = keyof typeof SHORTCUTS
