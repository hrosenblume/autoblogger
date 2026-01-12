// Client-side types (with React)
import type { ComponentType } from 'react'
import type { Post } from '../types'
import type { StylesConfig } from '../server'

// Re-export server types
export type { StylesConfig }

// Custom field component props
export interface CustomFieldProps<T = unknown> {
  value: T
  onChange: (value: T) => void
  onFieldChange: (name: string, value: unknown) => void  // Update any post field
  post: Post
  disabled?: boolean
}

// Custom field definition
export interface CustomFieldConfig {
  name: string
  label?: string
  component: ComponentType<CustomFieldProps<unknown>>
  position?: 'footer' | 'sidebar'
}
