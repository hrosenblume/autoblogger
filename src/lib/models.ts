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
  { id: 'claude-opus', name: 'Opus 4.7', description: 'Highest quality, slower', hasNativeSearch: false },
  { id: 'claude-sonnet', name: 'Sonnet 4.6', description: 'Fast, capable, best value', hasNativeSearch: false },
  { id: 'claude-haiku', name: 'Haiku 4.5', description: 'Fastest, lightweight', hasNativeSearch: false },
  { id: 'openai-flagship', name: 'GPT-5.5', description: 'Latest OpenAI flagship', hasNativeSearch: true },
  { id: 'openai-mini', name: 'GPT-5.4 Mini', description: 'Fast and cost-efficient', hasNativeSearch: true },
]
