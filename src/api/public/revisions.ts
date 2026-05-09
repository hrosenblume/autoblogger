import type { AutobloggerServer } from '../../server'
import type { VerifiedKey } from '../../data/api-keys'
import {
  jsonResponse,
  notFound,
  methodNotAllowed,
  type NextRequest,
} from './shared'

export async function handlePublicRevisions(
  req: NextRequest,
  cms: AutobloggerServer,
  _key: VerifiedKey,
  path: string
): Promise<Response> {
  const method = req.method
  const segments = path.split('/').filter(Boolean) // ['v1', 'revisions', ':id', 'restore']
  const id = segments[2]
  const action = segments[3]

  // GET /v1/revisions/:id
  if (method === 'GET' && id && !action) {
    const revision = await cms.revisions.findById(id)
    if (!revision) return notFound('Revision')
    return jsonResponse({ data: revision })
  }

  // POST /v1/revisions/:id/restore
  if (method === 'POST' && id && action === 'restore') {
    try {
      const post = await cms.revisions.restore(id)
      return jsonResponse({ data: post })
    } catch {
      return notFound('Revision')
    }
  }

  return methodNotAllowed()
}
