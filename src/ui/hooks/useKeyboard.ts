import { useEffect, useCallback } from 'react'

interface KeyboardShortcut {
  key: string
  metaKey?: boolean
  ctrlKey?: boolean
  shiftKey?: boolean
  action: () => void
  description?: string
}

export function useKeyboard(shortcuts: KeyboardShortcut[], enabled: boolean = true) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return

      // Don't trigger shortcuts when typing in inputs
      const target = event.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        // Allow certain shortcuts even in inputs
        const allowInInputs = ['Escape']
        if (!allowInInputs.includes(event.key)) {
          return
        }
      }

      for (const shortcut of shortcuts) {
        const metaMatch = shortcut.metaKey ? event.metaKey || event.ctrlKey : true
        const ctrlMatch = shortcut.ctrlKey ? event.ctrlKey : true
        const shiftMatch = shortcut.shiftKey ? event.shiftKey : !event.shiftKey
        const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase()

        if (keyMatch && metaMatch && ctrlMatch && shiftMatch) {
          event.preventDefault()
          shortcut.action()
          break
        }
      }
    },
    [shortcuts, enabled]
  )

  useEffect(() => {
    if (!enabled) return

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown, enabled])
}

// Dashboard-specific shortcuts
export function useDashboardKeyboard(options: {
  basePath: string
  onToggleView?: () => void
  onToggleSettings?: () => void
  onNewPost?: () => void
  onEscape?: () => void
}) {
  const shortcuts: KeyboardShortcut[] = [
    {
      key: '/',
      metaKey: true,
      action: () => options.onToggleView?.(),
      description: 'Toggle view',
    },
    {
      key: "'",
      metaKey: true,
      action: () => options.onToggleSettings?.(),
      description: 'Toggle settings',
    },
    {
      key: 'n',
      action: () => options.onNewPost?.(),
      description: 'New post',
    },
    {
      key: 'Escape',
      action: () => options.onEscape?.(),
      description: 'Go back',
    },
  ]

  useKeyboard(shortcuts, true)
}
