import type { AutobloggerServer } from '../../server'
import { PostStatus } from '../../types/models'

type NextRequest = Request & { nextUrl: URL }

export function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

export function badRequest(message: string): Response {
  return jsonResponse({ error: message }, 400)
}

export function notFound(resource: string): Response {
  return jsonResponse({ error: `${resource} not found` }, 404)
}

export function unprocessable(message: string): Response {
  return jsonResponse({ error: message }, 422)
}

export function methodNotAllowed(): Response {
  return jsonResponse({ error: 'Method not allowed' }, 405)
}

/**
 * Collect a Server-Sent Events stream produced by the internal AI helpers
 * (createStream / chatStream / generateStream / expandPlanStream) into a
 * single text string. Mirrors the approach in src/api/ai.ts:325-351.
 */
export async function collectStream(stream: ReadableStream): Promise<string> {
  const reader = stream.getReader()
  const decoder = new TextDecoder()
  let text = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    const chunk = decoder.decode(value, { stream: true })
    for (const line of chunk.split('\n')) {
      if (!line.startsWith('data: ')) continue
      const data = line.slice(6)
      if (data === '[DONE]') continue
      try {
        const parsed = JSON.parse(data)
        if (typeof parsed.text === 'string') text += parsed.text
      } catch {
        // ignore parse errors — non-text events
      }
    }
  }
  return text
}

export interface ListQuery {
  status?: string
  q?: string
  tags: string[]
  topicId?: string
  since?: Date
  until?: Date
  sort: 'updated' | 'created' | 'published' | 'title'
  order: 'asc' | 'desc'
  page: number
  limit: number
  include: Set<string>
}

export function parseListQuery(url: URL): ListQuery {
  const status = url.searchParams.get('status') || undefined
  const q = url.searchParams.get('q') || undefined
  const tags = url.searchParams.getAll('tag').filter(Boolean)
  const topicId = url.searchParams.get('topicId') || undefined

  const sinceRaw = url.searchParams.get('since')
  const untilRaw = url.searchParams.get('until')
  const since = sinceRaw ? new Date(sinceRaw) : undefined
  const until = untilRaw ? new Date(untilRaw) : undefined

  const sortRaw = url.searchParams.get('sort') as ListQuery['sort'] | null
  const sort: ListQuery['sort'] =
    sortRaw === 'created' || sortRaw === 'published' || sortRaw === 'title' ? sortRaw : 'updated'
  const orderRaw = url.searchParams.get('order')
  const order: ListQuery['order'] = orderRaw === 'asc' ? 'asc' : 'desc'

  const page = Math.max(parseInt(url.searchParams.get('page') || '1', 10), 1)
  const limitRaw = parseInt(url.searchParams.get('limit') || '25', 10)
  const limit = Math.max(1, Math.min(limitRaw || 25, 200))

  const includeRaw = url.searchParams.get('include') || ''
  const include = new Set(includeRaw.split(',').map((s) => s.trim()).filter(Boolean))

  return { status, q, tags, topicId, since, until, sort, order, page, limit, include }
}

const SORT_FIELDS: Record<ListQuery['sort'], string> = {
  updated: 'updatedAt',
  created: 'createdAt',
  published: 'publishedAt',
  title: 'title',
}

/**
 * Build a Prisma `where`/`orderBy`/`skip`/`take`/`include` shape from a parsed list query.
 */
export function buildPostsQuery(query: ListQuery) {
  const where: Record<string, unknown> = {}

  if (query.status === 'all') {
    // no filter
  } else if (query.status) {
    where.status = query.status
  } else {
    // default: exclude deleted (trash)
    where.status = { not: PostStatus.DELETED }
  }

  if (query.topicId) where.topicId = query.topicId

  if (query.q) {
    where.OR = [
      { title: { contains: query.q, mode: 'insensitive' } },
      { subtitle: { contains: query.q, mode: 'insensitive' } },
      { markdown: { contains: query.q, mode: 'insensitive' } },
    ]
  }

  if (query.tags.length > 0) {
    where.AND = query.tags.map((slug) => ({
      tags: { some: { tag: { name: slug } } },
    }))
  }

  const dateField = query.status === 'published' ? 'publishedAt' : 'updatedAt'
  if (query.since || query.until) {
    const range: Record<string, Date> = {}
    if (query.since) range.gte = query.since
    if (query.until) range.lte = query.until
    where[dateField] = range
  }

  const include: Record<string, unknown> = {}
  if (query.include.has('tags') || query.include.size === 0) {
    include.tags = { include: { tag: true } }
  }
  if (query.include.has('revisionCount')) {
    include._count = { select: { revisions: true } }
  }

  return {
    where,
    orderBy: { [SORT_FIELDS[query.sort]]: query.order } as Record<string, 'asc' | 'desc'>,
    skip: (query.page - 1) * query.limit,
    take: query.limit,
    include,
  }
}

function countWords(text?: string | null): number {
  if (!text) return 0
  return text.split(/\s+/).filter(Boolean).length
}

export function withWordCount<T extends { markdown?: string | null }>(post: T): T & { wordCount: number } {
  return { ...post, wordCount: countWords(post.markdown) }
}

/**
 * Apply a status transition to a post. Used by /publish, /unpublish,
 * /restore, /approve, and /status. All transitions are idempotent.
 */
export async function applyStatusTransition(
  cms: AutobloggerServer,
  postId: string,
  target: string,
  extras?: { publishedAt?: Date | null }
) {
  const validTargets = [PostStatus.DRAFT, PostStatus.PUBLISHED, PostStatus.SUGGESTED, PostStatus.DELETED]
  if (!validTargets.includes(target as (typeof validTargets)[number])) {
    return { error: `Invalid status: ${target}`, status: 400 as const }
  }

  const existing = await cms.posts.findById(postId)
  if (!existing) return { error: 'Post not found', status: 404 as const }

  if (target === PostStatus.DELETED) {
    const result = await cms.posts.delete(postId)
    return { post: result }
  }

  if (target === PostStatus.DRAFT) {
    const result = await cms.posts.update(postId, {
      status: PostStatus.DRAFT,
      publishedAt: null as unknown as Date,
    })
    return { post: result }
  }

  if (target === PostStatus.PUBLISHED) {
    const data: Record<string, unknown> = { status: PostStatus.PUBLISHED }
    if (extras?.publishedAt) data.publishedAt = extras.publishedAt
    const result = await cms.posts.update(postId, data)
    return { post: result }
  }

  // suggested
  const result = await cms.posts.update(postId, { status: target })
  return { post: result }
}

/**
 * Extract the postId from a public API path when the path matches one of the
 * post-targeting shapes. Used by the audit logger so handlers don't need to
 * opt in.
 */
export function extractPostIdFromPath(path: string): string | null {
  // /v1/posts/<id>(/...)?
  const m = path.match(/^\/v1\/posts\/([^/]+)(?:\/|$)/)
  if (m && !['drafts', 'published', 'suggested', 'trash', 'counts', 'by-slug'].includes(m[1])) {
    return m[1]
  }
  return null
}

export type { NextRequest }
