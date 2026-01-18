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
