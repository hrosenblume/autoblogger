import { discoverModels, type DiscoveryKeys } from './models-discovery'

export const LENGTH_OPTIONS = [300, 500, 800, 1000] as const
export type LengthOption = (typeof LENGTH_OPTIONS)[number]

/** Full model definition with provider details. The `id` is a stable tier id (e.g. 'claude-sonnet') and `modelId` is the API string. */
export interface AIModel {
  id: string
  name: string
  provider: 'anthropic' | 'openai'
  modelId: string
  description?: string
  searchModel: 'native' | null
  supportsThinking: boolean
}

/** Tier order used by the UI dropdown. */
export const TIER_ORDER = [
  'claude-opus',
  'claude-sonnet',
  'claude-haiku',
  'openai-flagship',
  'openai-mini',
] as const

export type ModelId = (typeof TIER_ORDER)[number]

/** Baked-in fallback used when discovery fails or no API keys are configured. Kept current with the latest GA models as of release. */
export const STATIC_MODELS: AIModel[] = [
  {
    id: 'claude-opus',
    name: 'Opus 4.7',
    provider: 'anthropic',
    modelId: 'claude-opus-4-7',
    description: 'Highest quality, slower',
    searchModel: null,
    supportsThinking: true,
  },
  {
    id: 'claude-sonnet',
    name: 'Sonnet 4.6',
    provider: 'anthropic',
    modelId: 'claude-sonnet-4-6',
    description: 'Fast, capable, best value',
    searchModel: null,
    supportsThinking: true,
  },
  {
    id: 'claude-haiku',
    name: 'Haiku 4.5',
    provider: 'anthropic',
    modelId: 'claude-haiku-4-5',
    description: 'Fastest, lightweight',
    searchModel: null,
    supportsThinking: false,
  },
  {
    id: 'openai-flagship',
    name: 'GPT-5.5',
    provider: 'openai',
    modelId: 'gpt-5.5',
    description: 'Latest OpenAI flagship',
    searchModel: 'native',
    supportsThinking: false,
  },
  {
    id: 'openai-mini',
    name: 'GPT-5.4 Mini',
    provider: 'openai',
    modelId: 'gpt-5.4-mini',
    description: 'Fast and cost-efficient',
    searchModel: 'native',
    supportsThinking: false,
  },
]

export const STATIC_MODELS_BY_TIER: ReadonlyMap<string, AIModel> = new Map(
  STATIC_MODELS.map(m => [m.id, m])
)

/** @deprecated Prefer `STATIC_MODELS` or the async helpers; this only reflects the baked-in fallback. */
export const AI_MODELS = STATIC_MODELS

/** Old user-facing IDs that should map to current tier IDs. */
const LEGACY_ALIASES: Record<string, string> = {
  'gpt-5.2': 'openai-flagship',
  'gpt-5-mini': 'openai-mini',
}

function canonicalizeId(id: string): string {
  return LEGACY_ALIASES[id] ?? id
}

/** Subset of AIModel for UI dropdowns */
export interface AIModelOption {
  id: string
  name: string
  description?: string
  hasNativeSearch: boolean
}

/** Look up a model by tier id (or legacy id). Triggers discovery on first call; cached for 24h. */
export async function getModel(id: string, keys?: DiscoveryKeys): Promise<AIModel | undefined> {
  const tier = canonicalizeId(id)
  const models = await discoverModels(keys)
  return models.get(tier) ?? STATIC_MODELS_BY_TIER.get(tier)
}

export async function getDefaultModel(keys?: DiscoveryKeys): Promise<AIModel> {
  const models = await discoverModels(keys)
  return models.get('claude-sonnet') ?? STATIC_MODELS_BY_TIER.get('claude-sonnet')!
}

export async function modelHasNativeSearch(id: string, keys?: DiscoveryKeys): Promise<boolean> {
  const model = await getModel(id, keys)
  return model?.searchModel === 'native'
}

export async function getSearchModel(id: string, keys?: DiscoveryKeys): Promise<string | null> {
  const model = await getModel(id, keys)
  return model?.searchModel ?? null
}

/**
 * Resolve a model ID, falling back to database default or hardcoded default.
 * Used by AI API routes to avoid duplicating model resolution logic.
 *
 * @param providedModelId - Optional model ID from request
 * @param getDefaultModelId - Async function to get default from DB (avoids Prisma import here)
 * @param keys - Optional API keys to seed discovery
 * @throws Error if model cannot be resolved
 */
export async function resolveModel(
  providedModelId: string | undefined,
  getDefaultModelId: () => Promise<string | null>,
  keys?: DiscoveryKeys
): Promise<AIModel> {
  let modelId = providedModelId
  if (!modelId) {
    modelId = (await getDefaultModelId()) || 'claude-sonnet'
  }
  const model = await getModel(modelId, keys)
  if (!model) {
    throw new Error(`Unknown model: ${modelId}`)
  }
  return model
}

export function toModelOption(model: AIModel): AIModelOption {
  return {
    id: model.id,
    name: model.name,
    description: model.description,
    hasNativeSearch: model.searchModel === 'native',
  }
}

export async function getModelOptions(keys?: DiscoveryKeys): Promise<AIModelOption[]> {
  const models = await discoverModels(keys)
  return TIER_ORDER
    .map(id => models.get(id) ?? STATIC_MODELS_BY_TIER.get(id))
    .filter((m): m is AIModel => !!m)
    .map(toModelOption)
}
