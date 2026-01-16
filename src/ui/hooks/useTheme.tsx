'use client'

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'

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

export function AutobloggerThemeProvider({ children, className, onContainerRef }: AutobloggerThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>('system')
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('light')
  const [mounted, setMounted] = useState(false)
  const [containerEl, setContainerEl] = useState<HTMLDivElement | null>(null)

  // Initialize theme from localStorage on mount
  useEffect(() => {
    const stored = getStoredTheme()
    setThemeState(stored)
    setResolvedTheme(resolveTheme(stored))
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

  // Apply .dark class to container element (for ab-dark: variant)
  useEffect(() => {
    if (!containerEl) return
    
    if (resolvedTheme === 'dark') {
      containerEl.classList.add('dark')
    } else {
      containerEl.classList.remove('dark')
    }
  }, [resolvedTheme, containerEl])

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme)
    setResolvedTheme(resolveTheme(newTheme))
    
    try {
      localStorage.setItem(STORAGE_KEY, newTheme)
    } catch {
      // localStorage not available
    }
  }, [])

  const handleContainerRef = useCallback((el: HTMLDivElement | null) => {
    setContainerEl(el)
    onContainerRef?.(el)
  }, [onContainerRef])

  // Don't render children until mounted to avoid hydration mismatch
  // But we still need to render the context provider
  const value: ThemeContextValue = {
    theme: mounted ? theme : 'system',
    resolvedTheme: mounted ? resolvedTheme : 'light',
    setTheme,
  }

  const darkClass = mounted && resolvedTheme === 'dark' ? 'dark' : ''
  const combinedClassName = ['autoblogger', darkClass, className].filter(Boolean).join(' ')

  return (
    <ThemeContext.Provider value={value}>
      <div 
        ref={handleContainerRef}
        className={combinedClassName}
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
