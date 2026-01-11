import Anthropic from '@anthropic-ai/sdk'
import OpenAI from 'openai'
import { getModel } from './models'

interface StreamOptions {
  model: string
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>
  anthropicKey?: string
  openaiKey?: string
  maxTokens?: number
}

export async function createStream(options: StreamOptions): Promise<ReadableStream> {
  const modelConfig = getModel(options.model)
  if (!modelConfig) {
    throw new Error(`Unknown model: ${options.model}`)
  }

  if (modelConfig.provider === 'anthropic') {
    if (!options.anthropicKey) {
      throw new Error('Anthropic API key not configured')
    }
    return createAnthropicStream(options, modelConfig.modelId)
  } else {
    if (!options.openaiKey) {
      throw new Error('OpenAI API key not configured')
    }
    return createOpenAIStream(options, modelConfig.modelId)
  }
}

async function createAnthropicStream(options: StreamOptions, modelId: string): Promise<ReadableStream> {
  const anthropic = new Anthropic({ apiKey: options.anthropicKey })

  // Extract system message
  const systemMessage = options.messages.find(m => m.role === 'system')?.content || ''
  const chatMessages = options.messages
    .filter(m => m.role !== 'system')
    .map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }))

  const stream = await anthropic.messages.stream({
    model: modelId,
    max_tokens: options.maxTokens || 4096,
    system: systemMessage,
    messages: chatMessages,
  })

  return new ReadableStream({
    async start(controller) {
      for await (const event of stream) {
        if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
          controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`))
        }
      }
      controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'))
      controller.close()
    },
  })
}

async function createOpenAIStream(options: StreamOptions, modelId: string): Promise<ReadableStream> {
  const openai = new OpenAI({ apiKey: options.openaiKey })

  const stream = await openai.chat.completions.create({
    model: modelId,
    messages: options.messages,
    max_tokens: options.maxTokens || 4096,
    stream: true,
  })

  return new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content
        if (text) {
          controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ text })}\n\n`))
        }
      }
      controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'))
      controller.close()
    },
  })
}
