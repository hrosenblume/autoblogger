import type { AutobloggerServer as Autoblogger, Session } from '../server'
import { jsonResponse, requireAuth } from './utils'

type NextRequest = Request & { nextUrl: URL }

export async function handleUploadAPI(
  req: NextRequest,
  cms: Autoblogger,
  session: Session | null
): Promise<Response> {
  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405)
  }
  
  const authError = requireAuth(session)
  if (authError) return authError
  
  if (!cms.config.storage?.upload) {
    return jsonResponse({ 
      error: 'Image uploads not configured. Add storage.upload to your autoblogger config.' 
    }, 400)
  }

  try {
    const formData = await req.formData()
    // Support both 'image' (toolbar uploads) and 'file' (general uploads) field names
    const file = (formData.get('image') || formData.get('file')) as File
    
    if (!file) {
      return jsonResponse({ error: 'No file provided' }, 400)
    }
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return jsonResponse({ 
        error: 'Invalid file type. Allowed: JPEG, PNG, GIF, WebP' 
      }, 400)
    }
    
    // Validate file size (4MB max)
    const maxSize = 4 * 1024 * 1024
    if (file.size > maxSize) {
      return jsonResponse({ error: 'File too large. Maximum size: 4MB' }, 400)
    }
    
    const result = await cms.config.storage.upload(file)
    return jsonResponse({ data: result })
  } catch (error) {
    return jsonResponse({ 
      error: error instanceof Error ? error.message : 'Upload failed' 
    }, 500)
  }
}
