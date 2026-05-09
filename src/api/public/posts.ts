import type { AutobloggerServer } from '../../server'
import type { VerifiedKey } from '../../data/api-keys'
import { PostStatus } from '../../types/models'
import {
  jsonResponse,
  badRequest,
  notFound,
  unprocessable,
  methodNotAllowed,
  parseListQuery,
  buildPostsQuery,
  withWordCount,
  applyStatusTransition,
  type NextRequest,
} from './shared'

const STATUS_ALIASES: Record<string, string> = {
  drafts: PostStatus.DRAFT,
  published: PostStatus.PUBLISHED,
  suggested: PostStatus.SUGGESTED,
  trash: PostStatus.DELETED,
}

export async function handlePublicPosts(
  req: NextRequest,
  cms: AutobloggerServer,
  _key: VerifiedKey,
  path: string
): Promise<Response> {
  const method = req.method
  const segments = path.split('/').filter(Boolean) // ['v1', 'posts', ...]
  const second = segments[2]
  const third = segments[3]

  // GET /v1/posts/counts — counts grouped by status
  if (method === 'GET' && second === 'counts') {
    const prisma = cms.config.prisma as any
    const grouped = await prisma.post.groupBy({
      by: ['status'],
      _count: { _all: true },
    })
    const out: Record<string, number> = { all: 0, draft: 0, published: 0, suggested: 0, deleted: 0 }
    for (const row of grouped as Array<{ status: string; _count: { _all: number } }>) {
      out[row.status] = row._count._all
      out.all += row._count._all
    }
    return jsonResponse({ data: out })
  }

  // GET /v1/posts/by-slug/:slug
  if (method === 'GET' && second === 'by-slug' && third) {
    const post = await cms.posts.findBySlug(third)
    if (!post) return notFound('Post')
    return jsonResponse({ data: withWordCount(post) })
  }

  // GET /v1/posts/{drafts,published,suggested,trash} — convenience list aliases
  if (method === 'GET' && second && STATUS_ALIASES[second] && !third) {
    const prisma = cms.config.prisma as any
    const url = new URL(req.url)
    url.searchParams.set('status', STATUS_ALIASES[second])
    const fakeReq = Object.assign(new Request(url.toString(), { headers: req.headers }), {
      nextUrl: url,
    }) as NextRequest
    return listPosts(fakeReq, prisma)
  }

  // GET /v1/posts — list with filters
  if (method === 'GET' && !second) {
    const prisma = cms.config.prisma as any
    return listPosts(req, prisma)
  }

  // GET /v1/posts/:id
  if (method === 'GET' && second && !third) {
    const post = await cms.posts.findById(second)
    if (!post) return notFound('Post')
    return jsonResponse({ data: withWordCount(post) })
  }

  // POST /v1/posts — create
  if (method === 'POST' && !second) {
    const body = await req.json().catch(() => ({}))
    if (!body || typeof body.title !== 'string' || !body.title.trim()) {
      return badRequest('title is required')
    }
    const post = await cms.posts.create({
      title: body.title,
      subtitle: body.subtitle,
      slug: body.slug,
      markdown: typeof body.markdown === 'string' ? body.markdown : '',
      status: body.status || PostStatus.DRAFT,
      sourceUrl: body.sourceUrl,
      seoTitle: body.seoTitle,
      seoDescription: body.seoDescription,
      seoKeywords: body.seoKeywords,
      noIndex: body.noIndex,
      ogImage: body.ogImage,
      tagIds: Array.isArray(body.tagIds) ? body.tagIds : undefined,
    })
    return jsonResponse({ data: post }, 201)
  }

  // PATCH /v1/posts/:id — partial update
  if (method === 'PATCH' && second && !third) {
    const body = await req.json().catch(() => ({}))
    return updatePost(cms, second, body)
  }

  // PUT /v1/posts/:id — same shape, treated as full replacement (still partial in practice)
  if (method === 'PUT' && second && !third) {
    const body = await req.json().catch(() => ({}))
    if (!body || typeof body.title !== 'string') {
      return badRequest('PUT requires a full body with at least a title')
    }
    return updatePost(cms, second, body)
  }

  // DELETE /v1/posts/:id — soft delete
  if (method === 'DELETE' && second && !third) {
    const existing = await cms.posts.findById(second)
    if (!existing) return notFound('Post')
    await cms.posts.delete(second)
    return jsonResponse({ data: { success: true } })
  }

  // POST /v1/posts/:id/publish
  if (method === 'POST' && second && third === 'publish') {
    const body = await req.json().catch(() => ({}))
    const publishedAt = body?.publishedAt ? new Date(body.publishedAt) : undefined
    const result = await applyStatusTransition(cms, second, PostStatus.PUBLISHED, { publishedAt })
    if ('error' in result) return jsonResponse({ error: result.error }, result.status)
    return jsonResponse({ data: result.post })
  }

  // POST /v1/posts/:id/unpublish — alias for status='draft'
  if (method === 'POST' && second && third === 'unpublish') {
    const result = await applyStatusTransition(cms, second, PostStatus.DRAFT)
    if ('error' in result) return jsonResponse({ error: result.error }, result.status)
    return jsonResponse({ data: result.post })
  }

  // POST /v1/posts/:id/restore — bring back from trash → draft
  if (method === 'POST' && second && third === 'restore') {
    const existing = await cms.posts.findById(second)
    if (!existing) return notFound('Post')
    if (existing.status !== PostStatus.DELETED) {
      return unprocessable('Post is not in trash')
    }
    const result = await applyStatusTransition(cms, second, PostStatus.DRAFT)
    if ('error' in result) return jsonResponse({ error: result.error }, result.status)
    return jsonResponse({ data: result.post })
  }

  // POST /v1/posts/:id/approve — suggested → draft
  if (method === 'POST' && second && third === 'approve') {
    const existing = await cms.posts.findById(second)
    if (!existing) return notFound('Post')
    if (existing.status !== PostStatus.SUGGESTED) {
      return unprocessable('Post is not in suggested state')
    }
    const result = await applyStatusTransition(cms, second, PostStatus.DRAFT)
    if ('error' in result) return jsonResponse({ error: result.error }, result.status)
    return jsonResponse({ data: result.post })
  }

  // POST /v1/posts/:id/status — generic transition
  if (method === 'POST' && second && third === 'status') {
    const body = await req.json().catch(() => ({}))
    const target = typeof body.status === 'string' ? body.status : ''
    if (!target) return badRequest('status is required')
    const result = await applyStatusTransition(cms, second, target)
    if ('error' in result) return jsonResponse({ error: result.error }, result.status)
    return jsonResponse({ data: result.post })
  }

  // POST /v1/posts/:id/duplicate — clone as a new draft
  if (method === 'POST' && second && third === 'duplicate') {
    const original = await cms.posts.findById(second)
    if (!original) return notFound('Post')
    const cloned = await cms.posts.create({
      title: `${original.title} (copy)`,
      subtitle: original.subtitle,
      slug: `${original.slug}-copy`,
      markdown: original.markdown,
      status: PostStatus.DRAFT,
      seoTitle: original.seoTitle,
      seoDescription: original.seoDescription,
      seoKeywords: original.seoKeywords,
      ogImage: original.ogImage,
    })
    return jsonResponse({ data: cloned }, 201)
  }

  // POST /v1/posts/:id/preview-link — issue preview token
  if (method === 'POST' && second && third === 'preview-link') {
    const existing = await cms.posts.findById(second)
    if (!existing) return notFound('Post')
    const url = await cms.posts.getPreviewUrl(second)
    return jsonResponse({ data: { url } })
  }

  // GET /v1/posts/:id/revisions — list revisions for a post
  if (method === 'GET' && second && third === 'revisions') {
    const existing = await cms.posts.findById(second)
    if (!existing) return notFound('Post')
    const revisions = await cms.revisions.findByPost(second)
    return jsonResponse({ data: revisions })
  }

  // POST /v1/posts/:id/tags — replace tags on a post
  if (method === 'POST' && second && third === 'tags') {
    const existing = await cms.posts.findById(second)
    if (!existing) return notFound('Post')
    const body = await req.json().catch(() => ({}))
    const prisma = cms.config.prisma as any

    let tagIds: string[] = Array.isArray(body.tagIds) ? body.tagIds : []
    if (Array.isArray(body.tagNames)) {
      const names: string[] = body.tagNames.map((n: unknown) => String(n).trim()).filter(Boolean)
      for (const name of names) {
        let tag = await cms.tags.findByName(name)
        if (!tag) tag = await cms.tags.create(name)
        tagIds.push(tag.id)
      }
    }

    await prisma.postTag.deleteMany({ where: { postId: second } })
    if (tagIds.length > 0) {
      await prisma.postTag.createMany({
        data: tagIds.map((tagId) => ({ postId: second, tagId })),
        skipDuplicates: true,
      })
    }
    const post = await cms.posts.findById(second)
    return jsonResponse({ data: post })
  }

  // POST /v1/posts/:id/agent — handled in ai handler. Routed there from index.ts.
  // (We keep the route here as a 404 to make the surface explicit if reached.)

  return methodNotAllowed()
}

async function listPosts(req: NextRequest, prisma: any): Promise<Response> {
  const url = new URL(req.url)
  const query = parseListQuery(url)
  const built = buildPostsQuery(query)

  const [data, total] = await Promise.all([
    prisma.post.findMany(built),
    prisma.post.count({ where: built.where }),
  ])

  return jsonResponse({
    data: data.map((post: { markdown?: string | null }) => withWordCount(post as { markdown?: string | null })),
    total,
    page: query.page,
    totalPages: Math.ceil(total / query.limit) || 1,
  })
}

async function updatePost(cms: AutobloggerServer, id: string, body: Record<string, unknown>): Promise<Response> {
  const existing = await cms.posts.findById(id)
  if (!existing) return notFound('Post')

  // Auto-create a revision when content fields are changing — mirrors the
  // internal API logic in src/api/posts.ts (lines 91-115). Kept inline here
  // so we don't refactor the data layer in the same PR.
  const contentChanging =
    'title' in body || 'subtitle' in body || 'markdown' in body
  if (contentChanging && existing.markdown) {
    const recent = await cms.revisions.findByPost(id)
    const last = recent[0]
    const isDifferent =
      !last ||
      last.markdown !== existing.markdown ||
      last.title !== existing.title ||
      last.subtitle !== existing.subtitle
    if (isDifferent) {
      await cms.revisions.create(id, {
        title: existing.title,
        subtitle: existing.subtitle ?? undefined,
        markdown: existing.markdown,
      })
      await cms.revisions.pruneOldest(id, 50)
    }
  }

  const post = await cms.posts.update(id, body)
  return jsonResponse({ data: post })
}
