'use client'

import { useRef, useState, useEffect } from 'react'
import { ChevronLeft, Moon, Sun } from 'lucide-react'
import { useDashboardContext } from '../context'

export interface NavbarProps {
  // Callbacks
  onSignOut?: () => void
  onThemeToggle?: () => void
  // Current theme for icon display
  theme?: 'light' | 'dark'
  // Extra slot for host-app specific buttons (e.g., chat toggle)
  rightSlot?: React.ReactNode
}

export function Navbar({
  onSignOut,
  onThemeToggle,
  theme,
  rightSlot,
}: NavbarProps) {
  const { session, currentPath, navigate, goBack, basePath } = useDashboardContext()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  // Close menu on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [menuOpen])

  // Detect current route state
  const isRoot = currentPath === '/' || currentPath === ''
  const isSettings = currentPath.startsWith('/settings')

  const handleBack = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Blur to clear focus/active state (prevents sticky highlight on mobile)
    e.currentTarget.blur()
    goBack()
  }

  return (
    <header className="border-b border-border bg-background">
      <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Left side: Logo or back button */}
        {isRoot ? (
          <a href={basePath} className="font-medium flex items-center gap-1.5">
            Writer
            <span className="text-xs px-1.5 py-0.5 bg-primary text-primary-foreground rounded">AI</span>
          </a>
        ) : (
          <button
            type="button"
            onClick={handleBack}
            className="h-9 px-3 -ml-3 gap-1.5 inline-flex items-center justify-center text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground touch-manipulation"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back</span>
          </button>
        )}

        {/* Right side: icons and user menu */}
        <div className="flex items-center gap-2">
          {/* Extra slot from host app */}
          {rightSlot}

          {/* Theme toggle */}
          {onThemeToggle && (
            <button
              type="button"
              onClick={onThemeToggle}
              className="w-9 h-9 rounded-md border border-border hover:bg-accent text-muted-foreground flex items-center justify-center"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          )}

          {/* User menu */}
          {session && (
            <div className="relative" ref={menuRef}>
              <button
                ref={triggerRef}
                type="button"
                onClick={() => setMenuOpen(!menuOpen)}
                className="relative w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-sm font-medium text-secondary-foreground hover:ring-2 hover:ring-ring transition-shadow"
              >
                {session.user?.email?.charAt(0).toUpperCase() || '?'}
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-background" />
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-full mt-1 min-w-[180px] bg-popover border border-border rounded-md shadow-lg z-50 p-1">
                  {session.user?.role === 'admin' && (
                    <>
                      {/* Settings toggle */}
                      {!isSettings ? (
                        <button
                          onClick={() => { navigate('/settings'); setMenuOpen(false) }}
                          className="w-full px-3 py-2.5 md:px-2 md:py-1.5 min-h-[44px] md:min-h-0 text-left text-sm rounded-sm hover:bg-accent cursor-default"
                        >
                          Go to settings
                        </button>
                      ) : (
                        <button
                          onClick={() => { navigate('/'); setMenuOpen(false) }}
                          className="w-full px-3 py-2.5 md:px-2 md:py-1.5 min-h-[44px] md:min-h-0 text-left text-sm rounded-sm hover:bg-accent cursor-default"
                        >
                          Back to writer
                        </button>
                      )}

                      <div className="h-px bg-border my-1" />
                    </>
                  )}

                  {/* Back to site */}
                  <a
                    href="/"
                    className="block w-full px-3 py-2.5 md:px-2 md:py-1.5 min-h-[44px] md:min-h-0 text-left text-sm rounded-sm hover:bg-accent cursor-default"
                    onClick={() => setMenuOpen(false)}
                  >
                    Back to site
                  </a>

                  {/* Logout */}
                  {onSignOut && (
                    <button
                      onClick={() => { onSignOut(); setMenuOpen(false) }}
                      className="w-full px-3 py-2.5 md:px-2 md:py-1.5 min-h-[44px] md:min-h-0 text-left text-sm rounded-sm hover:bg-accent cursor-default"
                    >
                      Logout
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
