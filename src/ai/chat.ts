import { createStream } from './provider'
import { buildChatPrompt } from './builders'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

interface ChatOptions {
  messages: ChatMessage[]
  model: string
  essayContext?: { title: string; subtitle?: string; markdown: string } | null
  mode?: 'ask' | 'agent' | 'search'
  chatRules?: string
  template?: string | null
  anthropicKey?: string
  openaiKey?: string
}

export async function chatStream(options: ChatOptions): Promise<ReadableStream> {
  const systemPrompt = buildChatPrompt({
    chatRules: options.chatRules,
    template: options.template,
    essayContext: options.essayContext,
  })

  // Add mode-specific instructions
  let modeInstructions = ''
  if (options.mode === 'agent') {
    modeInstructions = `
You can directly edit the essay using these commands:
- To replace text: :::edit replace_section "old text" "new text" :::
- To replace all: :::edit replace_all "title" "subtitle" "full markdown" :::
- To insert: :::edit insert "position" "match_text" "new_text" ::: (position: before, after, start, end)
- To delete: :::edit delete "text to remove" :::
`
  }

  return createStream({
    model: options.model,
    messages: [
      { role: 'system', content: systemPrompt + modeInstructions },
      ...options.messages,
    ],
    anthropicKey: options.anthropicKey,
    openaiKey: options.openaiKey,
    maxTokens: 4096,
  })
}
