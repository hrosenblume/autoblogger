/** Word count options for essay generation */
export const LENGTH_OPTIONS = [300, 500, 800, 1000] as const
export type LengthOption = (typeof LENGTH_OPTIONS)[number]

/** AI model option for UI dropdowns */
export interface AIModelOption {
  id: string
  name: string
  description: string
  hasNativeSearch: boolean
}

/** Default models - can be overridden by API */
export const DEFAULT_MODELS: AIModelOption[] = [
  { id: 'claude-sonnet', name: 'Sonnet 4.5', description: 'Fast, capable', hasNativeSearch: false },
  { id: 'claude-opus', name: 'Opus 4.5', description: 'Highest quality', hasNativeSearch: false },
  { id: 'gpt-5.2', name: 'GPT-5.2', description: 'Latest OpenAI', hasNativeSearch: true },
  { id: 'gpt-5-mini', name: 'GPT-5 Mini', description: 'Fast and efficient', hasNativeSearch: true },
]
