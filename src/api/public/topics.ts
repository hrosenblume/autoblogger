import type { AutobloggerServer } from '../../server'
import type { VerifiedKey } from '../../data/api-keys'
import {
  jsonResponse,
  notFound,
  methodNotAllowed,
  type NextRequest,
} from './shared'

export async function handlePublicTopics(
  req: NextRequest,
  cms: AutobloggerServer,
  _key: VerifiedKey,
  path: string
): Promise<Response> {
  const method = req.method
  const segments = path.split('/').filter(Boolean) // ['v1', 'topics', ...] or ['v1', 'auto-draft', 'run']

  // POST /v1/auto-draft/run — trigger all active topics
  if (segments[1] === 'auto-draft' && segments[2] === 'run' && method === 'POST') {
    const body = await req.json().catch(() => ({}))
    const skipFrequencyCheck = body?.skipFrequencyCheck === true
    const results = await cms.autoDraft.run(undefined, skipFrequencyCheck)
    return jsonResponse({ data: results })
  }

  // From here: /v1/topics/...
  if (segments[1] !== 'topics') return notFound('Resource')
  const id = segments[2]
  const action = segments[3]

  // GET /v1/topics
  if (method === 'GET' && !id) {
    const topics = await cms.topics.findAll()
    return jsonResponse({ data: topics })
  }

  // GET /v1/topics/:id
  if (method === 'GET' && id && !action) {
    const topic = await cms.topics.findById(id)
    if (!topic) return notFound('Topic')
    return jsonResponse({ data: topic })
  }

  // POST /v1/topics/:id/run
  if (method === 'POST' && id && action === 'run') {
    const body = await req.json().catch(() => ({}))
    const skipFrequencyCheck = body?.skipFrequencyCheck === true
    const results = await cms.autoDraft.run(id, skipFrequencyCheck)
    return jsonResponse({ data: results })
  }

  return methodNotAllowed()
}
