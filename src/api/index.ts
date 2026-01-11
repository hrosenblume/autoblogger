import type { Autoblogger, Session } from '../config'
import { handlePostsAPI } from './posts'
import { handleCommentsAPI } from './comments'
import { handleTagsAPI } from './tags'
import { handleAIAPI } from './ai'
import { handleUploadAPI } from './upload'
import { handleTopicsAPI } from './topics'

interface APIHandlerOptions {
  basePath?: string
  onMutate?: (type: string, data: unknown) => Promise<void>
}

type NextRequest = Request & { nextUrl: URL }

function extractPath(pathname: string, basePath: string): string {
  const normalized = pathname.replace(/\/$/, '')
  const base = basePath.replace(/\/$/, '')
  
  if (normalized === base) return '/'
  if (normalized.startsWith(base + '/')) {
    return normalized.slice(base.length)
  }
  return '/'
}

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

export function createAPIHandler(cms: Autoblogger, options: APIHandlerOptions = {}) {
  const basePath = options.basePath || '/api/cms'
  
  return async (req: NextRequest): Promise<Response> => {
    const path = extractPath(req.nextUrl.pathname, basePath)
    const method = req.method
    
    // Get session for auth
    let session: Session | null = null
    try {
      session = await cms.config.auth.getSession()
    } catch {
      // Session retrieval failed
    }
    
    // Check auth for protected routes
    const isPublicRoute = path.startsWith('/posts') && method === 'GET'
    if (!isPublicRoute && !session) {
      return jsonResponse({ error: 'Unauthorized' }, 401)
    }
    
    try {
      // Route to handlers
      if (path.startsWith('/posts')) {
        return handlePostsAPI(req, cms, session, path, options.onMutate)
      }
      
      if (path.startsWith('/comments')) {
        return handleCommentsAPI(req, cms, session, path, options.onMutate)
      }
      
      if (path.startsWith('/tags')) {
        return handleTagsAPI(req, cms, session, path, options.onMutate)
      }
      
      if (path.startsWith('/ai')) {
        return handleAIAPI(req, cms, session, path)
      }
      
      if (path.startsWith('/upload')) {
        return handleUploadAPI(req, cms, session)
      }
      
      if (path.startsWith('/topics')) {
        return handleTopicsAPI(req, cms, session, path, options.onMutate)
      }
      
      return jsonResponse({ error: 'Not found' }, 404)
    } catch (error) {
      console.error('API error:', error)
      return jsonResponse({ 
        error: error instanceof Error ? error.message : 'Internal server error' 
      }, 500)
    }
  }
}

export { handlePostsAPI } from './posts'
export { handleCommentsAPI } from './comments'
export { handleTagsAPI } from './tags'
export { handleAIAPI } from './ai'
export { handleUploadAPI } from './upload'
export { handleTopicsAPI } from './topics'
