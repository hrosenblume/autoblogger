/**
 * Runtime model discovery: queries each provider's /v1/models endpoint, picks the
 * latest GA model per tier, and caches the result. Lets the app pick up new model
 * versions without code changes — providers ship a new ID, the next discovery
 * refresh surfaces it.
 */
import { type AIModel, STATIC_MODELS_BY_TIER, TIER_ORDER } from './models'

export interface DiscoveryKeys {
  anthropicKey?: string | null
  openaiKey?: string | null
}

const CACHE_TTL_MS = 24 * 60 * 60 * 1000

interface CacheEntry {
  value: Map<string, AIModel>
  fetchedAt: number
}

let cache: CacheEntry | null = null
let inFlight: Promise<Map<string, AIModel>> | null = null

/**
 * Returns the resolved tier→model map. First call kicks off the network fetch;
 * subsequent calls within 24h hit the in-memory cache. On any failure, falls
 * back to the baked-in `STATIC_MODELS_BY_TIER` so the app stays operational.
 */
export async function discoverModels(keys?: DiscoveryKeys): Promise<Map<string, AIModel>> {
  const now = Date.now()
  if (cache && now - cache.fetchedAt < CACHE_TTL_MS) {
    return cache.value
  }
  if (!inFlight) {
    inFlight = doDiscover(keys)
      .then(value => {
        cache = { value, fetchedAt: Date.now() }
        return value
      })
      .catch(err => {
        console.warn('[Model Discovery] Failed:', err instanceof Error ? err.message : err)
        if (cache) return cache.value
        return new Map(STATIC_MODELS_BY_TIER)
      })
      .finally(() => {
        inFlight = null
      })
  }
  return inFlight
}

/** Force a refresh on next call (used by tests or admin tooling). */
export function invalidateModelCache(): void {
  cache = null
}

async function doDiscover(keys?: DiscoveryKeys): Promise<Map<string, AIModel>> {
  const result = new Map<string, AIModel>(STATIC_MODELS_BY_TIER)
  const overrides = parseOverrides()

  const anthropicKey = keys?.anthropicKey || process.env.ANTHROPIC_API_KEY || null
  const openaiKey = keys?.openaiKey || process.env.OPENAI_API_KEY || null

  const [anthropic, openai] = await Promise.allSettled([
    anthropicKey
      ? fetchAnthropicModels(anthropicKey).then(curateAnthropic)
      : Promise.resolve(new Map<string, AIModel>()),
    openaiKey
      ? fetchOpenAIModels(openaiKey).then(curateOpenAI)
      : Promise.resolve(new Map<string, AIModel>()),
  ])

  if (anthropic.status === 'fulfilled') {
    for (const [tier, model] of anthropic.value) {
      if (!overrides.has(tier)) result.set(tier, model)
    }
  } else {
    console.warn('[Model Discovery] Anthropic /v1/models failed:', anthropic.reason)
  }
  if (openai.status === 'fulfilled') {
    for (const [tier, model] of openai.value) {
      if (!overrides.has(tier)) result.set(tier, model)
    }
  } else {
    console.warn('[Model Discovery] OpenAI /v1/models failed:', openai.reason)
  }

  for (const [tier, modelId] of overrides) {
    const existing = result.get(tier) ?? STATIC_MODELS_BY_TIER.get(tier)
    if (existing) result.set(tier, { ...existing, modelId })
  }

  return result
}

async function fetchAnthropicModels(apiKey: string): Promise<string[]> {
  const res = await fetch('https://api.anthropic.com/v1/models?limit=100', {
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
  })
  if (!res.ok) throw new Error(`Anthropic /v1/models ${res.status}`)
  const json = (await res.json()) as { data?: Array<{ id: string }> }
  return (json.data ?? []).map(m => m.id)
}

async function fetchOpenAIModels(apiKey: string): Promise<string[]> {
  const res = await fetch('https://api.openai.com/v1/models', {
    headers: { Authorization: `Bearer ${apiKey}` },
  })
  if (!res.ok) throw new Error(`OpenAI /v1/models ${res.status}`)
  const json = (await res.json()) as { data?: Array<{ id: string }> }
  return (json.data ?? []).map(m => m.id)
}

interface VersionedId {
  id: string
  major: number
  minor: number
}

function pickLatest(ids: string[], pattern: RegExp): VersionedId | null {
  let best: VersionedId | null = null
  for (const id of ids) {
    const m = id.match(pattern)
    if (!m) continue
    const major = parseInt(m[1], 10)
    const minor = m[2] != null ? parseInt(m[2], 10) : 0
    if (!best || major > best.major || (major === best.major && minor > best.minor)) {
      best = { id, major, minor }
    }
  }
  return best
}

/** Haiku may still ship dated IDs (e.g. `claude-haiku-4-5-20251001`); accept both shapes. */
function pickLatestHaiku(ids: string[]): VersionedId | null {
  let best: { id: string; major: number; minor: number; date: string } | null = null
  for (const id of ids) {
    const alias = id.match(/^claude-haiku-(\d+)-(\d+)$/)
    const dated = id.match(/^claude-haiku-(\d+)-(\d+)-(\d{8})$/)
    const m = alias ?? dated
    if (!m) continue
    const major = parseInt(m[1], 10)
    const minor = parseInt(m[2], 10)
    const date = dated ? m[3] : '99999999'
    const candidate = { id, major, minor, date }
    if (
      !best ||
      candidate.major > best.major ||
      (candidate.major === best.major && candidate.minor > best.minor) ||
      (candidate.major === best.major && candidate.minor === best.minor && candidate.date > best.date)
    ) {
      best = candidate
    }
  }
  return best ? { id: best.id, major: best.major, minor: best.minor } : null
}

async function curateAnthropic(ids: string[]): Promise<Map<string, AIModel>> {
  const out = new Map<string, AIModel>()
  const opus = pickLatest(ids, /^claude-opus-(\d+)-(\d+)$/)
  const sonnet = pickLatest(ids, /^claude-sonnet-(\d+)-(\d+)$/)
  const haiku = pickLatestHaiku(ids)

  if (opus) {
    const fallback = STATIC_MODELS_BY_TIER.get('claude-opus')!
    out.set('claude-opus', { ...fallback, modelId: opus.id, name: `Opus ${opus.major}.${opus.minor}` })
  }
  if (sonnet) {
    const fallback = STATIC_MODELS_BY_TIER.get('claude-sonnet')!
    out.set('claude-sonnet', { ...fallback, modelId: sonnet.id, name: `Sonnet ${sonnet.major}.${sonnet.minor}` })
  }
  if (haiku) {
    const fallback = STATIC_MODELS_BY_TIER.get('claude-haiku')!
    out.set('claude-haiku', { ...fallback, modelId: haiku.id, name: `Haiku ${haiku.major}.${haiku.minor}` })
  }
  return out
}

async function curateOpenAI(ids: string[]): Promise<Map<string, AIModel>> {
  const out = new Map<string, AIModel>()
  const flagship = pickLatest(ids, /^gpt-(\d+)(?:\.(\d+))?$/)
  const mini = pickLatest(ids, /^gpt-(\d+)(?:\.(\d+))?-mini$/)

  if (flagship) {
    const fallback = STATIC_MODELS_BY_TIER.get('openai-flagship')!
    const versionLabel = `${flagship.major}${flagship.minor ? `.${flagship.minor}` : ''}`
    out.set('openai-flagship', { ...fallback, modelId: flagship.id, name: `GPT-${versionLabel}` })
  }
  if (mini) {
    const fallback = STATIC_MODELS_BY_TIER.get('openai-mini')!
    const versionLabel = `${mini.major}${mini.minor ? `.${mini.minor}` : ''}`
    out.set('openai-mini', { ...fallback, modelId: mini.id, name: `GPT-${versionLabel} Mini` })
  }
  return out
}

/** Optional escape hatch: AUTOBLOGGER_MODELS_OVERRIDE=`{"claude-opus":"claude-opus-4-6"}` */
function parseOverrides(): Map<string, string> {
  const raw = process.env.AUTOBLOGGER_MODELS_OVERRIDE
  if (!raw) return new Map()
  try {
    const parsed = JSON.parse(raw) as Record<string, string>
    const out = new Map<string, string>()
    for (const tier of TIER_ORDER) {
      if (typeof parsed[tier] === 'string') out.set(tier, parsed[tier])
    }
    return out
  } catch {
    console.warn('[Model Discovery] Invalid AUTOBLOGGER_MODELS_OVERRIDE JSON; ignored')
    return new Map()
  }
}
