import { 
  DEFAULT_GENERATE_TEMPLATE, 
  DEFAULT_CHAT_TEMPLATE, 
  DEFAULT_EXPAND_PLAN_TEMPLATE,
  DEFAULT_PLAN_TEMPLATE,
  DEFAULT_PLAN_RULES,
  DEFAULT_REWRITE_TEMPLATE,
  DEFAULT_AUTO_DRAFT_TEMPLATE,
} from './prompts'

/**
 * Build a system prompt for essay generation.
 */
export function buildGeneratePrompt(options: {
  rules?: string
  template?: string | null
  wordCount?: number
  styleExamples?: string
}): string {
  const template = options.template || DEFAULT_GENERATE_TEMPLATE
  
  return template
    .replace('{{RULES}}', options.rules || '')
    .replace('{{WORD_COUNT}}', String(options.wordCount || 800))
    .replace('{{STYLE_EXAMPLES}}', options.styleExamples || '')
}

/**
 * Build a system prompt for chat interactions.
 */
export function buildChatPrompt(options: {
  chatRules?: string
  rules?: string
  template?: string | null
  essayContext?: { title: string; subtitle?: string; markdown: string } | null
  styleExamples?: string
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
    .replace('{{RULES}}', options.rules || '')
    .replace('{{ESSAY_CONTEXT}}', essaySection)
    .replace('{{STYLE_EXAMPLES}}', options.styleExamples || '')
}

/**
 * Build a system prompt for expanding a plan into a full essay.
 */
export function buildExpandPlanPrompt(options: {
  rules?: string
  template?: string | null
  plan: string
  styleExamples?: string
}): string {
  const template = options.template || DEFAULT_EXPAND_PLAN_TEMPLATE
  
  return template
    .replace('{{RULES}}', options.rules || '')
    .replace('{{STYLE_EXAMPLES}}', options.styleExamples || '')
    .replace('{{PLAN}}', options.plan)
}

/**
 * Build a system prompt for plan/outline generation.
 */
export function buildPlanPrompt(options: {
  planRules?: string
  template?: string | null
  styleExamples?: string
}): string {
  const template = options.template || DEFAULT_PLAN_TEMPLATE
  const rules = options.planRules || DEFAULT_PLAN_RULES
  
  return template
    .replace('{{PLAN_RULES}}', rules)
    .replace('{{STYLE_EXAMPLES}}', options.styleExamples || '')
}

/**
 * Build a system prompt for text rewriting.
 */
export function buildRewritePrompt(options: {
  rewriteRules?: string
  rules?: string
  template?: string | null
  styleExamples?: string
}): string {
  const template = options.template || DEFAULT_REWRITE_TEMPLATE
  
  return template
    .replace('{{REWRITE_RULES}}', options.rewriteRules || '')
    .replace('{{RULES}}', options.rules || '')
    .replace('{{STYLE_EXAMPLES}}', options.styleExamples || '')
}

/**
 * Build a system prompt for auto-drafting essays from news articles.
 */
export function buildAutoDraftPrompt(options: {
  autoDraftRules?: string
  rules?: string
  template?: string | null
  wordCount?: number
  styleExamples?: string
  // Article context
  topicName?: string
  articleTitle?: string
  articleSummary?: string
  articleUrl?: string
}): string {
  const template = options.template || DEFAULT_AUTO_DRAFT_TEMPLATE
  
  return template
    .replace('{{AUTO_DRAFT_RULES}}', options.autoDraftRules || '')
    .replace('{{RULES}}', options.rules || '')
    .replace('{{AUTO_DRAFT_WORD_COUNT}}', String(options.wordCount || 800))
    .replace('{{STYLE_EXAMPLES}}', options.styleExamples || '')
    .replace('{{TOPIC_NAME}}', options.topicName || '')
    .replace('{{ARTICLE_TITLE}}', options.articleTitle || '')
    .replace('{{ARTICLE_SUMMARY}}', options.articleSummary || '')
    .replace('{{ARTICLE_URL}}', options.articleUrl || '')
}
