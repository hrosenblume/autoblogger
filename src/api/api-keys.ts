import type { AutobloggerServer, Session } from '../server'
import { jsonResponse, requireAdmin } from './utils'

type NextRequest = Request & { nextUrl: URL }

interface PublicKeyShape {
  id: string
  name: string
  prefix: string
  ownerUserId: string | null
  createdAt: Date
  lastUsedAt: Date | null
  revokedAt: Date | null
}

function toPublic(key: {
  id: string
  name: string
  prefix: string
  ownerUserId: string | null
  createdAt: Date
  lastUsedAt: Date | null
  revokedAt: Date | null
}): PublicKeyShape {
  return {
    id: key.id,
    name: key.name,
    prefix: key.prefix,
    ownerUserId: key.ownerUserId,
    createdAt: key.createdAt,
    lastUsedAt: key.lastUsedAt,
    revokedAt: key.revokedAt,
  }
}

export async function handleApiKeysAPI(
  req: NextRequest,
  cms: AutobloggerServer,
  session: Session | null,
  path: string
): Promise<Response> {
  const method = req.method

  // All key management requires admin
  const adminError = requireAdmin(cms, session)
  if (adminError) return adminError

  const segments = path.split('/').filter(Boolean) // ['api-keys', ...]
  const id = segments[1]
  const action = segments[2]

  // GET /api-keys/audit - paginated audit log
  if (method === 'GET' && id === 'audit') {
    const url = new URL(req.url)
    const keyId = url.searchParams.get('keyId') || undefined
    const postId = url.searchParams.get('postId') || undefined
    const page = parseInt(url.searchParams.get('page') || '1', 10)
    const limit = parseInt(url.searchParams.get('limit') || '50', 10)

    const result = await cms.apiAuditLog.findAll({ keyId, postId, page, limit })
    return jsonResponse(result)
  }

  // GET /api-keys - list keys
  if (method === 'GET' && !id) {
    const keys = await cms.apiKeys.findAll()
    return jsonResponse({ data: keys.map(toPublic) })
  }

  // POST /api-keys - create key (returns plaintext ONCE)
  if (method === 'POST' && !id) {
    const body = await req.json().catch(() => ({}))
    const name = typeof body.name === 'string' ? body.name.trim() : ''
    if (!name) {
      return jsonResponse({ error: 'name is required' }, 400)
    }

    const ownerUserId = session?.user?.id || null
    const { key, plaintext } = await cms.apiKeys.create({ name, ownerUserId })

    return jsonResponse({ data: { ...toPublic(key), plaintext } }, 201)
  }

  // POST /api-keys/:id/revoke - revoke key (idempotent)
  if (method === 'POST' && id && action === 'revoke') {
    const existing = await cms.apiKeys.findById(id)
    if (!existing) return jsonResponse({ error: 'Key not found' }, 404)
    if (existing.revokedAt) return jsonResponse({ data: toPublic(existing) })
    const updated = await cms.apiKeys.revoke(id)
    return jsonResponse({ data: toPublic(updated) })
  }

  // DELETE /api-keys/:id - permanently delete
  if (method === 'DELETE' && id && !action) {
    const existing = await cms.apiKeys.findById(id)
    if (!existing) return jsonResponse({ error: 'Key not found' }, 404)
    await cms.apiKeys.delete(id)
    return jsonResponse({ data: { success: true } })
  }

  return jsonResponse({ error: 'Not found' }, 404)
}
