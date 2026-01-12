import { useEffect, useRef } from 'react'

interface KeyboardShortcut {
  key: string
  metaKey?: boolean
  ctrlKey?: boolean
  shiftKey?: boolean
  action: () => void
  description?: string
}

export function useKeyboard(shortcuts: KeyboardShortcut[], enabled: boolean = true) {
  // Use ref to avoid effect re-running when shortcuts array reference changes
  const shortcutsRef = useRef(shortcuts)
  shortcutsRef.current = shortcuts

  useEffect(() => {
    if (!enabled) return

    function handleKeyDown(event: KeyboardEvent) {
      // Don't trigger shortcuts when typing in inputs
      const target = event.target as HTMLElement
      const isTyping = 
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      
      if (isTyping) {
        // Allow Escape always, and Cmd+/ or Cmd+' for navigation
        const hasMeta = event.metaKey || event.ctrlKey
        const isEscape = event.key === 'Escape'
        const isNavShortcut = hasMeta && (event.key === '/' || event.key === "'")
        if (!isEscape && !isNavShortcut) {
          return
        }
      }

      for (const shortcut of shortcutsRef.current) {
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
