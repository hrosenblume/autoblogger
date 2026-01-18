'use client'

import { useState, useEffect } from 'react'
import { useAutobloggerTheme } from '../hooks/useTheme'
import { SunIcon, MoonIcon } from './Icons'
import { cn } from '../../lib/cn'

interface ThemeToggleProps {
  className?: string
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useAutobloggerTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const handleToggle = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={cn(
        'w-10 h-10 rounded-md border border-border',
        'active:bg-accent md:hover:bg-accent',
        'text-muted-foreground',
        'flex items-center justify-center',
        className
      )}
      aria-label="Toggle dark mode"
    >
      <div className="w-5 h-5 transition-transform duration-200 active:scale-90">
        {!mounted ? (
          <div className="w-5 h-5" />
        ) : resolvedTheme === 'dark' ? (
          <SunIcon className="w-5 h-5" />
        ) : (
          <MoonIcon className="w-5 h-5" />
        )}
      </div>
    </button>
  )
}
