import type { AutobloggerServer } from '../server'
import type { Session } from '../types/session'

/**
 * Create a JSON response with proper headers.
 */
export function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

/**
 * Parse URL path into segments and common parts.
 */
export function parsePath(path: string): {
  segments: string[]
  resource: string
  id?: string
  subPath: string
} {
  const segments = path.split('/').filter(Boolean)
  return {
    segments,
    resource: segments[0] || '',
    id: segments[1],
    subPath: segments.slice(2).join('/'),
  }
}

/**
 * Check if user is admin, return error response if not.
 * Returns null if authorized.
 */
export function requireAdmin(
  cms: AutobloggerServer,
  session: Session | null
): Response | null {
  if (!cms.config.auth.isAdmin(session)) {
    return jsonResponse({ error: 'Admin required' }, 403)
  }
  return null
}

/**
 * Check if user is authenticated, return error response if not.
 * Returns null if authorized.
 */
export function requireAuth(session: Session | null): Response | null {
  if (!session) {
    return jsonResponse({ error: 'Authentication required' }, 401)
  }
  return null
}

/**
 * Check if user can publish, return error response if not.
 * Returns null if authorized.
 */
export function requirePublish(
  cms: AutobloggerServer,
  session: Session | null
): Response | null {
  if (!cms.config.auth.canPublish(session)) {
    return jsonResponse({ error: 'Publish permission required' }, 403)
  }
  return null
}
