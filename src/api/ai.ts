import type { AutobloggerServer as Autoblogger, Session } from '../server'

type NextRequest = Request & { nextUrl: URL }

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

export async function handleAIAPI(
  req: NextRequest,
  cms: Autoblogger,
  session: Session | null,
  path: string
): Promise<Response> {
  const method = req.method
  
  // Check auth
  if (!session) {
    return jsonResponse({ error: 'Unauthorized' }, 401)
  }

  // GET /ai/settings - get AI settings
  if (method === 'GET' && path === '/ai/settings') {
    const settings = await cms.aiSettings.get()
    return jsonResponse({ data: settings })
  }

  // PATCH /ai/settings - update AI settings
  if (method === 'PATCH' && path === '/ai/settings') {
    if (!cms.config.auth.isAdmin(session)) {
      return jsonResponse({ error: 'Admin required' }, 403)
    }
    const body = await req.json()
    const settings = await cms.aiSettings.update(body)
    return jsonResponse({ data: settings })
  }

  // POST /ai/generate - generate content (streaming)
  if (method === 'POST' && path === '/ai/generate') {
    const body = await req.json()
    const { prompt, model, wordCount } = body
    
    // Get AI settings for rules
    const settings = await cms.aiSettings.get()
    
    // Use the AI provider to generate
    const { generateStream } = await import('../ai/generate')
    
    try {
      const stream = await generateStream({
        prompt,
        model: model || settings.defaultModel,
        wordCount,
        rules: settings.rules,
        template: settings.generateTemplate,
        anthropicKey: cms.config.ai?.anthropicKey,
        openaiKey: cms.config.ai?.openaiKey,
      })
      
      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      })
    } catch (error) {
      return jsonResponse({ 
        error: error instanceof Error ? error.message : 'Generation failed' 
      }, 500)
    }
  }

  // POST /ai/chat - chat with AI (streaming)
  if (method === 'POST' && path === '/ai/chat') {
    const body = await req.json()
    const { messages, model, essayContext, mode } = body
    
    const settings = await cms.aiSettings.get()
    
    const { chatStream } = await import('../ai/chat')
    
    try {
      const stream = await chatStream({
        messages,
        model: model || settings.defaultModel,
        essayContext,
        mode,
        chatRules: settings.chatRules,
        template: settings.chatTemplate,
        anthropicKey: cms.config.ai?.anthropicKey,
        openaiKey: cms.config.ai?.openaiKey,
      })
      
      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      })
    } catch (error) {
      return jsonResponse({ 
        error: error instanceof Error ? error.message : 'Chat failed' 
      }, 500)
    }
  }

  return jsonResponse({ error: 'Not found' }, 404)
}
