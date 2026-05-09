import type { AutobloggerServer } from '../../server'
import type { VerifiedKey } from '../../data/api-keys'

type NextRequest = Request & { nextUrl: URL }

const BEARER_PREFIX = 'Bearer '

export interface AuthSuccess {
  ok: true
  key: VerifiedKey
}
export interface AuthFailure {
  ok: false
  reason: 'missing' | 'invalid' | 'revoked'
}
export type AuthResult = AuthSuccess | AuthFailure

/**
 * Pull the bearer token out of the Authorization header and verify it
 * against the ApiKey table.
 */
export async function authenticate(req: Request, cms: AutobloggerServer): Promise<AuthResult> {
  const header = req.headers.get('authorization') || req.headers.get('Authorization')
  if (!header || !header.startsWith(BEARER_PREFIX)) {
    return { ok: false, reason: 'missing' }
  }
  const plaintext = header.slice(BEARER_PREFIX.length).trim()
  if (!plaintext) return { ok: false, reason: 'missing' }

  const verified = await cms.apiKeys.verify(plaintext)
  if (!verified) return { ok: false, reason: 'invalid' }
  return { ok: true, key: verified }
}

/**
 * Return the client IP from common proxy headers, falling back to null.
 */
export function getClientIp(req: NextRequest): string | null {
  const fwd = req.headers.get('x-forwarded-for')
  if (fwd) return fwd.split(',')[0]?.trim() || null
  const real = req.headers.get('x-real-ip')
  if (real) return real
  return null
}
