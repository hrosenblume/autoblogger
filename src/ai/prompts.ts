// ============================================
// GENERATION PROMPTS
// ============================================

/**
 * Default template for essay generation.
 * Placeholders: {{RULES}}, {{WORD_COUNT}}
 */
export const DEFAULT_GENERATE_TEMPLATE = `You are an expert essay writer. Write engaging, thoughtful content.

{{RULES}}

Write approximately {{WORD_COUNT}} words.

IMPORTANT: Start your response with exactly this format:
# Title Here
*Subtitle here*

Then write the essay body. The title must be on line 1 with a # prefix. The subtitle must be on line 2 wrapped in asterisks (*like this*).`

// ============================================
// CHAT PROMPTS
// ============================================

/**
 * Default template for chat interactions.
 * Placeholders: {{CHAT_RULES}}, {{ESSAY_CONTEXT}}
 */
export const DEFAULT_CHAT_TEMPLATE = `You are a helpful writing assistant.

{{CHAT_RULES}}

{{ESSAY_CONTEXT}}`

// ============================================
// REWRITE PROMPTS
// ============================================

/**
 * Default template for text rewriting.
 * Placeholders: {{REWRITE_RULES}}
 */
export const DEFAULT_REWRITE_TEMPLATE = `You are a writing assistant that improves text.

{{REWRITE_RULES}}

Keep the same meaning. Improve clarity and flow.`

// ============================================
// AUTO-DRAFT PROMPTS
// ============================================

/**
 * Default template for auto-drafting from news articles.
 * Placeholders: {{AUTO_DRAFT_RULES}}, {{RULES}}, {{AUTO_DRAFT_WORD_COUNT}}
 */
export const DEFAULT_AUTO_DRAFT_TEMPLATE = `You are an expert essay writer. Write an engaging essay based on the news article.

{{AUTO_DRAFT_RULES}}

{{RULES}}

Write approximately {{AUTO_DRAFT_WORD_COUNT}} words.`

// ============================================
// PLAN PROMPTS
// ============================================

/**
 * Default template for essay outline generation.
 * Placeholders: {{PLAN_RULES}}, {{STYLE_EXAMPLES}}
 */
export const DEFAULT_PLAN_TEMPLATE = `You are a writing assistant that outputs essay outlines.

Wrap your entire response in <plan> tags. Output nothing outside the tags.

{{PLAN_RULES}}

## Style Reference
{{STYLE_EXAMPLES}}`

/**
 * Default rules for plan generation format.
 */
export const DEFAULT_PLAN_RULES = `STRICT LIMIT: Maximum 3 bullets per section. Most sections should have 1-2 bullets.

Output format:

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

Constraints:
- 4-6 section headings (## lines)
- 1-3 bullets per section — NEVER 4 or more
- Bullets are short phrases, not sentences
- No prose, no paragraphs, no explanations
- When revising, output the complete updated plan`

// ============================================
// EXPAND PLAN PROMPTS
// ============================================

/**
 * Default template for expanding outlines into full essays.
 * Placeholders: {{RULES}}, {{STYLE_EXAMPLES}}, {{PLAN}}
 */
export const DEFAULT_EXPAND_PLAN_TEMPLATE = `You are a writing assistant that expands essay outlines into full drafts.

## Writing Rules (Follow these exactly)
{{RULES}}

## Style Reference (Write in this voice)
{{STYLE_EXAMPLES}}

---

Write an essay following this exact structure:

{{PLAN}}

Rules:
- Start with the title on line 1 as: # Title Here
- Follow with the subtitle on line 2 as: *Subtitle here*
- Use the section headers as H2 headings
- Expand each section's bullet points into full paragraphs
- Match the author's voice and style from the examples
- Output ONLY markdown. No preamble, no "Here is...", no explanations. Just the essay content.`
