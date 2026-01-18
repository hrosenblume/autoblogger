'use client'

import { createContext, useContext, useState, useEffect, useLayoutEffect, useCallback, useRef, type ReactNode } from 'react'
import { getThemeBackground } from '../../lib/theme-constants'
import { repaintIOSSafeArea } from '../../lib/safari-fixes'

type Theme = 'light' | 'dark' | 'system'
type ResolvedTheme = 'light' | 'dark'

interface ThemeContextValue {
  theme: Theme
  resolvedTheme: ResolvedTheme
  setTheme: (theme: Theme) => void
}

const STORAGE_KEY = 'autoblogger-theme'

const ThemeContext = createContext<ThemeContextValue | null>(null)

function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function getStoredTheme(): Theme {
  if (typeof window === 'undefined') return 'system'
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'light' || stored === 'dark' || stored === 'system') {
      return stored
    }
  } catch {
    // localStorage not available
  }
  return 'system'
}

function resolveTheme(theme: Theme): ResolvedTheme {
  if (theme === 'system') {
    return getSystemTheme()
  }
  return theme
}

interface AutobloggerThemeProviderProps {
  children: ReactNode
  /** Additional classes to apply to the container */
  className?: string
  /** Ref callback to get the container element for applying .dark class */
  onContainerRef?: (el: HTMLDivElement | null) => void
}

// Get initial theme synchronously to prevent flash
function getInitialTheme(): { theme: Theme; resolved: ResolvedTheme } {
  if (typeof window === 'undefined') {
    return { theme: 'system', resolved: 'light' }
  }
  const theme = getStoredTheme()
  const resolved = resolveTheme(theme)
  return { theme, resolved }
}

export function AutobloggerThemeProvider({ children, className, onContainerRef }: AutobloggerThemeProviderProps) {
  // Initialize with the correct theme immediately (prevents flash)
  const [initialState] = useState(() => getInitialTheme())
  const [theme, setThemeState] = useState<Theme>(initialState.theme)
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(initialState.resolved)
  const [mounted, setMounted] = useState(false)
  const [containerEl, setContainerEl] = useState<HTMLDivElement | null>(null)
  const initializedRef = useRef(false)

  // Set body background IMMEDIATELY on first client render (before effects)
  // This prevents the flash by setting colors before paint
  if (typeof window !== 'undefined' && !initializedRef.current) {
    initializedRef.current = true
    const bgColor = getThemeBackground(initialState.resolved)
    document.body.style.background = bgColor
    document.documentElement.style.background = bgColor
  }

  // Mark as mounted after first render
  useEffect(() => {
    setMounted(true)
  }, [])

  // Listen for system theme changes
  useEffect(() => {
    if (typeof window === 'undefined') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      if (theme === 'system') {
        setResolvedTheme(getSystemTheme())
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme])

  // Apply .dark class to container element (for theme CSS variables)
  useEffect(() => {
    if (!containerEl) return
    
    if (resolvedTheme === 'dark') {
      containerEl.classList.add('dark')
    } else {
      containerEl.classList.remove('dark')
    }
  }, [resolvedTheme, containerEl])

  // iOS Safari viewport fix: Set body background directly to prevent bleed-through
  // When Safari's address bar animates, gaps can show the underlying body color.
  // We sync body's background with autoblogger's theme to prevent this.
  // Using useLayoutEffect to run synchronously before browser paint.
  const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect
  
  useIsomorphicLayoutEffect(() => {
    if (typeof document === 'undefined' || !mounted) return
    
    const bgColor = getThemeBackground(resolvedTheme)
    
    // Set background on both html and body for full coverage
    document.body.style.background = bgColor
    document.documentElement.style.background = bgColor
    
    return () => {
      // Clear the background styles when autoblogger unmounts
      document.body.style.background = ''
      document.documentElement.style.background = ''
    }
  }, [resolvedTheme, mounted])

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme)
    setResolvedTheme(resolveTheme(newTheme))
    
    try {
      localStorage.setItem(STORAGE_KEY, newTheme)
    } catch {
      // localStorage not available
    }
    
    // iOS Safari safe-area repaint fix
    repaintIOSSafeArea(getThemeBackground(resolveTheme(newTheme)))
  }, [])

  const handleContainerRef = useCallback((el: HTMLDivElement | null) => {
    setContainerEl(el)
    onContainerRef?.(el)
  }, [onContainerRef])

  // Provide actual theme values (initialized synchronously on client)
  const value: ThemeContextValue = {
    theme,
    resolvedTheme,
    setTheme,
  }

  // Use actual resolved theme for classes and attributes (no waiting for mounted)
  const darkClass = resolvedTheme === 'dark' ? 'dark' : ''
  const combinedClassName = ['autoblogger', darkClass, className].filter(Boolean).join(' ')
  const themeAttr = resolvedTheme

  return (
    <ThemeContext.Provider value={value}>
      <div 
        ref={handleContainerRef}
        className={combinedClassName}
        data-autoblogger-root=""
        data-theme={themeAttr}
        suppressHydrationWarning
      >
        {children}
      </div>
    </ThemeContext.Provider>
  )
}

export function useAutobloggerTheme(): ThemeContextValue {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useAutobloggerTheme must be used within AutobloggerThemeProvider')
  }
  return context
}

// For backwards compatibility with components that used useTheme from next-themes
export function useTheme() {
  return useAutobloggerTheme()
}
