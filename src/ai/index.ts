// Models
export { 
  AI_MODELS, 
  getModel, 
  getDefaultModel,
  modelHasNativeSearch,
  getSearchModel,
  resolveModel,
  getModelOptions,
  toModelOption,
  LENGTH_OPTIONS,
} from './models'
export type { AIModel, AIModelOption, ModelId, LengthOption } from './models'

// Provider
export { createStream, generate, getApiKey } from './provider'
export type { ChatMessage } from './provider'

// Generate
export { generateStream, expandPlanStream } from './generate'

// Chat
export { chatStream } from './chat'

// Builders
export { 
  buildGeneratePrompt, 
  buildChatPrompt, 
  buildExpandPlanPrompt, 
  buildPlanPrompt, 
  buildRewritePrompt, 
  buildAutoDraftPrompt 
} from './builders'

// Prompts
export {
  DEFAULT_GENERATE_TEMPLATE,
  DEFAULT_CHAT_TEMPLATE,
  DEFAULT_REWRITE_TEMPLATE,
  DEFAULT_AUTO_DRAFT_TEMPLATE,
  DEFAULT_PLAN_TEMPLATE,
  DEFAULT_PLAN_RULES,
  DEFAULT_EXPAND_PLAN_TEMPLATE,
  DEFAULT_AGENT_TEMPLATE,
  DEFAULT_SEARCH_ONLY_PROMPT,
  buildSearchOnlyPrompt,
  buildPlanPrompt as buildPlanPromptFromPrompts,
  buildChatPrompt as buildChatPromptFromPrompts,
  buildAgentChatPrompt,
  buildGeneratePrompt as buildGeneratePromptFromPrompts,
  buildRewritePrompt as buildRewritePromptFromPrompts,
  buildExpandPlanPrompt as buildExpandPlanPromptFromPrompts,
} from './prompts'
export type { EssayContext, StyleContext } from './prompts'

// Parse
export { parseGeneratedContent } from './parse'