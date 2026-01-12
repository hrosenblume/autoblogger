import { createStream } from './provider'
import { buildGeneratePrompt, buildExpandPlanPrompt } from './builders'

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

interface ExpandPlanOptions {
  plan: string
  model: string
  rules?: string
  template?: string | null
  styleExamples?: string
  anthropicKey?: string
  openaiKey?: string
}

export async function expandPlanStream(options: ExpandPlanOptions): Promise<ReadableStream> {
  const systemPrompt = buildExpandPlanPrompt({
    rules: options.rules,
    template: options.template,
    plan: options.plan,
    styleExamples: options.styleExamples,
  })

  return createStream({
    model: options.model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: 'Write the essay now.' },
    ],
    anthropicKey: options.anthropicKey,
    openaiKey: options.openaiKey,
    maxTokens: 8192,
  })
}
