import type { AutobloggerServer as Autoblogger, Session } from '../server'
import { jsonResponse, parsePath, requireAdmin } from './utils'

type NextRequest = Request & { nextUrl: URL }

export async function handleTagsAPI(
  req: NextRequest,
  cms: Autoblogger,
  session: Session | null,
  path: string,
  onMutate?: (type: string, data: unknown) => Promise<void>
): Promise<Response> {
  const method = req.method
  const { id: tagId } = parsePath(path)

  // GET /tags - list all tags
  if (method === 'GET' && !tagId) {
    const tags = await cms.tags.findAll()
    return jsonResponse({ data: tags })
  }

  // POST /tags - create tag
  if (method === 'POST') {
    const authError = requireAdmin(cms, session)
    if (authError) return authError

    const body = await req.json()
    const tag = await cms.tags.create(body.name)
    if (onMutate) await onMutate('tag', tag)
    return jsonResponse({ data: tag }, 201)
  }

  // PATCH /tags/:id - update tag
  if (method === 'PATCH' && tagId) {
    const authError = requireAdmin(cms, session)
    if (authError) return authError

    const body = await req.json()
    const tag = await cms.tags.update(tagId, body.name)
    return jsonResponse({ data: tag })
  }

  // DELETE /tags/:id - delete tag
  if (method === 'DELETE' && tagId) {
    const authError = requireAdmin(cms, session)
    if (authError) return authError

    await cms.tags.delete(tagId)
    return jsonResponse({ data: { success: true } })
  }

  return jsonResponse({ error: 'Method not allowed' }, 405)
}
