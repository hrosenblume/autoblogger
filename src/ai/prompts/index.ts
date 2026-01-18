/**
 * AI Prompts - Templates and Builders
 * 
 * This module provides prompt templates and builder functions for AI interactions.
 * Templates are organized by purpose (generate, chat, rewrite, etc.)
 * Builders combine templates with context to create complete prompts.
 */

// Types
export * from './types'

// Templates
export { DEFAULT_GENERATE_TEMPLATE } from './templates/generate'
export { DEFAULT_CHAT_TEMPLATE } from './templates/chat'
export { DEFAULT_REWRITE_TEMPLATE } from './templates/rewrite'
export { DEFAULT_AUTO_DRAFT_TEMPLATE } from './templates/auto-draft'
export { DEFAULT_PLAN_TEMPLATE, DEFAULT_PLAN_RULES } from './templates/plan'
export { DEFAULT_AGENT_TEMPLATE } from './templates/agent'
export { DEFAULT_ASK_TEMPLATE } from './templates/ask'
export { DEFAULT_EXPAND_PLAN_TEMPLATE } from './templates/expand-plan'
export { DEFAULT_SEARCH_ONLY_PROMPT } from './templates/search'

// Builders
export {
  buildSearchOnlyPrompt,
  buildPlanPrompt,
  buildChatPrompt,
  buildAgentChatPrompt,
  buildGeneratePrompt,
  buildRewritePrompt,
  buildExpandPlanPrompt,
} from './builders'
