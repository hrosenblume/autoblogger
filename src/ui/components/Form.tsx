'use client'

import { cn } from '../../lib/cn'

// ============================================
// FORM FIELD WRAPPER
// ============================================

interface FormFieldProps {
  /** Field label */
  label: string
  /** Helper text below input */
  description?: string
  /** Error message */
  error?: string
  /** Field content */
  children: React.ReactNode
  /** Additional class names */
  className?: string
}

/**
 * Wrapper for form fields with consistent label, description, and error styling.
 */
export function FormField({ 
  label, 
  description, 
  error, 
  children,
  className,
}: FormFieldProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <label className="text-sm font-medium">{label}</label>
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      {children}
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  )
}

// ============================================
// FORM INPUT
// ============================================

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Field label */
  label: string
  /** Helper text */
  description?: string
  /** Error message */
  error?: string
}

/**
 * Styled text input with label.
 */
export function FormInput({ 
  label, 
  description,
  error, 
  className, 
  ...props 
}: FormInputProps) {
  return (
    <FormField label={label} description={description} error={error}>
      <input
        className={cn(
          'w-full px-3 py-2 border border-border rounded-md bg-background',
          'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          error && 'border-destructive',
          className
        )}
        {...props}
      />
    </FormField>
  )
}

// ============================================
// FORM TEXTAREA
// ============================================

interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Field label */
  label: string
  /** Helper text */
  description?: string
  /** Error message */
  error?: string
}

/**
 * Styled textarea with label.
 */
export function FormTextarea({ 
  label, 
  description,
  error, 
  className, 
  ...props 
}: FormTextareaProps) {
  return (
    <FormField label={label} description={description} error={error}>
      <textarea
        className={cn(
          'w-full px-3 py-2 border border-border rounded-md bg-background resize-none',
          'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'font-mono text-sm',
          error && 'border-destructive',
          className
        )}
        {...props}
      />
    </FormField>
  )
}

// ============================================
// FORM SELECT
// ============================================

interface FormSelectOption {
  value: string
  label: string
}

interface FormSelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  /** Field label */
  label: string
  /** Helper text */
  description?: string
  /** Error message */
  error?: string
  /** Select options */
  options: FormSelectOption[]
}

/**
 * Styled select dropdown with label.
 */
export function FormSelect({ 
  label, 
  description,
  error, 
  options,
  className, 
  ...props 
}: FormSelectProps) {
  return (
    <FormField label={label} description={description} error={error}>
      <select
        className={cn(
          'w-full px-3 py-2 border border-border rounded-md bg-background',
          'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          error && 'border-destructive',
          className
        )}
        {...props}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </FormField>
  )
}

// ============================================
// FORM CHECKBOX
// ============================================

interface FormCheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  /** Checkbox label */
  label: string
  /** Helper text */
  description?: string
}

/**
 * Styled checkbox with label.
 */
export function FormCheckbox({ 
  label, 
  description,
  className, 
  ...props 
}: FormCheckboxProps) {
  return (
    <label className={cn('flex items-start gap-3 cursor-pointer', className)}>
      <input
        type="checkbox"
        className={cn(
          'mt-1 h-4 w-4 rounded border-border',
          'focus:ring-2 focus:ring-ring focus:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed'
        )}
        {...props}
      />
      <div>
        <span className="text-sm font-medium">{label}</span>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
    </label>
  )
}

// ============================================
// FORM ACTIONS (submit/cancel buttons)
// ============================================

interface FormActionsProps {
  children: React.ReactNode
  className?: string
}

/**
 * Container for form action buttons with consistent spacing.
 */
export function FormActions({ children, className }: FormActionsProps) {
  return (
    <div className={cn('flex items-center gap-3 pt-4', className)}>
      {children}
    </div>
  )
}

// ============================================
// FORM BUTTON
// ============================================

interface FormButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Button variant */
  variant?: 'primary' | 'secondary' | 'destructive'
  /** Loading state */
  loading?: boolean
}

/**
 * Styled button for forms.
 */
export function FormButton({ 
  variant = 'primary',
  loading,
  disabled,
  className, 
  children,
  ...props 
}: FormButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled || loading}
      className={cn(
        'px-4 py-2 text-sm font-medium rounded-md',
        'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variant === 'primary' && 'bg-primary text-primary-foreground hover:bg-primary/90',
        variant === 'secondary' && 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        variant === 'destructive' && 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        className
      )}
      {...props}
    >
      {loading ? 'Saving...' : children}
    </button>
  )
}
