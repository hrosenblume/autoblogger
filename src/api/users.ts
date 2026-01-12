import type { AutobloggerServer, Session } from '../server'

type NextRequest = Request & { nextUrl: URL }

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

export async function handleUsersAPI(
  req: NextRequest,
  cms: AutobloggerServer,
  session: Session | null,
  path: string
): Promise<Response> {
  const method = req.method
  const segments = path.split('/').filter(Boolean)
  const userId = segments[1]

  // All user operations require admin
  if (!cms.config.auth.isAdmin(session)) {
    return jsonResponse({ error: 'Admin required' }, 403)
  }

  // GET /users - list all users
  if (method === 'GET' && !userId) {
    const users = await cms.users.findAll()
    return jsonResponse({ data: users })
  }

  // GET /users/:id - get single user
  if (method === 'GET' && userId) {
    const user = await cms.users.findById(userId)
    if (!user) return jsonResponse({ error: 'User not found' }, 404)
    return jsonResponse({ data: user })
  }

  // POST /users - create user
  if (method === 'POST') {
    const body = await req.json()
    if (!body.email) {
      return jsonResponse({ error: 'Email required' }, 400)
    }
    const user = await cms.users.create(body)
    return jsonResponse({ data: user }, 201)
  }

  // PATCH /users/:id - update user
  if (method === 'PATCH' && userId) {
    const body = await req.json()
    const user = await cms.users.update(userId, body)
    return jsonResponse({ data: user })
  }

  // DELETE /users/:id - delete user
  if (method === 'DELETE' && userId) {
    await cms.users.delete(userId)
    return jsonResponse({ data: { success: true } })
  }

  return jsonResponse({ error: 'Method not allowed' }, 405)
}
