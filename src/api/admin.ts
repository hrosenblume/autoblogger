import type { AutobloggerServer, Session } from '../server'
import { jsonResponse, requireAdmin } from './utils'

type NextRequest = Request & { nextUrl: URL }

export async function handleAdminAPI(
  req: NextRequest,
  cms: AutobloggerServer,
  session: Session | null,
  path: string
): Promise<Response> {
  const method = req.method

  // All admin operations require admin role
  const authError = requireAdmin(cms, session)
  if (authError) return authError

  // GET /admin/counts - get counts for dashboard
  if (method === 'GET' && path === '/admin/counts') {
    const [users, posts, tags, topics] = await Promise.all([
      cms.users.count(),
      cms.posts.findAll().then(p => p.length),
      cms.tags.findAll().then(t => t.length),
      cms.topics.findAll().then(t => t.length),
    ])
    return jsonResponse({ 
      data: { users, posts, tags, topics } 
    })
  }

  return jsonResponse({ error: 'Not found' }, 404)
}
