import type { AutobloggerServer, Session } from '../server'

type NextRequest = Request & { nextUrl: URL }

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

export async function handleAdminAPI(
  req: NextRequest,
  cms: AutobloggerServer,
  session: Session | null,
  path: string
): Promise<Response> {
  const method = req.method

  // All admin operations require admin role
  if (!cms.config.auth.isAdmin(session)) {
    return jsonResponse({ error: 'Admin required' }, 403)
  }

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
