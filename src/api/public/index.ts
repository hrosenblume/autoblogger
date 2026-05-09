import type { AutobloggerServer } from '../../server'
import { jsonResponse, extractPostIdFromPath, type NextRequest } from './shared'
import { authenticate, getClientIp } from './auth'
import { handlePublicPosts } from './posts'
import { handlePublicTags } from './tags'
import { handlePublicRevisions } from './revisions'
import { handlePublicTopics } from './topics'
import { handlePublicAI } from './ai'
import { handlePublicMe } from './me'

/**
 * Strip the configured base path (defaults to /writer/api) and return the
 * resource path under /v1/*.
 */
function extractV1Path(pathname: string): string {
  const idx = pathname.indexOf('/v1')
  if (idx === -1) return pathname
  return pathname.slice(idx)
}

export function createPublicAPIHandler(cms: AutobloggerServer) {
  return async (req: NextRequest): Promise<Response> => {
    const path = extractV1Path(req.nextUrl.pathname)
    const method = req.method
    const ip = getClientIp(req)
    const userAgent = req.headers.get('user-agent')

    // Authenticate first; failures still get logged (with apiKeyId: null) so
    // operators can see attempted access.
    const auth = await authenticate(req, cms)
    if (!auth.ok) {
      const status = 401
      cms.apiAuditLog.append({
        apiKeyId: null,
        apiKeyName: '<unauthorized>',
        method,
        path,
        postId: extractPostIdFromPath(path),
        status,
        ip,
        userAgent,
      })
      const message =
        auth.reason === 'missing'
          ? 'Missing or malformed Authorization header'
          : 'Invalid or revoked API key'
      return jsonResponse({ error: message }, status)
    }

    const { key } = auth
    let response: Response

    try {
      if (path === '/v1/me') {
        response = await handlePublicMe(req, cms, key, path)
      } else if (/^\/v1\/posts\/[^/]+\/agent$/.test(path)) {
        // Agent edits live in the AI handler since they share the chatStream surface
        response = await handlePublicAI(req, cms, key, path)
      } else if (path.startsWith('/v1/posts')) {
        response = await handlePublicPosts(req, cms, key, path)
      } else if (path.startsWith('/v1/tags')) {
        response = await handlePublicTags(req, cms, key, path)
      } else if (path.startsWith('/v1/revisions')) {
        response = await handlePublicRevisions(req, cms, key, path)
      } else if (path.startsWith('/v1/topics') || path.startsWith('/v1/auto-draft')) {
        response = await handlePublicTopics(req, cms, key, path)
      } else if (path.startsWith('/v1/ai')) {
        response = await handlePublicAI(req, cms, key, path)
      } else {
        response = jsonResponse({ error: 'Not found' }, 404)
      }
    } catch (err) {
      console.error('[public-api]', err)
      response = jsonResponse(
        { error: err instanceof Error ? err.message : 'Internal server error' },
        500
      )
    }

    // Fire-and-forget audit log + lastUsedAt bump.
    const status = response.status
    cms.apiAuditLog.append({
      apiKeyId: key.id,
      apiKeyName: key.name,
      method,
      path,
      postId: extractPostIdFromPath(path),
      status,
      ip,
      userAgent,
    })
    cms.apiKeys.touch(key.id)

    return response
  }
}
