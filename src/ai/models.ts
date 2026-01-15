/** Word count options for essay generation */
export const LENGTH_OPTIONS = [300, 500, 800, 1000] as const
export type LengthOption = (typeof LENGTH_OPTIONS)[number]

/** Full model definition with provider details */
export interface AIModel {
  id: string
  name: string
  provider: 'anthropic' | 'openai'
  modelId: string
  description?: string
  searchModel: 'native' | null // 'native' for GPT (uses tools), null for Claude (uses 2-call flow)
}

export const AI_MODELS: AIModel[] = [
  {
    id: 'claude-sonnet',
    name: 'Sonnet 4.5',
    provider: 'anthropic',
    modelId: 'claude-sonnet-4-5-20250929',
    description: 'Fast, capable, best value',
    searchModel: null, // No native search, uses search-first flow
  },
  {
    id: 'claude-opus',
    name: 'Opus 4.5',
    provider: 'anthropic',
    modelId: 'claude-opus-4-5-20251101',
    description: 'Highest quality, slower',
    searchModel: null,
  },
  {
    id: 'gpt-5.2',
    name: 'GPT-5.2',
    provider: 'openai',
    modelId: 'gpt-5.2',
    description: 'Latest OpenAI flagship',
    searchModel: 'native', // Uses tools-based web search
  },
  {
    id: 'gpt-5-mini',
    name: 'GPT-5 Mini',
    provider: 'openai',
    modelId: 'gpt-5-mini',
    description: 'Fast and cost-efficient',
    searchModel: 'native', // Uses tools-based web search
  },
]

export type ModelId = (typeof AI_MODELS)[number]['id']

/** Subset of AIModel for UI dropdowns */
export interface AIModelOption {
  id: string
  name: string
  description?: string
  hasNativeSearch: boolean
}

export function getModel(id: string): AIModel | undefined {
  return AI_MODELS.find(m => m.id === id)
}

export function getDefaultModel(): AIModel {
  return AI_MODELS[0]
}

/** Check if a model has native search (via tools, not a separate model) */
export function modelHasNativeSearch(id: string): boolean {
  return AI_MODELS.find(m => m.id === id)?.searchModel === 'native'
}

/** Get the search model variant for a model, or null if it uses 2-call flow */
export function getSearchModel(id: string): string | null {
  return AI_MODELS.find(m => m.id === id)?.searchModel ?? null
}

/**
 * Resolve a model ID, falling back to database default or hardcoded default.
 * Used by AI API routes to avoid duplicating model resolution logic.
 * 
 * @param providedModelId - Optional model ID from request
 * @param getDefaultModelId - Async function to get default from DB (avoids Prisma import here)
 * @returns Resolved AIModel
 * @throws Error if model not found
 */
export async function resolveModel(
  providedModelId: string | undefined,
  getDefaultModelId: () => Promise<string | null>
): Promise<AIModel> {
  let modelId = providedModelId
  
  if (!modelId) {
    modelId = (await getDefaultModelId()) || 'claude-sonnet'
  }
  
  const model = getModel(modelId)
  if (!model) {
    throw new Error(`Unknown model: ${modelId}. Available: ${AI_MODELS.map(m => m.id).join(', ')}`)
  }
  
  return model
}

/** Convert AIModel to AIModelOption for UI */
export function toModelOption(model: AIModel): AIModelOption {
  return {
    id: model.id,
    name: model.name,
    description: model.description,
    hasNativeSearch: model.searchModel === 'native',
  }
}

/** Get all models as options for UI dropdowns */
export function getModelOptions(): AIModelOption[] {
  return AI_MODELS.map(toModelOption)
}
