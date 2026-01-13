'use client'

import { useState, useRef, useEffect, useCallback, createContext, useContext } from 'react'
import { createPortal } from 'react-dom'
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
  const [position, setPosition] = useState({ top: 0, left: 0, right: 0 })
  const [mounted, setMounted] = useState(false)
  
  const triggerRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  
  // Controlled vs uncontrolled
  const isControlled = controlledOpen !== undefined
  const isOpen = isControlled ? controlledOpen : internalOpen
  
  const setOpen = useCallback((value: boolean) => {
    if (!isControlled) {
      setInternalOpen(value)
    }
    onOpenChange?.(value)
  }, [isControlled, onOpenChange])

  // Mount check for portal
  useEffect(() => {
    setMounted(true)
  }, [])

  // Calculate position when opening
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

  // Update position on open
  useEffect(() => {
    if (isOpen) {
      updatePosition()
    }
  }, [isOpen, updatePosition])

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return
    
    const handleClick = (e: MouseEvent) => {
      const target = e.target as Node
      if (
        menuRef.current && !menuRef.current.contains(target) &&
        triggerRef.current && !triggerRef.current.contains(target)
      ) {
        setOpen(false)
      }
    }
    
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [isOpen, setOpen])

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

  const menu = isOpen && mounted ? createPortal(
    <DropdownContext.Provider value={{ close }}>
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
          'z-50 min-w-[160px] bg-popover border border-border rounded-md shadow-lg p-1 overscroll-contain',
          className
        )}
        onWheel={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </DropdownContext.Provider>,
    document.body
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
