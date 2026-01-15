'use client'

import { useKeyboard } from '../hooks/useKeyboard'

interface GlobalShortcutsProps {
  /** Path to navigate to when Cmd+/ is pressed (default: /writer) */
  writerPath?: string
}

/**
 * Global keyboard shortcuts for use outside the dashboard.
 * Add this to your root layout to enable Cmd+/ navigation to the writer.
 * 
 * Zero-config: just add <GlobalShortcuts /> to your root layout.
 */
export function GlobalShortcuts({ writerPath = '/writer' }: GlobalShortcutsProps = {}) {
  useKeyboard([
    {
      key: '/',
      metaKey: true,
      allowInInput: true,
      action: () => {
        window.location.href = writerPath
      },
    },
  ])

  return null
}
