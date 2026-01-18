// Editor-related types

// ============================================================================
// Chat and Edit Types (consolidated from context.tsx and useChat.tsx)
// ============================================================================

export type ChatMode = 'ask' | 'agent' | 'plan' | 'search'

export interface EditCommand {
  type: 'replace_all' | 'replace_section' | 'insert' | 'delete'
  title?: string
  subtitle?: string
  markdown?: string
  find?: string
  replace?: string
  position?: 'before' | 'after' | 'start' | 'end'
}

export interface EssaySnapshot {
  title: string
  subtitle: string
  markdown: string
}

export type EditHandler = (edit: EditCommand) => boolean

// ============================================================================
// Revision Types
// ============================================================================

export interface RevisionSummary {
  id: string
  title: string | null
  createdAt: string
}

export interface RevisionFull extends RevisionSummary {
  subtitle: string | null
  markdown: string
  polyhedraShape: string | null
}

export interface StashedContent {
  title: string
  subtitle: string
  markdown: string
  polyhedraShape: string
}

export interface RevisionState {
  list: RevisionSummary[]
  loading: boolean
  previewLoading: boolean
  previewing: RevisionFull | null
  fetch: () => Promise<void>
  preview: (id: string) => Promise<void>
  cancel: () => void
  restore: () => Promise<void>
}

export type GenerationStatus = 'complete' | 'stopped' | 'error'

export interface AIState {
  generating: boolean
  generate: (
    prompt: string,
    wordCount: number,
    modelId?: string,
    useWebSearch?: boolean,
    mode?: 'generate' | 'expand_plan',
    useThinking?: boolean
  ) => Promise<GenerationStatus>
  stop: () => void
}
