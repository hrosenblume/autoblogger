import type { AutobloggerServer as Autoblogger, Session } from '../server'

type NextRequest = Request & { nextUrl: URL }

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

export async function handleCommentsAPI(
  req: NextRequest,
  cms: Autoblogger,
  session: Session | null,
  path: string,
  onMutate?: (type: string, data: unknown) => Promise<void>
): Promise<Response> {
  const method = req.method
  const segments = path.split('/').filter(Boolean)
  const commentId = segments[1]

  // GET /comments - list comments (with pagination)
  if (method === 'GET') {
    const url = new URL(req.url)
    const postId = url.searchParams.get('postId')
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '25')
    const result = await cms.comments.findAll({ 
      postId: postId || undefined,
      page,
      limit,
    })
    return jsonResponse(result)
  }

  // POST /comments - create comment
  if (method === 'POST') {
    const body = await req.json()
    const comment = await cms.comments.create({
      ...body,
      authorId: session?.user?.id,
    })
    if (onMutate) await onMutate('comment', comment)
    return jsonResponse({ data: comment }, 201)
  }

  // PATCH /comments/:id/approve - approve comment
  if (method === 'PATCH' && commentId && path.endsWith('/approve')) {
    if (!cms.config.auth.isAdmin(session)) {
      return jsonResponse({ error: 'Admin required' }, 403)
    }
    const comment = await cms.comments.approve(commentId)
    return jsonResponse({ data: comment })
  }

  // DELETE /comments/:id - delete comment
  if (method === 'DELETE' && commentId) {
    if (!cms.config.auth.isAdmin(session)) {
      return jsonResponse({ error: 'Admin required' }, 403)
    }
    await cms.comments.delete(commentId)
    return jsonResponse({ data: { success: true } })
  }

  return jsonResponse({ error: 'Method not allowed' }, 405)
}
