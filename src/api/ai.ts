import type { AutobloggerServer as Autoblogger, Session } from '../server'
import {
  DEFAULT_GENERATE_TEMPLATE,
  DEFAULT_CHAT_TEMPLATE,
  DEFAULT_REWRITE_TEMPLATE,
  DEFAULT_AUTO_DRAFT_TEMPLATE,
  DEFAULT_PLAN_TEMPLATE,
  DEFAULT_EXPAND_PLAN_TEMPLATE,
  DEFAULT_PLAN_RULES,
} from '../ai/prompts'
import { jsonResponse, requireAuth, requireAdmin } from './utils'

type NextRequest = Request & { nextUrl: URL }

export async function handleAIAPI(
  req: NextRequest,
  cms: Autoblogger,
  session: Session | null,
  path: string
): Promise<Response> {
  const method = req.method
  
  // Check auth
  const authError = requireAuth(session)
  if (authError) return authError

  // GET /ai/settings - get AI settings
  if (method === 'GET' && path === '/ai/settings') {
    const settings = await cms.aiSettings.get()
    // Include default templates for the UI to display as placeholders
    return jsonResponse({ 
      data: {
        ...settings,
        defaultGenerateTemplate: DEFAULT_GENERATE_TEMPLATE,
        defaultChatTemplate: DEFAULT_CHAT_TEMPLATE,
        defaultRewriteTemplate: DEFAULT_REWRITE_TEMPLATE,
        defaultAutoDraftTemplate: DEFAULT_AUTO_DRAFT_TEMPLATE,
        defaultPlanTemplate: DEFAULT_PLAN_TEMPLATE,
        defaultExpandPlanTemplate: DEFAULT_EXPAND_PLAN_TEMPLATE,
        defaultPlanRules: DEFAULT_PLAN_RULES,
      }
    })
  }

  // PATCH /ai/settings - update AI settings
  if (method === 'PATCH' && path === '/ai/settings') {
    const adminError = requireAdmin(cms, session)
    if (adminError) return adminError

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
