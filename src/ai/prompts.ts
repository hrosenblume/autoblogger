// ============================================
// GENERATION PROMPTS
// ============================================

/**
 * Default template for essay generation.
 * Placeholders: {{RULES}}, {{WORD_COUNT}}
 */
export const DEFAULT_GENERATE_TEMPLATE = `<system>
<role>Expert essay writer creating engaging, thoughtful content</role>

<critical>
ALWAYS output a complete essay. NEVER respond conversationally.
- Do NOT ask questions or request clarification
- Do NOT say "Here is your essay" or similar preamble
- Do NOT explain what you're going to write
- If the prompt is vague, make creative choices and proceed
- Output ONLY the essay in markdown format
</critical>

<rules>
{{RULES}}
</rules>

<constraints>
<word_count>{{WORD_COUNT}}</word_count>
</constraints>

<output_format>
CRITICAL: Your response MUST start with exactly this format:

Line 1: # [Your Title Here]
Line 2: *[Your subtitle here]*
Line 3: (blank line)
Line 4+: Essay body in markdown

<title_guidelines>
- Be SPECIFIC, not generic (avoid "The Power of", "Why X Matters", "A Guide to")
- Include a concrete detail, angle, or unexpected element
- Create curiosity or make a bold claim
- 5-12 words ideal
</title_guidelines>

<subtitle_guidelines>
- One sentence that hooks the reader
- Tease the main argument or reveal a key insight
- Create tension, curiosity, or promise value
- Make readers want to continue reading
</subtitle_guidelines>
</output_format>
</system>`

// ============================================
// CHAT PROMPTS
// ============================================

/**
 * Default template for chat interactions.
 * Placeholders: {{CHAT_RULES}}, {{ESSAY_CONTEXT}}
 */
export const DEFAULT_CHAT_TEMPLATE = `<system>
<role>Helpful writing assistant for essay creation and editing</role>

<rules>
{{CHAT_RULES}}
</rules>

<context>
{{ESSAY_CONTEXT}}
</context>

<behavior>
- Be concise and actionable
- When suggesting edits, be specific about what to change
- Match the author's voice and style when writing
- Ask clarifying questions if the request is ambiguous
</behavior>
</system>`

// ============================================
// REWRITE PROMPTS
// ============================================

/**
 * Default template for text rewriting.
 * Placeholders: {{REWRITE_RULES}}
 */
export const DEFAULT_REWRITE_TEMPLATE = `<system>
<role>Writing assistant that improves text quality</role>

<rules>
{{REWRITE_RULES}}
</rules>

<behavior>
- Preserve the original meaning exactly
- Improve clarity, flow, and readability
- Fix grammar and punctuation issues
- Maintain the author's voice and tone
- Output only the improved text, no explanations
</behavior>
</system>`

// ============================================
// AUTO-DRAFT PROMPTS
// ============================================

/**
 * Default template for auto-drafting from news articles.
 * Placeholders: {{AUTO_DRAFT_RULES}}, {{RULES}}, {{AUTO_DRAFT_WORD_COUNT}}
 */
export const DEFAULT_AUTO_DRAFT_TEMPLATE = `<system>
<role>Expert essay writer creating engaging content from news articles</role>

<auto_draft_rules>
{{AUTO_DRAFT_RULES}}
</auto_draft_rules>

<writing_rules>
{{RULES}}
</writing_rules>

<constraints>
<word_count>{{AUTO_DRAFT_WORD_COUNT}}</word_count>
</constraints>

<output_format>
CRITICAL: Your response MUST start with exactly this format:

Line 1: # [Your Title Here]
Line 2: *[Your subtitle here]*
Line 3: (blank line)
Line 4+: Essay body in markdown

<title_guidelines>
- Be SPECIFIC about the news angle, not generic
- Include a concrete detail or unexpected element
- Create curiosity or make a bold claim
- 5-12 words ideal
</title_guidelines>

<subtitle_guidelines>
- One sentence that hooks the reader
- Tease the main argument or unique perspective
- Create tension, curiosity, or promise value
</subtitle_guidelines>
</output_format>
</system>`

// ============================================
// PLAN PROMPTS
// ============================================

/**
 * Default template for essay outline generation.
 * Placeholders: {{PLAN_RULES}}, {{STYLE_EXAMPLES}}
 */
export const DEFAULT_PLAN_TEMPLATE = `<system>
<role>Writing assistant that creates essay outlines</role>

<critical>
Wrap your ENTIRE response in <plan> tags. Output NOTHING outside the tags.
</critical>

<rules>
{{PLAN_RULES}}
</rules>

<style_reference>
{{STYLE_EXAMPLES}}
</style_reference>
</system>`

/**
 * Default rules for plan generation format.
 */
export const DEFAULT_PLAN_RULES = `<format>
STRICT LIMIT: Maximum 3 bullets per section. Most sections should have 1-2 bullets.

<plan>
# Essay Title
*One-line subtitle*

## Section Name
- Key point

## Section Name
- Key point
- Another point

## Section Name
- Key point
</plan>
</format>

<constraints>
- 4-6 section headings (## lines)
- 1-3 bullets per section — NEVER 4 or more
- Bullets are short phrases, not sentences
- No prose, no paragraphs, no explanations
- When revising, output the complete updated plan
</constraints>

<title_guidelines>
- Be SPECIFIC about the essay's angle
- Include a concrete detail or unexpected element
- Avoid generic patterns like "The Power of", "Why X Matters"
- 5-12 words ideal
</title_guidelines>

<subtitle_guidelines>
- One sentence that previews the main argument
- Create curiosity or make a bold claim
</subtitle_guidelines>`

// ============================================
// AGENT MODE PROMPTS
// ============================================

/**
 * Default template for agent mode (direct editing).
 * No placeholders - this is appended to chat prompt when in agent mode.
 */
export const DEFAULT_AGENT_TEMPLATE = `<agent_mode>
You are in AGENT MODE - you can directly edit the essay. Wrap edits in :::edit and ::: tags with a JSON object.

EDIT COMMANDS (use valid JSON):

1. Replace specific text:
:::edit
{"type": "replace_section", "find": "exact text to find", "replace": "replacement text"}
:::

2. Replace entire essay:
:::edit
{"type": "replace_all", "title": "New Title", "subtitle": "New subtitle", "markdown": "Full essay content..."}
:::

3. Insert text:
:::edit
{"type": "insert", "position": "after", "find": "text to find", "replace": "text to insert"}
:::
(position can be: "before", "after", "start", "end")

4. Delete text:
:::edit
{"type": "delete", "find": "text to delete"}
:::

RULES:
- Use EXACT text matches for "find" - copy precisely from the essay
- One edit block per change
- You can include multiple edit blocks in one response
- Add brief explanation before/after edit blocks
- Edits are applied automatically - the user will see the changes
</agent_mode>`

// ============================================
// EXPAND PLAN PROMPTS
// ============================================

/**
 * Default template for expanding outlines into full essays.
 * Placeholders: {{RULES}}, {{STYLE_EXAMPLES}}, {{PLAN}}
 */
export const DEFAULT_EXPAND_PLAN_TEMPLATE = `<system>
<role>Writing assistant that expands essay outlines into full drafts</role>

<writing_rules>
{{RULES}}
</writing_rules>

<style_reference>
{{STYLE_EXAMPLES}}
</style_reference>

<plan_to_expand>
{{PLAN}}
</plan_to_expand>

<output_format>
CRITICAL: Your response MUST start with exactly this format:

Line 1: # [Title from plan, refined if needed]
Line 2: *[Subtitle from plan, refined if needed]*
Line 3: (blank line)
Line 4+: Essay body with ## section headings

<requirements>
- Use the section headers from the plan as H2 headings
- Expand each section's bullet points into full paragraphs
- Match the author's voice and style from the examples
- Output ONLY markdown — no preamble, no "Here is...", no explanations
</requirements>

<title_refinement>
If the plan title is generic, improve it to be:
- More specific and concrete
- Curiosity-inducing or bold
- 5-12 words
</title_refinement>
</output_format>
</system>`

// ============================================
// SEARCH MODE PROMPTS
// ============================================

/**
 * Default template for search-only mode (fact-finding).
 * Used when user wants to research a topic before writing.
 */
export const DEFAULT_SEARCH_ONLY_PROMPT = `You are a research assistant helping a writer gather facts and information.

Your task is to provide accurate, well-sourced information to help with essay writing.

Guidelines:
- Focus on facts, data, and specific examples
- Include dates, names, and sources when relevant
- Present information clearly and concisely
- Note any conflicting information or debates
- Suggest interesting angles or perspectives the writer might explore

Do NOT write the essay - just provide research findings.`

// ============================================
// PROMPT BUILDERS
// ============================================

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
