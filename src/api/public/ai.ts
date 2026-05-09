import type { AutobloggerServer } from '../../server'
import type { VerifiedKey } from '../../data/api-keys'
import { PostStatus } from '../../types/models'
import {
  jsonResponse,
  badRequest,
  notFound,
  methodNotAllowed,
  collectStream,
  type NextRequest,
} from './shared'

import {
  generate,
  generateStream,
  expandPlanStream,
  parseGeneratedContent,
  resolveModel,
  getModelOptions,
  buildRewritePrompt,
  createStream,
  DEFAULT_SEARCH_ONLY_PROMPT,
} from '../../ai'

interface AISettingsLike {
  rules: string
  chatRules: string
  rewriteRules?: string | null
  autoDraftRules?: string | null
  planRules?: string | null
  defaultModel: string
  generateTemplate?: string | null
  chatTemplate?: string | null
  rewriteTemplate?: string | null
  autoDraftTemplate?: string | null
  planTemplate?: string | null
  expandPlanTemplate?: string | null
  agentTemplate?: string | null
  anthropicKey?: string | null
  openaiKey?: string | null
}

const MAX_STYLE_EXAMPLES = 5
const MAX_WORDS_PER_EXAMPLE = 500

async function fetchStyleExamples(cms: AutobloggerServer): Promise<string> {
  try {
    const posts = await cms.posts.findPublished()
    if (posts.length === 0) return ''
    const examples = posts
      .slice(0, MAX_STYLE_EXAMPLES)
      .map((p: { title: string; subtitle?: string | null; markdown: string }) => {
        const words = p.markdown.split(/\s+/)
        const truncated =
          words.length > MAX_WORDS_PER_EXAMPLE
            ? words.slice(0, MAX_WORDS_PER_EXAMPLE).join(' ') + '...'
            : p.markdown
        return `## ${p.title}\n${p.subtitle ? `*${p.subtitle}*\n` : ''}${truncated}`
      })
      .join('\n\n---\n\n')
    return `The following are examples of the author's published work. Use these to match their voice, tone, and writing style:\n\n${examples}`
  } catch {
    return ''
  }
}

function resolveKeys(cms: AutobloggerServer, settings: AISettingsLike) {
  return {
    anthropicKey: cms.config.ai?.anthropicKey || settings.anthropicKey || undefined,
    openaiKey: cms.config.ai?.openaiKey || settings.openaiKey || undefined,
  }
}

export async function handlePublicAI(
  req: NextRequest,
  cms: AutobloggerServer,
  _key: VerifiedKey,
  path: string
): Promise<Response> {
  const method = req.method

  // GET /v1/ai/models
  if (method === 'GET' && path === '/v1/ai/models') {
    const settings = (await cms.aiSettings.get()) as AISettingsLike
    const { anthropicKey, openaiKey } = resolveKeys(cms, settings)
    const options = await getModelOptions({ anthropicKey, openaiKey })
    return jsonResponse({ data: options })
  }

  // GET /v1/ai/settings — read-only, secrets masked
  if (method === 'GET' && path === '/v1/ai/settings') {
    const settings = (await cms.aiSettings.get()) as AISettingsLike
    return jsonResponse({
      data: {
        rules: settings.rules,
        chatRules: settings.chatRules,
        rewriteRules: settings.rewriteRules,
        autoDraftRules: settings.autoDraftRules,
        planRules: settings.planRules,
        defaultModel: settings.defaultModel,
        generateTemplate: settings.generateTemplate,
        chatTemplate: settings.chatTemplate,
        rewriteTemplate: settings.rewriteTemplate,
        autoDraftTemplate: settings.autoDraftTemplate,
        planTemplate: settings.planTemplate,
        expandPlanTemplate: settings.expandPlanTemplate,
        agentTemplate: settings.agentTemplate,
        hasAnthropicKey: !!(cms.config.ai?.anthropicKey || settings.anthropicKey),
        hasOpenaiKey: !!(cms.config.ai?.openaiKey || settings.openaiKey),
      },
    })
  }

  if (method !== 'POST') return methodNotAllowed()

  // POST /v1/ai/generate — full-context generation, optional save
  if (path === '/v1/ai/generate') {
    return runGenerate(cms, req, { mode: 'standard' })
  }

  // POST /v1/ai/generate/raw — no system prompt, returns text only, never saves
  if (path === '/v1/ai/generate/raw') {
    return runGenerateRaw(cms, req)
  }

  // POST /v1/ai/plan — outline from prompt
  if (path === '/v1/ai/plan') {
    return runPlan(cms, req)
  }

  // POST /v1/ai/expand-plan — plan → draft (optionally saved)
  if (path === '/v1/ai/expand-plan') {
    return runGenerate(cms, req, { mode: 'expand_plan' })
  }

  // POST /v1/ai/rewrite — improve text
  if (path === '/v1/ai/rewrite') {
    return runRewrite(cms, req)
  }

  // POST /v1/ai/chat — stateless chat
  if (path === '/v1/ai/chat') {
    return runChat(cms, req)
  }

  // POST /v1/ai/search — web-search-only
  if (path === '/v1/ai/search') {
    return runSearch(cms, req)
  }

  // POST /v1/posts/:id/agent — agent edit
  const agentMatch = path.match(/^\/v1\/posts\/([^/]+)\/agent$/)
  if (agentMatch) {
    return runAgent(cms, req, agentMatch[1])
  }

  return jsonResponse({ error: 'Not found' }, 404)
}

// ---------------------------------------------------------------------------
// Implementations
// ---------------------------------------------------------------------------

async function runGenerate(
  cms: AutobloggerServer,
  req: NextRequest,
  opts: { mode: 'standard' | 'expand_plan' }
): Promise<Response> {
  const body = await req.json().catch(() => ({}))
  const settings = (await cms.aiSettings.get()) as AISettingsLike
  const { anthropicKey, openaiKey } = resolveKeys(cms, settings)
  const styleExamples = await fetchStyleExamples(cms)

  const model = body.model || settings.defaultModel
  const wordCount = typeof body.wordCount === 'number' ? body.wordCount : undefined
  const useWebSearch = body.useWebSearch === true
  const useThinking = body.useThinking === true
  const save = body.save !== false

  let stream: ReadableStream
  if (opts.mode === 'expand_plan') {
    const plan = typeof body.plan === 'string' ? body.plan : ''
    if (!plan.trim()) return badRequest('plan is required')
    stream = await expandPlanStream({
      plan,
      model,
      rules: settings.rules,
      template: settings.expandPlanTemplate ?? null,
      styleExamples,
      wordCount,
      anthropicKey,
      openaiKey,
    })
  } else {
    const prompt = typeof body.prompt === 'string' ? body.prompt : ''
    if (!prompt.trim()) return badRequest('prompt is required')
    stream = await generateStream({
      prompt,
      model,
      wordCount,
      rules: settings.rules,
      template: settings.generateTemplate ?? null,
      styleExamples,
      anthropicKey,
      openaiKey,
      useWebSearch,
      useThinking,
    })
  }

  const text = await collectStream(stream)
  const parsed = parseGeneratedContent(text)

  if (!save) {
    return jsonResponse({ data: { ...parsed, raw: text } })
  }

  const created = await cms.posts.create({
    title: parsed.title || 'Untitled',
    subtitle: parsed.subtitle || undefined,
    slug: typeof body.slug === 'string' ? body.slug : undefined,
    markdown: parsed.body,
    status: PostStatus.DRAFT,
    tagIds: Array.isArray(body.tagIds) ? body.tagIds : undefined,
  })

  return jsonResponse({ data: { ...parsed, raw: text, post: created } }, 201)
}

async function runGenerateRaw(cms: AutobloggerServer, req: NextRequest): Promise<Response> {
  const body = await req.json().catch(() => ({}))
  const prompt = typeof body.prompt === 'string' ? body.prompt : ''
  if (!prompt.trim()) return badRequest('prompt is required')

  const settings = (await cms.aiSettings.get()) as AISettingsLike
  const { anthropicKey, openaiKey } = resolveKeys(cms, settings)
  const resolved = await resolveModel(
    body.model,
    async () => settings.defaultModel,
    { anthropicKey, openaiKey }
  )

  const result = await generate(
    resolved.id,
    typeof body.system === 'string' ? body.system : '',
    prompt,
    {
      anthropicKey,
      openaiKey,
      maxTokens: typeof body.maxTokens === 'number' ? body.maxTokens : 4096,
      useWebSearch: body.useWebSearch === true,
    }
  )

  return jsonResponse({
    data: {
      text: result.text,
      usage: { inputTokens: result.inputTokens, outputTokens: result.outputTokens },
    },
  })
}

async function runPlan(cms: AutobloggerServer, req: NextRequest): Promise<Response> {
  const body = await req.json().catch(() => ({}))
  const prompt = typeof body.prompt === 'string' ? body.prompt : ''
  if (!prompt.trim()) return badRequest('prompt is required')

  const settings = (await cms.aiSettings.get()) as AISettingsLike
  const { anthropicKey, openaiKey } = resolveKeys(cms, settings)
  const styleExamples = await fetchStyleExamples(cms)

  const { chatStream } = await import('../../ai/chat')
  const stream = await chatStream({
    messages: [{ role: 'user', content: prompt }],
    model: body.model || settings.defaultModel,
    mode: 'plan',
    chatRules: settings.chatRules,
    rules: settings.rules,
    template: settings.chatTemplate ?? null,
    planTemplate: settings.planTemplate ?? null,
    planRules: settings.planRules ?? '',
    styleExamples,
    anthropicKey,
    openaiKey,
    useWebSearch: body.useWebSearch === true,
    useThinking: body.useThinking === true,
  })

  const text = await collectStream(stream)
  return jsonResponse({ data: { plan: text } })
}

async function runRewrite(cms: AutobloggerServer, req: NextRequest): Promise<Response> {
  const body = await req.json().catch(() => ({}))
  const text = typeof body.text === 'string' ? body.text : ''
  if (!text.trim()) return badRequest('text is required')

  const settings = (await cms.aiSettings.get()) as AISettingsLike
  const { anthropicKey, openaiKey } = resolveKeys(cms, settings)
  const styleExamples = await fetchStyleExamples(cms)

  const systemPrompt = buildRewritePrompt({
    rewriteRules: settings.rewriteRules ?? '',
    rules: settings.rules,
    template: settings.rewriteTemplate ?? null,
    styleExamples,
  })

  const stream = await createStream({
    model: body.model || settings.defaultModel,
    messages: [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: `Rewrite the following text, preserving meaning but improving clarity and style:\n\n${text}`,
      },
    ],
    anthropicKey,
    openaiKey,
    maxTokens: 2048,
  })

  const rewritten = await collectStream(stream)
  return jsonResponse({ data: { text: rewritten.trim() } })
}

async function runChat(cms: AutobloggerServer, req: NextRequest): Promise<Response> {
  const body = await req.json().catch(() => ({}))
  const messages = Array.isArray(body.messages) ? body.messages : null
  if (!messages || messages.length === 0) return badRequest('messages array is required')

  const settings = (await cms.aiSettings.get()) as AISettingsLike
  const { anthropicKey, openaiKey } = resolveKeys(cms, settings)
  const styleExamples = await fetchStyleExamples(cms)

  const { chatStream } = await import('../../ai/chat')
  const stream = await chatStream({
    messages,
    model: body.model || settings.defaultModel,
    mode: body.mode === 'plan' || body.mode === 'agent' || body.mode === 'search' ? body.mode : 'ask',
    essayContext: body.essayContext || null,
    chatRules: settings.chatRules,
    rules: settings.rules,
    template: settings.chatTemplate ?? null,
    planTemplate: settings.planTemplate ?? null,
    planRules: settings.planRules ?? '',
    agentTemplate: settings.agentTemplate ?? null,
    styleExamples,
    anthropicKey,
    openaiKey,
    useWebSearch: body.useWebSearch === true,
    useThinking: body.useThinking === true,
  })

  const text = await collectStream(stream)
  return jsonResponse({ data: { text } })
}

async function runSearch(cms: AutobloggerServer, req: NextRequest): Promise<Response> {
  const body = await req.json().catch(() => ({}))
  const query = typeof body.query === 'string' ? body.query : ''
  if (!query.trim()) return badRequest('query is required')

  const settings = (await cms.aiSettings.get()) as AISettingsLike
  const { anthropicKey, openaiKey } = resolveKeys(cms, settings)

  const result = await generate(
    body.model || settings.defaultModel,
    DEFAULT_SEARCH_ONLY_PROMPT,
    query,
    {
      anthropicKey,
      openaiKey,
      maxTokens: 4096,
      useWebSearch: true,
    }
  )

  return jsonResponse({
    data: {
      text: result.text,
      usage: { inputTokens: result.inputTokens, outputTokens: result.outputTokens },
    },
  })
}

async function runAgent(
  cms: AutobloggerServer,
  req: NextRequest,
  postId: string
): Promise<Response> {
  const post = await cms.posts.findById(postId)
  if (!post) return notFound('Post')

  const body = await req.json().catch(() => ({}))
  const instruction = typeof body.instruction === 'string' ? body.instruction : ''
  if (!instruction.trim()) return badRequest('instruction is required')

  // Status-aware default: published → new-draft (don't silently mutate live);
  // draft/suggested → in-place. Either can be overridden via `target`.
  const requestedTarget = body.target === 'in-place' || body.target === 'new-draft' ? body.target : null
  const defaultTarget =
    post.status === PostStatus.PUBLISHED ? 'new-draft' : 'in-place'
  const target: 'in-place' | 'new-draft' = requestedTarget ?? defaultTarget

  const settings = (await cms.aiSettings.get()) as AISettingsLike
  const { anthropicKey, openaiKey } = resolveKeys(cms, settings)
  const styleExamples = await fetchStyleExamples(cms)

  const { chatStream } = await import('../../ai/chat')
  const stream = await chatStream({
    messages: [{ role: 'user', content: instruction }],
    model: body.model || settings.defaultModel,
    mode: 'agent',
    essayContext: {
      title: post.title,
      subtitle: post.subtitle ?? undefined,
      markdown: post.markdown,
    },
    chatRules: settings.chatRules,
    rules: settings.rules,
    template: settings.chatTemplate ?? null,
    agentTemplate: settings.agentTemplate ?? null,
    styleExamples,
    anthropicKey,
    openaiKey,
    useWebSearch: body.useWebSearch === true,
    useThinking: body.useThinking === true,
  })

  const text = await collectStream(stream)
  const parsed = parseGeneratedContent(text)

  // Fall back to existing fields if the model didn't produce a new title/subtitle
  const newTitle = parsed.title || post.title
  const newSubtitle = parsed.subtitle || post.subtitle || undefined
  const newMarkdown = parsed.body || text

  if (target === 'new-draft') {
    const created = await cms.posts.create({
      title: `${newTitle} (agent draft)`,
      subtitle: newSubtitle,
      slug: `${post.slug}-agent`,
      markdown: newMarkdown,
      status: PostStatus.DRAFT,
      sourceUrl: post.slug,
    })
    return jsonResponse({ data: { post: created, target, raw: text } }, 201)
  }

  // in-place — reuse the same auto-revision logic as PATCH
  const recent = await cms.revisions.findByPost(postId)
  const last = recent[0]
  if (!last || last.markdown !== post.markdown || last.title !== post.title) {
    await cms.revisions.create(postId, {
      title: post.title,
      subtitle: post.subtitle ?? undefined,
      markdown: post.markdown,
    })
    await cms.revisions.pruneOldest(postId, 50)
  }

  const updated = await cms.posts.update(postId, {
    title: newTitle,
    subtitle: newSubtitle,
    markdown: newMarkdown,
  })
  return jsonResponse({ data: { post: updated, target, raw: text } })
}
