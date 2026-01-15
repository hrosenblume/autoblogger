import type { AutobloggerServer as Autoblogger, Session } from '../server'
import {
  DEFAULT_GENERATE_TEMPLATE,
  DEFAULT_CHAT_TEMPLATE,
  DEFAULT_REWRITE_TEMPLATE,
  DEFAULT_AUTO_DRAFT_TEMPLATE,
  DEFAULT_PLAN_TEMPLATE,
  DEFAULT_EXPAND_PLAN_TEMPLATE,
  DEFAULT_PLAN_RULES,
  DEFAULT_AGENT_TEMPLATE,
  DEFAULT_SEARCH_ONLY_PROMPT,
} from '../ai/prompts'
import { getModelOptions } from '../ai/models'
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
    
    // Check if API keys are available from config or environment variables
    const hasAnthropicEnvKey = !!(cms.config.ai?.anthropicKey || process.env.ANTHROPIC_API_KEY)
    const hasOpenaiEnvKey = !!(cms.config.ai?.openaiKey || process.env.OPENAI_API_KEY)
    
    // Include default templates for the UI to display as placeholders
    return jsonResponse({ 
      data: {
        ...settings,
        // Don't expose actual env keys, just indicate they exist
        hasAnthropicEnvKey,
        hasOpenaiEnvKey,
        defaultGenerateTemplate: DEFAULT_GENERATE_TEMPLATE,
        defaultChatTemplate: DEFAULT_CHAT_TEMPLATE,
        defaultRewriteTemplate: DEFAULT_REWRITE_TEMPLATE,
        defaultAutoDraftTemplate: DEFAULT_AUTO_DRAFT_TEMPLATE,
        defaultPlanTemplate: DEFAULT_PLAN_TEMPLATE,
        defaultExpandPlanTemplate: DEFAULT_EXPAND_PLAN_TEMPLATE,
        defaultAgentTemplate: DEFAULT_AGENT_TEMPLATE,
        defaultPlanRules: DEFAULT_PLAN_RULES,
        availableModels: getModelOptions(),
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
    const { prompt, model, wordCount, mode, plan, styleExamples: clientStyleExamples, useWebSearch, useThinking } = body
    
    // Get AI settings for rules
    const settings = await cms.aiSettings.get()
    
    try {
      let stream: ReadableStream
      
      // Use keys from config, falling back to database settings
      const anthropicKey = cms.config.ai?.anthropicKey || settings.anthropicKey
      const openaiKey = cms.config.ai?.openaiKey || settings.openaiKey

      if (mode === 'expand_plan' && plan) {
        // Fetch published essays as style examples if not provided by client
        let styleExamples = clientStyleExamples || ''
        if (!styleExamples) {
          styleExamples = await fetchStyleExamples(cms)
        }
        
        // Draft essay from plan mode
        const { expandPlanStream } = await import('../ai/generate')
        stream = await expandPlanStream({
          plan,
          model: model || settings.defaultModel,
          rules: settings.rules,
          template: settings.expandPlanTemplate,
          styleExamples,
          anthropicKey,
          openaiKey,
        })
      } else {
        // Fetch published essays as style examples for standard generation too
        let styleExamples = clientStyleExamples || ''
        if (!styleExamples) {
          styleExamples = await fetchStyleExamples(cms)
        }
        
        // Standard generation
        const { generateStream } = await import('../ai/generate')
        stream = await generateStream({
          prompt,
          model: model || settings.defaultModel,
          wordCount,
          rules: settings.rules,
          template: settings.generateTemplate,
          styleExamples,
          anthropicKey,
          openaiKey,
          useWebSearch,
          useThinking,
        })
      }
      
      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      })
    } catch (error) {
      console.error('[AI Generate Error]', error)
      return jsonResponse({ 
        error: error instanceof Error ? error.message : 'Generation failed' 
      }, 500)
    }
  }

  // POST /ai/chat - chat with AI (streaming or search mode)
  if (method === 'POST' && path === '/ai/chat') {
    const body = await req.json()
    const { messages, model, essayContext, mode, useWebSearch, useThinking } = body
    
    const settings = await cms.aiSettings.get()
    
    // Use keys from config, falling back to database settings
    const anthropicKey = cms.config.ai?.anthropicKey || settings.anthropicKey
    const openaiKey = cms.config.ai?.openaiKey || settings.openaiKey
    
    // Handle search mode - non-streaming JSON response
    if (mode === 'search') {
      try {
        const { generate } = await import('../ai/provider')
        
        // Get the last user message as the search query
        const lastUserMessage = [...messages].reverse().find((m: { role: string }) => m.role === 'user')
        if (!lastUserMessage) {
          return jsonResponse({ error: 'No user message found' }, 400)
        }
        
        const result = await generate(
          model || settings.defaultModel,
          DEFAULT_SEARCH_ONLY_PROMPT,
          lastUserMessage.content,
          {
            anthropicKey,
            openaiKey,
            maxTokens: 4096,
            useWebSearch: true, // Always use web search in search mode
          }
        )
        
        return jsonResponse({ 
          content: result.text,
          usage: {
            inputTokens: result.inputTokens,
            outputTokens: result.outputTokens,
          }
        })
      } catch (error) {
        console.error('[AI Search Error]', error)
        return jsonResponse({ 
          error: error instanceof Error ? error.message : 'Search failed' 
        }, 500)
      }
    }
    
    // Fetch published essays as style examples
    let styleExamples = ''
    try {
      const publishedPosts = await cms.posts.findPublished()
      const MAX_STYLE_EXAMPLES = 5
      const MAX_WORDS_PER_EXAMPLE = 500
      
      if (publishedPosts.length > 0) {
        const examples = publishedPosts
          .slice(0, MAX_STYLE_EXAMPLES)
          .map((post: { title: string; subtitle?: string; markdown: string }) => {
            // Truncate long essays to avoid massive prompts
            const words = post.markdown.split(/\s+/)
            const truncatedContent = words.length > MAX_WORDS_PER_EXAMPLE
              ? words.slice(0, MAX_WORDS_PER_EXAMPLE).join(' ') + '...'
              : post.markdown
            
            return `## ${post.title}
${post.subtitle ? `*${post.subtitle}*\n` : ''}
${truncatedContent}`
          })
          .join('\n\n---\n\n')
        
        styleExamples = `<published_essays>
The following are examples of the author's published work. Use these to match their voice, tone, and writing style:

${examples}
</published_essays>`
      }
    } catch (err) {
      console.error('[AI Chat] Failed to fetch published essays:', err)
      // Continue without style examples
    }
    
    const { chatStream } = await import('../ai/chat')
    
    try {
      const stream = await chatStream({
        messages,
        model: model || settings.defaultModel,
        essayContext,
        mode,
        chatRules: settings.chatRules,
        rules: settings.rules,
        template: settings.chatTemplate,
        // Plan mode specific settings
        planTemplate: settings.planTemplate,
        planRules: settings.planRules,
        // Agent mode specific settings
        agentTemplate: settings.agentTemplate,
        styleExamples,
        anthropicKey,
        openaiKey,
        useWebSearch,
        useThinking,
      })
      
      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      })
    } catch (error) {
      console.error('[AI Chat Error]', error)
      return jsonResponse({ 
        error: error instanceof Error ? error.message : 'Chat failed' 
      }, 500)
    }
  }

  // POST /ai/rewrite - rewrite selected text (non-streaming)
  if (method === 'POST' && path === '/ai/rewrite') {
    const body = await req.json()
    const { text } = body
    
    if (!text || typeof text !== 'string') {
      return jsonResponse({ error: 'Text is required' }, 400)
    }
    
    const settings = await cms.aiSettings.get()
    
    // Use keys from config, falling back to database settings
    const anthropicKey = cms.config.ai?.anthropicKey || settings.anthropicKey
    const openaiKey = cms.config.ai?.openaiKey || settings.openaiKey
    
    // Fetch published essays as style examples
    let styleExamples = ''
    try {
      const publishedPosts = await cms.posts.findPublished()
      const MAX_STYLE_EXAMPLES = 3
      const MAX_WORDS_PER_EXAMPLE = 300
      
      if (publishedPosts.length > 0) {
        const examples = publishedPosts
          .slice(0, MAX_STYLE_EXAMPLES)
          .map((post: { title: string; subtitle?: string; markdown: string }) => {
            const words = post.markdown.split(/\s+/)
            const truncatedContent = words.length > MAX_WORDS_PER_EXAMPLE
              ? words.slice(0, MAX_WORDS_PER_EXAMPLE).join(' ') + '...'
              : post.markdown
            
            return `## ${post.title}
${truncatedContent}`
          })
          .join('\n\n---\n\n')
        
        styleExamples = examples
      }
    } catch (err) {
      console.error('[AI Rewrite] Failed to fetch published essays:', err)
    }
    
    const { buildRewritePrompt } = await import('../ai/builders')
    const { createStream } = await import('../ai/provider')
    
    try {
      const systemPrompt = buildRewritePrompt({
        rewriteRules: settings.rewriteRules,
        rules: settings.rules,
        template: settings.rewriteTemplate,
        styleExamples,
      })
      
      // Use streaming internally but collect full response
      const stream = await createStream({
        model: settings.defaultModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Rewrite the following text, preserving meaning but improving clarity and style:\n\n${text}` },
        ],
        anthropicKey,
        openaiKey,
        maxTokens: 2048,
      })
      
      // Collect the streamed response
      const reader = stream.getReader()
      const decoder = new TextDecoder()
      let rewrittenText = ''
      
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        
        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') continue
            try {
              const parsed = JSON.parse(data)
              if (parsed.text) {
                rewrittenText += parsed.text
              }
            } catch {
              // Ignore parse errors
            }
          }
        }
      }
      
      return jsonResponse({ text: rewrittenText.trim() })
    } catch (error) {
      console.error('[AI Rewrite Error]', error)
      return jsonResponse({ 
        error: error instanceof Error ? error.message : 'Rewrite failed' 
      }, 500)
    }
  }

  return jsonResponse({ error: 'Not found' }, 404)
}

// Helper to fetch published essays as style examples
async function fetchStyleExamples(cms: Autoblogger): Promise<string> {
  try {
    const publishedPosts = await cms.posts.findPublished()
    const MAX_STYLE_EXAMPLES = 5
    const MAX_WORDS_PER_EXAMPLE = 500
    
    if (publishedPosts.length > 0) {
      const examples = publishedPosts
        .slice(0, MAX_STYLE_EXAMPLES)
        .map((post: { title: string; subtitle?: string; markdown: string }) => {
          const words = post.markdown.split(/\s+/)
          const truncatedContent = words.length > MAX_WORDS_PER_EXAMPLE
            ? words.slice(0, MAX_WORDS_PER_EXAMPLE).join(' ') + '...'
            : post.markdown
          
          return `## ${post.title}
${post.subtitle ? `*${post.subtitle}*\n` : ''}
${truncatedContent}`
        })
        .join('\n\n---\n\n')
      
      return `The following are examples of the author's published work. Use these to match their voice, tone, and writing style:

${examples}`
    }
  } catch (err) {
    console.error('[AI] Failed to fetch published essays:', err)
  }
  return ''
}
