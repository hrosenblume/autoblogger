const DEFAULT_GENERATE_TEMPLATE = `You are an expert essay writer. Write engaging, thoughtful content.

{{RULES}}

Write approximately {{WORD_COUNT}} words.`

const DEFAULT_CHAT_TEMPLATE = `You are a helpful writing assistant.

{{CHAT_RULES}}

{{ESSAY_CONTEXT}}`

export function buildGeneratePrompt(options: {
  rules?: string
  template?: string | null
  wordCount?: number
}): string {
  const template = options.template || DEFAULT_GENERATE_TEMPLATE
  
  return template
    .replace('{{RULES}}', options.rules || '')
    .replace('{{WORD_COUNT}}', String(options.wordCount || 800))
}

export function buildChatPrompt(options: {
  chatRules?: string
  template?: string | null
  essayContext?: { title: string; subtitle?: string; markdown: string } | null
}): string {
  const template = options.template || DEFAULT_CHAT_TEMPLATE
  
  let essaySection = ''
  if (options.essayContext) {
    essaySection = `
Current essay being edited:
Title: ${options.essayContext.title}
${options.essayContext.subtitle ? `Subtitle: ${options.essayContext.subtitle}` : ''}

Content:
${options.essayContext.markdown}
`
  }
  
  return template
    .replace('{{CHAT_RULES}}', options.chatRules || '')
    .replace('{{ESSAY_CONTEXT}}', essaySection)
}
