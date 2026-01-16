'use client'

import { type ReactNode } from 'react'
import { AutobloggerThemeProvider } from '../hooks/useTheme'

interface ThemeProviderProps {
  children: ReactNode
  className?: string
}

export function ThemeProvider({ children, className }: ThemeProviderProps) {
  return (
    <AutobloggerThemeProvider className={className}>
      {children}
    </AutobloggerThemeProvider>
  )
}
