'use client'

import { useState, useRef, useEffect, useCallback, createContext, useContext } from 'react'
import { AutobloggerPortal } from './Portal'
import { cn } from '../../lib/cn'

// ============================================
// DROPDOWN CONTEXT
// ============================================

const DropdownContext = createContext<{ close: () => void } | null>(null)

// ============================================
// DROPDOWN CONTAINER
// ============================================

interface DropdownProps {
  /** The trigger element (button, avatar, etc.) */
  trigger: React.ReactNode
  /** Dropdown content */
  children: React.ReactNode
  /** Alignment relative to trigger */
  align?: 'left' | 'right'
  /** Custom width class */
  className?: string
  /** Controlled open state */
  open?: boolean
  /** Callback when open state changes */
  onOpenChange?: (open: boolean) => void
  /** Disable the dropdown */
  disabled?: boolean
}

export function Dropdown({
  trigger,
  children,
  align = 'right',
  className,
  open: controlledOpen,
  onOpenChange,
  disabled,
}: DropdownProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const [position, setPosition] = useState<{ top: number; left: number; right: number } | null>(null)
  const [mounted, setMounted] = useState(false)
  
  const triggerRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  
  // Controlled vs uncontrolled
  const isControlled = controlledOpen !== undefined
  const isOpen = isControlled ? controlledOpen : internalOpen
  
  // Calculate position synchronously
  const updatePosition = useCallback(() => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      setPosition({
        top: rect.bottom + 4, // 4px gap
        left: rect.left,
        right: window.innerWidth - rect.right,
      })
    }
  }, [])
  
  const setOpen = useCallback((value: boolean) => {
    if (value) {
      // Calculate position synchronously BEFORE opening to prevent flicker
      updatePosition()
    } else {
      // Reset position when closing so next open recalculates
      setPosition(null)
    }
    if (!isControlled) {
      setInternalOpen(value)
    }
    onOpenChange?.(value)
  }, [isControlled, onOpenChange, updatePosition])

  // Mount check for portal
  useEffect(() => {
    setMounted(true)
  }, [])

  // For controlled mode, calculate position when externally opened
  useEffect(() => {
    if (isControlled && controlledOpen && !position) {
      updatePosition()
    }
    if (isControlled && !controlledOpen) {
      setPosition(null)
    }
  }, [isControlled, controlledOpen, position, updatePosition])

  // Close on click outside is handled by the backdrop element below

  // Lock scroll when dropdown is open
  useEffect(() => {
    if (!isOpen) return
    
    // Save current scroll position and lock body scroll
    const scrollY = window.scrollY
    document.body.style.position = 'fixed'
    document.body.style.top = `-${scrollY}px`
    document.body.style.left = '0'
    document.body.style.right = '0'
    document.body.style.overflow = 'hidden'
    
    return () => {
      // Restore scroll position
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.left = ''
      document.body.style.right = ''
      document.body.style.overflow = ''
      window.scrollTo(0, scrollY)
    }
  }, [isOpen])

  // Close on escape
  useEffect(() => {
    if (!isOpen) return
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
      }
    }
    
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, setOpen])

  // Update position on scroll/resize
  useEffect(() => {
    if (!isOpen) return
    
    const handleUpdate = () => updatePosition()
    window.addEventListener('scroll', handleUpdate, true)
    window.addEventListener('resize', handleUpdate)
    return () => {
      window.removeEventListener('scroll', handleUpdate, true)
      window.removeEventListener('resize', handleUpdate)
    }
  }, [isOpen, updatePosition])

  const handleTriggerClick = () => {
    if (disabled) return
    setOpen(!isOpen)
  }

  const close = useCallback(() => setOpen(false), [setOpen])

  // Handle backdrop click - closes dropdown and prevents click-through
  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setOpen(false)
  }, [setOpen])

  // Only render menu when open, mounted, AND position is calculated
  const menu = isOpen && mounted && position ? (
    <AutobloggerPortal>
      <DropdownContext.Provider value={{ close }}>
        {/* Invisible backdrop to capture clicks outside dropdown */}
        <div
          className="ab-dropdown-backdrop"
          onClick={handleBackdropClick}
          onMouseDown={handleBackdropClick}
        />
        <div
          ref={menuRef}
          style={{
            position: 'fixed',
            top: position.top,
            ...(align === 'right' 
              ? { right: position.right } 
              : { left: position.left }
            ),
          }}
          className={cn(
            'z-[80] min-w-[160px] bg-popover text-popover-foreground border border-border rounded-md shadow-lg p-1 overscroll-contain',
            className
          )}
          onWheel={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      </DropdownContext.Provider>
    </AutobloggerPortal>
  ) : null

  return (
    <>
      <div ref={triggerRef} onClick={handleTriggerClick}>
        {trigger}
      </div>
      {menu}
    </>
  )
}

// ============================================
// DROPDOWN ITEM
// ============================================

interface DropdownItemProps {
  onClick?: () => void
  destructive?: boolean
  disabled?: boolean
  children: React.ReactNode
  className?: string
}

export function DropdownItem({
  onClick,
  destructive,
  disabled,
  children,
  className,
}: DropdownItemProps) {
  const context = useContext(DropdownContext)
  
  const handleClick = () => {
    if (!disabled) {
      onClick?.()
      context?.close()
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className={cn(
        'w-full px-3 py-2.5 md:px-2 md:py-1.5 min-h-[44px] md:min-h-0',
        'text-left text-sm rounded-sm cursor-default',
        'active:bg-accent md:hover:bg-accent focus:bg-accent focus:outline-none',
        destructive && 'text-destructive',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      {children}
    </button>
  )
}

// ============================================
// DROPDOWN DIVIDER
// ============================================

export function DropdownDivider() {
  return <div className="h-px bg-border my-1" />
}

// ============================================
// DROPDOWN LABEL (non-interactive header)
// ============================================

export function DropdownLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-3 py-1.5 md:px-2 md:py-1 text-xs font-medium text-muted-foreground">
      {children}
    </div>
  )
}
