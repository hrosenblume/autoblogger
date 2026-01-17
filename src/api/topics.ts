import type { AutobloggerServer as Autoblogger, Session } from '../server'
import { jsonResponse, parsePath, requireAdmin } from './utils'

type NextRequest = Request & { nextUrl: URL }

export async function handleTopicsAPI(
  req: NextRequest,
  cms: Autoblogger,
  session: Session | null,
  path: string,
  onMutate?: (type: string, data: unknown) => Promise<void>
): Promise<Response> {
  const method = req.method
  const { id: topicId, subPath } = parsePath(path)

  // Check admin for all topic operations
  const authError = requireAdmin(cms, session)
  if (authError) return authError

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

  // POST /topics/generate - trigger generation for all active topics
  if (method === 'POST' && path === '/topics/generate') {
    const results = await cms.autoDraft.run(undefined, true) // skipFrequencyCheck = true for manual trigger
    return jsonResponse({ 
      data: { 
        success: true, 
        results,
      } 
    })
  }

  // POST /topics - create topic
  if (method === 'POST' && !topicId) {
    const body = await req.json()
    const topic = await cms.topics.create(body)
    if (onMutate) await onMutate('topic', topic)
    return jsonResponse({ data: topic }, 201)
  }

  // POST /topics/:id/generate - trigger generation for a specific topic
  if (method === 'POST' && topicId && subPath === 'generate') {
    const results = await cms.autoDraft.run(topicId, true) // skipFrequencyCheck = true for manual trigger
    return jsonResponse({ 
      data: { 
        success: true, 
        results,
      } 
    })
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

  return jsonResponse({ error: 'Method not allowed' }, 405)
}
