/**
 * Prompt builder functions
 */

import type { EssayContext, StyleContext } from './types'
import { DEFAULT_GENERATE_TEMPLATE } from './templates/generate'
import { DEFAULT_CHAT_TEMPLATE } from './templates/chat'
import { DEFAULT_REWRITE_TEMPLATE } from './templates/rewrite'
import { DEFAULT_PLAN_TEMPLATE, DEFAULT_PLAN_RULES } from './templates/plan'
import { DEFAULT_AGENT_TEMPLATE } from './templates/agent'
import { DEFAULT_EXPAND_PLAN_TEMPLATE } from './templates/expand-plan'
import { DEFAULT_SEARCH_ONLY_PROMPT } from './templates/search'

/**
 * Format essay context for inclusion in prompts.
 */
function formatEssayContext(essayContext: EssayContext): string {
  const parts: string[] = []
  
  if (essayContext.title) {
    parts.push(`Title: ${essayContext.title}`)
  }
  if (essayContext.subtitle) {
    parts.push(`Subtitle: ${essayContext.subtitle}`)
  }
  if (essayContext.markdown) {
    parts.push(`Content:\n${essayContext.markdown}`)
  }
  
  return parts.join('\n') || 'Empty essay'
}

/**
 * Build the search-only prompt for fact-finding queries.
 */
export function buildSearchOnlyPrompt(query: string): string {
  return `${DEFAULT_SEARCH_ONLY_PROMPT}

Research Topic: ${query}`
}

/**
 * Build the full plan prompt with context and essay state.
 */
export function buildPlanPrompt(
  context: StyleContext,
  essayContext?: EssayContext | null
): string {
  let prompt = DEFAULT_PLAN_TEMPLATE
    .replace('{{PLAN_RULES}}', context.planRules || DEFAULT_PLAN_RULES)
    .replace('{{STYLE_EXAMPLES}}', context.styleExamples || 'No style examples provided.')

  if (essayContext) {
    const currentState = formatEssayContext(essayContext)
    prompt += `\n\n<current_essay>\n${currentState}\n</current_essay>`
  }

  return prompt
}

/**
 * Build the chat prompt with essay context.
 */
export function buildChatPrompt(
  context: StyleContext,
  essayContext?: EssayContext | null
): string {
  let essayContextStr = 'No essay currently open.'
  if (essayContext) {
    essayContextStr = formatEssayContext(essayContext)
  }

  return DEFAULT_CHAT_TEMPLATE
    .replace('{{CHAT_RULES}}', context.chatRules || 'Be helpful and concise.')
    .replace('{{ESSAY_CONTEXT}}', essayContextStr)
}

/**
 * Build the agent chat prompt for direct editing mode.
 */
export function buildAgentChatPrompt(
  context: StyleContext,
  essayContext?: EssayContext | null
): string {
  const basePrompt = buildChatPrompt(context, essayContext)
  return basePrompt + '\n\n' + DEFAULT_AGENT_TEMPLATE
}

/**
 * Build the generate prompt for essay creation.
 */
export function buildGeneratePrompt(
  context: StyleContext,
  wordCount: number = 800
): string {
  return DEFAULT_GENERATE_TEMPLATE
    .replace('{{RULES}}', context.rules || '')
    .replace('{{WORD_COUNT}}', wordCount.toString())
}

/**
 * Build the rewrite prompt.
 */
export function buildRewritePrompt(context: StyleContext): string {
  return DEFAULT_REWRITE_TEMPLATE
    .replace('{{REWRITE_RULES}}', context.rewriteRules || 'Improve clarity and flow.')
}

/**
 * Build the expand plan prompt.
 */
export function buildExpandPlanPrompt(
  context: StyleContext,
  plan: string
): string {
  return DEFAULT_EXPAND_PLAN_TEMPLATE
    .replace('{{RULES}}', context.rules || '')
    .replace('{{STYLE_EXAMPLES}}', context.styleExamples || 'No style examples provided.')
    .replace('{{PLAN}}', plan)
}
