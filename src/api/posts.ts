import type { Autoblogger, Session } from '../config'

type NextRequest = Request & { nextUrl: URL }

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

export async function handlePostsAPI(
  req: NextRequest,
  cms: Autoblogger,
  session: Session | null,
  path: string,
  onMutate?: (type: string, data: unknown) => Promise<void>
): Promise<Response> {
  const method = req.method
  const segments = path.split('/').filter(Boolean)
  const postId = segments[1]

  // GET /posts - list posts
  if (method === 'GET' && !postId) {
    const url = new URL(req.url)
    const status = url.searchParams.get('status')
    const posts = await cms.posts.findAll({ status: status || undefined })
    return jsonResponse({ data: posts })
  }

  // GET /posts/:id - get single post
  if (method === 'GET' && postId) {
    const post = await cms.posts.findById(postId)
    if (!post) return jsonResponse({ error: 'Post not found' }, 404)
    return jsonResponse({ data: post })
  }

  // POST /posts - create post
  if (method === 'POST') {
    const body = await req.json()
    const post = await cms.posts.create(body)
    if (onMutate) await onMutate('post', post)
    return jsonResponse({ data: post }, 201)
  }

  // PATCH /posts/:id - update post
  if (method === 'PATCH' && postId) {
    const body = await req.json()
    
    // Check publish permission
    if (body.status === 'published' && !cms.config.auth.canPublish(session)) {
      return jsonResponse({ error: 'Not authorized to publish' }, 403)
    }
    
    const post = await cms.posts.update(postId, body)
    if (onMutate) await onMutate('post', post)
    return jsonResponse({ data: post })
  }

  // DELETE /posts/:id - delete post
  if (method === 'DELETE' && postId) {
    if (!cms.config.auth.isAdmin(session)) {
      return jsonResponse({ error: 'Admin required' }, 403)
    }
    await cms.posts.delete(postId)
    if (onMutate) await onMutate('post', { id: postId })
    return jsonResponse({ data: { success: true } })
  }

  return jsonResponse({ error: 'Method not allowed' }, 405)
}
