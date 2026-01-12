import { DEFAULT_GENERATE_TEMPLATE, DEFAULT_CHAT_TEMPLATE } from './prompts'

/**
 * Build a system prompt for essay generation.
 */
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

/**
 * Build a system prompt for chat interactions.
 */
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
