import { createStream } from './provider'
import { buildGeneratePrompt, buildExpandPlanPrompt } from './builders'
import { extractAndFetchUrls } from '../lib/url-extractor'

interface GenerateOptions {
  prompt: string
  model: string
  wordCount?: number
  rules?: string
  template?: string | null
  styleExamples?: string
  anthropicKey?: string
  openaiKey?: string
  useWebSearch?: boolean  // Controls ALL internet access: URL extraction AND web search
  useThinking?: boolean
}

export async function generateStream(options: GenerateOptions): Promise<ReadableStream> {
  const systemPrompt = buildGeneratePrompt({
    rules: options.rules,
    template: options.template,
    wordCount: options.wordCount,
    styleExamples: options.styleExamples,
  })

  // Extract and fetch URL content when web access is enabled
  let enrichedPrompt = options.prompt
  if (options.useWebSearch) {
    try {
      const fetched = await extractAndFetchUrls(options.prompt)
      const successful = fetched.filter((f) => !f.error && f.content)
      if (successful.length > 0) {
        enrichedPrompt = `${options.prompt}

<source_material>
${successful
  .map(
    (f) =>
      `Source: ${f.url}${f.title ? ` (${f.title})` : ''}
${f.content}`
  )
  .join('\n\n---\n\n')}
</source_material>

Use the source material above as reference for the essay.`
      }
    } catch (err) {
      console.warn('URL extraction failed:', err)
    }
  }

  return createStream({
    model: options.model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: enrichedPrompt },
    ],
    anthropicKey: options.anthropicKey,
    openaiKey: options.openaiKey,
    maxTokens: options.useThinking ? 16000 : 8192,
    useWebSearch: options.useWebSearch,
    useThinking: options.useThinking,
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
