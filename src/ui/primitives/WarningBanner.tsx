'use client'

import { useTheme } from '../hooks/useTheme'
import { getColor, getColorWithOpacity } from './colors'

interface WarningBannerProps {
  children: React.ReactNode
  /** Optional actions to render on the right side */
  actions?: React.ReactNode
  /** Variant: 'banner' for full-width bar, 'box' for inline alert box */
  variant?: 'banner' | 'box'
  className?: string
}

/**
 * Self-contained warning banner that doesn't rely on CSS variables.
 * Uses hardcoded colors with theme detection.
 */
export function WarningBanner({ 
  children, 
  actions, 
  variant = 'banner',
  className = '' 
}: WarningBannerProps) {
  const { resolvedTheme } = useTheme()
  
  const warningColor = getColor('warning', resolvedTheme)
  const warningBg = getColorWithOpacity('warning', resolvedTheme, variant === 'banner' ? 0.15 : 0.1)
  const warningBorder = getColorWithOpacity('warning', resolvedTheme, 0.3)
  
  if (variant === 'box') {
    return (
      <div 
        className={`flex items-start gap-2 p-3 rounded-md text-sm ${className}`}
        style={{
          backgroundColor: warningBg,
          borderWidth: 1,
          borderStyle: 'solid',
          borderColor: warningBorder,
        }}
      >
        <svg 
          className="w-4 h-4 mt-0.5 flex-shrink-0" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
          style={{ color: warningColor }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <div style={{ color: warningColor }}>
          {children}
        </div>
      </div>
    )
  }
  
  return (
    <div 
      className={`px-4 py-2 flex items-center justify-between ${className}`}
      style={{
        backgroundColor: warningBg,
        borderBottomWidth: 1,
        borderBottomStyle: 'solid',
        borderBottomColor: warningBorder,
      }}
    >
      <span className="text-sm" style={{ color: warningColor }}>
        {children}
      </span>
      {actions && (
        <div className="flex items-center gap-2">
          {actions}
        </div>
      )}
    </div>
  )
}

interface WarningButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'outline' | 'solid'
}

/**
 * Button styled for use within WarningBanner
 */
export function WarningButton({ 
  variant = 'outline', 
  className = '', 
  ...props 
}: WarningButtonProps) {
  const { resolvedTheme } = useTheme()
  const warningColor = getColor('warning', resolvedTheme)
  
  if (variant === 'solid') {
    return (
      <button
        className={`px-3 py-1 text-sm rounded ${className}`}
        style={{
          backgroundColor: '#d97706', // amber-600
          color: '#ffffff',
        }}
        {...props}
      />
    )
  }
  
  return (
    <button
      className={`px-3 py-1 text-sm rounded ${className}`}
      style={{
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: getColorWithOpacity('warning', resolvedTheme, 0.4),
        color: warningColor,
      }}
      {...props}
    />
  )
}

interface WarningCodeProps {
  children: React.ReactNode
}

/**
 * Inline code styled for use within WarningBanner
 */
export function WarningCode({ children }: WarningCodeProps) {
  const { resolvedTheme } = useTheme()
  
  return (
    <code 
      className="px-1 py-0.5 rounded text-xs"
      style={{
        backgroundColor: getColorWithOpacity('warning', resolvedTheme, 0.2),
      }}
    >
      {children}
    </code>
  )
}
