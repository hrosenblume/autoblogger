'use client'

import { useDashboardContext } from '../context'
import { Dropdown, DropdownItem, DropdownDivider } from './Dropdown'
import { ThemeToggle } from './ThemeToggle'
import { ChevronLeftIcon } from './Icons'

export interface NavbarProps {
  // Callbacks
  onSignOut?: () => void
  // Extra slot for host-app specific buttons (e.g., additional actions)
  rightSlot?: React.ReactNode
  // When true, removes sticky positioning (used when Navbar is inside a fixed container)
  isInsideFixedContainer?: boolean
}

export function Navbar({
  onSignOut,
  rightSlot,
  isInsideFixedContainer = false,
}: NavbarProps) {
  const { session, currentPath, navigate, goBack, basePath } = useDashboardContext()

  // Detect current route state
  const isRoot = currentPath === '/' || currentPath === ''
  const isSettings = currentPath.startsWith('/settings')

  const handleBack = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Blur to clear focus/active state (prevents sticky highlight on mobile)
    e.currentTarget.blur()
    goBack()
  }

  const avatarTrigger = (
    <button
      type="button"
      className="relative w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-sm font-medium text-secondary-foreground active:ring-2 md:hover:ring-2 active:ring-ring md:hover:ring-ring transition-shadow"
    >
      {session?.user?.email?.charAt(0).toUpperCase() || '?'}
      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-background" />
    </button>
  )

  // When inside a fixed container, don't add sticky positioning
  const headerClasses = isInsideFixedContainer
    ? "border-b border-border bg-background overscroll-none"
    : "sticky top-0 z-50 border-b border-border bg-background overscroll-none"

  return (
    <header className={headerClasses}>
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
            className="h-10 px-3 -ml-3 gap-1.5 inline-flex items-center justify-center text-sm font-medium rounded-md active:bg-accent md:hover:bg-accent active:text-accent-foreground md:hover:text-accent-foreground touch-manipulation"
          >
            <ChevronLeftIcon />
            <span className="hidden sm:inline">Back</span>
          </button>
        )}

        {/* Right side: icons and user menu */}
        <div className="flex items-center gap-2">
          {/* Extra slot from host app */}
          {rightSlot}

          {/* Theme toggle - always shown, uses internal theme context */}
          <ThemeToggle />

          {/* User menu */}
          {session && (
            <Dropdown trigger={avatarTrigger} align="right" className="min-w-[180px]">
              {session.user?.role === 'admin' && (
                <>
                  {/* Settings toggle */}
                  {!isSettings ? (
                    <DropdownItem onClick={() => navigate('/settings')}>
                      Go to settings
                    </DropdownItem>
                  ) : (
                    <DropdownItem onClick={() => navigate('/')}>
                      Back to writer
                    </DropdownItem>
                  )}
                  <DropdownDivider />
                </>
              )}

              {/* Back to site */}
              <DropdownItem onClick={() => { window.location.href = '/' }}>
                Back to site
              </DropdownItem>

              {/* Logout */}
              {onSignOut && (
                <DropdownItem onClick={onSignOut}>
                  Logout
                </DropdownItem>
              )}
            </Dropdown>
          )}
        </div>
      </div>
    </header>
  )
}
