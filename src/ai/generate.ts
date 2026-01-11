import { createStream } from './provider'
import { buildGeneratePrompt } from './system-prompt'

interface GenerateOptions {
  prompt: string
  model: string
  wordCount?: number
  rules?: string
  template?: string | null
  anthropicKey?: string
  openaiKey?: string
}

export async function generateStream(options: GenerateOptions): Promise<ReadableStream> {
  const systemPrompt = buildGeneratePrompt({
    rules: options.rules,
    template: options.template,
    wordCount: options.wordCount,
  })

  return createStream({
    model: options.model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: options.prompt },
    ],
    anthropicKey: options.anthropicKey,
    openaiKey: options.openaiKey,
    maxTokens: 8192,
  })
}
