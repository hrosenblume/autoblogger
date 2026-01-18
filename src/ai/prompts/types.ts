/**
 * Shared types for prompt building
 */

export interface EssayContext {
  title?: string
  subtitle?: string
  markdown?: string
}

export interface StyleContext {
  rules?: string
  chatRules?: string
  rewriteRules?: string
  planRules?: string
  styleExamples?: string
}
