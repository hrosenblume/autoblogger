import Anthropic from '@anthropic-ai/sdk'
import OpenAI from 'openai'
import { getModel } from './models'

/** Message format for chat conversations */
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

interface StreamOptions {
  model: string
  messages: ChatMessage[]
  anthropicKey?: string
  openaiKey?: string
  maxTokens?: number
  useThinking?: boolean
  useWebSearch?: boolean
}

interface GenerateResult {
  text: string
  inputTokens?: number
  outputTokens?: number
}

/**
 * Get API key for a provider, checking DB first then falling back to env var.
 * Accepts a prisma client to avoid importing it directly.
 */
export async function getApiKey(
  provider: 'anthropic' | 'openai',
  prisma?: { aISettings?: { findUnique: (args: any) => Promise<any> } }
): Promise<string | null> {
  // Try AISettings DB first if prisma is provided
  if (prisma?.aISettings) {
    try {
      const settings = await prisma.aISettings.findUnique({
        where: { id: 'default' },
      })
      
      if (provider === 'anthropic' && settings?.anthropicKey) {
        return settings.anthropicKey
      }
      if (provider === 'openai' && settings?.openaiKey) {
        return settings.openaiKey
      }
    } catch {
      // DB lookup failed, fall back to env vars
    }
  }
  
  // Fall back to env vars
  if (provider === 'anthropic') {
    return process.env.ANTHROPIC_API_KEY || null
  }
  return process.env.OPENAI_API_KEY || null
}

/**
 * Fetch web search results using OpenAI's Responses API with web_search tool.
 * Returns a summary of search results to be used as context.
 */
async function fetchSearchResults(query: string, openaiKey?: string): Promise<string | null> {
  try {
    console.log('[Web Search] Fetching search results for:', query.slice(0, 100))
    const openai = new OpenAI({
      ...(openaiKey && { apiKey: openaiKey }),
    })
    
    const response = await (openai as any).responses.create({
      model: 'gpt-5-mini',
      input: `You are a research assistant. Provide a concise summary of the most relevant and recent information from the web about the following query. Include key facts, dates, and sources when available. Keep your response under 500 words.\n\nQuery: ${query}`,
      tools: [{ type: 'web_search' }],
    })
    
    const result = response.output_text || null
    console.log('[Web Search] Got results:', result ? `${result.length} chars` : 'null')
    return result
  } catch (error) {
    console.error('[Web Search] Failed:', error)
    return null
  }
}

/**
 * Extract the most recent user message to use as search query.
 */
function extractSearchQuery(messages: ChatMessage[]): string {
  const userMessages = messages.filter(m => m.role === 'user')
  return userMessages[userMessages.length - 1]?.content || ''
}

/**
 * Generate text using the specified model (non-streaming).
 * Used for search mode and other non-streaming requests.
 */
export async function generate(
  modelId: string,
  systemPrompt: string,
  userPrompt: string,
  options: {
    anthropicKey?: string
    openaiKey?: string
    maxTokens?: number
    useWebSearch?: boolean
  } = {}
): Promise<GenerateResult> {
  const model = getModel(modelId)
  if (!model) {
    throw new Error(`Unknown model: ${modelId}`)
  }

  if (model.provider === 'anthropic') {
    return generateWithAnthropic(model.modelId, systemPrompt, userPrompt, options)
  }
  return generateWithOpenAI(model.modelId, systemPrompt, userPrompt, options)
}

async function generateWithAnthropic(
  modelId: string,
  systemPrompt: string,
  userPrompt: string,
  options: { anthropicKey?: string; maxTokens?: number }
): Promise<GenerateResult> {
  const anthropic = new Anthropic({
    ...(options.anthropicKey && { apiKey: options.anthropicKey }),
  })

  const response = await anthropic.messages.create({
    model: modelId,
    max_tokens: options.maxTokens || 4096,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  })

  const textContent = response.content.find(c => c.type === 'text')
  if (!textContent || textContent.type !== 'text') {
    throw new Error('No text content in response')
  }

  return {
    text: textContent.text,
    inputTokens: response.usage?.input_tokens,
    outputTokens: response.usage?.output_tokens,
  }
}

async function generateWithOpenAI(
  modelId: string,
  systemPrompt: string,
  userPrompt: string,
  options: { openaiKey?: string; maxTokens?: number; useWebSearch?: boolean }
): Promise<GenerateResult> {
  const openai = new OpenAI({
    ...(options.openaiKey && { apiKey: options.openaiKey }),
  })

  // Use Responses API for web search
  if (options.useWebSearch) {
    const response = await (openai as any).responses.create({
      model: modelId,
      instructions: systemPrompt,
      input: userPrompt,
      max_output_tokens: options.maxTokens || 4096,
      tools: [{ type: 'web_search' }],
    })

    const textOutput = response.output?.find((item: { type: string }) => item.type === 'message')
    const content = textOutput?.content?.find((c: { type: string }) => c.type === 'output_text')?.text

    if (!content) {
      throw new Error('No content in response')
    }

    return {
      text: content,
      inputTokens: response.usage?.input_tokens,
      outputTokens: response.usage?.output_tokens,
    }
  }

  // Standard chat completions
  const response = await openai.chat.completions.create({
    model: modelId,
    max_completion_tokens: options.maxTokens || 4096,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
  })

  const content = response.choices[0]?.message?.content
  if (!content) {
    throw new Error('No content in response')
  }

  return {
    text: content,
    inputTokens: response.usage?.prompt_tokens,
    outputTokens: response.usage?.completion_tokens,
  }
}

export async function createStream(options: StreamOptions): Promise<ReadableStream> {
  const modelConfig = getModel(options.model)
  if (!modelConfig) {
    throw new Error(`Unknown model: ${options.model}`)
  }

  // For Anthropic with web search enabled, fetch search results first using OpenAI
  let searchContext = ''
  if (options.useWebSearch && modelConfig.provider === 'anthropic') {
    const query = extractSearchQuery(options.messages)
    if (query) {
      const searchResults = await fetchSearchResults(query, options.openaiKey)
      if (searchResults) {
        searchContext = `\n\n<web_search_results>\n${searchResults}\n</web_search_results>\n\nUse the search results above to inform your response with current, accurate information.`
      }
    }
  }

  if (modelConfig.provider === 'anthropic') {
    return createAnthropicStream(options, modelConfig.modelId, searchContext)
  } else {
    return createOpenAIStream(options, modelConfig.modelId, options.useWebSearch)
  }
}

async function createAnthropicStream(options: StreamOptions, modelId: string, searchContext: string = ''): Promise<ReadableStream> {
  const anthropic = new Anthropic({
    ...(options.anthropicKey && { apiKey: options.anthropicKey }),
  })

  const systemMessage = (options.messages.find(m => m.role === 'system')?.content || '') + searchContext
  const chatMessages = options.messages
    .filter(m => m.role !== 'system')
    .map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }))

  const requestParams: any = {
    model: modelId,
    max_tokens: options.maxTokens || 4096,
    system: systemMessage,
    messages: chatMessages,
  }

  if (options.useThinking && (modelId.includes('claude-sonnet') || modelId.includes('claude-opus'))) {
    requestParams.thinking = {
      type: 'enabled',
      budget_tokens: 10000,
    }
    requestParams.max_tokens = Math.max(requestParams.max_tokens, 16000)
  }

  try {
    const stream = await anthropic.messages.stream(requestParams)

    return new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (event.type === 'content_block_delta') {
              const delta = event.delta as { type: string; text?: string; thinking?: string }
              if (delta.type === 'text_delta' && delta.text) {
                controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ text: delta.text })}\n\n`))
              } else if (delta.type === 'thinking_delta' && delta.thinking) {
                controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ thinking: delta.thinking })}\n\n`))
              }
            }
          }
          controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'))
          controller.close()
        } catch (streamError) {
          const errorMessage = streamError instanceof Error ? streamError.message : 'Stream error'
          console.error('[Anthropic Stream Error]', streamError)
          controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ error: errorMessage })}\n\n`))
          controller.close()
        }
      },
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Anthropic API error'
    console.error('[Anthropic API Error]', error)
    throw new Error(errorMessage)
  }
}

async function createOpenAIStream(options: StreamOptions, modelId: string, useWebSearch: boolean = false): Promise<ReadableStream> {
  const openai = new OpenAI({
    ...(options.openaiKey && { apiKey: options.openaiKey }),
  })

  if (useWebSearch) {
    return createOpenAIResponsesStream(openai, options, modelId)
  }

  const requestParams: any = {
    model: modelId,
    messages: options.messages,
    max_completion_tokens: options.maxTokens || 4096,
    stream: true,
  }

  try {
    const stream = await openai.chat.completions.create(requestParams) as unknown as AsyncIterable<OpenAI.Chat.Completions.ChatCompletionChunk>

    return new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text = chunk.choices[0]?.delta?.content
            if (text) {
              controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ text })}\n\n`))
            }
          }
          controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'))
          controller.close()
        } catch (streamError) {
          const errorMessage = streamError instanceof Error ? streamError.message : 'Stream error'
          console.error('[OpenAI Stream Error]', streamError)
          controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ error: errorMessage })}\n\n`))
          controller.close()
        }
      },
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'OpenAI API error'
    console.error('[OpenAI API Error]', error)
    throw new Error(errorMessage)
  }
}

async function createOpenAIResponsesStream(openai: OpenAI, options: StreamOptions, modelId: string): Promise<ReadableStream> {
  const systemMessage = options.messages.find(m => m.role === 'system')?.content || ''
  const conversationMessages = options.messages.filter(m => m.role !== 'system')
  
  const lastUserMessage = conversationMessages[conversationMessages.length - 1]?.content || ''
  const conversationContext = conversationMessages.slice(0, -1)
    .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
    .join('\n\n')
  
  const fullInput = conversationContext 
    ? `${systemMessage}\n\nPrevious conversation:\n${conversationContext}\n\nUser: ${lastUserMessage}`
    : `${systemMessage}\n\n${lastUserMessage}`

  try {
    const response = await (openai as any).responses.create({
      model: modelId,
      input: fullInput,
      tools: [{ type: 'web_search' }],
      stream: true,
    })

    return new ReadableStream({
      async start(controller) {
        try {
          for await (const event of response) {
            if (event.type === 'response.output_text.delta') {
              const text = event.delta
              if (text) {
                controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ text })}\n\n`))
              }
            }
          }
          controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'))
          controller.close()
        } catch (streamError) {
          const errorMessage = streamError instanceof Error ? streamError.message : 'Stream error'
          console.error('[OpenAI Responses Stream Error]', streamError)
          controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ error: errorMessage })}\n\n`))
          controller.close()
        }
      },
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'OpenAI Responses API error'
    console.error('[OpenAI Responses API Error]', error)
    throw new Error(errorMessage)
  }
}
