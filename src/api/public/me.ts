import type { AutobloggerServer } from '../../server'
import type { VerifiedKey } from '../../data/api-keys'
import { jsonResponse, methodNotAllowed, type NextRequest } from './shared'

export async function handlePublicMe(
  req: NextRequest,
  cms: AutobloggerServer,
  key: VerifiedKey,
  _path: string
): Promise<Response> {
  if (req.method !== 'GET') return methodNotAllowed()

  const full = await cms.apiKeys.findById(key.id)
  if (!full) return jsonResponse({ error: 'Key not found' }, 404)

  return jsonResponse({
    data: {
      id: full.id,
      name: full.name,
      prefix: full.prefix,
      ownerUserId: full.ownerUserId,
      createdAt: full.createdAt,
      lastUsedAt: full.lastUsedAt,
    },
  })
}
