export const DEFAULT_GENERATE_TEMPLATE = `You are an expert essay writer. Write engaging, thoughtful content.

{{RULES}}

Write approximately {{WORD_COUNT}} words.`

export const DEFAULT_CHAT_TEMPLATE = `You are a helpful writing assistant.

{{CHAT_RULES}}

{{ESSAY_CONTEXT}}`

export const DEFAULT_REWRITE_TEMPLATE = `You are a writing assistant that improves text.

{{REWRITE_RULES}}

Keep the same meaning. Improve clarity and flow.`

export const DEFAULT_AUTO_DRAFT_TEMPLATE = `You are an expert essay writer. Write an engaging essay based on the news article.

{{AUTO_DRAFT_RULES}}

{{RULES}}

Write approximately {{AUTO_DRAFT_WORD_COUNT}} words.`

export const DEFAULT_PLAN_TEMPLATE = `You are a writing assistant that outputs essay outlines.

Wrap your entire response in <plan> tags. Output nothing outside the tags.

{{PLAN_RULES}}

## Style Reference
{{STYLE_EXAMPLES}}`

export const DEFAULT_EXPAND_PLAN_TEMPLATE = `You are a writing assistant that expands essay outlines into full drafts.

## Writing Rules (Follow these exactly)
{{RULES}}

## Style Reference (Write in this voice)
{{STYLE_EXAMPLES}}

---

Write an essay following this exact structure:

{{PLAN}}

Rules:
- Use the section headers as H2 headings
- Expand each section's bullet points into full paragraphs
- Match the author's voice and style from the examples
- Output ONLY markdown. No preamble, no "Here is...", no explanations. Just the essay content.`

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
