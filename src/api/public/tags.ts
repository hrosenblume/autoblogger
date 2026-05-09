import type { AutobloggerServer } from '../../server'
import type { VerifiedKey } from '../../data/api-keys'
import {
  jsonResponse,
  badRequest,
  notFound,
  methodNotAllowed,
  type NextRequest,
} from './shared'

export async function handlePublicTags(
  req: NextRequest,
  cms: AutobloggerServer,
  _key: VerifiedKey,
  path: string
): Promise<Response> {
  const method = req.method
  const segments = path.split('/').filter(Boolean) // ['v1', 'tags', ...]
  const id = segments[2]

  // GET /v1/tags
  if (method === 'GET' && !id) {
    const tags = await cms.tags.findAll()
    return jsonResponse({ data: tags })
  }

  // GET /v1/tags/:id
  if (method === 'GET' && id) {
    const tag = await cms.tags.findById(id)
    if (!tag) return notFound('Tag')
    return jsonResponse({ data: tag })
  }

  // POST /v1/tags
  if (method === 'POST' && !id) {
    const body = await req.json().catch(() => ({}))
    const name = typeof body.name === 'string' ? body.name.trim() : ''
    if (!name) return badRequest('name is required')
    const tag = await cms.tags.create(name)
    return jsonResponse({ data: tag }, 201)
  }

  // PATCH /v1/tags/:id
  if (method === 'PATCH' && id) {
    const body = await req.json().catch(() => ({}))
    const name = typeof body.name === 'string' ? body.name.trim() : ''
    if (!name) return badRequest('name is required')
    const tag = await cms.tags.update(id, name)
    return jsonResponse({ data: tag })
  }

  // DELETE /v1/tags/:id (cascade via Prisma FK rules)
  if (method === 'DELETE' && id) {
    const existing = await cms.tags.findById(id)
    if (!existing) return notFound('Tag')
    await cms.tags.delete(id)
    return jsonResponse({ data: { success: true } })
  }

  return methodNotAllowed()
}
