import type { AutobloggerServer as Autoblogger, Session } from '../server'

type NextRequest = Request & { nextUrl: URL }

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

export async function handleTopicsAPI(
  req: NextRequest,
  cms: Autoblogger,
  session: Session | null,
  path: string,
  onMutate?: (type: string, data: unknown) => Promise<void>
): Promise<Response> {
  const method = req.method
  const segments = path.split('/').filter(Boolean)
  const topicId = segments[1]

  // Check admin for all topic operations
  if (!cms.config.auth.isAdmin(session)) {
    return jsonResponse({ error: 'Admin required' }, 403)
  }

  // GET /topics - list topics
  if (method === 'GET' && !topicId) {
    const topics = await cms.topics.findAll()
    return jsonResponse({ data: topics })
  }

  // GET /topics/:id - get single topic
  if (method === 'GET' && topicId) {
    const topic = await cms.topics.findById(topicId)
    if (!topic) return jsonResponse({ error: 'Topic not found' }, 404)
    return jsonResponse({ data: topic })
  }

  // POST /topics - create topic
  if (method === 'POST') {
    const body = await req.json()
    const topic = await cms.topics.create(body)
    if (onMutate) await onMutate('topic', topic)
    return jsonResponse({ data: topic }, 201)
  }

  // PATCH /topics/:id - update topic
  if (method === 'PATCH' && topicId) {
    const body = await req.json()
    const topic = await cms.topics.update(topicId, body)
    return jsonResponse({ data: topic })
  }

  // DELETE /topics/:id - delete topic
  if (method === 'DELETE' && topicId) {
    await cms.topics.delete(topicId)
    return jsonResponse({ data: { success: true } })
  }

  // POST /topics/:id/generate - trigger generation for a topic
  if (method === 'POST' && topicId && path.endsWith('/generate')) {
    // Mark topic as run
    await cms.topics.markRun(topicId)
    // Note: Actual RSS fetching and essay generation would be implemented
    // by the host application via hooks or a separate service
    return jsonResponse({ 
      data: { 
        success: true, 
        message: 'Generation triggered. Implement generation logic in your application.',
      } 
    })
  }

  return jsonResponse({ error: 'Method not allowed' }, 405)
}
