import Anthropic from '@anthropic-ai/sdk'
import OpenAI from 'openai'
import { getModel } from './models'

interface StreamOptions {
  model: string
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>
  anthropicKey?: string
  openaiKey?: string
  maxTokens?: number
  useThinking?: boolean
  useWebSearch?: boolean
}

/**
 * Fetch web search results using OpenAI's Responses API with web_search tool.
 * Returns a summary of search results to be used as context.
 */
async function fetchSearchResults(query: string, openaiKey?: string): Promise<string | null> {
  try {
    console.log('[Web Search] Fetching search results for:', query.slice(0, 100))
    // Only pass apiKey if explicitly provided, otherwise SDK reads from OPENAI_API_KEY env var
    const openai = new OpenAI({
      ...(openaiKey && { apiKey: openaiKey }),
    })
    
    // Use GPT-5 Mini with web search via Responses API
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
function extractSearchQuery(messages: Array<{ role: string; content: string }>): string {
  const userMessages = messages.filter(m => m.role === 'user')
  return userMessages[userMessages.length - 1]?.content || ''
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
      // SDK will read from OPENAI_API_KEY env var if not provided in config
      const searchResults = await fetchSearchResults(query, options.openaiKey)
      if (searchResults) {
        searchContext = `\n\n<web_search_results>\n${searchResults}\n</web_search_results>\n\nUse the search results above to inform your response with current, accurate information.`
      }
    }
  }

  if (modelConfig.provider === 'anthropic') {
    // Allow SDK to read from ANTHROPIC_API_KEY env var if not provided in config
    return createAnthropicStream(options, modelConfig.modelId, searchContext)
  } else {
    // Allow SDK to read from OPENAI_API_KEY env var if not provided in config
    return createOpenAIStream(options, modelConfig.modelId, options.useWebSearch)
  }
}

async function createAnthropicStream(options: StreamOptions, modelId: string, searchContext: string = ''): Promise<ReadableStream> {
  // Only pass apiKey if explicitly provided, otherwise SDK reads from ANTHROPIC_API_KEY env var
  const anthropic = new Anthropic({
    ...(options.anthropicKey && { apiKey: options.anthropicKey }),
  })

  // Extract system message and append search context if available
  const systemMessage = (options.messages.find(m => m.role === 'system')?.content || '') + searchContext
  const chatMessages = options.messages
    .filter(m => m.role !== 'system')
    .map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }))

  // Build request params - extended thinking is supported on Claude models
  const requestParams: any = {
    model: modelId,
    max_tokens: options.maxTokens || 4096,
    system: systemMessage,
    messages: chatMessages,
  }

  // Enable extended thinking for supported models when useThinking is enabled
  if (options.useThinking && (modelId.includes('claude-sonnet') || modelId.includes('claude-opus'))) {
    requestParams.thinking = {
      type: 'enabled',
      budget_tokens: 10000,
    }
    // Extended thinking requires higher max_tokens
    requestParams.max_tokens = Math.max(requestParams.max_tokens, 16000)
  }

  try {
    const stream = await anthropic.messages.stream(requestParams)

    return new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (event.type === 'content_block_delta') {
              // Handle both text and thinking deltas
              const delta = event.delta as { type: string; text?: string; thinking?: string }
              if (delta.type === 'text_delta' && delta.text) {
                controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ text: delta.text })}\n\n`))
              } else if (delta.type === 'thinking_delta' && delta.thinking) {
                // Optionally stream thinking content with a marker
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
    // Handle errors that occur before streaming starts (e.g., auth errors, invalid model)
    const errorMessage = error instanceof Error ? error.message : 'Anthropic API error'
    console.error('[Anthropic API Error]', error)
    throw new Error(errorMessage)
  }
}

async function createOpenAIStream(options: StreamOptions, modelId: string, useWebSearch: boolean = false): Promise<ReadableStream> {
  // Only pass apiKey if explicitly provided, otherwise SDK reads from OPENAI_API_KEY env var
  const openai = new OpenAI({
    ...(options.openaiKey && { apiKey: options.openaiKey }),
  })

  // GPT-5+ models use the Responses API for web search
  if (useWebSearch) {
    return createOpenAIResponsesStream(openai, options, modelId)
  }

  // Standard chat completions for non-web-search requests
  // GPT-5+ models use max_completion_tokens instead of max_tokens
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
    // Handle errors that occur before streaming starts (e.g., auth errors, invalid model)
    const errorMessage = error instanceof Error ? error.message : 'OpenAI API error'
    console.error('[OpenAI API Error]', error)
    throw new Error(errorMessage)
  }
}

/**
 * Create a stream using OpenAI's Responses API with web search tool.
 * GPT-5+ models require this API for web search functionality.
 */
async function createOpenAIResponsesStream(openai: OpenAI, options: StreamOptions, modelId: string): Promise<ReadableStream> {
  // Convert chat messages to a single input prompt for the Responses API
  const systemMessage = options.messages.find(m => m.role === 'system')?.content || ''
  const conversationMessages = options.messages.filter(m => m.role !== 'system')
  
  // Build input from conversation - Responses API takes a simpler input format
  const lastUserMessage = conversationMessages[conversationMessages.length - 1]?.content || ''
  const conversationContext = conversationMessages.slice(0, -1)
    .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
    .join('\n\n')
  
  const fullInput = conversationContext 
    ? `${systemMessage}\n\nPrevious conversation:\n${conversationContext}\n\nUser: ${lastUserMessage}`
    : `${systemMessage}\n\n${lastUserMessage}`

  try {
    // Use the Responses API with web search tool
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
            // Handle different event types from Responses API streaming
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
