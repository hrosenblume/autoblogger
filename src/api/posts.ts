import type { AutobloggerServer as Autoblogger, Session } from '../server'
import { PostStatus } from '../types/models'

type NextRequest = Request & { nextUrl: URL }

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

function countWords(text?: string | null): number {
  if (!text) return 0
  return text.split(/\s+/).filter(Boolean).length
}

function withWordCount<T extends { markdown?: string | null }>(post: T): T & { wordCount: number } {
  return { ...post, wordCount: countWords(post.markdown) }
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
  
  // Handle nested comment routes: /posts/:id/comments
  if (postId && segments[2] === 'comments') {
    return handlePostCommentsAPI(req, cms, session, postId, segments.slice(3), onMutate)
  }

  // GET /posts - list posts
  if (method === 'GET' && !postId) {
    const url = new URL(req.url)
    const status = url.searchParams.get('status')
    const all = url.searchParams.get('all') === '1'
    const page = parseInt(url.searchParams.get('page') || '1', 10)
    const limit = parseInt(url.searchParams.get('limit') || '0', 10)
    const includeRevisionCount = url.searchParams.get('includeRevisionCount') === '1'
    
    // Calculate pagination
    const skip = limit > 0 ? (page - 1) * limit : undefined
    const take = limit > 0 ? limit : undefined
    
    // Get total count for pagination
    const total = await cms.posts.count(all ? undefined : { status: status || undefined })
    
    const posts = await cms.posts.findAll({ 
      status: all ? undefined : (status || undefined),
      skip,
      take,
      includeRevisionCount,
    })
    return jsonResponse({ data: posts.map(withWordCount), total })
  }

  // GET /posts/:id - get single post
  if (method === 'GET' && postId) {
    const post = await cms.posts.findById(postId)
    if (!post) return jsonResponse({ error: 'Post not found' }, 404)
    return jsonResponse({ data: withWordCount(post) })
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
    if (body.status === PostStatus.PUBLISHED && !cms.config.auth.canPublish(session)) {
      return jsonResponse({ error: 'Not authorized to publish' }, 403)
    }
    
    // Create a revision of the current state BEFORE updating (if content is changing)
    const contentChanging = body.title !== undefined || body.subtitle !== undefined || body.markdown !== undefined
    if (contentChanging) {
      const existingPost = await cms.posts.findById(postId)
      if (existingPost && existingPost.markdown) {
        // Check if content is actually different from most recent revision
        // to avoid creating duplicate revisions on frequent auto-saves
        const recentRevisions = await cms.revisions.findByPost(postId)
        const lastRevision = recentRevisions[0]
        
        const contentIsDifferent = !lastRevision || 
          lastRevision.markdown !== existingPost.markdown ||
          lastRevision.title !== existingPost.title ||
          lastRevision.subtitle !== existingPost.subtitle
        
        if (contentIsDifferent) {
          await cms.revisions.create(postId, {
            title: existingPost.title,
            subtitle: existingPost.subtitle,
            markdown: existingPost.markdown,
          })
          // Prune old revisions (keep last 50)
          await cms.revisions.pruneOldest(postId, 50)
        }
      }
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

/**
 * Handle post-specific comment routes: /posts/:postId/comments/*
 * These are editor comments (with quotedText, replies, resolve).
 */
async function handlePostCommentsAPI(
  req: NextRequest,
  cms: Autoblogger,
  session: Session | null,
  postId: string,
  segments: string[], // e.g., [] for /comments, ['abc'] for /comments/abc, ['abc', 'resolve'] for /comments/abc/resolve
  onMutate?: (type: string, data: unknown) => Promise<void>
): Promise<Response> {
  const method = req.method
  const commentId = segments[0]
  const action = segments[1] // e.g., 'resolve'
  
  const userId = session?.user?.id
  if (!userId) {
    return jsonResponse({ error: 'Authentication required' }, 401)
  }

  // GET /posts/:id/comments - list comments for post
  if (method === 'GET' && !commentId) {
    const comments = await cms.comments.findEditorComments(postId, userId)
    return jsonResponse({ data: comments })
  }

  // POST /posts/:id/comments - create comment
  if (method === 'POST' && !commentId) {
    const body = await req.json()
    const comment = await cms.comments.createEditorComment(postId, userId, {
      postId,
      quotedText: body.quotedText || '',
      content: body.content,
      parentId: body.parentId,
    })
    if (onMutate) await onMutate('comment', comment)
    return jsonResponse({ data: comment }, 201)
  }

  // POST /posts/:id/comments/resolve-all - resolve all comments
  if (method === 'POST' && commentId === 'resolve-all') {
    const result = await cms.comments.resolveAll(postId)
    return jsonResponse({ data: result })
  }

  // PATCH /posts/:id/comments/:commentId - update comment
  if (method === 'PATCH' && commentId && !action) {
    const body = await req.json()
    const comment = await cms.comments.updateEditorComment(commentId, body.content, userId)
    return jsonResponse({ data: comment })
  }

  // POST /posts/:id/comments/:commentId/resolve - toggle resolve
  if (method === 'POST' && commentId && action === 'resolve') {
    const comment = await cms.comments.toggleResolve(commentId)
    return jsonResponse({ data: comment })
  }

  // DELETE /posts/:id/comments/:commentId - delete comment
  if (method === 'DELETE' && commentId) {
    await cms.comments.deleteEditorComment(commentId)
    return jsonResponse({ data: { success: true } })
  }

  return jsonResponse({ error: 'Method not allowed' }, 405)
}
