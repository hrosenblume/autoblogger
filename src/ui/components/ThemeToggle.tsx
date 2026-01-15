'use client'

import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import { SunIcon, MoonIcon } from './Icons'
import { cn } from '../../lib/cn'

interface ThemeToggleProps {
  className?: string
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const handleToggle = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={cn(
        'w-9 h-9 rounded-md border border-border',
        'active:bg-accent md:hover:bg-accent',
        'text-muted-foreground',
        'flex items-center justify-center',
        className
      )}
      aria-label="Toggle dark mode"
    >
      <div className="w-4 h-4 transition-transform duration-200 active:scale-90">
        {!mounted ? (
          <div className="w-4 h-4" />
        ) : theme === 'dark' ? (
          <SunIcon className="w-4 h-4" />
        ) : (
          <MoonIcon className="w-4 h-4" />
        )}
      </div>
    </button>
  )
}
