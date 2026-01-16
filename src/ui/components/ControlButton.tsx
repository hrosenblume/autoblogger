'use client'

import { forwardRef } from 'react'

interface ControlButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean
}

export const ControlButton = forwardRef<HTMLButtonElement, ControlButtonProps>(
  ({ className = '', active, disabled, children, type = 'button', ...props }, ref) => {
    const baseClasses = "inline-flex items-center gap-1 text-sm transition-colors focus:outline-none"
    const stateClasses = disabled
      ? "text-muted-foreground/30 cursor-not-allowed"
      : active
        ? "text-blue-500 ab-dark:text-blue-400"
        : "text-muted-foreground active:text-foreground md:hover:text-foreground"
    
    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled}
        className={`${baseClasses} ${stateClasses} ${className}`}
        {...props}
      >
        {children}
      </button>
    )
  }
)

ControlButton.displayName = 'ControlButton'
