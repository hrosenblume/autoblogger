import type { AutobloggerServer as Autoblogger, Session } from '../server'
import { jsonResponse, parsePath, requireAdmin } from './utils'

type NextRequest = Request & { nextUrl: URL }

export async function handleRevisionsAPI(
  req: NextRequest,
  cms: Autoblogger,
  session: Session | null,
  path: string,
  onMutate?: (type: string, data: unknown) => Promise<void>
): Promise<Response> {
  const method = req.method
  const url = new URL(req.url)
  const { id: revisionId, subPath } = parsePath(path)

  // GET /revisions - list all revisions (paginated)
  if (method === 'GET' && !revisionId) {
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '25')
    const postId = url.searchParams.get('postId')

    const where = postId ? { postId } : {}
    
    const [revisions, total] = await Promise.all([
      cms.revisions.findAll({ ...where, skip: (page - 1) * limit, take: limit }),
      cms.revisions.count(where),
    ])

    return jsonResponse({
      data: revisions,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    })
  }

  // GET /revisions/:id - get single revision
  if (method === 'GET' && revisionId) {
    const revision = await cms.revisions.findById(revisionId)
    if (!revision) return jsonResponse({ error: 'Revision not found' }, 404)
    return jsonResponse({ data: revision })
  }

  // POST /revisions/:id/restore - restore a revision
  if (method === 'POST' && revisionId && subPath === 'restore') {
    const authError = requireAdmin(cms, session)
    if (authError) return authError

    const post = await cms.revisions.restore(revisionId)
    if (onMutate) await onMutate('post', post)
    return jsonResponse({ data: post })
  }

  // DELETE /revisions/:id - delete a revision
  if (method === 'DELETE' && revisionId) {
    const authError = requireAdmin(cms, session)
    if (authError) return authError

    await cms.revisions.delete(revisionId)
    return jsonResponse({ data: { success: true } })
  }

  return jsonResponse({ error: 'Method not allowed' }, 405)
}
