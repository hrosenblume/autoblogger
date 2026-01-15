import { useEffect, useRef } from 'react'

interface KeyboardShortcut {
  key: string
  metaKey?: boolean
  ctrlKey?: boolean
  shiftKey?: boolean
  altKey?: boolean
  action: () => void
  description?: string
  allowInInput?: boolean  // If true, fires even when typing in inputs
}

export function useKeyboard(shortcuts: KeyboardShortcut[], enabled: boolean = true) {
  // Use ref to avoid effect re-running when shortcuts array reference changes
  const shortcutsRef = useRef(shortcuts)
  shortcutsRef.current = shortcuts

  useEffect(() => {
    if (!enabled) return

    function handleKeyDown(event: KeyboardEvent) {
      // Check if user is typing in an input
      const target = event.target as HTMLElement
      const isTyping = 
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable

      // Check if event is inside a dialog/modal - let the modal handle its own Escape
      const isInDialog = target && (
        target.closest('[role="dialog"]') ||
        target.closest('[role="alertdialog"]') ||
        target.closest('[data-radix-dialog-content]') ||
        target.closest('[data-radix-alert-dialog-content]')
      )

      for (const shortcut of shortcutsRef.current) {
        // Skip if typing and shortcut doesn't allow it
        if (isTyping && !shortcut.allowInInput) continue

        // Skip Escape handling if inside a dialog - let the dialog close first
        if (shortcut.key === 'Escape' && isInDialog) continue

        const metaMatch = shortcut.metaKey ? event.metaKey || event.ctrlKey : true
        const ctrlMatch = shortcut.ctrlKey ? event.ctrlKey : true
        const shiftMatch = shortcut.shiftKey ? event.shiftKey : !event.shiftKey
        const altMatch = shortcut.altKey ? event.altKey : !event.altKey
        
        // Check both e.key and e.code for matching
        // When Alt/Option is pressed on Mac, the key character changes (e.g., m → µ)
        const keyLower = event.key.toLowerCase()
        const codeLower = event.code.toLowerCase()
        const targetKey = shortcut.key.toLowerCase()
        const keyMatch = keyLower === targetKey || 
          (shortcut.altKey && codeLower === `key${targetKey}`)

        if (keyMatch && metaMatch && ctrlMatch && shiftMatch && altMatch) {
          event.preventDefault()
          shortcut.action()
          break
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [enabled])
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
      allowInInput: true,
      action: () => options.onToggleView?.(),
      description: 'Toggle view',
    },
    {
      key: "'",
      metaKey: true,
      allowInInput: true,
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
      allowInInput: true,
      action: () => options.onEscape?.(),
      description: 'Go back',
    },
  ]

  useKeyboard(shortcuts, true)
}
