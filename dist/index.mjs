var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/ai/prompts.ts
var DEFAULT_GENERATE_TEMPLATE, DEFAULT_CHAT_TEMPLATE, DEFAULT_REWRITE_TEMPLATE, DEFAULT_AUTO_DRAFT_TEMPLATE, DEFAULT_PLAN_TEMPLATE, DEFAULT_PLAN_RULES, DEFAULT_AGENT_TEMPLATE, DEFAULT_EXPAND_PLAN_TEMPLATE, DEFAULT_SEARCH_ONLY_PROMPT;
var init_prompts = __esm({
  "src/ai/prompts.ts"() {
    "use strict";
    DEFAULT_GENERATE_TEMPLATE = `<system>
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

<style_reference>
{{STYLE_EXAMPLES}}
</style_reference>

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
</system>`;
    DEFAULT_CHAT_TEMPLATE = `<system>
<role>Helpful writing assistant for essay creation and editing</role>

<chat_rules>
{{CHAT_RULES}}
</chat_rules>

<writing_rules>
{{RULES}}
</writing_rules>

<style_reference>
{{STYLE_EXAMPLES}}
</style_reference>

<context>
{{ESSAY_CONTEXT}}
</context>

<behavior>
- Be concise and actionable
- When suggesting edits, be specific about what to change
- Match the author's voice and style when writing
- Ask clarifying questions if the request is ambiguous
</behavior>
</system>`;
    DEFAULT_REWRITE_TEMPLATE = `<system>
<role>Writing assistant that improves text quality</role>

<rewrite_rules>
{{REWRITE_RULES}}
</rewrite_rules>

<writing_rules>
{{RULES}}
</writing_rules>

<style_reference>
{{STYLE_EXAMPLES}}
</style_reference>

<behavior>
- Preserve the original meaning exactly
- Improve clarity, flow, and readability
- Fix grammar and punctuation issues
- Maintain the author's voice and tone
- Output only the improved text, no explanations
</behavior>
</system>`;
    DEFAULT_AUTO_DRAFT_TEMPLATE = `<system>
<role>Expert essay writer creating engaging content from news articles</role>

<auto_draft_rules>
{{AUTO_DRAFT_RULES}}
</auto_draft_rules>

<writing_rules>
{{RULES}}
</writing_rules>

<style_reference>
{{STYLE_EXAMPLES}}
</style_reference>

<source_article>
<topic>{{TOPIC_NAME}}</topic>
<title>{{ARTICLE_TITLE}}</title>
<summary>{{ARTICLE_SUMMARY}}</summary>
<url>{{ARTICLE_URL}}</url>
</source_article>

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
</system>`;
    DEFAULT_PLAN_TEMPLATE = `<system>
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
</system>`;
    DEFAULT_PLAN_RULES = `<format>
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
- 1-3 bullets per section \u2014 NEVER 4 or more
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
</subtitle_guidelines>`;
    DEFAULT_AGENT_TEMPLATE = `<agent_mode>
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
</agent_mode>`;
    DEFAULT_EXPAND_PLAN_TEMPLATE = `<system>
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
- Output ONLY markdown \u2014 no preamble, no "Here is...", no explanations
</requirements>

<title_refinement>
If the plan title is generic, improve it to be:
- More specific and concrete
- Curiosity-inducing or bold
- 5-12 words
</title_refinement>
</output_format>
</system>`;
    DEFAULT_SEARCH_ONLY_PROMPT = `You are a research assistant helping a writer gather facts and information.

Your task is to provide accurate, well-sourced information to help with essay writing.

Guidelines:
- Focus on facts, data, and specific examples
- Include dates, names, and sources when relevant
- Present information clearly and concisely
- Note any conflicting information or debates
- Suggest interesting angles or perspectives the writer might explore

Do NOT write the essay - just provide research findings.`;
  }
});

// src/ai/models.ts
function getModel(id) {
  return AI_MODELS.find((m) => m.id === id);
}
function getDefaultModel() {
  return AI_MODELS[0];
}
async function resolveModel(providedModelId, getDefaultModelId) {
  let modelId = providedModelId;
  if (!modelId) {
    modelId = await getDefaultModelId() || "claude-sonnet";
  }
  const model = getModel(modelId);
  if (!model) {
    throw new Error(`Unknown model: ${modelId}. Available: ${AI_MODELS.map((m) => m.id).join(", ")}`);
  }
  return model;
}
function toModelOption(model) {
  return {
    id: model.id,
    name: model.name,
    description: model.description,
    hasNativeSearch: model.searchModel === "native"
  };
}
function getModelOptions() {
  return AI_MODELS.map(toModelOption);
}
var AI_MODELS;
var init_models = __esm({
  "src/ai/models.ts"() {
    "use strict";
    AI_MODELS = [
      {
        id: "claude-sonnet",
        name: "Sonnet 4.5",
        provider: "anthropic",
        modelId: "claude-sonnet-4-5-20250929",
        description: "Fast, capable, best value",
        searchModel: null
        // No native search, uses search-first flow
      },
      {
        id: "claude-opus",
        name: "Opus 4.5",
        provider: "anthropic",
        modelId: "claude-opus-4-5-20251101",
        description: "Highest quality, slower",
        searchModel: null
      },
      {
        id: "gpt-5.2",
        name: "GPT-5.2",
        provider: "openai",
        modelId: "gpt-5.2",
        description: "Latest OpenAI flagship",
        searchModel: "native"
        // Uses tools-based web search
      },
      {
        id: "gpt-5-mini",
        name: "GPT-5 Mini",
        provider: "openai",
        modelId: "gpt-5-mini",
        description: "Fast and cost-efficient",
        searchModel: "native"
        // Uses tools-based web search
      }
    ];
  }
});

// src/ai/provider.ts
var provider_exports = {};
__export(provider_exports, {
  createStream: () => createStream,
  generate: () => generate,
  getApiKey: () => getApiKey
});
import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
async function getApiKey(provider, prisma) {
  if (prisma?.aISettings) {
    try {
      const settings = await prisma.aISettings.findUnique({
        where: { id: "default" }
      });
      if (provider === "anthropic" && settings?.anthropicKey) {
        return settings.anthropicKey;
      }
      if (provider === "openai" && settings?.openaiKey) {
        return settings.openaiKey;
      }
    } catch {
    }
  }
  if (provider === "anthropic") {
    return process.env.ANTHROPIC_API_KEY || null;
  }
  return process.env.OPENAI_API_KEY || null;
}
async function fetchSearchResults(query, openaiKey) {
  try {
    console.log("[Web Search] Fetching search results for:", query.slice(0, 100));
    const openai = new OpenAI({
      ...openaiKey && { apiKey: openaiKey }
    });
    const response = await openai.responses.create({
      model: "gpt-5-mini",
      input: `You are a research assistant. Provide a concise summary of the most relevant and recent information from the web about the following query. Include key facts, dates, and sources when available. Keep your response under 500 words.

Query: ${query}`,
      tools: [{ type: "web_search" }]
    });
    const result = response.output_text || null;
    console.log("[Web Search] Got results:", result ? `${result.length} chars` : "null");
    return result;
  } catch (error) {
    console.error("[Web Search] Failed:", error);
    return null;
  }
}
function extractSearchQuery(messages) {
  const userMessages = messages.filter((m) => m.role === "user");
  return userMessages[userMessages.length - 1]?.content || "";
}
async function generate(modelId, systemPrompt, userPrompt, options = {}) {
  const model = getModel(modelId);
  if (!model) {
    throw new Error(`Unknown model: ${modelId}`);
  }
  if (model.provider === "anthropic") {
    return generateWithAnthropic(model.modelId, systemPrompt, userPrompt, options);
  }
  return generateWithOpenAI(model.modelId, systemPrompt, userPrompt, options);
}
async function generateWithAnthropic(modelId, systemPrompt, userPrompt, options) {
  const anthropic = new Anthropic({
    ...options.anthropicKey && { apiKey: options.anthropicKey }
  });
  const response = await anthropic.messages.create({
    model: modelId,
    max_tokens: options.maxTokens || 4096,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }]
  });
  const textContent = response.content.find((c) => c.type === "text");
  if (!textContent || textContent.type !== "text") {
    throw new Error("No text content in response");
  }
  return {
    text: textContent.text,
    inputTokens: response.usage?.input_tokens,
    outputTokens: response.usage?.output_tokens
  };
}
async function generateWithOpenAI(modelId, systemPrompt, userPrompt, options) {
  const openai = new OpenAI({
    ...options.openaiKey && { apiKey: options.openaiKey }
  });
  if (options.useWebSearch) {
    const response2 = await openai.responses.create({
      model: modelId,
      instructions: systemPrompt,
      input: userPrompt,
      max_output_tokens: options.maxTokens || 4096,
      tools: [{ type: "web_search" }]
    });
    const textOutput = response2.output?.find((item) => item.type === "message");
    const content2 = textOutput?.content?.find((c) => c.type === "output_text")?.text;
    if (!content2) {
      throw new Error("No content in response");
    }
    return {
      text: content2,
      inputTokens: response2.usage?.input_tokens,
      outputTokens: response2.usage?.output_tokens
    };
  }
  const response = await openai.chat.completions.create({
    model: modelId,
    max_completion_tokens: options.maxTokens || 4096,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ]
  });
  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No content in response");
  }
  return {
    text: content,
    inputTokens: response.usage?.prompt_tokens,
    outputTokens: response.usage?.completion_tokens
  };
}
async function createStream(options) {
  const modelConfig = getModel(options.model);
  if (!modelConfig) {
    throw new Error(`Unknown model: ${options.model}`);
  }
  let searchContext = "";
  if (options.useWebSearch && modelConfig.provider === "anthropic") {
    const query = extractSearchQuery(options.messages);
    if (query) {
      const searchResults = await fetchSearchResults(query, options.openaiKey);
      if (searchResults) {
        searchContext = `

<web_search_results>
${searchResults}
</web_search_results>

Use the search results above to inform your response with current, accurate information.`;
      }
    }
  }
  if (modelConfig.provider === "anthropic") {
    return createAnthropicStream(options, modelConfig.modelId, searchContext);
  } else {
    return createOpenAIStream(options, modelConfig.modelId, options.useWebSearch);
  }
}
function safeEnqueue(controller, data) {
  try {
    controller.enqueue(data);
    return true;
  } catch {
    return false;
  }
}
function safeClose(controller) {
  try {
    controller.close();
  } catch {
  }
}
async function createAnthropicStream(options, modelId, searchContext = "") {
  const anthropic = new Anthropic({
    ...options.anthropicKey && { apiKey: options.anthropicKey }
  });
  const systemMessage = (options.messages.find((m) => m.role === "system")?.content || "") + searchContext;
  const chatMessages = options.messages.filter((m) => m.role !== "system").map((m) => ({ role: m.role, content: m.content }));
  const requestParams = {
    model: modelId,
    max_tokens: options.maxTokens || 4096,
    system: systemMessage,
    messages: chatMessages
  };
  if (options.useThinking && (modelId.includes("claude-sonnet") || modelId.includes("claude-opus"))) {
    requestParams.thinking = {
      type: "enabled",
      budget_tokens: 1e4
    };
    requestParams.max_tokens = Math.max(requestParams.max_tokens, 16e3);
  }
  try {
    const stream = await anthropic.messages.stream(requestParams);
    return new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (event.type === "content_block_delta") {
              const delta = event.delta;
              if (delta.type === "text_delta" && delta.text) {
                if (!safeEnqueue(controller, new TextEncoder().encode(`data: ${JSON.stringify({ text: delta.text })}

`))) {
                  return;
                }
              } else if (delta.type === "thinking_delta" && delta.thinking) {
                if (!safeEnqueue(controller, new TextEncoder().encode(`data: ${JSON.stringify({ thinking: delta.thinking })}

`))) {
                  return;
                }
              }
            }
          }
          safeEnqueue(controller, new TextEncoder().encode("data: [DONE]\n\n"));
          safeClose(controller);
        } catch (streamError) {
          const errorMessage = streamError instanceof Error ? streamError.message : "Stream error";
          console.error("[Anthropic Stream Error]", streamError);
          safeEnqueue(controller, new TextEncoder().encode(`data: ${JSON.stringify({ error: errorMessage })}

`));
          safeClose(controller);
        }
      }
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Anthropic API error";
    console.error("[Anthropic API Error]", error);
    throw new Error(errorMessage);
  }
}
async function createOpenAIStream(options, modelId, useWebSearch = false) {
  const openai = new OpenAI({
    ...options.openaiKey && { apiKey: options.openaiKey }
  });
  if (useWebSearch) {
    return createOpenAIResponsesStream(openai, options, modelId);
  }
  const requestParams = {
    model: modelId,
    messages: options.messages,
    max_completion_tokens: options.maxTokens || 4096,
    stream: true
  };
  try {
    const stream = await openai.chat.completions.create(requestParams);
    return new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text = chunk.choices[0]?.delta?.content;
            if (text) {
              if (!safeEnqueue(controller, new TextEncoder().encode(`data: ${JSON.stringify({ text })}

`))) {
                return;
              }
            }
          }
          safeEnqueue(controller, new TextEncoder().encode("data: [DONE]\n\n"));
          safeClose(controller);
        } catch (streamError) {
          const errorMessage = streamError instanceof Error ? streamError.message : "Stream error";
          console.error("[OpenAI Stream Error]", streamError);
          safeEnqueue(controller, new TextEncoder().encode(`data: ${JSON.stringify({ error: errorMessage })}

`));
          safeClose(controller);
        }
      }
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "OpenAI API error";
    console.error("[OpenAI API Error]", error);
    throw new Error(errorMessage);
  }
}
async function createOpenAIResponsesStream(openai, options, modelId) {
  const systemMessage = options.messages.find((m) => m.role === "system")?.content || "";
  const conversationMessages = options.messages.filter((m) => m.role !== "system");
  const lastUserMessage = conversationMessages[conversationMessages.length - 1]?.content || "";
  const conversationContext = conversationMessages.slice(0, -1).map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`).join("\n\n");
  const fullInput = conversationContext ? `${systemMessage}

Previous conversation:
${conversationContext}

User: ${lastUserMessage}` : `${systemMessage}

${lastUserMessage}`;
  try {
    const response = await openai.responses.create({
      model: modelId,
      input: fullInput,
      tools: [{ type: "web_search" }],
      stream: true
    });
    return new ReadableStream({
      async start(controller) {
        try {
          for await (const event of response) {
            if (event.type === "response.output_text.delta") {
              const text = event.delta;
              if (text) {
                if (!safeEnqueue(controller, new TextEncoder().encode(`data: ${JSON.stringify({ text })}

`))) {
                  return;
                }
              }
            }
          }
          safeEnqueue(controller, new TextEncoder().encode("data: [DONE]\n\n"));
          safeClose(controller);
        } catch (streamError) {
          const errorMessage = streamError instanceof Error ? streamError.message : "Stream error";
          console.error("[OpenAI Responses Stream Error]", streamError);
          safeEnqueue(controller, new TextEncoder().encode(`data: ${JSON.stringify({ error: errorMessage })}

`));
          safeClose(controller);
        }
      }
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "OpenAI Responses API error";
    console.error("[OpenAI Responses API Error]", error);
    throw new Error(errorMessage);
  }
}
var init_provider = __esm({
  "src/ai/provider.ts"() {
    "use strict";
    init_models();
  }
});

// src/ai/builders.ts
var builders_exports = {};
__export(builders_exports, {
  buildAutoDraftPrompt: () => buildAutoDraftPrompt,
  buildChatPrompt: () => buildChatPrompt,
  buildExpandPlanPrompt: () => buildExpandPlanPrompt,
  buildGeneratePrompt: () => buildGeneratePrompt,
  buildPlanPrompt: () => buildPlanPrompt,
  buildRewritePrompt: () => buildRewritePrompt
});
function buildGeneratePrompt(options) {
  const template = options.template || DEFAULT_GENERATE_TEMPLATE;
  return template.replace("{{RULES}}", options.rules || "").replace("{{WORD_COUNT}}", String(options.wordCount || 800)).replace("{{STYLE_EXAMPLES}}", options.styleExamples || "");
}
function buildChatPrompt(options) {
  const template = options.template || DEFAULT_CHAT_TEMPLATE;
  let essaySection = "";
  if (options.essayContext) {
    essaySection = `
Current essay being edited:
Title: ${options.essayContext.title}
${options.essayContext.subtitle ? `Subtitle: ${options.essayContext.subtitle}` : ""}

Content:
${options.essayContext.markdown}
`;
  }
  return template.replace("{{CHAT_RULES}}", options.chatRules || "").replace("{{RULES}}", options.rules || "").replace("{{ESSAY_CONTEXT}}", essaySection).replace("{{STYLE_EXAMPLES}}", options.styleExamples || "");
}
function buildExpandPlanPrompt(options) {
  const template = options.template || DEFAULT_EXPAND_PLAN_TEMPLATE;
  return template.replace("{{RULES}}", options.rules || "").replace("{{STYLE_EXAMPLES}}", options.styleExamples || "").replace("{{PLAN}}", options.plan);
}
function buildPlanPrompt(options) {
  const template = options.template || DEFAULT_PLAN_TEMPLATE;
  const rules = options.planRules || DEFAULT_PLAN_RULES;
  return template.replace("{{PLAN_RULES}}", rules).replace("{{STYLE_EXAMPLES}}", options.styleExamples || "");
}
function buildRewritePrompt(options) {
  const template = options.template || DEFAULT_REWRITE_TEMPLATE;
  return template.replace("{{REWRITE_RULES}}", options.rewriteRules || "").replace("{{RULES}}", options.rules || "").replace("{{STYLE_EXAMPLES}}", options.styleExamples || "");
}
function buildAutoDraftPrompt(options) {
  const template = options.template || DEFAULT_AUTO_DRAFT_TEMPLATE;
  return template.replace("{{AUTO_DRAFT_RULES}}", options.autoDraftRules || "").replace("{{RULES}}", options.rules || "").replace("{{AUTO_DRAFT_WORD_COUNT}}", String(options.wordCount || 800)).replace("{{STYLE_EXAMPLES}}", options.styleExamples || "").replace("{{TOPIC_NAME}}", options.topicName || "").replace("{{ARTICLE_TITLE}}", options.articleTitle || "").replace("{{ARTICLE_SUMMARY}}", options.articleSummary || "").replace("{{ARTICLE_URL}}", options.articleUrl || "");
}
var init_builders = __esm({
  "src/ai/builders.ts"() {
    "use strict";
    init_prompts();
  }
});

// src/lib/url-extractor.ts
var url_extractor_exports = {};
__export(url_extractor_exports, {
  buildUrlContext: () => buildUrlContext,
  extractAndFetchUrls: () => extractAndFetchUrls,
  extractUrls: () => extractUrls,
  fetchUrlContent: () => fetchUrlContent
});
function isServerlessEnvironment() {
  return !!(process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.VERCEL || process.env.NETLIFY || process.env.AWS_EXECUTION_ENV);
}
function extractUrls(text) {
  const urls = [];
  const withProtocol = text.match(URL_WITH_PROTOCOL);
  if (withProtocol) urls.push(...withProtocol);
  const wwwUrls = text.match(URL_WITHOUT_PROTOCOL);
  if (wwwUrls) {
    for (const url of wwwUrls) {
      const normalized = `https://${url}`;
      if (!urls.some((u) => u.includes(url))) {
        urls.push(normalized);
      }
    }
  }
  const bareUrls = text.match(DOMAIN_ONLY);
  if (bareUrls) {
    for (const url of bareUrls) {
      const normalized = `https://${url}`;
      if (!urls.some((u) => u.includes(url.split("/")[0]))) {
        urls.push(normalized);
      }
    }
  }
  return [...new Set(urls)];
}
function extractTextFromHtml(html, url) {
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : void 0;
  let text = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "").replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "").replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, "").replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, "").replace(/<header[^>]*>[\s\S]*?<\/header>/gi, "").replace(/<aside[^>]*>[\s\S]*?<\/aside>/gi, "").replace(/<!--[\s\S]*?-->/g, "").replace(/<(p|div|br|h[1-6]|li|tr)[^>]*>/gi, "\n").replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&[a-z]+;/gi, " ").replace(/\s+/g, " ").replace(/\n\s+/g, "\n").replace(/\n+/g, "\n").trim();
  if (text.length > 4e3) {
    text = text.slice(0, 4e3) + "\n\n[Content truncated...]";
  }
  if (text.length < 50) {
    return { url, content: "", error: "Could not extract meaningful content" };
  }
  return { url, title, content: text };
}
async function parseWithReadability(html, url) {
  try {
    const { JSDOM } = await import("jsdom");
    const { Readability } = await import("@mozilla/readability");
    const doc = new JSDOM(html, {
      url,
      resources: void 0,
      // Don't load ANY external resources (stylesheets, etc.)
      runScripts: void 0
      // Don't run any scripts
    });
    const reader = new Readability(doc.window.document);
    const article = reader.parse();
    if (!article || !article.textContent) {
      console.log("[Readability] No article content, falling back to simple extraction");
      return extractTextFromHtml(html, url);
    }
    let content = article.textContent.trim();
    if (content.length > 4e3) {
      content = content.slice(0, 4e3) + "\n\n[Content truncated...]";
    }
    return {
      url,
      title: article.title || void 0,
      content
    };
  } catch (error) {
    console.error("[JSDOM] Failed, using simple extraction:", error instanceof Error ? error.message : error);
    return extractTextFromHtml(html, url);
  }
}
async function fetchWithPuppeteer(url) {
  let browser = null;
  const isServerless = isServerlessEnvironment();
  try {
    console.log(`[Puppeteer] Launching browser for: ${url} (serverless: ${isServerless})`);
    if (isServerless) {
      const chromium = await import("@sparticuz/chromium");
      const puppeteerCore = await import("puppeteer-core");
      const executablePath = await chromium.default.executablePath();
      browser = await puppeteerCore.default.launch({
        args: chromium.default.args,
        defaultViewport: chromium.default.defaultViewport,
        executablePath,
        headless: chromium.default.headless
      });
    } else {
      try {
        const puppeteer = await import("puppeteer");
        browser = await puppeteer.default.launch({
          headless: true,
          args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage",
            "--disable-accelerated-2d-canvas",
            "--disable-gpu"
          ]
        });
      } catch (puppeteerImportError) {
        console.error("[Puppeteer] Import/launch failed:", puppeteerImportError);
        return { url, content: "", error: "Puppeteer unavailable - falling back to simple fetch" };
      }
    }
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    await page.setUserAgent(
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );
    await page.setRequestInterception(true);
    page.on("request", (req) => {
      const resourceType = req.resourceType();
      if (["image", "stylesheet", "font", "media"].includes(resourceType)) {
        req.abort();
      } else {
        req.continue();
      }
    });
    await page.goto(url, {
      waitUntil: "networkidle2",
      timeout: PUPPETEER_TIMEOUT
    });
    await new Promise((resolve) => setTimeout(resolve, CONTENT_WAIT_TIME));
    const html = await page.content();
    await browser.close();
    browser = null;
    console.log("[Puppeteer] Got HTML, parsing with Readability...");
    return await parseWithReadability(html, url);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Puppeteer error";
    console.error("[Puppeteer] Failed:", errorMessage);
    return { url, content: "", error: `Puppeteer: ${errorMessage}` };
  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch {
      }
    }
  }
}
async function fetchWithSimpleRequest(url) {
  try {
    console.log("[SimpleFetch] Fetching:", url);
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9"
      }
    });
    if (!res.ok) {
      return { url, content: "", error: `HTTP ${res.status}` };
    }
    const html = await res.text();
    return parseWithReadability(html, url);
  } catch (error) {
    return {
      url,
      content: "",
      error: error instanceof Error ? error.message : "Failed to fetch"
    };
  }
}
async function fetchUrlContent(url) {
  console.log("[URL Extractor] Fetching content from:", url);
  const puppeteerResult = await fetchWithPuppeteer(url);
  if (!puppeteerResult.error && puppeteerResult.content && puppeteerResult.content.length > 100) {
    console.log("[URL Extractor] Puppeteer succeeded, got", puppeteerResult.content.length, "chars");
    return puppeteerResult;
  }
  console.log("[URL Extractor] Puppeteer failed or got minimal content, trying simple fetch...");
  const simpleResult = await fetchWithSimpleRequest(url);
  if (simpleResult.content && simpleResult.content.length > (puppeteerResult.content?.length || 0)) {
    console.log("[URL Extractor] Simple fetch got more content:", simpleResult.content.length, "chars");
    return simpleResult;
  }
  if (puppeteerResult.content && puppeteerResult.content.length > 0) {
    return puppeteerResult;
  }
  return simpleResult.error ? simpleResult : puppeteerResult;
}
async function extractAndFetchUrls(text) {
  const urls = extractUrls(text);
  if (urls.length === 0) return [];
  const toFetch = urls.slice(0, 3);
  const results = await Promise.all(toFetch.map((url) => fetchUrlContent(url)));
  return results;
}
function buildUrlContext(fetched) {
  const successful = fetched.filter((f) => !f.error && f.content);
  if (successful.length === 0) return "";
  return `
<referenced_urls>
${successful.map(
    (f) => `<url src="${f.url}"${f.title ? ` title="${f.title}"` : ""}>
${f.content}
</url>`
  ).join("\n\n")}
</referenced_urls>

Use the content from these URLs when relevant to the conversation.`;
}
var URL_WITH_PROTOCOL, URL_WITHOUT_PROTOCOL, DOMAIN_ONLY, PUPPETEER_TIMEOUT, CONTENT_WAIT_TIME;
var init_url_extractor = __esm({
  "src/lib/url-extractor.ts"() {
    "use strict";
    URL_WITH_PROTOCOL = /https?:\/\/[^\s<>\[\]()]+(?:\([^\s<>\[\]()]*\))?[^\s<>\[\]().,;:!?"']*(?<![.,;:!?"'])/gi;
    URL_WITHOUT_PROTOCOL = /(?:www\.)[a-zA-Z0-9][-a-zA-Z0-9]*(?:\.[a-zA-Z]{2,})+(?:\/[^\s<>\[\]()]*)?/gi;
    DOMAIN_ONLY = /(?<![/@])(?:[a-zA-Z0-9][-a-zA-Z0-9]*\.)+(?:com|org|net|edu|gov|io|co|app|dev|news|info)(?:\/[^\s<>\[\]()]*)?(?![a-zA-Z])/gi;
    PUPPETEER_TIMEOUT = 15e3;
    CONTENT_WAIT_TIME = 2e3;
  }
});

// src/ai/generate.ts
var generate_exports = {};
__export(generate_exports, {
  expandPlanStream: () => expandPlanStream,
  generateStream: () => generateStream
});
async function generateStream(options) {
  const systemPrompt = buildGeneratePrompt({
    rules: options.rules,
    template: options.template,
    wordCount: options.wordCount,
    styleExamples: options.styleExamples
  });
  let enrichedPrompt = options.prompt;
  if (options.useWebSearch) {
    try {
      const fetched = await extractAndFetchUrls(options.prompt);
      const successful = fetched.filter((f) => !f.error && f.content);
      if (successful.length > 0) {
        enrichedPrompt = `${options.prompt}

<source_material>
${successful.map(
          (f) => `Source: ${f.url}${f.title ? ` (${f.title})` : ""}
${f.content}`
        ).join("\n\n---\n\n")}
</source_material>

Use the source material above as reference for the essay.`;
      }
    } catch (err) {
      console.warn("URL extraction failed:", err);
    }
  }
  return createStream({
    model: options.model,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: enrichedPrompt }
    ],
    anthropicKey: options.anthropicKey,
    openaiKey: options.openaiKey,
    maxTokens: options.useThinking ? 16e3 : 8192,
    useWebSearch: options.useWebSearch,
    useThinking: options.useThinking
  });
}
async function expandPlanStream(options) {
  const systemPrompt = buildExpandPlanPrompt({
    rules: options.rules,
    template: options.template,
    plan: options.plan,
    styleExamples: options.styleExamples
  });
  return createStream({
    model: options.model,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: "Write the essay now." }
    ],
    anthropicKey: options.anthropicKey,
    openaiKey: options.openaiKey,
    maxTokens: 8192
  });
}
var init_generate = __esm({
  "src/ai/generate.ts"() {
    "use strict";
    init_provider();
    init_builders();
    init_url_extractor();
  }
});

// src/ai/chat.ts
var chat_exports = {};
__export(chat_exports, {
  chatStream: () => chatStream
});
async function chatStream(options) {
  const systemPrompt = options.mode === "plan" ? buildPlanPrompt({
    planRules: options.planRules,
    template: options.planTemplate,
    styleExamples: options.styleExamples
  }) : buildChatPrompt({
    chatRules: options.chatRules,
    rules: options.rules,
    template: options.template,
    essayContext: options.essayContext,
    styleExamples: options.styleExamples
  });
  let urlContext = "";
  let urlExtractionStatus = "";
  if (options.useWebSearch) {
    const lastUserMsg = [...options.messages].reverse().find((m) => m.role === "user");
    if (lastUserMsg) {
      try {
        const { extractUrls: extractUrls2 } = await Promise.resolve().then(() => (init_url_extractor(), url_extractor_exports));
        const detectedUrls = extractUrls2(lastUserMsg.content);
        if (detectedUrls.length > 0) {
          console.log("[URL Extraction] Detected URLs:", detectedUrls);
          const fetched = await extractAndFetchUrls(lastUserMsg.content);
          if (fetched.length > 0) {
            const successful = fetched.filter((f) => !f.error && f.content);
            const failed = fetched.filter((f) => f.error || !f.content);
            if (successful.length > 0) {
              urlContext = buildUrlContext(fetched);
              console.log("[URL Extraction] Successfully fetched:", successful.map((f) => f.url));
            }
            if (failed.length > 0) {
              console.warn("[URL Extraction] Failed to fetch:", failed.map((f) => ({ url: f.url, error: f.error })));
              urlExtractionStatus = `

<url_extraction_status>
Attempted to fetch ${detectedUrls.length} URL(s). ${successful.length} succeeded, ${failed.length} failed.
${failed.map((f) => `- ${f.url}: ${f.error || "Empty content"}`).join("\n")}
</url_extraction_status>`;
            }
          }
        }
      } catch (err) {
        console.error("[URL Extraction] Error:", err);
        urlExtractionStatus = `

<url_extraction_status>
URL extraction encountered an error: ${err instanceof Error ? err.message : "Unknown error"}
</url_extraction_status>`;
      }
    }
  }
  let modeInstructions = "";
  if (options.mode === "agent") {
    modeInstructions = "\n\n" + (options.agentTemplate || DEFAULT_AGENT_TEMPLATE);
  }
  let webSearchContext = "";
  if (options.useWebSearch) {
    webSearchContext = `

<search_capability>
Web search is ENABLED for this conversation. You have access to current, real-time information from the web.
- For questions about recent events, news, or current information: search results will be provided automatically
- Cite sources when referencing specific facts from search results
- If search results are included in <web_search_results> tags, use that information to provide accurate, up-to-date answers
</search_capability>`;
  }
  let thinkingInstructions = "";
  if (options.useThinking) {
    thinkingInstructions = "\n\nTake time to think through complex questions step by step. Consider multiple angles before providing your final answer.";
  }
  let urlCapabilityInstructions = "";
  if (options.useWebSearch) {
    const hasUrlContent = urlContext.length > 0;
    const hasFailedUrls = urlExtractionStatus.length > 0;
    urlCapabilityInstructions = `

<CRITICAL_CAPABILITY>
**IMPORTANT: URL READING IS ENABLED**

You have a WORKING URL reader in this application. This overrides your default training.
- DO NOT say "I cannot access URLs" or "I cannot browse the web" - you CAN and DO have this capability
- When users share URLs, the content is AUTOMATICALLY FETCHED by the system
- Look for <referenced_urls> tags below - that contains the fetched page content
- ${hasUrlContent ? "URL CONTENT WAS SUCCESSFULLY FETCHED - see <referenced_urls> below" : hasFailedUrls ? "URL fetch was ATTEMPTED but FAILED - see <url_extraction_status> below for details" : "No URLs detected in the current message"}

If you see fetched content, use it to answer the user's question. Quote specific passages when relevant.
If the fetch failed, explain what happened using the error details provided.
</CRITICAL_CAPABILITY>`;
  }
  const filteredMessages = options.messages.filter((m) => m.content && m.content.trim().length > 0);
  return createStream({
    model: options.model,
    messages: [
      { role: "system", content: systemPrompt + modeInstructions + webSearchContext + thinkingInstructions + urlCapabilityInstructions + urlContext + urlExtractionStatus },
      ...filteredMessages
    ],
    anthropicKey: options.anthropicKey,
    openaiKey: options.openaiKey,
    maxTokens: options.useThinking ? 16e3 : 4096,
    // Allow more tokens for thinking mode
    useThinking: options.useThinking,
    useWebSearch: options.useWebSearch
  });
}
var init_chat = __esm({
  "src/ai/chat.ts"() {
    "use strict";
    init_provider();
    init_builders();
    init_url_extractor();
    init_prompts();
  }
});

// src/data/posts.ts
function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}
async function generateUniqueSlug(prisma, baseSlug, excludeId) {
  let slug = baseSlug;
  let counter = 1;
  while (true) {
    const existing = await prisma.post.findFirst({
      where: {
        slug,
        ...excludeId ? { NOT: { id: excludeId } } : {}
      }
    });
    if (!existing) return slug;
    counter++;
    slug = `${baseSlug}-${counter}`;
  }
}
function createPostsData(prisma, hooks) {
  return {
    async count(where) {
      return prisma.post.count({ where });
    },
    async findPublished() {
      return prisma.post.findMany({
        where: { status: "published" },
        orderBy: { publishedAt: "desc" }
      });
    },
    async findBySlug(slug) {
      return prisma.post.findUnique({
        where: { slug },
        include: { tags: { include: { tag: true } } }
      });
    },
    async findById(id) {
      return prisma.post.findUnique({
        where: { id },
        include: { tags: { include: { tag: true } } }
      });
    },
    async findDrafts() {
      return prisma.post.findMany({
        where: { status: "draft" },
        orderBy: { updatedAt: "desc" }
      });
    },
    async findAll(options) {
      return prisma.post.findMany({
        where: options?.status ? { status: options.status } : void 0,
        orderBy: options?.orderBy || { updatedAt: "desc" },
        include: {
          tags: { include: { tag: true } },
          ...options?.includeRevisionCount ? { _count: { select: { revisions: true } } } : {}
        },
        skip: options?.skip,
        take: options?.take
      });
    },
    async create(data) {
      const { tagIds, ...postData } = data;
      const slug = postData.slug ? await generateUniqueSlug(prisma, postData.slug) : await generateUniqueSlug(prisma, slugify(postData.title));
      const post = await prisma.post.create({
        data: {
          ...postData,
          slug,
          markdown: postData.markdown || "",
          status: postData.status || "draft"
        }
      });
      if (tagIds?.length) {
        await prisma.postTag.createMany({
          data: tagIds.map((tagId) => ({ postId: post.id, tagId }))
        });
      }
      const result = await prisma.post.findUnique({
        where: { id: post.id },
        include: { tags: { include: { tag: true } } }
      });
      if (hooks?.afterSave) {
        await hooks.afterSave(result);
      }
      return result;
    },
    async update(id, data) {
      const {
        tagIds,
        tags,
        revisions,
        topic,
        topicId,
        // Handle separately as relation
        id: _id,
        // Don't update the ID
        createdAt: _createdAt,
        // Don't update createdAt
        wordCount: _wordCount,
        // Computed field, don't save
        ...postData
      } = data;
      if (postData.status === "published") {
        const existing = await prisma.post.findUnique({ where: { id } });
        if (existing?.status !== "published") {
          postData.publishedAt = /* @__PURE__ */ new Date();
          if (hooks?.beforePublish) {
            await hooks.beforePublish(existing);
          }
        }
      }
      if (postData.slug) {
        postData.slug = await generateUniqueSlug(prisma, postData.slug, id);
      }
      const updatePayload = { ...postData };
      if (topicId !== void 0) {
        updatePayload.topic = topicId ? { connect: { id: topicId } } : { disconnect: true };
      }
      const post = await prisma.post.update({
        where: { id },
        data: updatePayload
      });
      if (tagIds !== void 0) {
        await prisma.postTag.deleteMany({ where: { postId: id } });
        if (tagIds.length) {
          await prisma.postTag.createMany({
            data: tagIds.map((tagId) => ({ postId: id, tagId }))
          });
        }
      }
      const result = await prisma.post.findUnique({
        where: { id },
        include: { tags: { include: { tag: true } } }
      });
      if (hooks?.afterSave) {
        await hooks.afterSave(result);
      }
      return result;
    },
    async delete(id) {
      return prisma.post.update({
        where: { id },
        data: { status: "deleted" }
      });
    },
    async getPreviewUrl(id, basePath = "/e") {
      const token = crypto.randomUUID();
      const expiry = new Date(Date.now() + 24 * 60 * 60 * 1e3);
      const post = await prisma.post.update({
        where: { id },
        data: { previewToken: token, previewExpiry: expiry }
      });
      return `${basePath}/${post.slug}?preview=${token}`;
    },
    async findByPreviewToken(token) {
      const post = await prisma.post.findFirst({
        where: {
          previewToken: token,
          previewExpiry: { gt: /* @__PURE__ */ new Date() }
        }
      });
      return post;
    }
  };
}

// src/data/comments.ts
function createCommentsData(prisma, config) {
  const mode = config?.mode || "authenticated";
  return {
    async count() {
      if (mode === "disabled") return 0;
      return prisma.comment.count();
    },
    // Public blog comments (original simple system)
    async findByPost(postId) {
      if (mode === "disabled") return [];
      return prisma.comment.findMany({
        where: { postId, approved: true },
        orderBy: { createdAt: "desc" }
      });
    },
    async findAll(options) {
      if (mode === "disabled") return { data: [], total: 0, page: 1, totalPages: 1 };
      const page = options?.page || 1;
      const limit = options?.limit || 25;
      const skip = (page - 1) * limit;
      const where = {
        ...options?.postId ? { postId: options.postId } : {},
        ...options?.approved !== void 0 ? { approved: options.approved } : {}
      };
      const [comments, total] = await Promise.all([
        prisma.comment.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip,
          take: limit,
          include: {
            post: { select: { id: true, title: true, slug: true } },
            user: { select: { id: true, name: true, email: true } }
          }
        }),
        prisma.comment.count({ where })
      ]);
      return {
        data: comments,
        total,
        page,
        totalPages: Math.ceil(total / limit)
      };
    },
    async create(data) {
      if (mode === "disabled") {
        throw new Error("Comments are disabled");
      }
      return prisma.comment.create({
        data: {
          ...data,
          approved: mode === "authenticated"
        }
      });
    },
    async approve(id) {
      return prisma.comment.update({
        where: { id },
        data: { approved: true }
      });
    },
    async delete(id) {
      return prisma.comment.delete({ where: { id } });
    },
    getMode() {
      return mode;
    },
    // ========================================
    // Editor comments (with quotedText, replies, resolve)
    // ========================================
    /**
     * Find all editor comments for a post with nested replies.
     */
    async findEditorComments(postId, userId) {
      if (mode === "disabled") return [];
      const allComments = await prisma.comment.findMany({
        where: {
          postId,
          deletedAt: null
        },
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: { id: true, name: true, email: true }
          }
        }
      });
      const topLevel = allComments.filter((c) => !c.parentId);
      const replies = allComments.filter((c) => c.parentId);
      return topLevel.map((comment) => ({
        ...comment,
        replies: replies.filter((r) => r.parentId === comment.id)
      }));
    },
    /**
     * Create an editor comment (with quotedText and optional parentId for replies).
     */
    async createEditorComment(postId, userId, data) {
      if (mode === "disabled") {
        throw new Error("Comments are disabled");
      }
      const comment = await prisma.comment.create({
        data: {
          postId,
          userId,
          quotedText: data.quotedText || "",
          content: data.content,
          parentId: data.parentId || null,
          resolved: false
        },
        include: {
          user: {
            select: { id: true, name: true, email: true }
          }
        }
      });
      return { ...comment, replies: [] };
    },
    /**
     * Update a comment's content.
     */
    async updateEditorComment(commentId, content, userId) {
      const comment = await prisma.comment.update({
        where: { id: commentId },
        data: { content },
        include: {
          user: {
            select: { id: true, name: true, email: true }
          }
        }
      });
      return comment;
    },
    /**
     * Soft delete a comment.
     */
    async deleteEditorComment(commentId) {
      const hasDeletedAt = await prisma.comment.findFirst({
        where: { id: commentId },
        select: { id: true }
      });
      if (hasDeletedAt) {
        try {
          await prisma.comment.update({
            where: { id: commentId },
            data: { deletedAt: /* @__PURE__ */ new Date() }
          });
        } catch {
          await prisma.comment.delete({ where: { id: commentId } });
        }
      }
    },
    /**
     * Toggle resolved status.
     */
    async toggleResolve(commentId) {
      const current = await prisma.comment.findUnique({
        where: { id: commentId },
        select: { resolved: true }
      });
      const comment = await prisma.comment.update({
        where: { id: commentId },
        data: { resolved: !current?.resolved },
        include: {
          user: {
            select: { id: true, name: true, email: true }
          }
        }
      });
      return comment;
    },
    /**
     * Resolve all open comments for a post.
     */
    async resolveAll(postId) {
      const result = await prisma.comment.updateMany({
        where: {
          postId,
          resolved: false,
          parentId: null
          // Only top-level comments
        },
        data: { resolved: true }
      });
      return { resolved: result.count };
    }
  };
}

// src/data/factory.ts
function createCrudData(prisma, options) {
  const delegate = prisma[options.model];
  return {
    async findAll(opts) {
      return delegate.findMany({
        orderBy: options.defaultOrderBy,
        include: options.defaultInclude,
        ...opts
      });
    },
    async findById(id) {
      return delegate.findUnique({
        where: { id },
        include: options.defaultInclude
      });
    },
    async count(where) {
      return delegate.count({ where });
    },
    async create(data) {
      return delegate.create({ data });
    },
    async update(id, data) {
      return delegate.update({
        where: { id },
        data
      });
    },
    async delete(id) {
      return delegate.delete({ where: { id } });
    }
  };
}

// src/data/tags.ts
function createTagsData(prisma) {
  const base = createCrudData(prisma, {
    model: "tag",
    defaultOrderBy: { name: "asc" },
    defaultInclude: { _count: { select: { posts: true } } }
  });
  return {
    ...base,
    // Alias for backward compatibility
    async findAllWithCounts() {
      return base.findAll();
    },
    async findByName(name) {
      return prisma.tag.findUnique({ where: { name } });
    },
    // Override create to accept string directly
    async create(name) {
      return prisma.tag.create({ data: { name } });
    },
    // Override update to accept name directly
    async update(id, name) {
      return prisma.tag.update({ where: { id }, data: { name } });
    },
    async addToPost(postId, tagId) {
      return prisma.postTag.create({
        data: { postId, tagId }
      });
    },
    async removeFromPost(postId, tagId) {
      return prisma.postTag.deleteMany({
        where: { postId, tagId }
      });
    },
    async getPostTags(postId) {
      const postTags = await prisma.postTag.findMany({
        where: { postId },
        include: { tag: true }
      });
      return postTags.map((pt) => pt.tag);
    }
  };
}

// src/data/revisions.ts
function createRevisionsData(prisma) {
  return {
    async findAll(options) {
      return prisma.revision.findMany({
        where: options?.postId ? { postId: options.postId } : {},
        orderBy: { createdAt: "desc" },
        skip: options?.skip,
        take: options?.take,
        include: {
          post: { select: { id: true, title: true, slug: true, markdown: true } }
        }
      });
    },
    async count(where) {
      return prisma.revision.count({ where });
    },
    async findByPost(postId) {
      return prisma.revision.findMany({
        where: { postId },
        orderBy: { createdAt: "desc" }
      });
    },
    async findById(id) {
      return prisma.revision.findUnique({
        where: { id },
        include: {
          post: { select: { id: true, title: true, slug: true, markdown: true } }
        }
      });
    },
    async create(postId, data) {
      return prisma.revision.create({
        data: { postId, ...data }
      });
    },
    async restore(revisionId) {
      const revision = await prisma.revision.findUnique({ where: { id: revisionId } });
      if (!revision) throw new Error("Revision not found");
      return prisma.post.update({
        where: { id: revision.postId },
        data: {
          title: revision.title,
          subtitle: revision.subtitle,
          markdown: revision.markdown
        }
      });
    },
    async compare(revisionId1, revisionId2) {
      const [rev1, rev2] = await Promise.all([
        prisma.revision.findUnique({ where: { id: revisionId1 } }),
        prisma.revision.findUnique({ where: { id: revisionId2 } })
      ]);
      if (!rev1 || !rev2) throw new Error("Revision not found");
      return {
        older: rev1.createdAt < rev2.createdAt ? rev1 : rev2,
        newer: rev1.createdAt < rev2.createdAt ? rev2 : rev1
      };
    },
    async pruneOldest(postId, keepCount) {
      const revisions = await prisma.revision.findMany({
        where: { postId },
        orderBy: { createdAt: "desc" },
        skip: keepCount,
        select: { id: true }
      });
      if (revisions.length > 0) {
        await prisma.revision.deleteMany({
          where: { id: { in: revisions.map((r) => r.id) } }
        });
      }
      return revisions.length;
    },
    async delete(id) {
      return prisma.revision.delete({ where: { id } });
    }
  };
}

// src/data/ai-settings.ts
function createAISettingsData(prisma) {
  const DEFAULT_ID = "default";
  return {
    async get() {
      let settings = await prisma.aISettings.findUnique({ where: { id: DEFAULT_ID } });
      if (!settings) {
        settings = await prisma.aISettings.create({
          data: { id: DEFAULT_ID }
        });
      }
      return settings;
    },
    async update(data) {
      return prisma.aISettings.upsert({
        where: { id: DEFAULT_ID },
        create: { id: DEFAULT_ID, ...data },
        update: data
      });
    }
  };
}

// src/data/topics.ts
function createTopicsData(prisma) {
  return {
    async findAll() {
      return prisma.topicSubscription.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          _count: { select: { posts: true, newsItems: true } }
        }
      });
    },
    async count() {
      return prisma.topicSubscription.count();
    },
    async findActive() {
      return prisma.topicSubscription.findMany({
        where: { isActive: true },
        orderBy: { createdAt: "desc" }
      });
    },
    async findById(id) {
      return prisma.topicSubscription.findUnique({
        where: { id },
        include: { posts: true, newsItems: true }
      });
    },
    async create(data) {
      return prisma.topicSubscription.create({
        data: {
          name: data.name,
          keywords: JSON.stringify(data.keywords || []),
          rssFeeds: JSON.stringify(data.rssFeeds || []),
          isActive: data.isActive ?? true,
          useKeywordFilter: data.useKeywordFilter ?? true,
          frequency: data.frequency || "daily",
          maxPerPeriod: data.maxPerPeriod || 3,
          essayFocus: data.essayFocus
        }
      });
    },
    async update(id, data) {
      const updateData = { ...data };
      if (data.keywords) {
        updateData.keywords = JSON.stringify(data.keywords);
      }
      if (data.rssFeeds) {
        updateData.rssFeeds = JSON.stringify(data.rssFeeds);
      }
      return prisma.topicSubscription.update({
        where: { id },
        data: updateData
      });
    },
    async delete(id) {
      return prisma.topicSubscription.delete({ where: { id } });
    },
    async markRun(id) {
      return prisma.topicSubscription.update({
        where: { id },
        data: { lastRunAt: /* @__PURE__ */ new Date() }
      });
    }
  };
}

// src/data/news-items.ts
function createNewsItemsData(prisma) {
  return {
    async findPending() {
      return prisma.newsItem.findMany({
        where: { status: "pending" },
        orderBy: { createdAt: "desc" },
        include: { topic: true }
      });
    },
    async findByTopic(topicId) {
      return prisma.newsItem.findMany({
        where: { topicId },
        orderBy: { createdAt: "desc" }
      });
    },
    async findById(id) {
      return prisma.newsItem.findUnique({
        where: { id },
        include: { topic: true, post: true }
      });
    },
    async create(data) {
      const existing = await prisma.newsItem.findUnique({
        where: { url: data.url }
      });
      if (existing) {
        return existing;
      }
      return prisma.newsItem.create({ data });
    },
    async skip(id) {
      return prisma.newsItem.update({
        where: { id },
        data: { status: "skipped" }
      });
    },
    async markGenerated(id, postId) {
      return prisma.newsItem.update({
        where: { id },
        data: { status: "generated", postId }
      });
    },
    async delete(id) {
      return prisma.newsItem.delete({ where: { id } });
    },
    // This would be called by the auto-draft system
    async generateDraft(id, createPost) {
      const newsItem = await prisma.newsItem.findUnique({
        where: { id },
        include: { topic: true }
      });
      if (!newsItem) throw new Error("News item not found");
      const post = await createPost({
        title: newsItem.title,
        markdown: newsItem.summary || "",
        status: "suggested",
        sourceUrl: newsItem.url,
        topicId: newsItem.topicId
      });
      await prisma.newsItem.update({
        where: { id },
        data: { status: "generated", postId: post.id }
      });
      return post;
    }
  };
}

// src/data/users.ts
function createUsersData(prisma) {
  const base = createCrudData(prisma, {
    model: "user",
    defaultOrderBy: { createdAt: "desc" }
  });
  return {
    ...base,
    async findByEmail(email) {
      return prisma.user.findUnique({ where: { email } });
    },
    // Override create with proper defaults
    async create(data) {
      return prisma.user.create({
        data: {
          email: data.email,
          name: data.name,
          role: data.role || "writer"
        }
      });
    },
    // Override update with proper typing
    async update(id, data) {
      return prisma.user.update({
        where: { id },
        data
      });
    }
  };
}

// src/api/posts.ts
function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}
function countWords(text) {
  if (!text) return 0;
  return text.split(/\s+/).filter(Boolean).length;
}
function withWordCount(post) {
  return { ...post, wordCount: countWords(post.markdown) };
}
async function handlePostsAPI(req, cms, session, path, onMutate) {
  const method = req.method;
  const segments = path.split("/").filter(Boolean);
  const postId = segments[1];
  if (postId && segments[2] === "comments") {
    return handlePostCommentsAPI(req, cms, session, postId, segments.slice(3), onMutate);
  }
  if (method === "GET" && !postId) {
    const url = new URL(req.url);
    const status = url.searchParams.get("status");
    const all = url.searchParams.get("all") === "1";
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const limit = parseInt(url.searchParams.get("limit") || "0", 10);
    const includeRevisionCount = url.searchParams.get("includeRevisionCount") === "1";
    const skip = limit > 0 ? (page - 1) * limit : void 0;
    const take = limit > 0 ? limit : void 0;
    const total = await cms.posts.count(all ? void 0 : { status: status || void 0 });
    const posts = await cms.posts.findAll({
      status: all ? void 0 : status || void 0,
      skip,
      take,
      includeRevisionCount
    });
    return jsonResponse({ data: posts.map(withWordCount), total });
  }
  if (method === "GET" && postId) {
    const post = await cms.posts.findById(postId);
    if (!post) return jsonResponse({ error: "Post not found" }, 404);
    return jsonResponse({ data: withWordCount(post) });
  }
  if (method === "POST") {
    const body = await req.json();
    const post = await cms.posts.create(body);
    if (onMutate) await onMutate("post", post);
    return jsonResponse({ data: post }, 201);
  }
  if (method === "PATCH" && postId) {
    const body = await req.json();
    if (body.status === "published" && !cms.config.auth.canPublish(session)) {
      return jsonResponse({ error: "Not authorized to publish" }, 403);
    }
    const contentChanging = body.title !== void 0 || body.subtitle !== void 0 || body.markdown !== void 0;
    if (contentChanging) {
      const existingPost = await cms.posts.findById(postId);
      if (existingPost && existingPost.markdown) {
        const recentRevisions = await cms.revisions.findByPost(postId);
        const lastRevision = recentRevisions[0];
        const contentIsDifferent = !lastRevision || lastRevision.markdown !== existingPost.markdown || lastRevision.title !== existingPost.title || lastRevision.subtitle !== existingPost.subtitle;
        if (contentIsDifferent) {
          await cms.revisions.create(postId, {
            title: existingPost.title,
            subtitle: existingPost.subtitle,
            markdown: existingPost.markdown
          });
          await cms.revisions.pruneOldest(postId, 50);
        }
      }
    }
    const post = await cms.posts.update(postId, body);
    if (onMutate) await onMutate("post", post);
    return jsonResponse({ data: post });
  }
  if (method === "DELETE" && postId) {
    if (!cms.config.auth.isAdmin(session)) {
      return jsonResponse({ error: "Admin required" }, 403);
    }
    await cms.posts.delete(postId);
    if (onMutate) await onMutate("post", { id: postId });
    return jsonResponse({ data: { success: true } });
  }
  return jsonResponse({ error: "Method not allowed" }, 405);
}
async function handlePostCommentsAPI(req, cms, session, postId, segments, onMutate) {
  const method = req.method;
  const commentId = segments[0];
  const action = segments[1];
  const userId = session?.user?.id;
  if (!userId) {
    return jsonResponse({ error: "Authentication required" }, 401);
  }
  if (method === "GET" && !commentId) {
    const comments = await cms.comments.findEditorComments(postId, userId);
    return jsonResponse({ data: comments });
  }
  if (method === "POST" && !commentId) {
    const body = await req.json();
    const comment = await cms.comments.createEditorComment(postId, userId, {
      postId,
      quotedText: body.quotedText || "",
      content: body.content,
      parentId: body.parentId
    });
    if (onMutate) await onMutate("comment", comment);
    return jsonResponse({ data: comment }, 201);
  }
  if (method === "POST" && commentId === "resolve-all") {
    const result = await cms.comments.resolveAll(postId);
    return jsonResponse({ data: result });
  }
  if (method === "PATCH" && commentId && !action) {
    const body = await req.json();
    const comment = await cms.comments.updateEditorComment(commentId, body.content, userId);
    return jsonResponse({ data: comment });
  }
  if (method === "POST" && commentId && action === "resolve") {
    const comment = await cms.comments.toggleResolve(commentId);
    return jsonResponse({ data: comment });
  }
  if (method === "DELETE" && commentId) {
    await cms.comments.deleteEditorComment(commentId);
    return jsonResponse({ data: { success: true } });
  }
  return jsonResponse({ error: "Method not allowed" }, 405);
}

// src/api/utils.ts
function jsonResponse2(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}
function parsePath(path) {
  const segments = path.split("/").filter(Boolean);
  return {
    segments,
    resource: segments[0] || "",
    id: segments[1],
    subPath: segments.slice(2).join("/")
  };
}
function requireAdmin(cms, session) {
  if (!cms.config.auth.isAdmin(session)) {
    return jsonResponse2({ error: "Admin required" }, 403);
  }
  return null;
}
function requireAuth(session) {
  if (!session) {
    return jsonResponse2({ error: "Authentication required" }, 401);
  }
  return null;
}

// src/api/comments.ts
async function handleCommentsAPI(req, cms, session, path, onMutate) {
  const method = req.method;
  const { id: commentId, subPath } = parsePath(path);
  if (method === "GET") {
    const url = new URL(req.url);
    const postId = url.searchParams.get("postId");
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "25");
    const result = await cms.comments.findAll({
      postId: postId || void 0,
      page,
      limit
    });
    return jsonResponse2(result);
  }
  if (method === "POST") {
    const body = await req.json();
    const comment = await cms.comments.create({
      ...body,
      authorId: session?.user?.id
    });
    if (onMutate) await onMutate("comment", comment);
    return jsonResponse2({ data: comment }, 201);
  }
  if (method === "PATCH" && commentId && subPath === "approve") {
    const authError = requireAdmin(cms, session);
    if (authError) return authError;
    const comment = await cms.comments.approve(commentId);
    return jsonResponse2({ data: comment });
  }
  if (method === "DELETE" && commentId) {
    const authError = requireAdmin(cms, session);
    if (authError) return authError;
    await cms.comments.delete(commentId);
    return jsonResponse2({ data: { success: true } });
  }
  return jsonResponse2({ error: "Method not allowed" }, 405);
}

// src/api/tags.ts
async function handleTagsAPI(req, cms, session, path, onMutate) {
  const method = req.method;
  const { id: tagId } = parsePath(path);
  if (method === "GET" && !tagId) {
    const tags = await cms.tags.findAll();
    return jsonResponse2({ data: tags });
  }
  if (method === "POST") {
    const authError = requireAdmin(cms, session);
    if (authError) return authError;
    const body = await req.json();
    const tag = await cms.tags.create(body.name);
    if (onMutate) await onMutate("tag", tag);
    return jsonResponse2({ data: tag }, 201);
  }
  if (method === "PATCH" && tagId) {
    const authError = requireAdmin(cms, session);
    if (authError) return authError;
    const body = await req.json();
    const tag = await cms.tags.update(tagId, body.name);
    return jsonResponse2({ data: tag });
  }
  if (method === "DELETE" && tagId) {
    const authError = requireAdmin(cms, session);
    if (authError) return authError;
    await cms.tags.delete(tagId);
    return jsonResponse2({ data: { success: true } });
  }
  return jsonResponse2({ error: "Method not allowed" }, 405);
}

// src/api/ai.ts
init_prompts();
init_models();
async function handleAIAPI(req, cms, session, path) {
  const method = req.method;
  const authError = requireAuth(session);
  if (authError) return authError;
  if (method === "GET" && path === "/ai/settings") {
    const settings = await cms.aiSettings.get();
    const hasAnthropicEnvKey = !!(cms.config.ai?.anthropicKey || process.env.ANTHROPIC_API_KEY);
    const hasOpenaiEnvKey = !!(cms.config.ai?.openaiKey || process.env.OPENAI_API_KEY);
    return jsonResponse2({
      data: {
        ...settings,
        // Don't expose actual env keys, just indicate they exist
        hasAnthropicEnvKey,
        hasOpenaiEnvKey,
        defaultGenerateTemplate: DEFAULT_GENERATE_TEMPLATE,
        defaultChatTemplate: DEFAULT_CHAT_TEMPLATE,
        defaultRewriteTemplate: DEFAULT_REWRITE_TEMPLATE,
        defaultAutoDraftTemplate: DEFAULT_AUTO_DRAFT_TEMPLATE,
        defaultPlanTemplate: DEFAULT_PLAN_TEMPLATE,
        defaultExpandPlanTemplate: DEFAULT_EXPAND_PLAN_TEMPLATE,
        defaultAgentTemplate: DEFAULT_AGENT_TEMPLATE,
        defaultPlanRules: DEFAULT_PLAN_RULES,
        availableModels: getModelOptions()
      }
    });
  }
  if (method === "PATCH" && path === "/ai/settings") {
    const adminError = requireAdmin(cms, session);
    if (adminError) return adminError;
    const body = await req.json();
    const settings = await cms.aiSettings.update(body);
    return jsonResponse2({ data: settings });
  }
  if (method === "POST" && path === "/ai/generate") {
    const body = await req.json();
    const { prompt, model, wordCount: wordCount2, mode, plan, styleExamples: clientStyleExamples, useWebSearch, useThinking } = body;
    const settings = await cms.aiSettings.get();
    try {
      let stream;
      const anthropicKey = cms.config.ai?.anthropicKey || settings.anthropicKey;
      const openaiKey = cms.config.ai?.openaiKey || settings.openaiKey;
      if (mode === "expand_plan" && plan) {
        let styleExamples = clientStyleExamples || "";
        if (!styleExamples) {
          styleExamples = await fetchStyleExamples(cms);
        }
        const { expandPlanStream: expandPlanStream2 } = await Promise.resolve().then(() => (init_generate(), generate_exports));
        stream = await expandPlanStream2({
          plan,
          model: model || settings.defaultModel,
          rules: settings.rules,
          template: settings.expandPlanTemplate,
          styleExamples,
          anthropicKey,
          openaiKey
        });
      } else {
        let styleExamples = clientStyleExamples || "";
        if (!styleExamples) {
          styleExamples = await fetchStyleExamples(cms);
        }
        const { generateStream: generateStream2 } = await Promise.resolve().then(() => (init_generate(), generate_exports));
        stream = await generateStream2({
          prompt,
          model: model || settings.defaultModel,
          wordCount: wordCount2,
          rules: settings.rules,
          template: settings.generateTemplate,
          styleExamples,
          anthropicKey,
          openaiKey,
          useWebSearch,
          useThinking
        });
      }
      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive"
        }
      });
    } catch (error) {
      console.error("[AI Generate Error]", error);
      return jsonResponse2({
        error: error instanceof Error ? error.message : "Generation failed"
      }, 500);
    }
  }
  if (method === "POST" && path === "/ai/chat") {
    const body = await req.json();
    const { messages, model, essayContext, mode, useWebSearch, useThinking } = body;
    const settings = await cms.aiSettings.get();
    const anthropicKey = cms.config.ai?.anthropicKey || settings.anthropicKey;
    const openaiKey = cms.config.ai?.openaiKey || settings.openaiKey;
    if (mode === "search") {
      try {
        const { generate: generate2 } = await Promise.resolve().then(() => (init_provider(), provider_exports));
        const lastUserMessage = [...messages].reverse().find((m) => m.role === "user");
        if (!lastUserMessage) {
          return jsonResponse2({ error: "No user message found" }, 400);
        }
        const result = await generate2(
          model || settings.defaultModel,
          DEFAULT_SEARCH_ONLY_PROMPT,
          lastUserMessage.content,
          {
            anthropicKey,
            openaiKey,
            maxTokens: 4096,
            useWebSearch: true
            // Always use web search in search mode
          }
        );
        return jsonResponse2({
          content: result.text,
          usage: {
            inputTokens: result.inputTokens,
            outputTokens: result.outputTokens
          }
        });
      } catch (error) {
        console.error("[AI Search Error]", error);
        return jsonResponse2({
          error: error instanceof Error ? error.message : "Search failed"
        }, 500);
      }
    }
    let styleExamples = "";
    try {
      const publishedPosts = await cms.posts.findPublished();
      const MAX_STYLE_EXAMPLES = 5;
      const MAX_WORDS_PER_EXAMPLE = 500;
      if (publishedPosts.length > 0) {
        const examples = publishedPosts.slice(0, MAX_STYLE_EXAMPLES).map((post) => {
          const words = post.markdown.split(/\s+/);
          const truncatedContent = words.length > MAX_WORDS_PER_EXAMPLE ? words.slice(0, MAX_WORDS_PER_EXAMPLE).join(" ") + "..." : post.markdown;
          return `## ${post.title}
${post.subtitle ? `*${post.subtitle}*
` : ""}
${truncatedContent}`;
        }).join("\n\n---\n\n");
        styleExamples = `<published_essays>
The following are examples of the author's published work. Use these to match their voice, tone, and writing style:

${examples}
</published_essays>`;
      }
    } catch (err) {
      console.error("[AI Chat] Failed to fetch published essays:", err);
    }
    const { chatStream: chatStream2 } = await Promise.resolve().then(() => (init_chat(), chat_exports));
    try {
      const stream = await chatStream2({
        messages,
        model: model || settings.defaultModel,
        essayContext,
        mode,
        chatRules: settings.chatRules,
        rules: settings.rules,
        template: settings.chatTemplate,
        // Plan mode specific settings
        planTemplate: settings.planTemplate,
        planRules: settings.planRules,
        // Agent mode specific settings
        agentTemplate: settings.agentTemplate,
        styleExamples,
        anthropicKey,
        openaiKey,
        useWebSearch,
        useThinking
      });
      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive"
        }
      });
    } catch (error) {
      console.error("[AI Chat Error]", error);
      return jsonResponse2({
        error: error instanceof Error ? error.message : "Chat failed"
      }, 500);
    }
  }
  if (method === "POST" && path === "/ai/rewrite") {
    const body = await req.json();
    const { text } = body;
    if (!text || typeof text !== "string") {
      return jsonResponse2({ error: "Text is required" }, 400);
    }
    const settings = await cms.aiSettings.get();
    const anthropicKey = cms.config.ai?.anthropicKey || settings.anthropicKey;
    const openaiKey = cms.config.ai?.openaiKey || settings.openaiKey;
    let styleExamples = "";
    try {
      const publishedPosts = await cms.posts.findPublished();
      const MAX_STYLE_EXAMPLES = 3;
      const MAX_WORDS_PER_EXAMPLE = 300;
      if (publishedPosts.length > 0) {
        const examples = publishedPosts.slice(0, MAX_STYLE_EXAMPLES).map((post) => {
          const words = post.markdown.split(/\s+/);
          const truncatedContent = words.length > MAX_WORDS_PER_EXAMPLE ? words.slice(0, MAX_WORDS_PER_EXAMPLE).join(" ") + "..." : post.markdown;
          return `## ${post.title}
${truncatedContent}`;
        }).join("\n\n---\n\n");
        styleExamples = examples;
      }
    } catch (err) {
      console.error("[AI Rewrite] Failed to fetch published essays:", err);
    }
    const { buildRewritePrompt: buildRewritePrompt3 } = await Promise.resolve().then(() => (init_builders(), builders_exports));
    const { createStream: createStream2 } = await Promise.resolve().then(() => (init_provider(), provider_exports));
    try {
      const systemPrompt = buildRewritePrompt3({
        rewriteRules: settings.rewriteRules,
        rules: settings.rules,
        template: settings.rewriteTemplate,
        styleExamples
      });
      const stream = await createStream2({
        model: settings.defaultModel,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Rewrite the following text, preserving meaning but improving clarity and style:

${text}` }
        ],
        anthropicKey,
        openaiKey,
        maxTokens: 2048
      });
      const reader = stream.getReader();
      const decoder = new TextDecoder();
      let rewrittenText = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") continue;
            try {
              const parsed = JSON.parse(data);
              if (parsed.text) {
                rewrittenText += parsed.text;
              }
            } catch {
            }
          }
        }
      }
      return jsonResponse2({ text: rewrittenText.trim() });
    } catch (error) {
      console.error("[AI Rewrite Error]", error);
      return jsonResponse2({
        error: error instanceof Error ? error.message : "Rewrite failed"
      }, 500);
    }
  }
  return jsonResponse2({ error: "Not found" }, 404);
}
async function fetchStyleExamples(cms) {
  try {
    const publishedPosts = await cms.posts.findPublished();
    const MAX_STYLE_EXAMPLES = 5;
    const MAX_WORDS_PER_EXAMPLE = 500;
    if (publishedPosts.length > 0) {
      const examples = publishedPosts.slice(0, MAX_STYLE_EXAMPLES).map((post) => {
        const words = post.markdown.split(/\s+/);
        const truncatedContent = words.length > MAX_WORDS_PER_EXAMPLE ? words.slice(0, MAX_WORDS_PER_EXAMPLE).join(" ") + "..." : post.markdown;
        return `## ${post.title}
${post.subtitle ? `*${post.subtitle}*
` : ""}
${truncatedContent}`;
      }).join("\n\n---\n\n");
      return `The following are examples of the author's published work. Use these to match their voice, tone, and writing style:

${examples}`;
    }
  } catch (err) {
    console.error("[AI] Failed to fetch published essays:", err);
  }
  return "";
}

// src/api/upload.ts
async function handleUploadAPI(req, cms, session) {
  if (req.method !== "POST") {
    return jsonResponse2({ error: "Method not allowed" }, 405);
  }
  const authError = requireAuth(session);
  if (authError) return authError;
  if (!cms.config.storage?.upload) {
    return jsonResponse2({
      error: "Image uploads not configured. Add storage.upload to your autoblogger config."
    }, 400);
  }
  try {
    const formData = await req.formData();
    const file = formData.get("image") || formData.get("file");
    if (!file) {
      return jsonResponse2({ error: "No file provided" }, 400);
    }
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return jsonResponse2({
        error: "Invalid file type. Allowed: JPEG, PNG, GIF, WebP"
      }, 400);
    }
    const maxSize = 4 * 1024 * 1024;
    if (file.size > maxSize) {
      return jsonResponse2({ error: "File too large. Maximum size: 4MB" }, 400);
    }
    const result = await cms.config.storage.upload(file);
    return jsonResponse2({ data: result });
  } catch (error) {
    return jsonResponse2({
      error: error instanceof Error ? error.message : "Upload failed"
    }, 500);
  }
}

// src/api/topics.ts
async function handleTopicsAPI(req, cms, session, path, onMutate) {
  const method = req.method;
  const { id: topicId, subPath } = parsePath(path);
  const authError = requireAdmin(cms, session);
  if (authError) return authError;
  if (method === "GET" && !topicId) {
    const topics = await cms.topics.findAll();
    return jsonResponse2({ data: topics });
  }
  if (method === "GET" && topicId) {
    const topic = await cms.topics.findById(topicId);
    if (!topic) return jsonResponse2({ error: "Topic not found" }, 404);
    return jsonResponse2({ data: topic });
  }
  if (method === "POST" && !topicId) {
    const body = await req.json();
    const topic = await cms.topics.create(body);
    if (onMutate) await onMutate("topic", topic);
    return jsonResponse2({ data: topic }, 201);
  }
  if (method === "POST" && topicId && subPath === "generate") {
    await cms.topics.markRun(topicId);
    return jsonResponse2({
      data: {
        success: true,
        message: "Generation triggered. Implement generation logic in your application."
      }
    });
  }
  if (method === "PATCH" && topicId) {
    const body = await req.json();
    const topic = await cms.topics.update(topicId, body);
    return jsonResponse2({ data: topic });
  }
  if (method === "DELETE" && topicId) {
    await cms.topics.delete(topicId);
    return jsonResponse2({ data: { success: true } });
  }
  return jsonResponse2({ error: "Method not allowed" }, 405);
}

// src/api/users.ts
function normalizeEmail(email) {
  return email.toLowerCase().trim();
}
async function handleUsersAPI(req, cms, session, path) {
  const method = req.method;
  const { id: userId } = parsePath(path);
  const authError = requireAdmin(cms, session);
  if (authError) return authError;
  if (method === "GET" && !userId) {
    const users = await cms.users.findAll();
    return jsonResponse2({ data: users });
  }
  if (method === "GET" && userId) {
    const user = await cms.users.findById(userId);
    if (!user) return jsonResponse2({ error: "User not found" }, 404);
    return jsonResponse2({ data: user });
  }
  if (method === "POST") {
    const body = await req.json();
    if (!body.email) {
      return jsonResponse2({ error: "Email required" }, 400);
    }
    const email = normalizeEmail(body.email);
    const existing = await cms.users.findByEmail(email);
    if (existing) {
      return jsonResponse2({ error: "User with this email already exists" }, 400);
    }
    const user = await cms.users.create({
      ...body,
      email
      // Use normalized email
    });
    return jsonResponse2({ data: user }, 201);
  }
  if (method === "PATCH" && userId) {
    const body = await req.json();
    const user = await cms.users.update(userId, body);
    return jsonResponse2({ data: user });
  }
  if (method === "DELETE" && userId) {
    await cms.users.delete(userId);
    return jsonResponse2({ data: { success: true } });
  }
  return jsonResponse2({ error: "Method not allowed" }, 405);
}

// src/api/admin.ts
async function handleAdminAPI(req, cms, session, path) {
  const method = req.method;
  const authError = requireAdmin(cms, session);
  if (authError) return authError;
  if (method === "GET" && path === "/admin/counts") {
    const [users, posts, tags, topics] = await Promise.all([
      cms.users.count(),
      cms.posts.findAll().then((p) => p.length),
      cms.tags.findAll().then((t) => t.length),
      cms.topics.findAll().then((t) => t.length)
    ]);
    return jsonResponse2({
      data: { users, posts, tags, topics }
    });
  }
  return jsonResponse2({ error: "Not found" }, 404);
}

// src/api/settings.ts
async function handleSettingsAPI(req, cms, session, path) {
  const method = req.method;
  const prisma = cms.config.prisma;
  const authError = requireAuth(session);
  if (authError) return authError;
  if (method === "GET" && path === "/settings") {
    const integrationSettings = await prisma.integrationSettings.findUnique({
      where: { id: "default" }
    });
    return jsonResponse2({
      data: {
        autoDraftEnabled: integrationSettings?.autoDraftEnabled ?? false,
        postUrlPattern: integrationSettings?.postUrlPattern ?? "/e/{slug}"
      }
    });
  }
  if (method === "PATCH" && path === "/settings") {
    const adminError = requireAdmin(cms, session);
    if (adminError) return adminError;
    const body = await req.json();
    const updateData = {};
    if (typeof body.autoDraftEnabled === "boolean") {
      updateData.autoDraftEnabled = body.autoDraftEnabled;
    }
    if (typeof body.postUrlPattern === "string") {
      updateData.postUrlPattern = body.postUrlPattern;
    }
    if (Object.keys(updateData).length > 0) {
      await prisma.integrationSettings.upsert({
        where: { id: "default" },
        create: { id: "default", ...updateData },
        update: updateData
      });
    }
    const integrationSettings = await prisma.integrationSettings.findUnique({
      where: { id: "default" }
    });
    return jsonResponse2({
      data: {
        autoDraftEnabled: integrationSettings?.autoDraftEnabled ?? false,
        postUrlPattern: integrationSettings?.postUrlPattern ?? "/e/{slug}"
      }
    });
  }
  return jsonResponse2({ error: "Not found" }, 404);
}

// src/api/revisions.ts
async function handleRevisionsAPI(req, cms, session, path, onMutate) {
  const method = req.method;
  const url = new URL(req.url);
  const { id: revisionId, subPath } = parsePath(path);
  if (method === "GET" && !revisionId) {
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "25");
    const postId = url.searchParams.get("postId");
    const where = postId ? { postId } : {};
    const [revisions, total] = await Promise.all([
      cms.revisions.findAll({ ...where, skip: (page - 1) * limit, take: limit }),
      cms.revisions.count(where)
    ]);
    return jsonResponse2({
      data: revisions,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  }
  if (method === "GET" && revisionId) {
    const revision = await cms.revisions.findById(revisionId);
    if (!revision) return jsonResponse2({ error: "Revision not found" }, 404);
    return jsonResponse2({ data: revision });
  }
  if (method === "POST" && revisionId && subPath === "restore") {
    const authError = requireAdmin(cms, session);
    if (authError) return authError;
    const post = await cms.revisions.restore(revisionId);
    if (onMutate) await onMutate("post", post);
    return jsonResponse2({ data: post });
  }
  if (method === "DELETE" && revisionId) {
    const authError = requireAdmin(cms, session);
    if (authError) return authError;
    await cms.revisions.delete(revisionId);
    return jsonResponse2({ data: { success: true } });
  }
  return jsonResponse2({ error: "Method not allowed" }, 405);
}

// src/api/chat-history.ts
async function handleChatHistoryAPI(req, prisma, isAuthenticated) {
  if (!isAuthenticated) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" }
    });
  }
  const method = req.method;
  const hasChatMessage = !!prisma.chatMessage;
  try {
    if (method === "GET") {
      if (!hasChatMessage) {
        return new Response(JSON.stringify([]), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        });
      }
      const messages = await prisma.chatMessage.findMany({
        orderBy: { createdAt: "desc" },
        take: 50
      });
      return new Response(JSON.stringify(messages.reverse()), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }
    if (method === "POST") {
      if (!hasChatMessage) {
        return new Response(JSON.stringify({ id: "temp", role: "user", content: "" }), {
          status: 201,
          headers: { "Content-Type": "application/json" }
        });
      }
      const body = await req.json();
      if (!body.role || !body.content) {
        return new Response(JSON.stringify({ error: "Missing role or content" }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }
      const message = await prisma.chatMessage.create({
        data: {
          role: body.role,
          content: body.content
        }
      });
      return new Response(JSON.stringify(message), {
        status: 201,
        headers: { "Content-Type": "application/json" }
      });
    }
    if (method === "DELETE") {
      if (!hasChatMessage) {
        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        });
      }
      await prisma.chatMessage.deleteMany({});
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("[Chat History API Error]", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}

// src/api/index.ts
function extractPath(pathname, basePath) {
  const normalized = pathname.replace(/\/$/, "");
  const base = basePath.replace(/\/$/, "");
  if (normalized === base) return "/";
  if (normalized.startsWith(base + "/")) {
    return normalized.slice(base.length);
  }
  return "/";
}
function jsonResponse3(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}
function createAPIHandler(cms, options = {}) {
  const basePath = options.basePath || "/api/cms";
  return async (req) => {
    const path = extractPath(req.nextUrl.pathname, basePath);
    const method = req.method;
    let session = null;
    try {
      session = await cms.config.auth.getSession();
    } catch {
    }
    const isPublicRoute = path.startsWith("/posts") && method === "GET";
    if (!isPublicRoute && !session) {
      return jsonResponse3({ error: "Unauthorized" }, 401);
    }
    try {
      if (path.startsWith("/posts")) {
        return handlePostsAPI(req, cms, session, path, options.onMutate);
      }
      if (path.startsWith("/comments")) {
        return handleCommentsAPI(req, cms, session, path, options.onMutate);
      }
      if (path.startsWith("/tags")) {
        return handleTagsAPI(req, cms, session, path, options.onMutate);
      }
      if (path.startsWith("/ai")) {
        return handleAIAPI(req, cms, session, path);
      }
      if (path.startsWith("/upload")) {
        return handleUploadAPI(req, cms, session);
      }
      if (path.startsWith("/topics")) {
        return handleTopicsAPI(req, cms, session, path, options.onMutate);
      }
      if (path.startsWith("/users")) {
        return handleUsersAPI(req, cms, session, path);
      }
      if (path.startsWith("/admin")) {
        return handleAdminAPI(req, cms, session, path);
      }
      if (path.startsWith("/settings")) {
        return handleSettingsAPI(req, cms, session, path);
      }
      if (path.startsWith("/revisions")) {
        return handleRevisionsAPI(req, cms, session, path, options.onMutate);
      }
      if (path.startsWith("/chat/history")) {
        return handleChatHistoryAPI(req, cms.config.prisma, !!session);
      }
      return jsonResponse3({ error: "Not found" }, 404);
    } catch (error) {
      console.error("API error:", error);
      return jsonResponse3({
        error: error instanceof Error ? error.message : "Internal server error"
      }, 500);
    }
  };
}

// src/auto-draft/rss.ts
import Parser from "rss-parser";
var parser = new Parser({
  timeout: 1e4,
  headers: {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
  }
});
async function fetchRssFeeds(feedUrls) {
  const articles = [];
  for (const url of feedUrls) {
    try {
      const feed = await parser.parseURL(url);
      for (const item of feed.items) {
        if (!item.title || !item.link) continue;
        articles.push({
          title: item.title,
          url: item.link,
          summary: item.contentSnippet || item.content || null,
          publishedAt: item.pubDate ? new Date(item.pubDate) : null
        });
      }
    } catch (error) {
      console.error(`Failed to fetch RSS feed: ${url}`, error);
    }
  }
  return articles;
}

// src/auto-draft/keywords.ts
function filterByKeywords(articles, keywords) {
  if (keywords.length === 0) return articles;
  const lowerKeywords = keywords.map((k) => k.toLowerCase().trim());
  return articles.filter((article) => {
    const searchText = `${article.title} ${article.summary || ""}`.toLowerCase();
    return lowerKeywords.some((keyword) => searchText.includes(keyword));
  });
}

// src/ai/index.ts
init_models();
init_provider();
init_generate();
init_chat();
init_builders();
init_prompts();

// src/ai/parse.ts
function parseGeneratedContent(markdown) {
  const lines = markdown.trim().split("\n");
  let title = "";
  let subtitle = "";
  let bodyStartIndex = 0;
  if (lines[0]?.startsWith("# ")) {
    title = lines[0].replace(/^#\s+/, "").trim();
    bodyStartIndex = 1;
  }
  for (let i = bodyStartIndex; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line === "") continue;
    const italicMatch = line.match(/^\*(.+)\*$/) || line.match(/^_(.+)_$/);
    if (italicMatch) {
      subtitle = italicMatch[1].trim();
      bodyStartIndex = i + 1;
    }
    break;
  }
  while (bodyStartIndex < lines.length && lines[bodyStartIndex].trim() === "") {
    bodyStartIndex++;
  }
  const body = lines.slice(bodyStartIndex).join("\n").trim();
  return { title, subtitle, body };
}

// src/lib/markdown.ts
import { marked, Renderer } from "marked";
import TurndownService from "turndown";
import sanitizeHtml from "sanitize-html";
marked.setOptions({
  gfm: true,
  breaks: false
});
function renderMarkdown(markdown) {
  return marked.parse(markdown);
}
function markdownToHtml(markdown) {
  return marked.parse(markdown, { gfm: true, breaks: true });
}
function createStyledRenderer() {
  const renderer = new Renderer();
  renderer.heading = function(text, level) {
    const classes = {
      1: "text-[22px] leading-tight font-bold mb-4",
      2: "text-lg leading-snug font-bold mt-6 mb-3",
      3: "text-base leading-snug font-bold mt-4 mb-2",
      4: "text-sm leading-snug font-semibold mt-3 mb-1",
      5: "text-sm leading-snug font-semibold mt-2 mb-1",
      6: "text-sm leading-snug font-medium mt-2 mb-1"
    };
    return `<h${level} class="${classes[level] || ""}">${text}</h${level}>
`;
  };
  renderer.paragraph = function(text) {
    return `<p class="mb-3 leading-relaxed">${text}</p>
`;
  };
  renderer.list = function(body, ordered) {
    const tag = ordered ? "ol" : "ul";
    const listClass = ordered ? "list-decimal" : "list-disc";
    return `<${tag} class="${listClass} pl-5 mb-3 space-y-1">${body}</${tag}>
`;
  };
  renderer.listitem = function(text) {
    return `<li>${text}</li>
`;
  };
  renderer.code = function(code, language) {
    const escaped = code.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    return `<pre class="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg overflow-x-auto mb-3 text-sm font-mono"><code class="language-${language || ""}">${escaped}</code></pre>
`;
  };
  renderer.codespan = function(text) {
    return `<code class="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm font-mono">${text}</code>`;
  };
  renderer.blockquote = function(quote) {
    return `<blockquote class="border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic text-gray-600 dark:text-gray-400 my-3">${quote}</blockquote>
`;
  };
  renderer.hr = function() {
    return `<hr class="my-6 border-t border-gray-200 dark:border-gray-700" />
`;
  };
  renderer.link = function(href, _title, text) {
    return `<a href="${href}" class="text-blue-600 dark:text-blue-400 underline">${text}</a>`;
  };
  renderer.image = function(href, _title, text) {
    return `<img src="${href}" alt="${text}" class="rounded-lg max-w-full my-3" />`;
  };
  renderer.strong = function(text) {
    return `<strong class="font-semibold">${text}</strong>`;
  };
  renderer.em = function(text) {
    return `<em class="italic">${text}</em>`;
  };
  renderer.table = function(header, body) {
    return `<table class="w-full border-collapse mb-3"><thead>${header}</thead><tbody>${body}</tbody></table>
`;
  };
  renderer.tablerow = function(content) {
    return `<tr>${content}</tr>
`;
  };
  renderer.tablecell = function(content, flags) {
    const tag = flags.header ? "th" : "td";
    const headerClass = flags.header ? " font-semibold bg-gray-50 dark:bg-gray-800" : "";
    const alignClass = flags.align ? ` text-${flags.align}` : " text-left";
    return `<${tag} class="border border-gray-200 dark:border-gray-700 px-3 py-2${alignClass}${headerClass}">${content}</${tag}>`;
  };
  return renderer;
}
var styledRenderer = createStyledRenderer();
function parseMarkdown(markdown) {
  return marked.lexer(markdown);
}
var turndownService = new TurndownService({
  headingStyle: "atx",
  codeBlockStyle: "fenced",
  bulletListMarker: "-"
});
turndownService.addRule("strikethrough", {
  filter: (node) => {
    const tagName = node.nodeName.toLowerCase();
    return tagName === "del" || tagName === "s" || tagName === "strike";
  },
  replacement: (content) => `~~${content}~~`
});
function htmlToMarkdown(html) {
  return turndownService.turndown(html);
}
function wordCount(text) {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}
function generateSlug(title) {
  return title.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").substring(0, 60);
}
function renderMarkdownSanitized(markdown) {
  const html = renderMarkdown(markdown);
  return sanitizeHtml(html, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img", "h1", "h2"]),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      img: ["src", "alt", "title"],
      a: ["href", "target", "rel"]
    }
  });
}

// src/auto-draft/runner.ts
async function getStyleContext(prisma) {
  const settings = await prisma.aISettings.findUnique({ where: { id: "default" } });
  const posts = await prisma.post.findMany({
    where: { status: "published" },
    select: { title: true, subtitle: true, markdown: true },
    orderBy: { publishedAt: "desc" },
    take: 10
  });
  const styleExamples = posts.map(
    (p) => `# ${p.title}
${p.subtitle ? `*${p.subtitle}*

` : ""}${p.markdown}`
  ).join("\n\n---\n\n");
  return {
    rules: settings?.rules || "",
    autoDraftRules: settings?.autoDraftRules || "",
    styleExamples
  };
}
function shouldRunTopic(topic) {
  if (topic.frequency === "manual") return false;
  if (!topic.lastRunAt) return true;
  const now = /* @__PURE__ */ new Date();
  const lastRun = new Date(topic.lastRunAt);
  const hoursSinceLastRun = (now.getTime() - lastRun.getTime()) / (1e3 * 60 * 60);
  if (topic.frequency === "daily") return hoursSinceLastRun >= 23;
  if (topic.frequency === "weekly") return hoursSinceLastRun >= 167;
  return true;
}
async function deduplicateArticles(prisma, articles) {
  const articleUrls = articles.map((a) => a.url);
  const existingUrls = await prisma.newsItem.findMany({
    where: { url: { in: articleUrls } },
    select: { url: true }
  });
  const urlSet = new Set(existingUrls.map((n) => n.url));
  return articles.filter((a) => !urlSet.has(a.url));
}
async function generateUniqueSlug2(prisma, title) {
  const baseSlug = generateSlug(title);
  const existing = await prisma.post.findUnique({ where: { slug: baseSlug } });
  if (!existing) return baseSlug;
  let suffix = 2;
  while (suffix < 100) {
    const candidateSlug = `${baseSlug}-${suffix}`;
    const exists = await prisma.post.findUnique({ where: { slug: candidateSlug } });
    if (!exists) return candidateSlug;
    suffix++;
  }
  return `${baseSlug}-${Date.now()}`;
}
async function generateEssayFromArticle(config, article, topicName, essayFocus) {
  const context = await getStyleContext(config.prisma);
  const systemPrompt = buildAutoDraftPrompt({
    autoDraftRules: context.autoDraftRules,
    rules: context.rules,
    wordCount: 800,
    styleExamples: context.styleExamples,
    topicName,
    articleTitle: article.title,
    articleSummary: article.summary || "",
    articleUrl: article.url
  });
  const model = await resolveModel(void 0, async () => {
    const settings = await config.prisma.aISettings.findUnique({ where: { id: "default" } });
    return settings?.defaultModel || null;
  });
  const userPrompt = essayFocus ? `Write the essay now. Focus on: ${essayFocus}` : "Write the essay now.";
  const result = await generate(model.id, systemPrompt, userPrompt, {
    maxTokens: 4096,
    anthropicKey: config.anthropicKey,
    openaiKey: config.openaiKey
  });
  const parsed = parseGeneratedContent(result.text);
  return {
    title: parsed.title || article.title,
    subtitle: parsed.subtitle || null,
    markdown: parsed.body
  };
}
async function runAutoDraft(config, topicId, skipFrequencyCheck = false) {
  const { prisma } = config;
  const integrationSettings = await prisma.integrationSettings.findUnique({
    where: { id: "default" }
  });
  if (!integrationSettings?.autoDraftEnabled) {
    console.log("Auto-draft is disabled. Skipping.");
    return [];
  }
  const topics = topicId ? await prisma.topicSubscription.findMany({ where: { id: topicId, isActive: true } }) : await prisma.topicSubscription.findMany({ where: { isActive: true } });
  const results = [];
  for (const topic of topics) {
    if (!skipFrequencyCheck && !shouldRunTopic(topic)) {
      continue;
    }
    try {
      const feedUrls = JSON.parse(topic.rssFeeds);
      const articles = await fetchRssFeeds(feedUrls);
      const keywords = JSON.parse(topic.keywords);
      const relevant = topic.useKeywordFilter ? filterByKeywords(articles, keywords) : articles;
      const newArticles = await deduplicateArticles(prisma, relevant);
      const toGenerate = newArticles.slice(0, topic.maxPerPeriod);
      let generated = 0;
      for (const article of toGenerate) {
        try {
          const newsItem = await prisma.newsItem.create({
            data: {
              topicId: topic.id,
              url: article.url,
              title: article.title,
              summary: article.summary,
              publishedAt: article.publishedAt,
              status: "pending"
            }
          });
          const essay = await generateEssayFromArticle(config, article, topic.name, topic.essayFocus);
          const slug = await generateUniqueSlug2(prisma, essay.title);
          const extraFields = config.onPostCreate ? await config.onPostCreate(article, essay) : {};
          const post = await prisma.post.create({
            data: {
              title: essay.title,
              subtitle: essay.subtitle,
              slug,
              markdown: essay.markdown,
              status: "suggested",
              sourceUrl: article.url,
              topicId: topic.id,
              ...extraFields
            }
          });
          await prisma.newsItem.update({
            where: { id: newsItem.id },
            data: { postId: post.id, status: "generated" }
          });
          generated++;
        } catch (articleError) {
          console.error(`Failed to process article: ${article.title}`, articleError);
        }
      }
      await prisma.topicSubscription.update({
        where: { id: topic.id },
        data: { lastRunAt: /* @__PURE__ */ new Date() }
      });
      results.push({
        topicId: topic.id,
        topicName: topic.name,
        generated,
        skipped: relevant.length - generated
      });
    } catch (topicError) {
      console.error(`Failed to process topic: ${topic.name}`, topicError);
      results.push({
        topicId: topic.id,
        topicName: topic.name,
        generated: 0,
        skipped: 0
      });
    }
  }
  return results;
}

// src/types/config.ts
var DEFAULT_STYLES = {
  container: "max-w-ab-content mx-auto px-ab-content-padding",
  title: "text-ab-title font-bold",
  subtitle: "text-ab-h2 text-muted-foreground",
  byline: "text-sm text-muted-foreground",
  prose: "prose"
};

// src/server.ts
function createAutoblogger(config) {
  const prisma = config.prisma;
  const mergedStyles = {
    ...DEFAULT_STYLES,
    ...config.styles
  };
  const baseServer = {
    config: {
      ...config,
      styles: mergedStyles
    },
    posts: createPostsData(prisma, config.hooks),
    comments: createCommentsData(prisma, config.comments),
    tags: createTagsData(prisma),
    revisions: createRevisionsData(prisma),
    aiSettings: createAISettingsData(prisma),
    topics: createTopicsData(prisma),
    newsItems: createNewsItemsData(prisma),
    users: createUsersData(prisma)
  };
  const server = {
    ...baseServer,
    handleRequest: async () => new Response("Not initialized", { status: 500 }),
    autoDraft: {
      run: async (topicId, skipFrequencyCheck) => {
        const autoDraftConfig = {
          prisma,
          anthropicKey: config.ai?.anthropicKey,
          openaiKey: config.ai?.openaiKey,
          onPostCreate: config.hooks?.onAutoDraftPostCreate
        };
        return runAutoDraft(autoDraftConfig, topicId, skipFrequencyCheck);
      }
    }
  };
  const apiHandler = createAPIHandler(server);
  server.handleRequest = async (req, path) => {
    const normalizedPath = "/" + path.replace(/^\//, "");
    const originalUrl = new URL(req.url);
    const newUrl = new URL(originalUrl.origin + "/api/cms" + normalizedPath);
    originalUrl.searchParams.forEach((value, key) => {
      newUrl.searchParams.set(key, value);
    });
    const handlerReq = new Request(newUrl.toString(), {
      method: req.method,
      headers: req.headers,
      body: req.method !== "GET" && req.method !== "HEAD" ? req.body : void 0,
      // @ts-ignore - duplex is needed for streaming bodies
      duplex: req.method !== "GET" && req.method !== "HEAD" ? "half" : void 0
    });
    Object.defineProperty(handlerReq, "nextUrl", {
      value: newUrl,
      writable: false
    });
    return apiHandler(handlerReq);
  };
  return server;
}

// src/schema.ts
var REQUIRED_TABLES = [
  "Post",
  "Revision",
  "Comment",
  "Tag",
  "PostTag",
  "AISettings",
  "TopicSubscription",
  "NewsItem"
];
async function validateSchema(prisma) {
  const p = prisma;
  const missingTables = [];
  for (const table of REQUIRED_TABLES) {
    const modelName = table.charAt(0).toLowerCase() + table.slice(1);
    try {
      if (!p[modelName]) {
        missingTables.push(table);
      } else {
        await p[modelName].findFirst({ take: 1 }).catch(() => {
          missingTables.push(table);
        });
      }
    } catch {
      missingTables.push(table);
    }
  }
  return {
    valid: missingTables.length === 0,
    missingTables
  };
}

// src/lib/format.ts
function formatDate(date, options) {
  const d = typeof date === "string" ? new Date(date) : date;
  const defaultOptions = {
    year: "numeric",
    month: "long",
    day: "numeric"
  };
  return d.toLocaleDateString("en-US", options || defaultOptions);
}
function truncate(text, maxLength) {
  const stripped = text.replace(/#+\s/g, "").replace(/\*\*/g, "").replace(/\*/g, "").replace(/`/g, "").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/\n+/g, " ").trim();
  if (stripped.length <= maxLength) return stripped;
  return stripped.slice(0, maxLength - 3).trim() + "...";
}

// src/lib/seo.ts
function getSeoValues(post) {
  return {
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.subtitle || truncate(post.markdown, 160),
    keywords: post.seoKeywords,
    noIndex: post.noIndex,
    ogImage: post.ogImage
  };
}

// src/lib/comments.ts
function canDeleteComment(comment, currentUserEmail, isAdmin) {
  return comment.user.email === currentUserEmail || isAdmin;
}
function canEditComment(comment, currentUserEmail) {
  return comment.user.email === currentUserEmail;
}
function createCommentsClient(apiBasePath = "/api/cms") {
  return {
    async fetchComments(postId) {
      const res = await fetch(`${apiBasePath}/posts/${postId}/comments`);
      if (!res.ok) throw new Error("Failed to fetch comments");
      const json = await res.json();
      return json.data || json;
    },
    async createComment(postId, data) {
      const res = await fetch(`${apiBasePath}/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to create comment");
      }
      const json = await res.json();
      return json.data || json;
    },
    async updateComment(postId, commentId, content) {
      const res = await fetch(`${apiBasePath}/posts/${postId}/comments/${commentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content })
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to update comment");
      }
      const json = await res.json();
      return json.data || json;
    },
    async deleteComment(postId, commentId) {
      const res = await fetch(`${apiBasePath}/posts/${postId}/comments/${commentId}`, {
        method: "DELETE"
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to delete comment");
      }
    },
    async toggleResolve(postId, commentId) {
      const res = await fetch(`${apiBasePath}/posts/${postId}/comments/${commentId}/resolve`, {
        method: "POST"
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to toggle resolve");
      }
      const json = await res.json();
      return json.data || json;
    },
    async resolveAllComments(postId) {
      const res = await fetch(`${apiBasePath}/posts/${postId}/comments/resolve-all`, {
        method: "POST"
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to resolve all comments");
      }
      const json = await res.json();
      return json.data || json;
    }
  };
}

// node_modules/@tiptap/core/dist/index.js
import { liftTarget } from "@tiptap/pm/transform";
import { createParagraphNear as originalCreateParagraphNear } from "@tiptap/pm/commands";
import { TextSelection } from "@tiptap/pm/state";
import { deleteSelection as originalDeleteSelection } from "@tiptap/pm/commands";
import { exitCode as originalExitCode } from "@tiptap/pm/commands";
import { TextSelection as TextSelection2 } from "@tiptap/pm/state";
import { TextSelection as TextSelection3 } from "@tiptap/pm/state";
import { Selection, TextSelection as TextSelection4 } from "@tiptap/pm/state";
import { Fragment as Fragment2 } from "@tiptap/pm/model";
import { DOMParser, Fragment, Node as ProseMirrorNode, Schema } from "@tiptap/pm/model";
import { Selection as Selection2 } from "@tiptap/pm/state";
import { ReplaceAroundStep, ReplaceStep } from "@tiptap/pm/transform";
import {
  joinBackward as originalJoinBackward,
  joinDown as originalJoinDown,
  joinForward as originalJoinForward,
  joinUp as originalJoinUp
} from "@tiptap/pm/commands";
import { joinPoint } from "@tiptap/pm/transform";
import { joinPoint as joinPoint2 } from "@tiptap/pm/transform";
import { joinTextblockBackward as originalCommand } from "@tiptap/pm/commands";
import { joinTextblockForward as originalCommand2 } from "@tiptap/pm/commands";
import { lift as originalLift } from "@tiptap/pm/commands";
import { liftEmptyBlock as originalLiftEmptyBlock } from "@tiptap/pm/commands";
import { liftListItem as originalLiftListItem } from "@tiptap/pm/schema-list";
import { newlineInCode as originalNewlineInCode } from "@tiptap/pm/commands";
import { AllSelection } from "@tiptap/pm/state";
import { selectNodeBackward as originalSelectNodeBackward } from "@tiptap/pm/commands";
import { selectNodeForward as originalSelectNodeForward } from "@tiptap/pm/commands";
import { selectParentNode as originalSelectParentNode } from "@tiptap/pm/commands";
import { selectTextblockEnd as originalSelectTextblockEnd } from "@tiptap/pm/commands";
import { selectTextblockStart as originalSelectTextblockStart } from "@tiptap/pm/commands";
import { Transform } from "@tiptap/pm/transform";
import { Node } from "@tiptap/pm/model";
import { DOMSerializer } from "@tiptap/pm/model";
import { Schema as Schema2 } from "@tiptap/pm/model";
import { DOMParser as DOMParser2 } from "@tiptap/pm/model";
import { Node as Node2 } from "@tiptap/pm/model";
import { NodeSelection } from "@tiptap/pm/state";
import { setBlockType } from "@tiptap/pm/commands";
import { NodeSelection as NodeSelection2 } from "@tiptap/pm/state";
import { TextSelection as TextSelection5 } from "@tiptap/pm/state";
import { sinkListItem as originalSinkListItem } from "@tiptap/pm/schema-list";
import { NodeSelection as NodeSelection3, TextSelection as TextSelection6 } from "@tiptap/pm/state";
import { canSplit } from "@tiptap/pm/transform";
import { Fragment as Fragment3, Slice } from "@tiptap/pm/model";
import { TextSelection as TextSelection7 } from "@tiptap/pm/state";
import { canSplit as canSplit2 } from "@tiptap/pm/transform";
import { canJoin } from "@tiptap/pm/transform";
import { wrapIn as originalWrapIn } from "@tiptap/pm/commands";
import { wrapInList as originalWrapInList } from "@tiptap/pm/schema-list";
import { EditorState } from "@tiptap/pm/state";
import { EditorView } from "@tiptap/pm/view";
import { keymap } from "@tiptap/pm/keymap";
import { Fragment as Fragment4 } from "@tiptap/pm/model";
import { Plugin } from "@tiptap/pm/state";
import { Fragment as Fragment5 } from "@tiptap/pm/model";
import { Plugin as Plugin2 } from "@tiptap/pm/state";
import { Plugin as Plugin3, PluginKey } from "@tiptap/pm/state";
import { RemoveMarkStep } from "@tiptap/pm/transform";
import { Plugin as Plugin4, PluginKey as PluginKey2 } from "@tiptap/pm/state";
import { Plugin as Plugin5, PluginKey as PluginKey3 } from "@tiptap/pm/state";
import { Plugin as Plugin6, PluginKey as PluginKey4 } from "@tiptap/pm/state";
import { Plugin as Plugin7, PluginKey as PluginKey5, Selection as Selection3 } from "@tiptap/pm/state";
import { Plugin as Plugin8, PluginKey as PluginKey6 } from "@tiptap/pm/state";
import { Plugin as Plugin9, PluginKey as PluginKey7 } from "@tiptap/pm/state";
import { Plugin as Plugin10, PluginKey as PluginKey8 } from "@tiptap/pm/state";
import { canJoin as canJoin2, findWrapping } from "@tiptap/pm/transform";
import { NodeSelection as NodeSelection4 } from "@tiptap/pm/state";
import { NodeSelection as NodeSelection5 } from "@tiptap/pm/state";
var __defProp2 = Object.defineProperty;
var __export2 = (target, all) => {
  for (var name in all)
    __defProp2(target, name, { get: all[name], enumerable: true });
};
function createChainableState(config) {
  const { state, transaction } = config;
  let { selection } = transaction;
  let { doc } = transaction;
  let { storedMarks } = transaction;
  return {
    ...state,
    apply: state.apply.bind(state),
    applyTransaction: state.applyTransaction.bind(state),
    plugins: state.plugins,
    schema: state.schema,
    reconfigure: state.reconfigure.bind(state),
    toJSON: state.toJSON.bind(state),
    get storedMarks() {
      return storedMarks;
    },
    get selection() {
      return selection;
    },
    get doc() {
      return doc;
    },
    get tr() {
      selection = transaction.selection;
      doc = transaction.doc;
      storedMarks = transaction.storedMarks;
      return transaction;
    }
  };
}
var CommandManager = class {
  constructor(props) {
    this.editor = props.editor;
    this.rawCommands = this.editor.extensionManager.commands;
    this.customState = props.state;
  }
  get hasCustomState() {
    return !!this.customState;
  }
  get state() {
    return this.customState || this.editor.state;
  }
  get commands() {
    const { rawCommands, editor, state } = this;
    const { view } = editor;
    const { tr } = state;
    const props = this.buildProps(tr);
    return Object.fromEntries(
      Object.entries(rawCommands).map(([name, command2]) => {
        const method = (...args) => {
          const callback = command2(...args)(props);
          if (!tr.getMeta("preventDispatch") && !this.hasCustomState) {
            view.dispatch(tr);
          }
          return callback;
        };
        return [name, method];
      })
    );
  }
  get chain() {
    return () => this.createChain();
  }
  get can() {
    return () => this.createCan();
  }
  createChain(startTr, shouldDispatch = true) {
    const { rawCommands, editor, state } = this;
    const { view } = editor;
    const callbacks = [];
    const hasStartTransaction = !!startTr;
    const tr = startTr || state.tr;
    const run3 = () => {
      if (!hasStartTransaction && shouldDispatch && !tr.getMeta("preventDispatch") && !this.hasCustomState) {
        view.dispatch(tr);
      }
      return callbacks.every((callback) => callback === true);
    };
    const chain = {
      ...Object.fromEntries(
        Object.entries(rawCommands).map(([name, command2]) => {
          const chainedCommand = (...args) => {
            const props = this.buildProps(tr, shouldDispatch);
            const callback = command2(...args)(props);
            callbacks.push(callback);
            return chain;
          };
          return [name, chainedCommand];
        })
      ),
      run: run3
    };
    return chain;
  }
  createCan(startTr) {
    const { rawCommands, state } = this;
    const dispatch = false;
    const tr = startTr || state.tr;
    const props = this.buildProps(tr, dispatch);
    const formattedCommands = Object.fromEntries(
      Object.entries(rawCommands).map(([name, command2]) => {
        return [name, (...args) => command2(...args)({ ...props, dispatch: void 0 })];
      })
    );
    return {
      ...formattedCommands,
      chain: () => this.createChain(tr, dispatch)
    };
  }
  buildProps(tr, shouldDispatch = true) {
    const { rawCommands, editor, state } = this;
    const { view } = editor;
    const props = {
      tr,
      editor,
      view,
      state: createChainableState({
        state,
        transaction: tr
      }),
      dispatch: shouldDispatch ? () => void 0 : void 0,
      chain: () => this.createChain(tr, shouldDispatch),
      can: () => this.createCan(tr),
      get commands() {
        return Object.fromEntries(
          Object.entries(rawCommands).map(([name, command2]) => {
            return [name, (...args) => command2(...args)(props)];
          })
        );
      }
    };
    return props;
  }
};
var commands_exports = {};
__export2(commands_exports, {
  blur: () => blur,
  clearContent: () => clearContent,
  clearNodes: () => clearNodes,
  command: () => command,
  createParagraphNear: () => createParagraphNear,
  cut: () => cut,
  deleteCurrentNode: () => deleteCurrentNode,
  deleteNode: () => deleteNode,
  deleteRange: () => deleteRange,
  deleteSelection: () => deleteSelection,
  enter: () => enter,
  exitCode: () => exitCode,
  extendMarkRange: () => extendMarkRange,
  first: () => first,
  focus: () => focus,
  forEach: () => forEach,
  insertContent: () => insertContent,
  insertContentAt: () => insertContentAt,
  joinBackward: () => joinBackward,
  joinDown: () => joinDown,
  joinForward: () => joinForward,
  joinItemBackward: () => joinItemBackward,
  joinItemForward: () => joinItemForward,
  joinTextblockBackward: () => joinTextblockBackward,
  joinTextblockForward: () => joinTextblockForward,
  joinUp: () => joinUp,
  keyboardShortcut: () => keyboardShortcut,
  lift: () => lift,
  liftEmptyBlock: () => liftEmptyBlock,
  liftListItem: () => liftListItem,
  newlineInCode: () => newlineInCode,
  resetAttributes: () => resetAttributes,
  scrollIntoView: () => scrollIntoView,
  selectAll: () => selectAll,
  selectNodeBackward: () => selectNodeBackward,
  selectNodeForward: () => selectNodeForward,
  selectParentNode: () => selectParentNode,
  selectTextblockEnd: () => selectTextblockEnd,
  selectTextblockStart: () => selectTextblockStart,
  setContent: () => setContent,
  setMark: () => setMark,
  setMeta: () => setMeta,
  setNode: () => setNode,
  setNodeSelection: () => setNodeSelection,
  setTextDirection: () => setTextDirection,
  setTextSelection: () => setTextSelection,
  sinkListItem: () => sinkListItem,
  splitBlock: () => splitBlock,
  splitListItem: () => splitListItem,
  toggleList: () => toggleList,
  toggleMark: () => toggleMark,
  toggleNode: () => toggleNode,
  toggleWrap: () => toggleWrap,
  undoInputRule: () => undoInputRule,
  unsetAllMarks: () => unsetAllMarks,
  unsetMark: () => unsetMark,
  unsetTextDirection: () => unsetTextDirection,
  updateAttributes: () => updateAttributes,
  wrapIn: () => wrapIn,
  wrapInList: () => wrapInList
});
var blur = () => ({ editor, view }) => {
  requestAnimationFrame(() => {
    var _a;
    if (!editor.isDestroyed) {
      ;
      view.dom.blur();
      (_a = window == null ? void 0 : window.getSelection()) == null ? void 0 : _a.removeAllRanges();
    }
  });
  return true;
};
var clearContent = (emitUpdate = true) => ({ commands }) => {
  return commands.setContent("", { emitUpdate });
};
var clearNodes = () => ({ state, tr, dispatch }) => {
  const { selection } = tr;
  const { ranges } = selection;
  if (!dispatch) {
    return true;
  }
  ranges.forEach(({ $from, $to }) => {
    state.doc.nodesBetween($from.pos, $to.pos, (node, pos) => {
      if (node.type.isText) {
        return;
      }
      const { doc, mapping } = tr;
      const $mappedFrom = doc.resolve(mapping.map(pos));
      const $mappedTo = doc.resolve(mapping.map(pos + node.nodeSize));
      const nodeRange = $mappedFrom.blockRange($mappedTo);
      if (!nodeRange) {
        return;
      }
      const targetLiftDepth = liftTarget(nodeRange);
      if (node.type.isTextblock) {
        const { defaultType } = $mappedFrom.parent.contentMatchAt($mappedFrom.index());
        tr.setNodeMarkup(nodeRange.start, defaultType);
      }
      if (targetLiftDepth || targetLiftDepth === 0) {
        tr.lift(nodeRange, targetLiftDepth);
      }
    });
  });
  return true;
};
var command = (fn) => (props) => {
  return fn(props);
};
var createParagraphNear = () => ({ state, dispatch }) => {
  return originalCreateParagraphNear(state, dispatch);
};
var cut = (originRange, targetPos) => ({ editor, tr }) => {
  const { state } = editor;
  const contentSlice = state.doc.slice(originRange.from, originRange.to);
  tr.deleteRange(originRange.from, originRange.to);
  const newPos = tr.mapping.map(targetPos);
  tr.insert(newPos, contentSlice.content);
  tr.setSelection(new TextSelection(tr.doc.resolve(Math.max(newPos - 1, 0))));
  return true;
};
var deleteCurrentNode = () => ({ tr, dispatch }) => {
  const { selection } = tr;
  const currentNode = selection.$anchor.node();
  if (currentNode.content.size > 0) {
    return false;
  }
  const $pos = tr.selection.$anchor;
  for (let depth = $pos.depth; depth > 0; depth -= 1) {
    const node = $pos.node(depth);
    if (node.type === currentNode.type) {
      if (dispatch) {
        const from = $pos.before(depth);
        const to = $pos.after(depth);
        tr.delete(from, to).scrollIntoView();
      }
      return true;
    }
  }
  return false;
};
function getNodeType(nameOrType, schema) {
  if (typeof nameOrType === "string") {
    if (!schema.nodes[nameOrType]) {
      throw Error(`There is no node type named '${nameOrType}'. Maybe you forgot to add the extension?`);
    }
    return schema.nodes[nameOrType];
  }
  return nameOrType;
}
var deleteNode = (typeOrName) => ({ tr, state, dispatch }) => {
  const type = getNodeType(typeOrName, state.schema);
  const $pos = tr.selection.$anchor;
  for (let depth = $pos.depth; depth > 0; depth -= 1) {
    const node = $pos.node(depth);
    if (node.type === type) {
      if (dispatch) {
        const from = $pos.before(depth);
        const to = $pos.after(depth);
        tr.delete(from, to).scrollIntoView();
      }
      return true;
    }
  }
  return false;
};
var deleteRange = (range) => ({ tr, dispatch }) => {
  const { from, to } = range;
  if (dispatch) {
    tr.delete(from, to);
  }
  return true;
};
var deleteSelection = () => ({ state, dispatch }) => {
  return originalDeleteSelection(state, dispatch);
};
var enter = () => ({ commands }) => {
  return commands.keyboardShortcut("Enter");
};
var exitCode = () => ({ state, dispatch }) => {
  return originalExitCode(state, dispatch);
};
function isRegExp(value) {
  return Object.prototype.toString.call(value) === "[object RegExp]";
}
function objectIncludes(object1, object2, options = { strict: true }) {
  const keys = Object.keys(object2);
  if (!keys.length) {
    return true;
  }
  return keys.every((key) => {
    if (options.strict) {
      return object2[key] === object1[key];
    }
    if (isRegExp(object2[key])) {
      return object2[key].test(object1[key]);
    }
    return object2[key] === object1[key];
  });
}
function findMarkInSet(marks, type, attributes = {}) {
  return marks.find((item) => {
    return item.type === type && objectIncludes(
      // Only check equality for the attributes that are provided
      Object.fromEntries(Object.keys(attributes).map((k) => [k, item.attrs[k]])),
      attributes
    );
  });
}
function isMarkInSet(marks, type, attributes = {}) {
  return !!findMarkInSet(marks, type, attributes);
}
function getMarkRange($pos, type, attributes) {
  var _a;
  if (!$pos || !type) {
    return;
  }
  let start = $pos.parent.childAfter($pos.parentOffset);
  if (!start.node || !start.node.marks.some((mark2) => mark2.type === type)) {
    start = $pos.parent.childBefore($pos.parentOffset);
  }
  if (!start.node || !start.node.marks.some((mark2) => mark2.type === type)) {
    return;
  }
  attributes = attributes || ((_a = start.node.marks[0]) == null ? void 0 : _a.attrs);
  const mark = findMarkInSet([...start.node.marks], type, attributes);
  if (!mark) {
    return;
  }
  let startIndex = start.index;
  let startPos = $pos.start() + start.offset;
  let endIndex = startIndex + 1;
  let endPos = startPos + start.node.nodeSize;
  while (startIndex > 0 && isMarkInSet([...$pos.parent.child(startIndex - 1).marks], type, attributes)) {
    startIndex -= 1;
    startPos -= $pos.parent.child(startIndex).nodeSize;
  }
  while (endIndex < $pos.parent.childCount && isMarkInSet([...$pos.parent.child(endIndex).marks], type, attributes)) {
    endPos += $pos.parent.child(endIndex).nodeSize;
    endIndex += 1;
  }
  return {
    from: startPos,
    to: endPos
  };
}
function getMarkType(nameOrType, schema) {
  if (typeof nameOrType === "string") {
    if (!schema.marks[nameOrType]) {
      throw Error(`There is no mark type named '${nameOrType}'. Maybe you forgot to add the extension?`);
    }
    return schema.marks[nameOrType];
  }
  return nameOrType;
}
var extendMarkRange = (typeOrName, attributes = {}) => ({ tr, state, dispatch }) => {
  const type = getMarkType(typeOrName, state.schema);
  const { doc, selection } = tr;
  const { $from, from, to } = selection;
  if (dispatch) {
    const range = getMarkRange($from, type, attributes);
    if (range && range.from <= from && range.to >= to) {
      const newSelection = TextSelection2.create(doc, range.from, range.to);
      tr.setSelection(newSelection);
    }
  }
  return true;
};
var first = (commands) => (props) => {
  const items = typeof commands === "function" ? commands(props) : commands;
  for (let i = 0; i < items.length; i += 1) {
    if (items[i](props)) {
      return true;
    }
  }
  return false;
};
function isTextSelection(value) {
  return value instanceof TextSelection3;
}
function minMax(value = 0, min = 0, max = 0) {
  return Math.min(Math.max(value, min), max);
}
function resolveFocusPosition(doc, position = null) {
  if (!position) {
    return null;
  }
  const selectionAtStart = Selection.atStart(doc);
  const selectionAtEnd = Selection.atEnd(doc);
  if (position === "start" || position === true) {
    return selectionAtStart;
  }
  if (position === "end") {
    return selectionAtEnd;
  }
  const minPos = selectionAtStart.from;
  const maxPos = selectionAtEnd.to;
  if (position === "all") {
    return TextSelection4.create(doc, minMax(0, minPos, maxPos), minMax(doc.content.size, minPos, maxPos));
  }
  return TextSelection4.create(doc, minMax(position, minPos, maxPos), minMax(position, minPos, maxPos));
}
function isAndroid() {
  return navigator.platform === "Android" || /android/i.test(navigator.userAgent);
}
function isiOS() {
  return ["iPad Simulator", "iPhone Simulator", "iPod Simulator", "iPad", "iPhone", "iPod"].includes(navigator.platform) || // iPad on iOS 13 detection
  navigator.userAgent.includes("Mac") && "ontouchend" in document;
}
function isSafari() {
  return typeof navigator !== "undefined" ? /^((?!chrome|android).)*safari/i.test(navigator.userAgent) : false;
}
var focus = (position = null, options = {}) => ({ editor, view, tr, dispatch }) => {
  options = {
    scrollIntoView: true,
    ...options
  };
  const delayedFocus = () => {
    if (isiOS() || isAndroid()) {
      ;
      view.dom.focus();
    }
    if (isSafari() && !isiOS() && !isAndroid()) {
      ;
      view.dom.focus({ preventScroll: true });
    }
    requestAnimationFrame(() => {
      if (!editor.isDestroyed) {
        view.focus();
        if (options == null ? void 0 : options.scrollIntoView) {
          editor.commands.scrollIntoView();
        }
      }
    });
  };
  if (view.hasFocus() && position === null || position === false) {
    return true;
  }
  if (dispatch && position === null && !isTextSelection(editor.state.selection)) {
    delayedFocus();
    return true;
  }
  const selection = resolveFocusPosition(tr.doc, position) || editor.state.selection;
  const isSameSelection = editor.state.selection.eq(selection);
  if (dispatch) {
    if (!isSameSelection) {
      tr.setSelection(selection);
    }
    if (isSameSelection && tr.storedMarks) {
      tr.setStoredMarks(tr.storedMarks);
    }
    delayedFocus();
  }
  return true;
};
var forEach = (items, fn) => (props) => {
  return items.every((item, index) => fn(item, { ...props, index }));
};
var insertContent = (value, options) => ({ tr, commands }) => {
  return commands.insertContentAt({ from: tr.selection.from, to: tr.selection.to }, value, options);
};
var removeWhitespaces = (node) => {
  const children = node.childNodes;
  for (let i = children.length - 1; i >= 0; i -= 1) {
    const child = children[i];
    if (child.nodeType === 3 && child.nodeValue && /^(\n\s\s|\n)$/.test(child.nodeValue)) {
      node.removeChild(child);
    } else if (child.nodeType === 1) {
      removeWhitespaces(child);
    }
  }
  return node;
};
function elementFromString(value) {
  if (typeof window === "undefined") {
    throw new Error("[tiptap error]: there is no window object available, so this function cannot be used");
  }
  const wrappedValue = `<body>${value}</body>`;
  const html = new window.DOMParser().parseFromString(wrappedValue, "text/html").body;
  return removeWhitespaces(html);
}
function createNodeFromContent(content, schema, options) {
  if (content instanceof ProseMirrorNode || content instanceof Fragment) {
    return content;
  }
  options = {
    slice: true,
    parseOptions: {},
    ...options
  };
  const isJSONContent = typeof content === "object" && content !== null;
  const isTextContent = typeof content === "string";
  if (isJSONContent) {
    try {
      const isArrayContent = Array.isArray(content) && content.length > 0;
      if (isArrayContent) {
        return Fragment.fromArray(content.map((item) => schema.nodeFromJSON(item)));
      }
      const node = schema.nodeFromJSON(content);
      if (options.errorOnInvalidContent) {
        node.check();
      }
      return node;
    } catch (error) {
      if (options.errorOnInvalidContent) {
        throw new Error("[tiptap error]: Invalid JSON content", { cause: error });
      }
      console.warn("[tiptap warn]: Invalid content.", "Passed value:", content, "Error:", error);
      return createNodeFromContent("", schema, options);
    }
  }
  if (isTextContent) {
    if (options.errorOnInvalidContent) {
      let hasInvalidContent = false;
      let invalidContent = "";
      const contentCheckSchema = new Schema({
        topNode: schema.spec.topNode,
        marks: schema.spec.marks,
        // Prosemirror's schemas are executed such that: the last to execute, matches last
        // This means that we can add a catch-all node at the end of the schema to catch any content that we don't know how to handle
        nodes: schema.spec.nodes.append({
          __tiptap__private__unknown__catch__all__node: {
            content: "inline*",
            group: "block",
            parseDOM: [
              {
                tag: "*",
                getAttrs: (e) => {
                  hasInvalidContent = true;
                  invalidContent = typeof e === "string" ? e : e.outerHTML;
                  return null;
                }
              }
            ]
          }
        })
      });
      if (options.slice) {
        DOMParser.fromSchema(contentCheckSchema).parseSlice(elementFromString(content), options.parseOptions);
      } else {
        DOMParser.fromSchema(contentCheckSchema).parse(elementFromString(content), options.parseOptions);
      }
      if (options.errorOnInvalidContent && hasInvalidContent) {
        throw new Error("[tiptap error]: Invalid HTML content", {
          cause: new Error(`Invalid element found: ${invalidContent}`)
        });
      }
    }
    const parser2 = DOMParser.fromSchema(schema);
    if (options.slice) {
      return parser2.parseSlice(elementFromString(content), options.parseOptions).content;
    }
    return parser2.parse(elementFromString(content), options.parseOptions);
  }
  return createNodeFromContent("", schema, options);
}
function selectionToInsertionEnd(tr, startLen, bias) {
  const last = tr.steps.length - 1;
  if (last < startLen) {
    return;
  }
  const step = tr.steps[last];
  if (!(step instanceof ReplaceStep || step instanceof ReplaceAroundStep)) {
    return;
  }
  const map = tr.mapping.maps[last];
  let end = 0;
  map.forEach((_from, _to, _newFrom, newTo) => {
    if (end === 0) {
      end = newTo;
    }
  });
  tr.setSelection(Selection2.near(tr.doc.resolve(end), bias));
}
var isFragment = (nodeOrFragment) => {
  return !("type" in nodeOrFragment);
};
var insertContentAt = (position, value, options) => ({ tr, dispatch, editor }) => {
  var _a;
  if (dispatch) {
    options = {
      parseOptions: editor.options.parseOptions,
      updateSelection: true,
      applyInputRules: false,
      applyPasteRules: false,
      ...options
    };
    let content;
    const emitContentError = (error) => {
      editor.emit("contentError", {
        editor,
        error,
        disableCollaboration: () => {
          if ("collaboration" in editor.storage && typeof editor.storage.collaboration === "object" && editor.storage.collaboration) {
            ;
            editor.storage.collaboration.isDisabled = true;
          }
        }
      });
    };
    const parseOptions = {
      preserveWhitespace: "full",
      ...options.parseOptions
    };
    if (!options.errorOnInvalidContent && !editor.options.enableContentCheck && editor.options.emitContentError) {
      try {
        createNodeFromContent(value, editor.schema, {
          parseOptions,
          errorOnInvalidContent: true
        });
      } catch (e) {
        emitContentError(e);
      }
    }
    try {
      content = createNodeFromContent(value, editor.schema, {
        parseOptions,
        errorOnInvalidContent: (_a = options.errorOnInvalidContent) != null ? _a : editor.options.enableContentCheck
      });
    } catch (e) {
      emitContentError(e);
      return false;
    }
    let { from, to } = typeof position === "number" ? { from: position, to: position } : { from: position.from, to: position.to };
    let isOnlyTextContent = true;
    let isOnlyBlockContent = true;
    const nodes = isFragment(content) ? content : [content];
    nodes.forEach((node) => {
      node.check();
      isOnlyTextContent = isOnlyTextContent ? node.isText && node.marks.length === 0 : false;
      isOnlyBlockContent = isOnlyBlockContent ? node.isBlock : false;
    });
    if (from === to && isOnlyBlockContent) {
      const { parent } = tr.doc.resolve(from);
      const isEmptyTextBlock = parent.isTextblock && !parent.type.spec.code && !parent.childCount;
      if (isEmptyTextBlock) {
        from -= 1;
        to += 1;
      }
    }
    let newContent;
    if (isOnlyTextContent) {
      if (Array.isArray(value)) {
        newContent = value.map((v) => v.text || "").join("");
      } else if (value instanceof Fragment2) {
        let text = "";
        value.forEach((node) => {
          if (node.text) {
            text += node.text;
          }
        });
        newContent = text;
      } else if (typeof value === "object" && !!value && !!value.text) {
        newContent = value.text;
      } else {
        newContent = value;
      }
      tr.insertText(newContent, from, to);
    } else {
      newContent = content;
      const $from = tr.doc.resolve(from);
      const $fromNode = $from.node();
      const fromSelectionAtStart = $from.parentOffset === 0;
      const isTextSelection2 = $fromNode.isText || $fromNode.isTextblock;
      const hasContent = $fromNode.content.size > 0;
      if (fromSelectionAtStart && isTextSelection2 && hasContent) {
        from = Math.max(0, from - 1);
      }
      tr.replaceWith(from, to, newContent);
    }
    if (options.updateSelection) {
      selectionToInsertionEnd(tr, tr.steps.length - 1, -1);
    }
    if (options.applyInputRules) {
      tr.setMeta("applyInputRules", { from, text: newContent });
    }
    if (options.applyPasteRules) {
      tr.setMeta("applyPasteRules", { from, text: newContent });
    }
  }
  return true;
};
var joinUp = () => ({ state, dispatch }) => {
  return originalJoinUp(state, dispatch);
};
var joinDown = () => ({ state, dispatch }) => {
  return originalJoinDown(state, dispatch);
};
var joinBackward = () => ({ state, dispatch }) => {
  return originalJoinBackward(state, dispatch);
};
var joinForward = () => ({ state, dispatch }) => {
  return originalJoinForward(state, dispatch);
};
var joinItemBackward = () => ({ state, dispatch, tr }) => {
  try {
    const point = joinPoint(state.doc, state.selection.$from.pos, -1);
    if (point === null || point === void 0) {
      return false;
    }
    tr.join(point, 2);
    if (dispatch) {
      dispatch(tr);
    }
    return true;
  } catch {
    return false;
  }
};
var joinItemForward = () => ({ state, dispatch, tr }) => {
  try {
    const point = joinPoint2(state.doc, state.selection.$from.pos, 1);
    if (point === null || point === void 0) {
      return false;
    }
    tr.join(point, 2);
    if (dispatch) {
      dispatch(tr);
    }
    return true;
  } catch {
    return false;
  }
};
var joinTextblockBackward = () => ({ state, dispatch }) => {
  return originalCommand(state, dispatch);
};
var joinTextblockForward = () => ({ state, dispatch }) => {
  return originalCommand2(state, dispatch);
};
function isMacOS() {
  return typeof navigator !== "undefined" ? /Mac/.test(navigator.platform) : false;
}
function normalizeKeyName(name) {
  const parts = name.split(/-(?!$)/);
  let result = parts[parts.length - 1];
  if (result === "Space") {
    result = " ";
  }
  let alt;
  let ctrl;
  let shift;
  let meta;
  for (let i = 0; i < parts.length - 1; i += 1) {
    const mod = parts[i];
    if (/^(cmd|meta|m)$/i.test(mod)) {
      meta = true;
    } else if (/^a(lt)?$/i.test(mod)) {
      alt = true;
    } else if (/^(c|ctrl|control)$/i.test(mod)) {
      ctrl = true;
    } else if (/^s(hift)?$/i.test(mod)) {
      shift = true;
    } else if (/^mod$/i.test(mod)) {
      if (isiOS() || isMacOS()) {
        meta = true;
      } else {
        ctrl = true;
      }
    } else {
      throw new Error(`Unrecognized modifier name: ${mod}`);
    }
  }
  if (alt) {
    result = `Alt-${result}`;
  }
  if (ctrl) {
    result = `Ctrl-${result}`;
  }
  if (meta) {
    result = `Meta-${result}`;
  }
  if (shift) {
    result = `Shift-${result}`;
  }
  return result;
}
var keyboardShortcut = (name) => ({ editor, view, tr, dispatch }) => {
  const keys = normalizeKeyName(name).split(/-(?!$)/);
  const key = keys.find((item) => !["Alt", "Ctrl", "Meta", "Shift"].includes(item));
  const event = new KeyboardEvent("keydown", {
    key: key === "Space" ? " " : key,
    altKey: keys.includes("Alt"),
    ctrlKey: keys.includes("Ctrl"),
    metaKey: keys.includes("Meta"),
    shiftKey: keys.includes("Shift"),
    bubbles: true,
    cancelable: true
  });
  const capturedTransaction = editor.captureTransaction(() => {
    view.someProp("handleKeyDown", (f) => f(view, event));
  });
  capturedTransaction == null ? void 0 : capturedTransaction.steps.forEach((step) => {
    const newStep = step.map(tr.mapping);
    if (newStep && dispatch) {
      tr.maybeStep(newStep);
    }
  });
  return true;
};
function isNodeActive(state, typeOrName, attributes = {}) {
  const { from, to, empty } = state.selection;
  const type = typeOrName ? getNodeType(typeOrName, state.schema) : null;
  const nodeRanges = [];
  state.doc.nodesBetween(from, to, (node, pos) => {
    if (node.isText) {
      return;
    }
    const relativeFrom = Math.max(from, pos);
    const relativeTo = Math.min(to, pos + node.nodeSize);
    nodeRanges.push({
      node,
      from: relativeFrom,
      to: relativeTo
    });
  });
  const selectionRange = to - from;
  const matchedNodeRanges = nodeRanges.filter((nodeRange) => {
    if (!type) {
      return true;
    }
    return type.name === nodeRange.node.type.name;
  }).filter((nodeRange) => objectIncludes(nodeRange.node.attrs, attributes, { strict: false }));
  if (empty) {
    return !!matchedNodeRanges.length;
  }
  const range = matchedNodeRanges.reduce((sum, nodeRange) => sum + nodeRange.to - nodeRange.from, 0);
  return range >= selectionRange;
}
var lift = (typeOrName, attributes = {}) => ({ state, dispatch }) => {
  const type = getNodeType(typeOrName, state.schema);
  const isActive2 = isNodeActive(state, type, attributes);
  if (!isActive2) {
    return false;
  }
  return originalLift(state, dispatch);
};
var liftEmptyBlock = () => ({ state, dispatch }) => {
  return originalLiftEmptyBlock(state, dispatch);
};
var liftListItem = (typeOrName) => ({ state, dispatch }) => {
  const type = getNodeType(typeOrName, state.schema);
  return originalLiftListItem(type)(state, dispatch);
};
var newlineInCode = () => ({ state, dispatch }) => {
  return originalNewlineInCode(state, dispatch);
};
function getSchemaTypeNameByName(name, schema) {
  if (schema.nodes[name]) {
    return "node";
  }
  if (schema.marks[name]) {
    return "mark";
  }
  return null;
}
function deleteProps(obj, propOrProps) {
  const props = typeof propOrProps === "string" ? [propOrProps] : propOrProps;
  return Object.keys(obj).reduce((newObj, prop) => {
    if (!props.includes(prop)) {
      newObj[prop] = obj[prop];
    }
    return newObj;
  }, {});
}
var resetAttributes = (typeOrName, attributes) => ({ tr, state, dispatch }) => {
  let nodeType = null;
  let markType = null;
  const schemaType = getSchemaTypeNameByName(
    typeof typeOrName === "string" ? typeOrName : typeOrName.name,
    state.schema
  );
  if (!schemaType) {
    return false;
  }
  if (schemaType === "node") {
    nodeType = getNodeType(typeOrName, state.schema);
  }
  if (schemaType === "mark") {
    markType = getMarkType(typeOrName, state.schema);
  }
  let canReset = false;
  tr.selection.ranges.forEach((range) => {
    state.doc.nodesBetween(range.$from.pos, range.$to.pos, (node, pos) => {
      if (nodeType && nodeType === node.type) {
        canReset = true;
        if (dispatch) {
          tr.setNodeMarkup(pos, void 0, deleteProps(node.attrs, attributes));
        }
      }
      if (markType && node.marks.length) {
        node.marks.forEach((mark) => {
          if (markType === mark.type) {
            canReset = true;
            if (dispatch) {
              tr.addMark(pos, pos + node.nodeSize, markType.create(deleteProps(mark.attrs, attributes)));
            }
          }
        });
      }
    });
  });
  return canReset;
};
var scrollIntoView = () => ({ tr, dispatch }) => {
  if (dispatch) {
    tr.scrollIntoView();
  }
  return true;
};
var selectAll = () => ({ tr, dispatch }) => {
  if (dispatch) {
    const selection = new AllSelection(tr.doc);
    tr.setSelection(selection);
  }
  return true;
};
var selectNodeBackward = () => ({ state, dispatch }) => {
  return originalSelectNodeBackward(state, dispatch);
};
var selectNodeForward = () => ({ state, dispatch }) => {
  return originalSelectNodeForward(state, dispatch);
};
var selectParentNode = () => ({ state, dispatch }) => {
  return originalSelectParentNode(state, dispatch);
};
var selectTextblockEnd = () => ({ state, dispatch }) => {
  return originalSelectTextblockEnd(state, dispatch);
};
var selectTextblockStart = () => ({ state, dispatch }) => {
  return originalSelectTextblockStart(state, dispatch);
};
function createDocument(content, schema, parseOptions = {}, options = {}) {
  return createNodeFromContent(content, schema, {
    slice: false,
    parseOptions,
    errorOnInvalidContent: options.errorOnInvalidContent
  });
}
var setContent = (content, { errorOnInvalidContent, emitUpdate = true, parseOptions = {} } = {}) => ({ editor, tr, dispatch, commands }) => {
  const { doc } = tr;
  if (parseOptions.preserveWhitespace !== "full") {
    const document2 = createDocument(content, editor.schema, parseOptions, {
      errorOnInvalidContent: errorOnInvalidContent != null ? errorOnInvalidContent : editor.options.enableContentCheck
    });
    if (dispatch) {
      tr.replaceWith(0, doc.content.size, document2).setMeta("preventUpdate", !emitUpdate);
    }
    return true;
  }
  if (dispatch) {
    tr.setMeta("preventUpdate", !emitUpdate);
  }
  return commands.insertContentAt({ from: 0, to: doc.content.size }, content, {
    parseOptions,
    errorOnInvalidContent: errorOnInvalidContent != null ? errorOnInvalidContent : editor.options.enableContentCheck
  });
};
function getMarkAttributes(state, typeOrName) {
  const type = getMarkType(typeOrName, state.schema);
  const { from, to, empty } = state.selection;
  const marks = [];
  if (empty) {
    if (state.storedMarks) {
      marks.push(...state.storedMarks);
    }
    marks.push(...state.selection.$head.marks());
  } else {
    state.doc.nodesBetween(from, to, (node) => {
      marks.push(...node.marks);
    });
  }
  const mark = marks.find((markItem) => markItem.type.name === type.name);
  if (!mark) {
    return {};
  }
  return { ...mark.attrs };
}
function combineTransactionSteps(oldDoc, transactions) {
  const transform = new Transform(oldDoc);
  transactions.forEach((transaction) => {
    transaction.steps.forEach((step) => {
      transform.step(step);
    });
  });
  return transform;
}
function defaultBlockAt(match) {
  for (let i = 0; i < match.edgeCount; i += 1) {
    const { type } = match.edge(i);
    if (type.isTextblock && !type.hasRequiredAttrs()) {
      return type;
    }
  }
  return null;
}
function findParentNodeClosestToPos($pos, predicate) {
  for (let i = $pos.depth; i > 0; i -= 1) {
    const node = $pos.node(i);
    if (predicate(node)) {
      return {
        pos: i > 0 ? $pos.before(i) : 0,
        start: $pos.start(i),
        depth: i,
        node
      };
    }
  }
}
function findParentNode(predicate) {
  return (selection) => findParentNodeClosestToPos(selection.$from, predicate);
}
function getExtensionField(extension, field, context) {
  if (extension.config[field] === void 0 && extension.parent) {
    return getExtensionField(extension.parent, field, context);
  }
  if (typeof extension.config[field] === "function") {
    const value = extension.config[field].bind({
      ...context,
      parent: extension.parent ? getExtensionField(extension.parent, field, context) : null
    });
    return value;
  }
  return extension.config[field];
}
function flattenExtensions(extensions) {
  return extensions.map((extension) => {
    const context = {
      name: extension.name,
      options: extension.options,
      storage: extension.storage
    };
    const addExtensions = getExtensionField(extension, "addExtensions", context);
    if (addExtensions) {
      return [extension, ...flattenExtensions(addExtensions())];
    }
    return extension;
  }).flat(10);
}
function getHTMLFromFragment(fragment, schema) {
  const documentFragment = DOMSerializer.fromSchema(schema).serializeFragment(fragment);
  const temporaryDocument = document.implementation.createHTMLDocument();
  const container = temporaryDocument.createElement("div");
  container.appendChild(documentFragment);
  return container.innerHTML;
}
function isFunction(value) {
  return typeof value === "function";
}
function callOrReturn(value, context = void 0, ...props) {
  if (isFunction(value)) {
    if (context) {
      return value.bind(context)(...props);
    }
    return value(...props);
  }
  return value;
}
function isEmptyObject(value = {}) {
  return Object.keys(value).length === 0 && value.constructor === Object;
}
function splitExtensions(extensions) {
  const baseExtensions = extensions.filter((extension) => extension.type === "extension");
  const nodeExtensions = extensions.filter((extension) => extension.type === "node");
  const markExtensions = extensions.filter((extension) => extension.type === "mark");
  return {
    baseExtensions,
    nodeExtensions,
    markExtensions
  };
}
function getAttributesFromExtensions(extensions) {
  const extensionAttributes = [];
  const { nodeExtensions, markExtensions } = splitExtensions(extensions);
  const nodeAndMarkExtensions = [...nodeExtensions, ...markExtensions];
  const defaultAttribute = {
    default: null,
    validate: void 0,
    rendered: true,
    renderHTML: null,
    parseHTML: null,
    keepOnSplit: true,
    isRequired: false
  };
  extensions.forEach((extension) => {
    const context = {
      name: extension.name,
      options: extension.options,
      storage: extension.storage,
      extensions: nodeAndMarkExtensions
    };
    const addGlobalAttributes = getExtensionField(
      extension,
      "addGlobalAttributes",
      context
    );
    if (!addGlobalAttributes) {
      return;
    }
    const globalAttributes = addGlobalAttributes();
    globalAttributes.forEach((globalAttribute) => {
      globalAttribute.types.forEach((type) => {
        Object.entries(globalAttribute.attributes).forEach(([name, attribute]) => {
          extensionAttributes.push({
            type,
            name,
            attribute: {
              ...defaultAttribute,
              ...attribute
            }
          });
        });
      });
    });
  });
  nodeAndMarkExtensions.forEach((extension) => {
    const context = {
      name: extension.name,
      options: extension.options,
      storage: extension.storage
    };
    const addAttributes = getExtensionField(
      extension,
      "addAttributes",
      context
    );
    if (!addAttributes) {
      return;
    }
    const attributes = addAttributes();
    Object.entries(attributes).forEach(([name, attribute]) => {
      const mergedAttr = {
        ...defaultAttribute,
        ...attribute
      };
      if (typeof (mergedAttr == null ? void 0 : mergedAttr.default) === "function") {
        mergedAttr.default = mergedAttr.default();
      }
      if ((mergedAttr == null ? void 0 : mergedAttr.isRequired) && (mergedAttr == null ? void 0 : mergedAttr.default) === void 0) {
        delete mergedAttr.default;
      }
      extensionAttributes.push({
        type: extension.name,
        name,
        attribute: mergedAttr
      });
    });
  });
  return extensionAttributes;
}
function mergeAttributes(...objects) {
  return objects.filter((item) => !!item).reduce((items, item) => {
    const mergedAttributes = { ...items };
    Object.entries(item).forEach(([key, value]) => {
      const exists = mergedAttributes[key];
      if (!exists) {
        mergedAttributes[key] = value;
        return;
      }
      if (key === "class") {
        const valueClasses = value ? String(value).split(" ") : [];
        const existingClasses = mergedAttributes[key] ? mergedAttributes[key].split(" ") : [];
        const insertClasses = valueClasses.filter((valueClass) => !existingClasses.includes(valueClass));
        mergedAttributes[key] = [...existingClasses, ...insertClasses].join(" ");
      } else if (key === "style") {
        const newStyles = value ? value.split(";").map((style2) => style2.trim()).filter(Boolean) : [];
        const existingStyles = mergedAttributes[key] ? mergedAttributes[key].split(";").map((style2) => style2.trim()).filter(Boolean) : [];
        const styleMap = /* @__PURE__ */ new Map();
        existingStyles.forEach((style2) => {
          const [property, val] = style2.split(":").map((part) => part.trim());
          styleMap.set(property, val);
        });
        newStyles.forEach((style2) => {
          const [property, val] = style2.split(":").map((part) => part.trim());
          styleMap.set(property, val);
        });
        mergedAttributes[key] = Array.from(styleMap.entries()).map(([property, val]) => `${property}: ${val}`).join("; ");
      } else {
        mergedAttributes[key] = value;
      }
    });
    return mergedAttributes;
  }, {});
}
function getRenderedAttributes(nodeOrMark, extensionAttributes) {
  return extensionAttributes.filter((attribute) => attribute.type === nodeOrMark.type.name).filter((item) => item.attribute.rendered).map((item) => {
    if (!item.attribute.renderHTML) {
      return {
        [item.name]: nodeOrMark.attrs[item.name]
      };
    }
    return item.attribute.renderHTML(nodeOrMark.attrs) || {};
  }).reduce((attributes, attribute) => mergeAttributes(attributes, attribute), {});
}
function fromString(value) {
  if (typeof value !== "string") {
    return value;
  }
  if (value.match(/^[+-]?(?:\d*\.)?\d+$/)) {
    return Number(value);
  }
  if (value === "true") {
    return true;
  }
  if (value === "false") {
    return false;
  }
  return value;
}
function injectExtensionAttributesToParseRule(parseRule, extensionAttributes) {
  if ("style" in parseRule) {
    return parseRule;
  }
  return {
    ...parseRule,
    getAttrs: (node) => {
      const oldAttributes = parseRule.getAttrs ? parseRule.getAttrs(node) : parseRule.attrs;
      if (oldAttributes === false) {
        return false;
      }
      const newAttributes = extensionAttributes.reduce((items, item) => {
        const value = item.attribute.parseHTML ? item.attribute.parseHTML(node) : fromString(node.getAttribute(item.name));
        if (value === null || value === void 0) {
          return items;
        }
        return {
          ...items,
          [item.name]: value
        };
      }, {});
      return { ...oldAttributes, ...newAttributes };
    }
  };
}
function cleanUpSchemaItem(data) {
  return Object.fromEntries(
    // @ts-ignore
    Object.entries(data).filter(([key, value]) => {
      if (key === "attrs" && isEmptyObject(value)) {
        return false;
      }
      return value !== null && value !== void 0;
    })
  );
}
function buildAttributeSpec(extensionAttribute) {
  var _a, _b;
  const spec = {};
  if (!((_a = extensionAttribute == null ? void 0 : extensionAttribute.attribute) == null ? void 0 : _a.isRequired) && "default" in ((extensionAttribute == null ? void 0 : extensionAttribute.attribute) || {})) {
    spec.default = extensionAttribute.attribute.default;
  }
  if (((_b = extensionAttribute == null ? void 0 : extensionAttribute.attribute) == null ? void 0 : _b.validate) !== void 0) {
    spec.validate = extensionAttribute.attribute.validate;
  }
  return [extensionAttribute.name, spec];
}
function getSchemaByResolvedExtensions(extensions, editor) {
  var _a;
  const allAttributes = getAttributesFromExtensions(extensions);
  const { nodeExtensions, markExtensions } = splitExtensions(extensions);
  const topNode = (_a = nodeExtensions.find((extension) => getExtensionField(extension, "topNode"))) == null ? void 0 : _a.name;
  const nodes = Object.fromEntries(
    nodeExtensions.map((extension) => {
      const extensionAttributes = allAttributes.filter((attribute) => attribute.type === extension.name);
      const context = {
        name: extension.name,
        options: extension.options,
        storage: extension.storage,
        editor
      };
      const extraNodeFields = extensions.reduce((fields, e) => {
        const extendNodeSchema = getExtensionField(e, "extendNodeSchema", context);
        return {
          ...fields,
          ...extendNodeSchema ? extendNodeSchema(extension) : {}
        };
      }, {});
      const schema = cleanUpSchemaItem({
        ...extraNodeFields,
        content: callOrReturn(getExtensionField(extension, "content", context)),
        marks: callOrReturn(getExtensionField(extension, "marks", context)),
        group: callOrReturn(getExtensionField(extension, "group", context)),
        inline: callOrReturn(getExtensionField(extension, "inline", context)),
        atom: callOrReturn(getExtensionField(extension, "atom", context)),
        selectable: callOrReturn(getExtensionField(extension, "selectable", context)),
        draggable: callOrReturn(getExtensionField(extension, "draggable", context)),
        code: callOrReturn(getExtensionField(extension, "code", context)),
        whitespace: callOrReturn(getExtensionField(extension, "whitespace", context)),
        linebreakReplacement: callOrReturn(
          getExtensionField(extension, "linebreakReplacement", context)
        ),
        defining: callOrReturn(getExtensionField(extension, "defining", context)),
        isolating: callOrReturn(getExtensionField(extension, "isolating", context)),
        attrs: Object.fromEntries(extensionAttributes.map(buildAttributeSpec))
      });
      const parseHTML = callOrReturn(getExtensionField(extension, "parseHTML", context));
      if (parseHTML) {
        schema.parseDOM = parseHTML.map(
          (parseRule) => injectExtensionAttributesToParseRule(parseRule, extensionAttributes)
        );
      }
      const renderHTML = getExtensionField(extension, "renderHTML", context);
      if (renderHTML) {
        schema.toDOM = (node) => renderHTML({
          node,
          HTMLAttributes: getRenderedAttributes(node, extensionAttributes)
        });
      }
      const renderText = getExtensionField(extension, "renderText", context);
      if (renderText) {
        schema.toText = renderText;
      }
      return [extension.name, schema];
    })
  );
  const marks = Object.fromEntries(
    markExtensions.map((extension) => {
      const extensionAttributes = allAttributes.filter((attribute) => attribute.type === extension.name);
      const context = {
        name: extension.name,
        options: extension.options,
        storage: extension.storage,
        editor
      };
      const extraMarkFields = extensions.reduce((fields, e) => {
        const extendMarkSchema = getExtensionField(e, "extendMarkSchema", context);
        return {
          ...fields,
          ...extendMarkSchema ? extendMarkSchema(extension) : {}
        };
      }, {});
      const schema = cleanUpSchemaItem({
        ...extraMarkFields,
        inclusive: callOrReturn(getExtensionField(extension, "inclusive", context)),
        excludes: callOrReturn(getExtensionField(extension, "excludes", context)),
        group: callOrReturn(getExtensionField(extension, "group", context)),
        spanning: callOrReturn(getExtensionField(extension, "spanning", context)),
        code: callOrReturn(getExtensionField(extension, "code", context)),
        attrs: Object.fromEntries(extensionAttributes.map(buildAttributeSpec))
      });
      const parseHTML = callOrReturn(getExtensionField(extension, "parseHTML", context));
      if (parseHTML) {
        schema.parseDOM = parseHTML.map(
          (parseRule) => injectExtensionAttributesToParseRule(parseRule, extensionAttributes)
        );
      }
      const renderHTML = getExtensionField(extension, "renderHTML", context);
      if (renderHTML) {
        schema.toDOM = (mark) => renderHTML({
          mark,
          HTMLAttributes: getRenderedAttributes(mark, extensionAttributes)
        });
      }
      return [extension.name, schema];
    })
  );
  return new Schema2({
    topNode,
    nodes,
    marks
  });
}
function findDuplicates(items) {
  const filtered = items.filter((el, index) => items.indexOf(el) !== index);
  return Array.from(new Set(filtered));
}
function sortExtensions(extensions) {
  const defaultPriority = 100;
  return extensions.sort((a, b) => {
    const priorityA = getExtensionField(a, "priority") || defaultPriority;
    const priorityB = getExtensionField(b, "priority") || defaultPriority;
    if (priorityA > priorityB) {
      return -1;
    }
    if (priorityA < priorityB) {
      return 1;
    }
    return 0;
  });
}
function resolveExtensions(extensions) {
  const resolvedExtensions = sortExtensions(flattenExtensions(extensions));
  const duplicatedNames = findDuplicates(resolvedExtensions.map((extension) => extension.name));
  if (duplicatedNames.length) {
    console.warn(
      `[tiptap warn]: Duplicate extension names found: [${duplicatedNames.map((item) => `'${item}'`).join(", ")}]. This can lead to issues.`
    );
  }
  return resolvedExtensions;
}
function getTextBetween(startNode, range, options) {
  const { from, to } = range;
  const { blockSeparator = "\n\n", textSerializers = {} } = options || {};
  let text = "";
  startNode.nodesBetween(from, to, (node, pos, parent, index) => {
    var _a;
    if (node.isBlock && pos > from) {
      text += blockSeparator;
    }
    const textSerializer = textSerializers == null ? void 0 : textSerializers[node.type.name];
    if (textSerializer) {
      if (parent) {
        text += textSerializer({
          node,
          pos,
          parent,
          index,
          range
        });
      }
      return false;
    }
    if (node.isText) {
      text += (_a = node == null ? void 0 : node.text) == null ? void 0 : _a.slice(Math.max(from, pos) - pos, to - pos);
    }
  });
  return text;
}
function getTextSerializersFromSchema(schema) {
  return Object.fromEntries(
    Object.entries(schema.nodes).filter(([, node]) => node.spec.toText).map(([name, node]) => [name, node.spec.toText])
  );
}
function removeDuplicates(array, by = JSON.stringify) {
  const seen = {};
  return array.filter((item) => {
    const key = by(item);
    return Object.prototype.hasOwnProperty.call(seen, key) ? false : seen[key] = true;
  });
}
function simplifyChangedRanges(changes) {
  const uniqueChanges = removeDuplicates(changes);
  return uniqueChanges.length === 1 ? uniqueChanges : uniqueChanges.filter((change, index) => {
    const rest = uniqueChanges.filter((_, i) => i !== index);
    return !rest.some((otherChange) => {
      return change.oldRange.from >= otherChange.oldRange.from && change.oldRange.to <= otherChange.oldRange.to && change.newRange.from >= otherChange.newRange.from && change.newRange.to <= otherChange.newRange.to;
    });
  });
}
function getChangedRanges(transform) {
  const { mapping, steps } = transform;
  const changes = [];
  mapping.maps.forEach((stepMap, index) => {
    const ranges = [];
    if (!stepMap.ranges.length) {
      const { from, to } = steps[index];
      if (from === void 0 || to === void 0) {
        return;
      }
      ranges.push({ from, to });
    } else {
      stepMap.forEach((from, to) => {
        ranges.push({ from, to });
      });
    }
    ranges.forEach(({ from, to }) => {
      const newStart = mapping.slice(index).map(from, -1);
      const newEnd = mapping.slice(index).map(to);
      const oldStart = mapping.invert().map(newStart, -1);
      const oldEnd = mapping.invert().map(newEnd);
      changes.push({
        oldRange: {
          from: oldStart,
          to: oldEnd
        },
        newRange: {
          from: newStart,
          to: newEnd
        }
      });
    });
  });
  return simplifyChangedRanges(changes);
}
function getSchemaTypeByName(name, schema) {
  return schema.nodes[name] || schema.marks[name] || null;
}
function getSplittedAttributes(extensionAttributes, typeName, attributes) {
  return Object.fromEntries(
    Object.entries(attributes).filter(([name]) => {
      const extensionAttribute = extensionAttributes.find((item) => {
        return item.type === typeName && item.name === name;
      });
      if (!extensionAttribute) {
        return false;
      }
      return extensionAttribute.attribute.keepOnSplit;
    })
  );
}
var getTextContentFromNodes = ($from, maxMatch = 500) => {
  let textBefore = "";
  const sliceEndPos = $from.parentOffset;
  $from.parent.nodesBetween(Math.max(0, sliceEndPos - maxMatch), sliceEndPos, (node, pos, parent, index) => {
    var _a, _b;
    const chunk = ((_b = (_a = node.type.spec).toText) == null ? void 0 : _b.call(_a, {
      node,
      pos,
      parent,
      index
    })) || node.textContent || "%leaf%";
    textBefore += node.isAtom && !node.isText ? chunk : chunk.slice(0, Math.max(0, sliceEndPos - pos));
  });
  return textBefore;
};
function isMarkActive(state, typeOrName, attributes = {}) {
  const { empty, ranges } = state.selection;
  const type = typeOrName ? getMarkType(typeOrName, state.schema) : null;
  if (empty) {
    return !!(state.storedMarks || state.selection.$from.marks()).filter((mark) => {
      if (!type) {
        return true;
      }
      return type.name === mark.type.name;
    }).find((mark) => objectIncludes(mark.attrs, attributes, { strict: false }));
  }
  let selectionRange = 0;
  const markRanges = [];
  ranges.forEach(({ $from, $to }) => {
    const from = $from.pos;
    const to = $to.pos;
    state.doc.nodesBetween(from, to, (node, pos) => {
      if (!node.isText && !node.marks.length) {
        return;
      }
      const relativeFrom = Math.max(from, pos);
      const relativeTo = Math.min(to, pos + node.nodeSize);
      const range2 = relativeTo - relativeFrom;
      selectionRange += range2;
      markRanges.push(
        ...node.marks.map((mark) => ({
          mark,
          from: relativeFrom,
          to: relativeTo
        }))
      );
    });
  });
  if (selectionRange === 0) {
    return false;
  }
  const matchedRange = markRanges.filter((markRange) => {
    if (!type) {
      return true;
    }
    return type.name === markRange.mark.type.name;
  }).filter((markRange) => objectIncludes(markRange.mark.attrs, attributes, { strict: false })).reduce((sum, markRange) => sum + markRange.to - markRange.from, 0);
  const excludedRange = markRanges.filter((markRange) => {
    if (!type) {
      return true;
    }
    return markRange.mark.type !== type && markRange.mark.type.excludes(type);
  }).reduce((sum, markRange) => sum + markRange.to - markRange.from, 0);
  const range = matchedRange > 0 ? matchedRange + excludedRange : matchedRange;
  return range >= selectionRange;
}
function isExtensionRulesEnabled(extension, enabled) {
  if (Array.isArray(enabled)) {
    return enabled.some((enabledExtension) => {
      const name = typeof enabledExtension === "string" ? enabledExtension : enabledExtension.name;
      return name === extension.name;
    });
  }
  return enabled;
}
function isList(name, extensions) {
  const { nodeExtensions } = splitExtensions(extensions);
  const extension = nodeExtensions.find((item) => item.name === name);
  if (!extension) {
    return false;
  }
  const context = {
    name: extension.name,
    options: extension.options,
    storage: extension.storage
  };
  const group = callOrReturn(getExtensionField(extension, "group", context));
  if (typeof group !== "string") {
    return false;
  }
  return group.split(" ").includes("list");
}
function isNodeEmpty(node, {
  checkChildren = true,
  ignoreWhitespace = false
} = {}) {
  var _a;
  if (ignoreWhitespace) {
    if (node.type.name === "hardBreak") {
      return true;
    }
    if (node.isText) {
      return /^\s*$/m.test((_a = node.text) != null ? _a : "");
    }
  }
  if (node.isText) {
    return !node.text;
  }
  if (node.isAtom || node.isLeaf) {
    return false;
  }
  if (node.content.childCount === 0) {
    return true;
  }
  if (checkChildren) {
    let isContentEmpty = true;
    node.content.forEach((childNode) => {
      if (isContentEmpty === false) {
        return;
      }
      if (!isNodeEmpty(childNode, { ignoreWhitespace, checkChildren })) {
        isContentEmpty = false;
      }
    });
    return isContentEmpty;
  }
  return false;
}
function canSetMark(state, tr, newMarkType) {
  var _a;
  const { selection } = tr;
  let cursor = null;
  if (isTextSelection(selection)) {
    cursor = selection.$cursor;
  }
  if (cursor) {
    const currentMarks = (_a = state.storedMarks) != null ? _a : cursor.marks();
    const parentAllowsMarkType = cursor.parent.type.allowsMarkType(newMarkType);
    return parentAllowsMarkType && (!!newMarkType.isInSet(currentMarks) || !currentMarks.some((mark) => mark.type.excludes(newMarkType)));
  }
  const { ranges } = selection;
  return ranges.some(({ $from, $to }) => {
    let someNodeSupportsMark = $from.depth === 0 ? state.doc.inlineContent && state.doc.type.allowsMarkType(newMarkType) : false;
    state.doc.nodesBetween($from.pos, $to.pos, (node, _pos, parent) => {
      if (someNodeSupportsMark) {
        return false;
      }
      if (node.isInline) {
        const parentAllowsMarkType = !parent || parent.type.allowsMarkType(newMarkType);
        const currentMarksAllowMarkType = !!newMarkType.isInSet(node.marks) || !node.marks.some((otherMark) => otherMark.type.excludes(newMarkType));
        someNodeSupportsMark = parentAllowsMarkType && currentMarksAllowMarkType;
      }
      return !someNodeSupportsMark;
    });
    return someNodeSupportsMark;
  });
}
var setMark = (typeOrName, attributes = {}) => ({ tr, state, dispatch }) => {
  const { selection } = tr;
  const { empty, ranges } = selection;
  const type = getMarkType(typeOrName, state.schema);
  if (dispatch) {
    if (empty) {
      const oldAttributes = getMarkAttributes(state, type);
      tr.addStoredMark(
        type.create({
          ...oldAttributes,
          ...attributes
        })
      );
    } else {
      ranges.forEach((range) => {
        const from = range.$from.pos;
        const to = range.$to.pos;
        state.doc.nodesBetween(from, to, (node, pos) => {
          const trimmedFrom = Math.max(pos, from);
          const trimmedTo = Math.min(pos + node.nodeSize, to);
          const someHasMark = node.marks.find((mark) => mark.type === type);
          if (someHasMark) {
            node.marks.forEach((mark) => {
              if (type === mark.type) {
                tr.addMark(
                  trimmedFrom,
                  trimmedTo,
                  type.create({
                    ...mark.attrs,
                    ...attributes
                  })
                );
              }
            });
          } else {
            tr.addMark(trimmedFrom, trimmedTo, type.create(attributes));
          }
        });
      });
    }
  }
  return canSetMark(state, tr, type);
};
var setMeta = (key, value) => ({ tr }) => {
  tr.setMeta(key, value);
  return true;
};
var setNode = (typeOrName, attributes = {}) => ({ state, dispatch, chain }) => {
  const type = getNodeType(typeOrName, state.schema);
  let attributesToCopy;
  if (state.selection.$anchor.sameParent(state.selection.$head)) {
    attributesToCopy = state.selection.$anchor.parent.attrs;
  }
  if (!type.isTextblock) {
    console.warn('[tiptap warn]: Currently "setNode()" only supports text block nodes.');
    return false;
  }
  return chain().command(({ commands }) => {
    const canSetBlock = setBlockType(type, { ...attributesToCopy, ...attributes })(state);
    if (canSetBlock) {
      return true;
    }
    return commands.clearNodes();
  }).command(({ state: updatedState }) => {
    return setBlockType(type, { ...attributesToCopy, ...attributes })(updatedState, dispatch);
  }).run();
};
var setNodeSelection = (position) => ({ tr, dispatch }) => {
  if (dispatch) {
    const { doc } = tr;
    const from = minMax(position, 0, doc.content.size);
    const selection = NodeSelection2.create(doc, from);
    tr.setSelection(selection);
  }
  return true;
};
var setTextDirection = (direction, position) => ({ tr, state, dispatch }) => {
  const { selection } = state;
  let from;
  let to;
  if (typeof position === "number") {
    from = position;
    to = position;
  } else if (position && "from" in position && "to" in position) {
    from = position.from;
    to = position.to;
  } else {
    from = selection.from;
    to = selection.to;
  }
  if (dispatch) {
    tr.doc.nodesBetween(from, to, (node, pos) => {
      if (node.isText) {
        return;
      }
      tr.setNodeMarkup(pos, void 0, {
        ...node.attrs,
        dir: direction
      });
    });
  }
  return true;
};
var setTextSelection = (position) => ({ tr, dispatch }) => {
  if (dispatch) {
    const { doc } = tr;
    const { from, to } = typeof position === "number" ? { from: position, to: position } : position;
    const minPos = TextSelection5.atStart(doc).from;
    const maxPos = TextSelection5.atEnd(doc).to;
    const resolvedFrom = minMax(from, minPos, maxPos);
    const resolvedEnd = minMax(to, minPos, maxPos);
    const selection = TextSelection5.create(doc, resolvedFrom, resolvedEnd);
    tr.setSelection(selection);
  }
  return true;
};
var sinkListItem = (typeOrName) => ({ state, dispatch }) => {
  const type = getNodeType(typeOrName, state.schema);
  return originalSinkListItem(type)(state, dispatch);
};
function ensureMarks(state, splittableMarks) {
  const marks = state.storedMarks || state.selection.$to.parentOffset && state.selection.$from.marks();
  if (marks) {
    const filteredMarks = marks.filter((mark) => splittableMarks == null ? void 0 : splittableMarks.includes(mark.type.name));
    state.tr.ensureMarks(filteredMarks);
  }
}
var splitBlock = ({ keepMarks = true } = {}) => ({ tr, state, dispatch, editor }) => {
  const { selection, doc } = tr;
  const { $from, $to } = selection;
  const extensionAttributes = editor.extensionManager.attributes;
  const newAttributes = getSplittedAttributes(extensionAttributes, $from.node().type.name, $from.node().attrs);
  if (selection instanceof NodeSelection3 && selection.node.isBlock) {
    if (!$from.parentOffset || !canSplit(doc, $from.pos)) {
      return false;
    }
    if (dispatch) {
      if (keepMarks) {
        ensureMarks(state, editor.extensionManager.splittableMarks);
      }
      tr.split($from.pos).scrollIntoView();
    }
    return true;
  }
  if (!$from.parent.isBlock) {
    return false;
  }
  const atEnd = $to.parentOffset === $to.parent.content.size;
  const deflt = $from.depth === 0 ? void 0 : defaultBlockAt($from.node(-1).contentMatchAt($from.indexAfter(-1)));
  let types = atEnd && deflt ? [
    {
      type: deflt,
      attrs: newAttributes
    }
  ] : void 0;
  let can = canSplit(tr.doc, tr.mapping.map($from.pos), 1, types);
  if (!types && !can && canSplit(tr.doc, tr.mapping.map($from.pos), 1, deflt ? [{ type: deflt }] : void 0)) {
    can = true;
    types = deflt ? [
      {
        type: deflt,
        attrs: newAttributes
      }
    ] : void 0;
  }
  if (dispatch) {
    if (can) {
      if (selection instanceof TextSelection6) {
        tr.deleteSelection();
      }
      tr.split(tr.mapping.map($from.pos), 1, types);
      if (deflt && !atEnd && !$from.parentOffset && $from.parent.type !== deflt) {
        const first2 = tr.mapping.map($from.before());
        const $first = tr.doc.resolve(first2);
        if ($from.node(-1).canReplaceWith($first.index(), $first.index() + 1, deflt)) {
          tr.setNodeMarkup(tr.mapping.map($from.before()), deflt);
        }
      }
    }
    if (keepMarks) {
      ensureMarks(state, editor.extensionManager.splittableMarks);
    }
    tr.scrollIntoView();
  }
  return can;
};
var splitListItem = (typeOrName, overrideAttrs = {}) => ({ tr, state, dispatch, editor }) => {
  var _a;
  const type = getNodeType(typeOrName, state.schema);
  const { $from, $to } = state.selection;
  const node = state.selection.node;
  if (node && node.isBlock || $from.depth < 2 || !$from.sameParent($to)) {
    return false;
  }
  const grandParent = $from.node(-1);
  if (grandParent.type !== type) {
    return false;
  }
  const extensionAttributes = editor.extensionManager.attributes;
  if ($from.parent.content.size === 0 && $from.node(-1).childCount === $from.indexAfter(-1)) {
    if ($from.depth === 2 || $from.node(-3).type !== type || $from.index(-2) !== $from.node(-2).childCount - 1) {
      return false;
    }
    if (dispatch) {
      let wrap = Fragment3.empty;
      const depthBefore = $from.index(-1) ? 1 : $from.index(-2) ? 2 : 3;
      for (let d = $from.depth - depthBefore; d >= $from.depth - 3; d -= 1) {
        wrap = Fragment3.from($from.node(d).copy(wrap));
      }
      const depthAfter = (
        // eslint-disable-next-line no-nested-ternary
        $from.indexAfter(-1) < $from.node(-2).childCount ? 1 : $from.indexAfter(-2) < $from.node(-3).childCount ? 2 : 3
      );
      const newNextTypeAttributes2 = {
        ...getSplittedAttributes(extensionAttributes, $from.node().type.name, $from.node().attrs),
        ...overrideAttrs
      };
      const nextType2 = ((_a = type.contentMatch.defaultType) == null ? void 0 : _a.createAndFill(newNextTypeAttributes2)) || void 0;
      wrap = wrap.append(Fragment3.from(type.createAndFill(null, nextType2) || void 0));
      const start = $from.before($from.depth - (depthBefore - 1));
      tr.replace(start, $from.after(-depthAfter), new Slice(wrap, 4 - depthBefore, 0));
      let sel = -1;
      tr.doc.nodesBetween(start, tr.doc.content.size, (n, pos) => {
        if (sel > -1) {
          return false;
        }
        if (n.isTextblock && n.content.size === 0) {
          sel = pos + 1;
        }
      });
      if (sel > -1) {
        tr.setSelection(TextSelection7.near(tr.doc.resolve(sel)));
      }
      tr.scrollIntoView();
    }
    return true;
  }
  const nextType = $to.pos === $from.end() ? grandParent.contentMatchAt(0).defaultType : null;
  const newTypeAttributes = {
    ...getSplittedAttributes(extensionAttributes, grandParent.type.name, grandParent.attrs),
    ...overrideAttrs
  };
  const newNextTypeAttributes = {
    ...getSplittedAttributes(extensionAttributes, $from.node().type.name, $from.node().attrs),
    ...overrideAttrs
  };
  tr.delete($from.pos, $to.pos);
  const types = nextType ? [
    { type, attrs: newTypeAttributes },
    { type: nextType, attrs: newNextTypeAttributes }
  ] : [{ type, attrs: newTypeAttributes }];
  if (!canSplit2(tr.doc, $from.pos, 2)) {
    return false;
  }
  if (dispatch) {
    const { selection, storedMarks } = state;
    const { splittableMarks } = editor.extensionManager;
    const marks = storedMarks || selection.$to.parentOffset && selection.$from.marks();
    tr.split($from.pos, 2, types).scrollIntoView();
    if (!marks || !dispatch) {
      return true;
    }
    const filteredMarks = marks.filter((mark) => splittableMarks.includes(mark.type.name));
    tr.ensureMarks(filteredMarks);
  }
  return true;
};
var joinListBackwards = (tr, listType) => {
  const list = findParentNode((node) => node.type === listType)(tr.selection);
  if (!list) {
    return true;
  }
  const before = tr.doc.resolve(Math.max(0, list.pos - 1)).before(list.depth);
  if (before === void 0) {
    return true;
  }
  const nodeBefore = tr.doc.nodeAt(before);
  const canJoinBackwards = list.node.type === (nodeBefore == null ? void 0 : nodeBefore.type) && canJoin(tr.doc, list.pos);
  if (!canJoinBackwards) {
    return true;
  }
  tr.join(list.pos);
  return true;
};
var joinListForwards = (tr, listType) => {
  const list = findParentNode((node) => node.type === listType)(tr.selection);
  if (!list) {
    return true;
  }
  const after = tr.doc.resolve(list.start).after(list.depth);
  if (after === void 0) {
    return true;
  }
  const nodeAfter = tr.doc.nodeAt(after);
  const canJoinForwards = list.node.type === (nodeAfter == null ? void 0 : nodeAfter.type) && canJoin(tr.doc, after);
  if (!canJoinForwards) {
    return true;
  }
  tr.join(after);
  return true;
};
var toggleList = (listTypeOrName, itemTypeOrName, keepMarks, attributes = {}) => ({ editor, tr, state, dispatch, chain, commands, can }) => {
  const { extensions, splittableMarks } = editor.extensionManager;
  const listType = getNodeType(listTypeOrName, state.schema);
  const itemType = getNodeType(itemTypeOrName, state.schema);
  const { selection, storedMarks } = state;
  const { $from, $to } = selection;
  const range = $from.blockRange($to);
  const marks = storedMarks || selection.$to.parentOffset && selection.$from.marks();
  if (!range) {
    return false;
  }
  const parentList = findParentNode((node) => isList(node.type.name, extensions))(selection);
  if (range.depth >= 1 && parentList && range.depth - parentList.depth <= 1) {
    if (parentList.node.type === listType) {
      return commands.liftListItem(itemType);
    }
    if (isList(parentList.node.type.name, extensions) && listType.validContent(parentList.node.content) && dispatch) {
      return chain().command(() => {
        tr.setNodeMarkup(parentList.pos, listType);
        return true;
      }).command(() => joinListBackwards(tr, listType)).command(() => joinListForwards(tr, listType)).run();
    }
  }
  if (!keepMarks || !marks || !dispatch) {
    return chain().command(() => {
      const canWrapInList = can().wrapInList(listType, attributes);
      if (canWrapInList) {
        return true;
      }
      return commands.clearNodes();
    }).wrapInList(listType, attributes).command(() => joinListBackwards(tr, listType)).command(() => joinListForwards(tr, listType)).run();
  }
  return chain().command(() => {
    const canWrapInList = can().wrapInList(listType, attributes);
    const filteredMarks = marks.filter((mark) => splittableMarks.includes(mark.type.name));
    tr.ensureMarks(filteredMarks);
    if (canWrapInList) {
      return true;
    }
    return commands.clearNodes();
  }).wrapInList(listType, attributes).command(() => joinListBackwards(tr, listType)).command(() => joinListForwards(tr, listType)).run();
};
var toggleMark = (typeOrName, attributes = {}, options = {}) => ({ state, commands }) => {
  const { extendEmptyMarkRange = false } = options;
  const type = getMarkType(typeOrName, state.schema);
  const isActive2 = isMarkActive(state, type, attributes);
  if (isActive2) {
    return commands.unsetMark(type, { extendEmptyMarkRange });
  }
  return commands.setMark(type, attributes);
};
var toggleNode = (typeOrName, toggleTypeOrName, attributes = {}) => ({ state, commands }) => {
  const type = getNodeType(typeOrName, state.schema);
  const toggleType = getNodeType(toggleTypeOrName, state.schema);
  const isActive2 = isNodeActive(state, type, attributes);
  let attributesToCopy;
  if (state.selection.$anchor.sameParent(state.selection.$head)) {
    attributesToCopy = state.selection.$anchor.parent.attrs;
  }
  if (isActive2) {
    return commands.setNode(toggleType, attributesToCopy);
  }
  return commands.setNode(type, { ...attributesToCopy, ...attributes });
};
var toggleWrap = (typeOrName, attributes = {}) => ({ state, commands }) => {
  const type = getNodeType(typeOrName, state.schema);
  const isActive2 = isNodeActive(state, type, attributes);
  if (isActive2) {
    return commands.lift(type);
  }
  return commands.wrapIn(type, attributes);
};
var undoInputRule = () => ({ state, dispatch }) => {
  const plugins = state.plugins;
  for (let i = 0; i < plugins.length; i += 1) {
    const plugin = plugins[i];
    let undoable;
    if (plugin.spec.isInputRules && (undoable = plugin.getState(state))) {
      if (dispatch) {
        const tr = state.tr;
        const toUndo = undoable.transform;
        for (let j = toUndo.steps.length - 1; j >= 0; j -= 1) {
          tr.step(toUndo.steps[j].invert(toUndo.docs[j]));
        }
        if (undoable.text) {
          const marks = tr.doc.resolve(undoable.from).marks();
          tr.replaceWith(undoable.from, undoable.to, state.schema.text(undoable.text, marks));
        } else {
          tr.delete(undoable.from, undoable.to);
        }
      }
      return true;
    }
  }
  return false;
};
var unsetAllMarks = () => ({ tr, dispatch }) => {
  const { selection } = tr;
  const { empty, ranges } = selection;
  if (empty) {
    return true;
  }
  if (dispatch) {
    ranges.forEach((range) => {
      tr.removeMark(range.$from.pos, range.$to.pos);
    });
  }
  return true;
};
var unsetMark = (typeOrName, options = {}) => ({ tr, state, dispatch }) => {
  var _a;
  const { extendEmptyMarkRange = false } = options;
  const { selection } = tr;
  const type = getMarkType(typeOrName, state.schema);
  const { $from, empty, ranges } = selection;
  if (!dispatch) {
    return true;
  }
  if (empty && extendEmptyMarkRange) {
    let { from, to } = selection;
    const attrs = (_a = $from.marks().find((mark) => mark.type === type)) == null ? void 0 : _a.attrs;
    const range = getMarkRange($from, type, attrs);
    if (range) {
      from = range.from;
      to = range.to;
    }
    tr.removeMark(from, to, type);
  } else {
    ranges.forEach((range) => {
      tr.removeMark(range.$from.pos, range.$to.pos, type);
    });
  }
  tr.removeStoredMark(type);
  return true;
};
var unsetTextDirection = (position) => ({ tr, state, dispatch }) => {
  const { selection } = state;
  let from;
  let to;
  if (typeof position === "number") {
    from = position;
    to = position;
  } else if (position && "from" in position && "to" in position) {
    from = position.from;
    to = position.to;
  } else {
    from = selection.from;
    to = selection.to;
  }
  if (dispatch) {
    tr.doc.nodesBetween(from, to, (node, pos) => {
      if (node.isText) {
        return;
      }
      const newAttrs = { ...node.attrs };
      delete newAttrs.dir;
      tr.setNodeMarkup(pos, void 0, newAttrs);
    });
  }
  return true;
};
var updateAttributes = (typeOrName, attributes = {}) => ({ tr, state, dispatch }) => {
  let nodeType = null;
  let markType = null;
  const schemaType = getSchemaTypeNameByName(
    typeof typeOrName === "string" ? typeOrName : typeOrName.name,
    state.schema
  );
  if (!schemaType) {
    return false;
  }
  if (schemaType === "node") {
    nodeType = getNodeType(typeOrName, state.schema);
  }
  if (schemaType === "mark") {
    markType = getMarkType(typeOrName, state.schema);
  }
  let canUpdate = false;
  tr.selection.ranges.forEach((range) => {
    const from = range.$from.pos;
    const to = range.$to.pos;
    let lastPos;
    let lastNode;
    let trimmedFrom;
    let trimmedTo;
    if (tr.selection.empty) {
      state.doc.nodesBetween(from, to, (node, pos) => {
        if (nodeType && nodeType === node.type) {
          canUpdate = true;
          trimmedFrom = Math.max(pos, from);
          trimmedTo = Math.min(pos + node.nodeSize, to);
          lastPos = pos;
          lastNode = node;
        }
      });
    } else {
      state.doc.nodesBetween(from, to, (node, pos) => {
        if (pos < from && nodeType && nodeType === node.type) {
          canUpdate = true;
          trimmedFrom = Math.max(pos, from);
          trimmedTo = Math.min(pos + node.nodeSize, to);
          lastPos = pos;
          lastNode = node;
        }
        if (pos >= from && pos <= to) {
          if (nodeType && nodeType === node.type) {
            canUpdate = true;
            if (dispatch) {
              tr.setNodeMarkup(pos, void 0, {
                ...node.attrs,
                ...attributes
              });
            }
          }
          if (markType && node.marks.length) {
            node.marks.forEach((mark) => {
              if (markType === mark.type) {
                canUpdate = true;
                if (dispatch) {
                  const trimmedFrom2 = Math.max(pos, from);
                  const trimmedTo2 = Math.min(pos + node.nodeSize, to);
                  tr.addMark(
                    trimmedFrom2,
                    trimmedTo2,
                    markType.create({
                      ...mark.attrs,
                      ...attributes
                    })
                  );
                }
              }
            });
          }
        }
      });
    }
    if (lastNode) {
      if (lastPos !== void 0 && dispatch) {
        tr.setNodeMarkup(lastPos, void 0, {
          ...lastNode.attrs,
          ...attributes
        });
      }
      if (markType && lastNode.marks.length) {
        lastNode.marks.forEach((mark) => {
          if (markType === mark.type && dispatch) {
            tr.addMark(
              trimmedFrom,
              trimmedTo,
              markType.create({
                ...mark.attrs,
                ...attributes
              })
            );
          }
        });
      }
    }
  });
  return canUpdate;
};
var wrapIn = (typeOrName, attributes = {}) => ({ state, dispatch }) => {
  const type = getNodeType(typeOrName, state.schema);
  return originalWrapIn(type, attributes)(state, dispatch);
};
var wrapInList = (typeOrName, attributes = {}) => ({ state, dispatch }) => {
  const type = getNodeType(typeOrName, state.schema);
  return originalWrapInList(type, attributes)(state, dispatch);
};
var inputRuleMatcherHandler = (text, find) => {
  if (isRegExp(find)) {
    return find.exec(text);
  }
  const inputRuleMatch = find(text);
  if (!inputRuleMatch) {
    return null;
  }
  const result = [inputRuleMatch.text];
  result.index = inputRuleMatch.index;
  result.input = text;
  result.data = inputRuleMatch.data;
  if (inputRuleMatch.replaceWith) {
    if (!inputRuleMatch.text.includes(inputRuleMatch.replaceWith)) {
      console.warn('[tiptap warn]: "inputRuleMatch.replaceWith" must be part of "inputRuleMatch.text".');
    }
    result.push(inputRuleMatch.replaceWith);
  }
  return result;
};
function run(config) {
  var _a;
  const { editor, from, to, text, rules, plugin } = config;
  const { view } = editor;
  if (view.composing) {
    return false;
  }
  const $from = view.state.doc.resolve(from);
  if (
    // check for code node
    $from.parent.type.spec.code || // check for code mark
    !!((_a = $from.nodeBefore || $from.nodeAfter) == null ? void 0 : _a.marks.find((mark) => mark.type.spec.code))
  ) {
    return false;
  }
  let matched = false;
  const textBefore = getTextContentFromNodes($from) + text;
  rules.forEach((rule) => {
    if (matched) {
      return;
    }
    const match = inputRuleMatcherHandler(textBefore, rule.find);
    if (!match) {
      return;
    }
    const tr = view.state.tr;
    const state = createChainableState({
      state: view.state,
      transaction: tr
    });
    const range = {
      from: from - (match[0].length - text.length),
      to
    };
    const { commands, chain, can } = new CommandManager({
      editor,
      state
    });
    const handler = rule.handler({
      state,
      range,
      match,
      commands,
      chain,
      can
    });
    if (handler === null || !tr.steps.length) {
      return;
    }
    if (rule.undoable) {
      tr.setMeta(plugin, {
        transform: tr,
        from,
        to,
        text
      });
    }
    view.dispatch(tr);
    matched = true;
  });
  return matched;
}
function inputRulesPlugin(props) {
  const { editor, rules } = props;
  const plugin = new Plugin({
    state: {
      init() {
        return null;
      },
      apply(tr, prev, state) {
        const stored = tr.getMeta(plugin);
        if (stored) {
          return stored;
        }
        const simulatedInputMeta = tr.getMeta("applyInputRules");
        const isSimulatedInput = !!simulatedInputMeta;
        if (isSimulatedInput) {
          setTimeout(() => {
            let { text } = simulatedInputMeta;
            if (typeof text === "string") {
              text = text;
            } else {
              text = getHTMLFromFragment(Fragment4.from(text), state.schema);
            }
            const { from } = simulatedInputMeta;
            const to = from + text.length;
            run({
              editor,
              from,
              to,
              text,
              rules,
              plugin
            });
          });
        }
        return tr.selectionSet || tr.docChanged ? null : prev;
      }
    },
    props: {
      handleTextInput(view, from, to, text) {
        return run({
          editor,
          from,
          to,
          text,
          rules,
          plugin
        });
      },
      handleDOMEvents: {
        compositionend: (view) => {
          setTimeout(() => {
            const { $cursor } = view.state.selection;
            if ($cursor) {
              run({
                editor,
                from: $cursor.pos,
                to: $cursor.pos,
                text: "",
                rules,
                plugin
              });
            }
          });
          return false;
        }
      },
      // add support for input rules to trigger on enter
      // this is useful for example for code blocks
      handleKeyDown(view, event) {
        if (event.key !== "Enter") {
          return false;
        }
        const { $cursor } = view.state.selection;
        if ($cursor) {
          return run({
            editor,
            from: $cursor.pos,
            to: $cursor.pos,
            text: "\n",
            rules,
            plugin
          });
        }
        return false;
      }
    },
    // @ts-ignore
    isInputRules: true
  });
  return plugin;
}
function getType(value) {
  return Object.prototype.toString.call(value).slice(8, -1);
}
function isPlainObject(value) {
  if (getType(value) !== "Object") {
    return false;
  }
  return value.constructor === Object && Object.getPrototypeOf(value) === Object.prototype;
}
function mergeDeep(target, source) {
  const output = { ...target };
  if (isPlainObject(target) && isPlainObject(source)) {
    Object.keys(source).forEach((key) => {
      if (isPlainObject(source[key]) && isPlainObject(target[key])) {
        output[key] = mergeDeep(target[key], source[key]);
      } else {
        output[key] = source[key];
      }
    });
  }
  return output;
}
var Extendable = class {
  constructor(config = {}) {
    this.type = "extendable";
    this.parent = null;
    this.child = null;
    this.name = "";
    this.config = {
      name: this.name
    };
    this.config = {
      ...this.config,
      ...config
    };
    this.name = this.config.name;
  }
  get options() {
    return {
      ...callOrReturn(
        getExtensionField(this, "addOptions", {
          name: this.name
        })
      ) || {}
    };
  }
  get storage() {
    return {
      ...callOrReturn(
        getExtensionField(this, "addStorage", {
          name: this.name,
          options: this.options
        })
      ) || {}
    };
  }
  configure(options = {}) {
    const extension = this.extend({
      ...this.config,
      addOptions: () => {
        return mergeDeep(this.options, options);
      }
    });
    extension.name = this.name;
    extension.parent = this.parent;
    return extension;
  }
  extend(extendedConfig = {}) {
    const extension = new this.constructor({ ...this.config, ...extendedConfig });
    extension.parent = this;
    this.child = extension;
    extension.name = "name" in extendedConfig ? extendedConfig.name : extension.parent.name;
    return extension;
  }
};
var Mark = class _Mark extends Extendable {
  constructor() {
    super(...arguments);
    this.type = "mark";
  }
  /**
   * Create a new Mark instance
   * @param config - Mark configuration object or a function that returns a configuration object
   */
  static create(config = {}) {
    const resolvedConfig = typeof config === "function" ? config() : config;
    return new _Mark(resolvedConfig);
  }
  static handleExit({ editor, mark }) {
    const { tr } = editor.state;
    const currentPos = editor.state.selection.$from;
    const isAtEnd = currentPos.pos === currentPos.end();
    if (isAtEnd) {
      const currentMarks = currentPos.marks();
      const isInMark = !!currentMarks.find((m) => (m == null ? void 0 : m.type.name) === mark.name);
      if (!isInMark) {
        return false;
      }
      const removeMark = currentMarks.find((m) => (m == null ? void 0 : m.type.name) === mark.name);
      if (removeMark) {
        tr.removeStoredMark(removeMark);
      }
      tr.insertText(" ", currentPos.pos);
      editor.view.dispatch(tr);
      return true;
    }
    return false;
  }
  configure(options) {
    return super.configure(options);
  }
  extend(extendedConfig) {
    const resolvedConfig = typeof extendedConfig === "function" ? extendedConfig() : extendedConfig;
    return super.extend(resolvedConfig);
  }
};
function isNumber(value) {
  return typeof value === "number";
}
var pasteRuleMatcherHandler = (text, find, event) => {
  if (isRegExp(find)) {
    return [...text.matchAll(find)];
  }
  const matches = find(text, event);
  if (!matches) {
    return [];
  }
  return matches.map((pasteRuleMatch) => {
    const result = [pasteRuleMatch.text];
    result.index = pasteRuleMatch.index;
    result.input = text;
    result.data = pasteRuleMatch.data;
    if (pasteRuleMatch.replaceWith) {
      if (!pasteRuleMatch.text.includes(pasteRuleMatch.replaceWith)) {
        console.warn('[tiptap warn]: "pasteRuleMatch.replaceWith" must be part of "pasteRuleMatch.text".');
      }
      result.push(pasteRuleMatch.replaceWith);
    }
    return result;
  });
};
function run2(config) {
  const { editor, state, from, to, rule, pasteEvent, dropEvent } = config;
  const { commands, chain, can } = new CommandManager({
    editor,
    state
  });
  const handlers = [];
  state.doc.nodesBetween(from, to, (node, pos) => {
    var _a, _b, _c, _d, _e;
    if (((_b = (_a = node.type) == null ? void 0 : _a.spec) == null ? void 0 : _b.code) || !(node.isText || node.isTextblock || node.isInline)) {
      return;
    }
    const contentSize = (_e = (_d = (_c = node.content) == null ? void 0 : _c.size) != null ? _d : node.nodeSize) != null ? _e : 0;
    const resolvedFrom = Math.max(from, pos);
    const resolvedTo = Math.min(to, pos + contentSize);
    if (resolvedFrom >= resolvedTo) {
      return;
    }
    const textToMatch = node.isText ? node.text || "" : node.textBetween(resolvedFrom - pos, resolvedTo - pos, void 0, "\uFFFC");
    const matches = pasteRuleMatcherHandler(textToMatch, rule.find, pasteEvent);
    matches.forEach((match) => {
      if (match.index === void 0) {
        return;
      }
      const start = resolvedFrom + match.index + 1;
      const end = start + match[0].length;
      const range = {
        from: state.tr.mapping.map(start),
        to: state.tr.mapping.map(end)
      };
      const handler = rule.handler({
        state,
        range,
        match,
        commands,
        chain,
        can,
        pasteEvent,
        dropEvent
      });
      handlers.push(handler);
    });
  });
  const success = handlers.every((handler) => handler !== null);
  return success;
}
var tiptapDragFromOtherEditor = null;
var createClipboardPasteEvent = (text) => {
  var _a;
  const event = new ClipboardEvent("paste", {
    clipboardData: new DataTransfer()
  });
  (_a = event.clipboardData) == null ? void 0 : _a.setData("text/html", text);
  return event;
};
function pasteRulesPlugin(props) {
  const { editor, rules } = props;
  let dragSourceElement = null;
  let isPastedFromProseMirror = false;
  let isDroppedFromProseMirror = false;
  let pasteEvent = typeof ClipboardEvent !== "undefined" ? new ClipboardEvent("paste") : null;
  let dropEvent;
  try {
    dropEvent = typeof DragEvent !== "undefined" ? new DragEvent("drop") : null;
  } catch {
    dropEvent = null;
  }
  const processEvent = ({
    state,
    from,
    to,
    rule,
    pasteEvt
  }) => {
    const tr = state.tr;
    const chainableState = createChainableState({
      state,
      transaction: tr
    });
    const handler = run2({
      editor,
      state: chainableState,
      from: Math.max(from - 1, 0),
      to: to.b - 1,
      rule,
      pasteEvent: pasteEvt,
      dropEvent
    });
    if (!handler || !tr.steps.length) {
      return;
    }
    try {
      dropEvent = typeof DragEvent !== "undefined" ? new DragEvent("drop") : null;
    } catch {
      dropEvent = null;
    }
    pasteEvent = typeof ClipboardEvent !== "undefined" ? new ClipboardEvent("paste") : null;
    return tr;
  };
  const plugins = rules.map((rule) => {
    return new Plugin2({
      // we register a global drag handler to track the current drag source element
      view(view) {
        const handleDragstart = (event) => {
          var _a;
          dragSourceElement = ((_a = view.dom.parentElement) == null ? void 0 : _a.contains(event.target)) ? view.dom.parentElement : null;
          if (dragSourceElement) {
            tiptapDragFromOtherEditor = editor;
          }
        };
        const handleDragend = () => {
          if (tiptapDragFromOtherEditor) {
            tiptapDragFromOtherEditor = null;
          }
        };
        window.addEventListener("dragstart", handleDragstart);
        window.addEventListener("dragend", handleDragend);
        return {
          destroy() {
            window.removeEventListener("dragstart", handleDragstart);
            window.removeEventListener("dragend", handleDragend);
          }
        };
      },
      props: {
        handleDOMEvents: {
          drop: (view, event) => {
            isDroppedFromProseMirror = dragSourceElement === view.dom.parentElement;
            dropEvent = event;
            if (!isDroppedFromProseMirror) {
              const dragFromOtherEditor = tiptapDragFromOtherEditor;
              if (dragFromOtherEditor == null ? void 0 : dragFromOtherEditor.isEditable) {
                setTimeout(() => {
                  const selection = dragFromOtherEditor.state.selection;
                  if (selection) {
                    dragFromOtherEditor.commands.deleteRange({ from: selection.from, to: selection.to });
                  }
                }, 10);
              }
            }
            return false;
          },
          paste: (_view, event) => {
            var _a;
            const html = (_a = event.clipboardData) == null ? void 0 : _a.getData("text/html");
            pasteEvent = event;
            isPastedFromProseMirror = !!(html == null ? void 0 : html.includes("data-pm-slice"));
            return false;
          }
        }
      },
      appendTransaction: (transactions, oldState, state) => {
        const transaction = transactions[0];
        const isPaste = transaction.getMeta("uiEvent") === "paste" && !isPastedFromProseMirror;
        const isDrop = transaction.getMeta("uiEvent") === "drop" && !isDroppedFromProseMirror;
        const simulatedPasteMeta = transaction.getMeta("applyPasteRules");
        const isSimulatedPaste = !!simulatedPasteMeta;
        if (!isPaste && !isDrop && !isSimulatedPaste) {
          return;
        }
        if (isSimulatedPaste) {
          let { text } = simulatedPasteMeta;
          if (typeof text === "string") {
            text = text;
          } else {
            text = getHTMLFromFragment(Fragment5.from(text), state.schema);
          }
          const { from: from2 } = simulatedPasteMeta;
          const to2 = from2 + text.length;
          const pasteEvt = createClipboardPasteEvent(text);
          return processEvent({
            rule,
            state,
            from: from2,
            to: { b: to2 },
            pasteEvt
          });
        }
        const from = oldState.doc.content.findDiffStart(state.doc.content);
        const to = oldState.doc.content.findDiffEnd(state.doc.content);
        if (!isNumber(from) || !to || from === to.b) {
          return;
        }
        return processEvent({
          rule,
          state,
          from,
          to,
          pasteEvt: pasteEvent
        });
      }
    });
  });
  return plugins;
}
var ExtensionManager = class {
  constructor(extensions, editor) {
    this.splittableMarks = [];
    this.editor = editor;
    this.baseExtensions = extensions;
    this.extensions = resolveExtensions(extensions);
    this.schema = getSchemaByResolvedExtensions(this.extensions, editor);
    this.setupExtensions();
  }
  /**
   * Get all commands from the extensions.
   * @returns An object with all commands where the key is the command name and the value is the command function
   */
  get commands() {
    return this.extensions.reduce((commands, extension) => {
      const context = {
        name: extension.name,
        options: extension.options,
        storage: this.editor.extensionStorage[extension.name],
        editor: this.editor,
        type: getSchemaTypeByName(extension.name, this.schema)
      };
      const addCommands = getExtensionField(extension, "addCommands", context);
      if (!addCommands) {
        return commands;
      }
      return {
        ...commands,
        ...addCommands()
      };
    }, {});
  }
  /**
   * Get all registered Prosemirror plugins from the extensions.
   * @returns An array of Prosemirror plugins
   */
  get plugins() {
    const { editor } = this;
    const extensions = sortExtensions([...this.extensions].reverse());
    const allPlugins = extensions.flatMap((extension) => {
      const context = {
        name: extension.name,
        options: extension.options,
        storage: this.editor.extensionStorage[extension.name],
        editor,
        type: getSchemaTypeByName(extension.name, this.schema)
      };
      const plugins = [];
      const addKeyboardShortcuts = getExtensionField(
        extension,
        "addKeyboardShortcuts",
        context
      );
      let defaultBindings = {};
      if (extension.type === "mark" && getExtensionField(extension, "exitable", context)) {
        defaultBindings.ArrowRight = () => Mark.handleExit({ editor, mark: extension });
      }
      if (addKeyboardShortcuts) {
        const bindings = Object.fromEntries(
          Object.entries(addKeyboardShortcuts()).map(([shortcut, method]) => {
            return [shortcut, () => method({ editor })];
          })
        );
        defaultBindings = { ...defaultBindings, ...bindings };
      }
      const keyMapPlugin = keymap(defaultBindings);
      plugins.push(keyMapPlugin);
      const addInputRules = getExtensionField(extension, "addInputRules", context);
      if (isExtensionRulesEnabled(extension, editor.options.enableInputRules) && addInputRules) {
        const rules = addInputRules();
        if (rules && rules.length) {
          const inputResult = inputRulesPlugin({
            editor,
            rules
          });
          const inputPlugins = Array.isArray(inputResult) ? inputResult : [inputResult];
          plugins.push(...inputPlugins);
        }
      }
      const addPasteRules = getExtensionField(extension, "addPasteRules", context);
      if (isExtensionRulesEnabled(extension, editor.options.enablePasteRules) && addPasteRules) {
        const rules = addPasteRules();
        if (rules && rules.length) {
          const pasteRules = pasteRulesPlugin({ editor, rules });
          plugins.push(...pasteRules);
        }
      }
      const addProseMirrorPlugins = getExtensionField(
        extension,
        "addProseMirrorPlugins",
        context
      );
      if (addProseMirrorPlugins) {
        const proseMirrorPlugins = addProseMirrorPlugins();
        plugins.push(...proseMirrorPlugins);
      }
      return plugins;
    });
    return allPlugins;
  }
  /**
   * Get all attributes from the extensions.
   * @returns An array of attributes
   */
  get attributes() {
    return getAttributesFromExtensions(this.extensions);
  }
  /**
   * Get all node views from the extensions.
   * @returns An object with all node views where the key is the node name and the value is the node view function
   */
  get nodeViews() {
    const { editor } = this;
    const { nodeExtensions } = splitExtensions(this.extensions);
    return Object.fromEntries(
      nodeExtensions.filter((extension) => !!getExtensionField(extension, "addNodeView")).map((extension) => {
        const extensionAttributes = this.attributes.filter((attribute) => attribute.type === extension.name);
        const context = {
          name: extension.name,
          options: extension.options,
          storage: this.editor.extensionStorage[extension.name],
          editor,
          type: getNodeType(extension.name, this.schema)
        };
        const addNodeView = getExtensionField(extension, "addNodeView", context);
        if (!addNodeView) {
          return [];
        }
        const nodeViewResult = addNodeView();
        if (!nodeViewResult) {
          return [];
        }
        const nodeview = (node, view, getPos, decorations, innerDecorations) => {
          const HTMLAttributes = getRenderedAttributes(node, extensionAttributes);
          return nodeViewResult({
            // pass-through
            node,
            view,
            getPos,
            decorations,
            innerDecorations,
            // tiptap-specific
            editor,
            extension,
            HTMLAttributes
          });
        };
        return [extension.name, nodeview];
      })
    );
  }
  /**
   * Get the composed dispatchTransaction function from all extensions.
   * @param baseDispatch The base dispatch function (e.g. from the editor or user props)
   * @returns A composed dispatch function
   */
  dispatchTransaction(baseDispatch) {
    const { editor } = this;
    const extensions = sortExtensions([...this.extensions].reverse());
    return extensions.reduceRight((next, extension) => {
      const context = {
        name: extension.name,
        options: extension.options,
        storage: this.editor.extensionStorage[extension.name],
        editor,
        type: getSchemaTypeByName(extension.name, this.schema)
      };
      const dispatchTransaction = getExtensionField(
        extension,
        "dispatchTransaction",
        context
      );
      if (!dispatchTransaction) {
        return next;
      }
      return (transaction) => {
        dispatchTransaction.call(context, { transaction, next });
      };
    }, baseDispatch);
  }
  get markViews() {
    const { editor } = this;
    const { markExtensions } = splitExtensions(this.extensions);
    return Object.fromEntries(
      markExtensions.filter((extension) => !!getExtensionField(extension, "addMarkView")).map((extension) => {
        const extensionAttributes = this.attributes.filter((attribute) => attribute.type === extension.name);
        const context = {
          name: extension.name,
          options: extension.options,
          storage: this.editor.extensionStorage[extension.name],
          editor,
          type: getMarkType(extension.name, this.schema)
        };
        const addMarkView = getExtensionField(extension, "addMarkView", context);
        if (!addMarkView) {
          return [];
        }
        const markView = (mark, view, inline) => {
          const HTMLAttributes = getRenderedAttributes(mark, extensionAttributes);
          return addMarkView()({
            // pass-through
            mark,
            view,
            inline,
            // tiptap-specific
            editor,
            extension,
            HTMLAttributes,
            updateAttributes: (attrs) => {
              updateMarkViewAttributes(mark, editor, attrs);
            }
          });
        };
        return [extension.name, markView];
      })
    );
  }
  /**
   * Go through all extensions, create extension storages & setup marks
   * & bind editor event listener.
   */
  setupExtensions() {
    const extensions = this.extensions;
    this.editor.extensionStorage = Object.fromEntries(
      extensions.map((extension) => [extension.name, extension.storage])
    );
    extensions.forEach((extension) => {
      var _a;
      const context = {
        name: extension.name,
        options: extension.options,
        storage: this.editor.extensionStorage[extension.name],
        editor: this.editor,
        type: getSchemaTypeByName(extension.name, this.schema)
      };
      if (extension.type === "mark") {
        const keepOnSplit = (_a = callOrReturn(getExtensionField(extension, "keepOnSplit", context))) != null ? _a : true;
        if (keepOnSplit) {
          this.splittableMarks.push(extension.name);
        }
      }
      const onBeforeCreate = getExtensionField(extension, "onBeforeCreate", context);
      const onCreate = getExtensionField(extension, "onCreate", context);
      const onUpdate = getExtensionField(extension, "onUpdate", context);
      const onSelectionUpdate = getExtensionField(
        extension,
        "onSelectionUpdate",
        context
      );
      const onTransaction = getExtensionField(extension, "onTransaction", context);
      const onFocus = getExtensionField(extension, "onFocus", context);
      const onBlur = getExtensionField(extension, "onBlur", context);
      const onDestroy = getExtensionField(extension, "onDestroy", context);
      if (onBeforeCreate) {
        this.editor.on("beforeCreate", onBeforeCreate);
      }
      if (onCreate) {
        this.editor.on("create", onCreate);
      }
      if (onUpdate) {
        this.editor.on("update", onUpdate);
      }
      if (onSelectionUpdate) {
        this.editor.on("selectionUpdate", onSelectionUpdate);
      }
      if (onTransaction) {
        this.editor.on("transaction", onTransaction);
      }
      if (onFocus) {
        this.editor.on("focus", onFocus);
      }
      if (onBlur) {
        this.editor.on("blur", onBlur);
      }
      if (onDestroy) {
        this.editor.on("destroy", onDestroy);
      }
    });
  }
};
ExtensionManager.resolve = resolveExtensions;
ExtensionManager.sort = sortExtensions;
ExtensionManager.flatten = flattenExtensions;
var extensions_exports = {};
__export2(extensions_exports, {
  ClipboardTextSerializer: () => ClipboardTextSerializer,
  Commands: () => Commands,
  Delete: () => Delete,
  Drop: () => Drop,
  Editable: () => Editable,
  FocusEvents: () => FocusEvents,
  Keymap: () => Keymap,
  Paste: () => Paste,
  Tabindex: () => Tabindex,
  TextDirection: () => TextDirection,
  focusEventsPluginKey: () => focusEventsPluginKey
});
var Extension = class _Extension extends Extendable {
  constructor() {
    super(...arguments);
    this.type = "extension";
  }
  /**
   * Create a new Extension instance
   * @param config - Extension configuration object or a function that returns a configuration object
   */
  static create(config = {}) {
    const resolvedConfig = typeof config === "function" ? config() : config;
    return new _Extension(resolvedConfig);
  }
  configure(options) {
    return super.configure(options);
  }
  extend(extendedConfig) {
    const resolvedConfig = typeof extendedConfig === "function" ? extendedConfig() : extendedConfig;
    return super.extend(resolvedConfig);
  }
};
var ClipboardTextSerializer = Extension.create({
  name: "clipboardTextSerializer",
  addOptions() {
    return {
      blockSeparator: void 0
    };
  },
  addProseMirrorPlugins() {
    return [
      new Plugin3({
        key: new PluginKey("clipboardTextSerializer"),
        props: {
          clipboardTextSerializer: () => {
            const { editor } = this;
            const { state, schema } = editor;
            const { doc, selection } = state;
            const { ranges } = selection;
            const from = Math.min(...ranges.map((range2) => range2.$from.pos));
            const to = Math.max(...ranges.map((range2) => range2.$to.pos));
            const textSerializers = getTextSerializersFromSchema(schema);
            const range = { from, to };
            return getTextBetween(doc, range, {
              ...this.options.blockSeparator !== void 0 ? { blockSeparator: this.options.blockSeparator } : {},
              textSerializers
            });
          }
        }
      })
    ];
  }
});
var Commands = Extension.create({
  name: "commands",
  addCommands() {
    return {
      ...commands_exports
    };
  }
});
var Delete = Extension.create({
  name: "delete",
  onUpdate({ transaction, appendedTransactions }) {
    var _a, _b, _c;
    const callback = () => {
      var _a2, _b2, _c2, _d;
      if ((_d = (_c2 = (_b2 = (_a2 = this.editor.options.coreExtensionOptions) == null ? void 0 : _a2.delete) == null ? void 0 : _b2.filterTransaction) == null ? void 0 : _c2.call(_b2, transaction)) != null ? _d : transaction.getMeta("y-sync$")) {
        return;
      }
      const nextTransaction = combineTransactionSteps(transaction.before, [transaction, ...appendedTransactions]);
      const changes = getChangedRanges(nextTransaction);
      changes.forEach((change) => {
        if (nextTransaction.mapping.mapResult(change.oldRange.from).deletedAfter && nextTransaction.mapping.mapResult(change.oldRange.to).deletedBefore) {
          nextTransaction.before.nodesBetween(change.oldRange.from, change.oldRange.to, (node, from) => {
            const to = from + node.nodeSize - 2;
            const isFullyWithinRange = change.oldRange.from <= from && to <= change.oldRange.to;
            this.editor.emit("delete", {
              type: "node",
              node,
              from,
              to,
              newFrom: nextTransaction.mapping.map(from),
              newTo: nextTransaction.mapping.map(to),
              deletedRange: change.oldRange,
              newRange: change.newRange,
              partial: !isFullyWithinRange,
              editor: this.editor,
              transaction,
              combinedTransform: nextTransaction
            });
          });
        }
      });
      const mapping = nextTransaction.mapping;
      nextTransaction.steps.forEach((step, index) => {
        var _a3, _b3;
        if (step instanceof RemoveMarkStep) {
          const newStart = mapping.slice(index).map(step.from, -1);
          const newEnd = mapping.slice(index).map(step.to);
          const oldStart = mapping.invert().map(newStart, -1);
          const oldEnd = mapping.invert().map(newEnd);
          const foundBeforeMark = (_a3 = nextTransaction.doc.nodeAt(newStart - 1)) == null ? void 0 : _a3.marks.some((mark) => mark.eq(step.mark));
          const foundAfterMark = (_b3 = nextTransaction.doc.nodeAt(newEnd)) == null ? void 0 : _b3.marks.some((mark) => mark.eq(step.mark));
          this.editor.emit("delete", {
            type: "mark",
            mark: step.mark,
            from: step.from,
            to: step.to,
            deletedRange: {
              from: oldStart,
              to: oldEnd
            },
            newRange: {
              from: newStart,
              to: newEnd
            },
            partial: Boolean(foundAfterMark || foundBeforeMark),
            editor: this.editor,
            transaction,
            combinedTransform: nextTransaction
          });
        }
      });
    };
    if ((_c = (_b = (_a = this.editor.options.coreExtensionOptions) == null ? void 0 : _a.delete) == null ? void 0 : _b.async) != null ? _c : true) {
      setTimeout(callback, 0);
    } else {
      callback();
    }
  }
});
var Drop = Extension.create({
  name: "drop",
  addProseMirrorPlugins() {
    return [
      new Plugin4({
        key: new PluginKey2("tiptapDrop"),
        props: {
          handleDrop: (_, e, slice, moved) => {
            this.editor.emit("drop", {
              editor: this.editor,
              event: e,
              slice,
              moved
            });
          }
        }
      })
    ];
  }
});
var Editable = Extension.create({
  name: "editable",
  addProseMirrorPlugins() {
    return [
      new Plugin5({
        key: new PluginKey3("editable"),
        props: {
          editable: () => this.editor.options.editable
        }
      })
    ];
  }
});
var focusEventsPluginKey = new PluginKey4("focusEvents");
var FocusEvents = Extension.create({
  name: "focusEvents",
  addProseMirrorPlugins() {
    const { editor } = this;
    return [
      new Plugin6({
        key: focusEventsPluginKey,
        props: {
          handleDOMEvents: {
            focus: (view, event) => {
              editor.isFocused = true;
              const transaction = editor.state.tr.setMeta("focus", { event }).setMeta("addToHistory", false);
              view.dispatch(transaction);
              return false;
            },
            blur: (view, event) => {
              editor.isFocused = false;
              const transaction = editor.state.tr.setMeta("blur", { event }).setMeta("addToHistory", false);
              view.dispatch(transaction);
              return false;
            }
          }
        }
      })
    ];
  }
});
var Keymap = Extension.create({
  name: "keymap",
  addKeyboardShortcuts() {
    const handleBackspace = () => this.editor.commands.first(({ commands }) => [
      () => commands.undoInputRule(),
      // maybe convert first text block node to default node
      () => commands.command(({ tr }) => {
        const { selection, doc } = tr;
        const { empty, $anchor } = selection;
        const { pos, parent } = $anchor;
        const $parentPos = $anchor.parent.isTextblock && pos > 0 ? tr.doc.resolve(pos - 1) : $anchor;
        const parentIsIsolating = $parentPos.parent.type.spec.isolating;
        const parentPos = $anchor.pos - $anchor.parentOffset;
        const isAtStart = parentIsIsolating && $parentPos.parent.childCount === 1 ? parentPos === $anchor.pos : Selection3.atStart(doc).from === pos;
        if (!empty || !parent.type.isTextblock || parent.textContent.length || !isAtStart || isAtStart && $anchor.parent.type.name === "paragraph") {
          return false;
        }
        return commands.clearNodes();
      }),
      () => commands.deleteSelection(),
      () => commands.joinBackward(),
      () => commands.selectNodeBackward()
    ]);
    const handleDelete = () => this.editor.commands.first(({ commands }) => [
      () => commands.deleteSelection(),
      () => commands.deleteCurrentNode(),
      () => commands.joinForward(),
      () => commands.selectNodeForward()
    ]);
    const handleEnter = () => this.editor.commands.first(({ commands }) => [
      () => commands.newlineInCode(),
      () => commands.createParagraphNear(),
      () => commands.liftEmptyBlock(),
      () => commands.splitBlock()
    ]);
    const baseKeymap = {
      Enter: handleEnter,
      "Mod-Enter": () => this.editor.commands.exitCode(),
      Backspace: handleBackspace,
      "Mod-Backspace": handleBackspace,
      "Shift-Backspace": handleBackspace,
      Delete: handleDelete,
      "Mod-Delete": handleDelete,
      "Mod-a": () => this.editor.commands.selectAll()
    };
    const pcKeymap = {
      ...baseKeymap
    };
    const macKeymap = {
      ...baseKeymap,
      "Ctrl-h": handleBackspace,
      "Alt-Backspace": handleBackspace,
      "Ctrl-d": handleDelete,
      "Ctrl-Alt-Backspace": handleDelete,
      "Alt-Delete": handleDelete,
      "Alt-d": handleDelete,
      "Ctrl-a": () => this.editor.commands.selectTextblockStart(),
      "Ctrl-e": () => this.editor.commands.selectTextblockEnd()
    };
    if (isiOS() || isMacOS()) {
      return macKeymap;
    }
    return pcKeymap;
  },
  addProseMirrorPlugins() {
    return [
      // With this plugin we check if the whole document was selected and deleted.
      // In this case we will additionally call `clearNodes()` to convert e.g. a heading
      // to a paragraph if necessary.
      // This is an alternative to ProseMirror's `AllSelection`, which doesn’t work well
      // with many other commands.
      new Plugin7({
        key: new PluginKey5("clearDocument"),
        appendTransaction: (transactions, oldState, newState) => {
          if (transactions.some((tr2) => tr2.getMeta("composition"))) {
            return;
          }
          const docChanges = transactions.some((transaction) => transaction.docChanged) && !oldState.doc.eq(newState.doc);
          const ignoreTr = transactions.some((transaction) => transaction.getMeta("preventClearDocument"));
          if (!docChanges || ignoreTr) {
            return;
          }
          const { empty, from, to } = oldState.selection;
          const allFrom = Selection3.atStart(oldState.doc).from;
          const allEnd = Selection3.atEnd(oldState.doc).to;
          const allWasSelected = from === allFrom && to === allEnd;
          if (empty || !allWasSelected) {
            return;
          }
          const isEmpty = isNodeEmpty(newState.doc);
          if (!isEmpty) {
            return;
          }
          const tr = newState.tr;
          const state = createChainableState({
            state: newState,
            transaction: tr
          });
          const { commands } = new CommandManager({
            editor: this.editor,
            state
          });
          commands.clearNodes();
          if (!tr.steps.length) {
            return;
          }
          return tr;
        }
      })
    ];
  }
});
var Paste = Extension.create({
  name: "paste",
  addProseMirrorPlugins() {
    return [
      new Plugin8({
        key: new PluginKey6("tiptapPaste"),
        props: {
          handlePaste: (_view, e, slice) => {
            this.editor.emit("paste", {
              editor: this.editor,
              event: e,
              slice
            });
          }
        }
      })
    ];
  }
});
var Tabindex = Extension.create({
  name: "tabindex",
  addProseMirrorPlugins() {
    return [
      new Plugin9({
        key: new PluginKey7("tabindex"),
        props: {
          attributes: () => this.editor.isEditable ? { tabindex: "0" } : {}
        }
      })
    ];
  }
});
var TextDirection = Extension.create({
  name: "textDirection",
  addOptions() {
    return {
      direction: void 0
    };
  },
  addGlobalAttributes() {
    if (!this.options.direction) {
      return [];
    }
    const { nodeExtensions } = splitExtensions(this.extensions);
    return [
      {
        types: nodeExtensions.filter((extension) => extension.name !== "text").map((extension) => extension.name),
        attributes: {
          dir: {
            default: this.options.direction,
            parseHTML: (element) => {
              const dir = element.getAttribute("dir");
              if (dir && (dir === "ltr" || dir === "rtl" || dir === "auto")) {
                return dir;
              }
              return this.options.direction;
            },
            renderHTML: (attributes) => {
              if (!attributes.dir) {
                return {};
              }
              return {
                dir: attributes.dir
              };
            }
          }
        }
      }
    ];
  },
  addProseMirrorPlugins() {
    return [
      new Plugin10({
        key: new PluginKey8("textDirection"),
        props: {
          attributes: () => {
            const direction = this.options.direction;
            if (!direction) {
              return {};
            }
            return {
              dir: direction
            };
          }
        }
      })
    ];
  }
});
var markdown_exports = {};
__export2(markdown_exports, {
  createAtomBlockMarkdownSpec: () => createAtomBlockMarkdownSpec,
  createBlockMarkdownSpec: () => createBlockMarkdownSpec,
  createInlineMarkdownSpec: () => createInlineMarkdownSpec,
  parseAttributes: () => parseAttributes,
  parseIndentedBlocks: () => parseIndentedBlocks,
  renderNestedMarkdownContent: () => renderNestedMarkdownContent,
  serializeAttributes: () => serializeAttributes
});
function parseAttributes(attrString) {
  if (!(attrString == null ? void 0 : attrString.trim())) {
    return {};
  }
  const attributes = {};
  const quotedStrings = [];
  const tempString = attrString.replace(/["']([^"']*)["']/g, (match) => {
    quotedStrings.push(match);
    return `__QUOTED_${quotedStrings.length - 1}__`;
  });
  const classMatches = tempString.match(/(?:^|\s)\.([a-zA-Z][\w-]*)/g);
  if (classMatches) {
    const classes = classMatches.map((match) => match.trim().slice(1));
    attributes.class = classes.join(" ");
  }
  const idMatch = tempString.match(/(?:^|\s)#([a-zA-Z][\w-]*)/);
  if (idMatch) {
    attributes.id = idMatch[1];
  }
  const kvRegex = /([a-zA-Z][\w-]*)\s*=\s*(__QUOTED_\d+__)/g;
  const kvMatches = Array.from(tempString.matchAll(kvRegex));
  kvMatches.forEach(([, key, quotedRef]) => {
    var _a;
    const quotedIndex = parseInt(((_a = quotedRef.match(/__QUOTED_(\d+)__/)) == null ? void 0 : _a[1]) || "0", 10);
    const quotedValue = quotedStrings[quotedIndex];
    if (quotedValue) {
      attributes[key] = quotedValue.slice(1, -1);
    }
  });
  const cleanString = tempString.replace(/(?:^|\s)\.([a-zA-Z][\w-]*)/g, "").replace(/(?:^|\s)#([a-zA-Z][\w-]*)/g, "").replace(/([a-zA-Z][\w-]*)\s*=\s*__QUOTED_\d+__/g, "").trim();
  if (cleanString) {
    const booleanAttrs = cleanString.split(/\s+/).filter(Boolean);
    booleanAttrs.forEach((attr) => {
      if (attr.match(/^[a-zA-Z][\w-]*$/)) {
        attributes[attr] = true;
      }
    });
  }
  return attributes;
}
function serializeAttributes(attributes) {
  if (!attributes || Object.keys(attributes).length === 0) {
    return "";
  }
  const parts = [];
  if (attributes.class) {
    const classes = String(attributes.class).split(/\s+/).filter(Boolean);
    classes.forEach((cls) => parts.push(`.${cls}`));
  }
  if (attributes.id) {
    parts.push(`#${attributes.id}`);
  }
  Object.entries(attributes).forEach(([key, value]) => {
    if (key === "class" || key === "id") {
      return;
    }
    if (value === true) {
      parts.push(key);
    } else if (value !== false && value != null) {
      parts.push(`${key}="${String(value)}"`);
    }
  });
  return parts.join(" ");
}
function createAtomBlockMarkdownSpec(options) {
  const {
    nodeName,
    name: markdownName,
    parseAttributes: parseAttributes2 = parseAttributes,
    serializeAttributes: serializeAttributes2 = serializeAttributes,
    defaultAttributes = {},
    requiredAttributes = [],
    allowedAttributes
  } = options;
  const blockName = markdownName || nodeName;
  const filterAttributes = (attrs) => {
    if (!allowedAttributes) {
      return attrs;
    }
    const filtered = {};
    allowedAttributes.forEach((key) => {
      if (key in attrs) {
        filtered[key] = attrs[key];
      }
    });
    return filtered;
  };
  return {
    parseMarkdown: (token, h2) => {
      const attrs = { ...defaultAttributes, ...token.attributes };
      return h2.createNode(nodeName, attrs, []);
    },
    markdownTokenizer: {
      name: nodeName,
      level: "block",
      start(src) {
        var _a;
        const regex = new RegExp(`^:::${blockName}(?:\\s|$)`, "m");
        const index = (_a = src.match(regex)) == null ? void 0 : _a.index;
        return index !== void 0 ? index : -1;
      },
      tokenize(src, _tokens, _lexer) {
        const regex = new RegExp(`^:::${blockName}(?:\\s+\\{([^}]*)\\})?\\s*:::(?:\\n|$)`);
        const match = src.match(regex);
        if (!match) {
          return void 0;
        }
        const attrString = match[1] || "";
        const attributes = parseAttributes2(attrString);
        const missingRequired = requiredAttributes.find((required) => !(required in attributes));
        if (missingRequired) {
          return void 0;
        }
        return {
          type: nodeName,
          raw: match[0],
          attributes
        };
      }
    },
    renderMarkdown: (node) => {
      const filteredAttrs = filterAttributes(node.attrs || {});
      const attrs = serializeAttributes2(filteredAttrs);
      const attrString = attrs ? ` {${attrs}}` : "";
      return `:::${blockName}${attrString} :::`;
    }
  };
}
function createBlockMarkdownSpec(options) {
  const {
    nodeName,
    name: markdownName,
    getContent,
    parseAttributes: parseAttributes2 = parseAttributes,
    serializeAttributes: serializeAttributes2 = serializeAttributes,
    defaultAttributes = {},
    content = "block",
    allowedAttributes
  } = options;
  const blockName = markdownName || nodeName;
  const filterAttributes = (attrs) => {
    if (!allowedAttributes) {
      return attrs;
    }
    const filtered = {};
    allowedAttributes.forEach((key) => {
      if (key in attrs) {
        filtered[key] = attrs[key];
      }
    });
    return filtered;
  };
  return {
    parseMarkdown: (token, h2) => {
      let nodeContent;
      if (getContent) {
        const contentResult = getContent(token);
        nodeContent = typeof contentResult === "string" ? [{ type: "text", text: contentResult }] : contentResult;
      } else if (content === "block") {
        nodeContent = h2.parseChildren(token.tokens || []);
      } else {
        nodeContent = h2.parseInline(token.tokens || []);
      }
      const attrs = { ...defaultAttributes, ...token.attributes };
      return h2.createNode(nodeName, attrs, nodeContent);
    },
    markdownTokenizer: {
      name: nodeName,
      level: "block",
      start(src) {
        var _a;
        const regex = new RegExp(`^:::${blockName}`, "m");
        const index = (_a = src.match(regex)) == null ? void 0 : _a.index;
        return index !== void 0 ? index : -1;
      },
      tokenize(src, _tokens, lexer) {
        var _a;
        const openingRegex = new RegExp(`^:::${blockName}(?:\\s+\\{([^}]*)\\})?\\s*\\n`);
        const openingMatch = src.match(openingRegex);
        if (!openingMatch) {
          return void 0;
        }
        const [openingTag, attrString = ""] = openingMatch;
        const attributes = parseAttributes2(attrString);
        let level = 1;
        const position = openingTag.length;
        let matchedContent = "";
        const blockPattern = /^:::([\w-]*)(\s.*)?/gm;
        const remaining = src.slice(position);
        blockPattern.lastIndex = 0;
        for (; ; ) {
          const match = blockPattern.exec(remaining);
          if (match === null) {
            break;
          }
          const matchPos = match.index;
          const blockType = match[1];
          if ((_a = match[2]) == null ? void 0 : _a.endsWith(":::")) {
            continue;
          }
          if (blockType) {
            level += 1;
          } else {
            level -= 1;
            if (level === 0) {
              const rawContent = remaining.slice(0, matchPos);
              matchedContent = rawContent.trim();
              const fullMatch = src.slice(0, position + matchPos + match[0].length);
              let contentTokens = [];
              if (matchedContent) {
                if (content === "block") {
                  contentTokens = lexer.blockTokens(rawContent);
                  contentTokens.forEach((token) => {
                    if (token.text && (!token.tokens || token.tokens.length === 0)) {
                      token.tokens = lexer.inlineTokens(token.text);
                    }
                  });
                  while (contentTokens.length > 0) {
                    const lastToken = contentTokens[contentTokens.length - 1];
                    if (lastToken.type === "paragraph" && (!lastToken.text || lastToken.text.trim() === "")) {
                      contentTokens.pop();
                    } else {
                      break;
                    }
                  }
                } else {
                  contentTokens = lexer.inlineTokens(matchedContent);
                }
              }
              return {
                type: nodeName,
                raw: fullMatch,
                attributes,
                content: matchedContent,
                tokens: contentTokens
              };
            }
          }
        }
        return void 0;
      }
    },
    renderMarkdown: (node, h2) => {
      const filteredAttrs = filterAttributes(node.attrs || {});
      const attrs = serializeAttributes2(filteredAttrs);
      const attrString = attrs ? ` {${attrs}}` : "";
      const renderedContent = h2.renderChildren(node.content || [], "\n\n");
      return `:::${blockName}${attrString}

${renderedContent}

:::`;
    }
  };
}
function parseShortcodeAttributes(attrString) {
  if (!attrString.trim()) {
    return {};
  }
  const attributes = {};
  const regex = /(\w+)=(?:"([^"]*)"|'([^']*)')/g;
  let match = regex.exec(attrString);
  while (match !== null) {
    const [, key, doubleQuoted, singleQuoted] = match;
    attributes[key] = doubleQuoted || singleQuoted;
    match = regex.exec(attrString);
  }
  return attributes;
}
function serializeShortcodeAttributes(attrs) {
  return Object.entries(attrs).filter(([, value]) => value !== void 0 && value !== null).map(([key, value]) => `${key}="${value}"`).join(" ");
}
function createInlineMarkdownSpec(options) {
  const {
    nodeName,
    name: shortcodeName,
    getContent,
    parseAttributes: parseAttributes2 = parseShortcodeAttributes,
    serializeAttributes: serializeAttributes2 = serializeShortcodeAttributes,
    defaultAttributes = {},
    selfClosing = false,
    allowedAttributes
  } = options;
  const shortcode = shortcodeName || nodeName;
  const filterAttributes = (attrs) => {
    if (!allowedAttributes) {
      return attrs;
    }
    const filtered = {};
    allowedAttributes.forEach((attr) => {
      const attrName = typeof attr === "string" ? attr : attr.name;
      const skipIfDefault = typeof attr === "string" ? void 0 : attr.skipIfDefault;
      if (attrName in attrs) {
        const value = attrs[attrName];
        if (skipIfDefault !== void 0 && value === skipIfDefault) {
          return;
        }
        filtered[attrName] = value;
      }
    });
    return filtered;
  };
  const escapedShortcode = shortcode.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return {
    parseMarkdown: (token, h2) => {
      const attrs = { ...defaultAttributes, ...token.attributes };
      if (selfClosing) {
        return h2.createNode(nodeName, attrs);
      }
      const content = getContent ? getContent(token) : token.content || "";
      if (content) {
        return h2.createNode(nodeName, attrs, [h2.createTextNode(content)]);
      }
      return h2.createNode(nodeName, attrs, []);
    },
    markdownTokenizer: {
      name: nodeName,
      level: "inline",
      start(src) {
        const startPattern = selfClosing ? new RegExp(`\\[${escapedShortcode}\\s*[^\\]]*\\]`) : new RegExp(`\\[${escapedShortcode}\\s*[^\\]]*\\][\\s\\S]*?\\[\\/${escapedShortcode}\\]`);
        const match = src.match(startPattern);
        const index = match == null ? void 0 : match.index;
        return index !== void 0 ? index : -1;
      },
      tokenize(src, _tokens, _lexer) {
        const tokenPattern = selfClosing ? new RegExp(`^\\[${escapedShortcode}\\s*([^\\]]*)\\]`) : new RegExp(`^\\[${escapedShortcode}\\s*([^\\]]*)\\]([\\s\\S]*?)\\[\\/${escapedShortcode}\\]`);
        const match = src.match(tokenPattern);
        if (!match) {
          return void 0;
        }
        let content = "";
        let attrString = "";
        if (selfClosing) {
          const [, attrs] = match;
          attrString = attrs;
        } else {
          const [, attrs, contentMatch] = match;
          attrString = attrs;
          content = contentMatch || "";
        }
        const attributes = parseAttributes2(attrString.trim());
        return {
          type: nodeName,
          raw: match[0],
          content: content.trim(),
          attributes
        };
      }
    },
    renderMarkdown: (node) => {
      let content = "";
      if (getContent) {
        content = getContent(node);
      } else if (node.content && node.content.length > 0) {
        content = node.content.filter((child) => child.type === "text").map((child) => child.text).join("");
      }
      const filteredAttrs = filterAttributes(node.attrs || {});
      const attrs = serializeAttributes2(filteredAttrs);
      const attrString = attrs ? ` ${attrs}` : "";
      if (selfClosing) {
        return `[${shortcode}${attrString}]`;
      }
      return `[${shortcode}${attrString}]${content}[/${shortcode}]`;
    }
  };
}
function parseIndentedBlocks(src, config, lexer) {
  var _a, _b, _c, _d;
  const lines = src.split("\n");
  const items = [];
  let totalRaw = "";
  let i = 0;
  const baseIndentSize = config.baseIndentSize || 2;
  while (i < lines.length) {
    const currentLine = lines[i];
    const itemMatch = currentLine.match(config.itemPattern);
    if (!itemMatch) {
      if (items.length > 0) {
        break;
      } else if (currentLine.trim() === "") {
        i += 1;
        totalRaw = `${totalRaw}${currentLine}
`;
        continue;
      } else {
        return void 0;
      }
    }
    const itemData = config.extractItemData(itemMatch);
    const { indentLevel, mainContent } = itemData;
    totalRaw = `${totalRaw}${currentLine}
`;
    const itemContent = [mainContent];
    i += 1;
    while (i < lines.length) {
      const nextLine = lines[i];
      if (nextLine.trim() === "") {
        const nextNonEmptyIndex = lines.slice(i + 1).findIndex((l) => l.trim() !== "");
        if (nextNonEmptyIndex === -1) {
          break;
        }
        const nextNonEmpty = lines[i + 1 + nextNonEmptyIndex];
        const nextIndent2 = ((_b = (_a = nextNonEmpty.match(/^(\s*)/)) == null ? void 0 : _a[1]) == null ? void 0 : _b.length) || 0;
        if (nextIndent2 > indentLevel) {
          itemContent.push(nextLine);
          totalRaw = `${totalRaw}${nextLine}
`;
          i += 1;
          continue;
        } else {
          break;
        }
      }
      const nextIndent = ((_d = (_c = nextLine.match(/^(\s*)/)) == null ? void 0 : _c[1]) == null ? void 0 : _d.length) || 0;
      if (nextIndent > indentLevel) {
        itemContent.push(nextLine);
        totalRaw = `${totalRaw}${nextLine}
`;
        i += 1;
      } else {
        break;
      }
    }
    let nestedTokens;
    const nestedContent = itemContent.slice(1);
    if (nestedContent.length > 0) {
      const dedentedNested = nestedContent.map((nestedLine) => nestedLine.slice(indentLevel + baseIndentSize)).join("\n");
      if (dedentedNested.trim()) {
        if (config.customNestedParser) {
          nestedTokens = config.customNestedParser(dedentedNested);
        } else {
          nestedTokens = lexer.blockTokens(dedentedNested);
        }
      }
    }
    const token = config.createToken(itemData, nestedTokens);
    items.push(token);
  }
  if (items.length === 0) {
    return void 0;
  }
  return {
    items,
    raw: totalRaw
  };
}
function renderNestedMarkdownContent(node, h2, prefixOrGenerator, ctx) {
  if (!node || !Array.isArray(node.content)) {
    return "";
  }
  const prefix = typeof prefixOrGenerator === "function" ? prefixOrGenerator(ctx) : prefixOrGenerator;
  const [content, ...children] = node.content;
  const mainContent = h2.renderChildren([content]);
  const output = [`${prefix}${mainContent}`];
  if (children && children.length > 0) {
    children.forEach((child) => {
      const childContent = h2.renderChildren([child]);
      if (childContent) {
        const indentedChild = childContent.split("\n").map((line) => line ? h2.indent(line) : "").join("\n");
        output.push(indentedChild);
      }
    });
  }
  return output.join("\n");
}
function updateMarkViewAttributes(checkMark, editor, attrs = {}) {
  const { state } = editor;
  const { doc, tr } = state;
  const thisMark = checkMark;
  doc.descendants((node, pos) => {
    const from = tr.mapping.map(pos);
    const to = tr.mapping.map(pos) + node.nodeSize;
    let foundMark = null;
    node.marks.forEach((mark) => {
      if (mark !== thisMark) {
        return false;
      }
      foundMark = mark;
    });
    if (!foundMark) {
      return;
    }
    let needsUpdate = false;
    Object.keys(attrs).forEach((k) => {
      if (attrs[k] !== foundMark.attrs[k]) {
        needsUpdate = true;
      }
    });
    if (needsUpdate) {
      const updatedMark = checkMark.type.create({
        ...checkMark.attrs,
        ...attrs
      });
      tr.removeMark(from, to, checkMark.type);
      tr.addMark(from, to, updatedMark);
    }
  });
  if (tr.docChanged) {
    editor.view.dispatch(tr);
  }
}

// src/lib/comment-mark.ts
import { Plugin as Plugin11, PluginKey as PluginKey9 } from "@tiptap/pm/state";
var CommentMark = Mark.create({
  name: "comment",
  addOptions() {
    return {
      onCommentClick: void 0
    };
  },
  addAttributes() {
    return {
      commentId: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-comment-id"),
        renderHTML: (attributes) => ({
          "data-comment-id": attributes.commentId
        })
      }
    };
  },
  parseHTML() {
    return [{ tag: "mark[data-comment-id]" }];
  },
  renderHTML({ HTMLAttributes }) {
    return [
      "mark",
      mergeAttributes(HTMLAttributes, {
        class: "bg-yellow-200/50 dark:bg-yellow-500/30 dark:text-foreground cursor-pointer hover:bg-yellow-300/60 dark:hover:bg-yellow-500/40 transition-colors rounded-sm"
      }),
      0
    ];
  },
  addCommands() {
    return {
      setComment: (commentId) => ({ commands }) => {
        return commands.setMark(this.name, { commentId });
      },
      unsetComment: (commentId) => ({ tr, state }) => {
        const { doc } = state;
        let found = false;
        doc.descendants((node, pos) => {
          node.marks.forEach((mark) => {
            if (mark.type.name === this.name && mark.attrs.commentId === commentId) {
              tr.removeMark(pos, pos + node.nodeSize, mark.type);
              found = true;
            }
          });
        });
        return found;
      }
    };
  },
  addProseMirrorPlugins() {
    const { onCommentClick } = this.options;
    return [
      new Plugin11({
        key: new PluginKey9("commentClick"),
        props: {
          handleClick(view, pos) {
            if (!onCommentClick) return false;
            const { state } = view;
            const $pos = state.doc.resolve(pos);
            const marks = $pos.marks();
            const commentMark = marks.find((mark) => mark.type.name === "comment");
            if (commentMark && commentMark.attrs.commentId) {
              ;
              view.dom.blur();
              onCommentClick(commentMark.attrs.commentId);
              return true;
            }
            return false;
          }
        }
      })
    ];
  }
});
function addCommentMark(editor, commentId, from, to) {
  if (!editor.view || editor.isDestroyed) {
    console.warn("Cannot add comment mark: editor not ready");
    return;
  }
  editor.chain().setTextSelection({ from, to }).setComment(commentId).run();
}
function removeCommentMark(editor, commentId) {
  if (!editor.view || editor.isDestroyed) return;
  editor.chain().unsetComment(commentId).run();
}
function applyCommentMarks(editor, comments) {
  if (!editor.view || editor.isDestroyed) return;
  const { doc } = editor.state;
  const textContent = doc.textContent;
  comments.forEach((comment) => {
    if (!comment.quotedText || comment.parentId || comment.resolved) return;
    const index = textContent.indexOf(comment.quotedText);
    if (index === -1) return;
    let currentPos = 0;
    let startPos = null;
    let endPos = null;
    doc.descendants((node, pos) => {
      if (startPos !== null && endPos !== null) return false;
      if (node.isText && node.text) {
        const nodeStart = currentPos;
        const nodeEnd = currentPos + node.text.length;
        if (startPos === null && nodeEnd > index) {
          const offsetInNode = index - nodeStart;
          startPos = pos + offsetInNode;
        }
        if (startPos !== null && endPos === null) {
          const targetEnd = index + comment.quotedText.length;
          if (nodeEnd >= targetEnd) {
            const offsetInNode = targetEnd - nodeStart;
            endPos = pos + offsetInNode;
          }
        }
        currentPos = nodeEnd;
      }
      return true;
    });
    if (startPos !== null && endPos !== null) {
      editor.chain().setTextSelection({ from: startPos, to: endPos }).setComment(comment.id).setTextSelection(endPos).run();
    }
  });
}
function scrollToComment(editor, commentId) {
  if (!editor.view || editor.isDestroyed) return;
  const { doc } = editor.state;
  doc.descendants((node, pos) => {
    const commentMark = node.marks.find(
      (mark) => mark.type.name === "comment" && mark.attrs.commentId === commentId
    );
    if (commentMark) {
      editor.chain().setTextSelection(pos).run();
      const view = editor.view;
      const coords = view.coordsAtPos(pos);
      const editorRect = view.dom.getBoundingClientRect();
      if (coords.top < editorRect.top || coords.bottom > editorRect.bottom) {
        view.dom.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return false;
    }
    return true;
  });
}
export {
  AI_MODELS,
  CommentMark,
  DEFAULT_AUTO_DRAFT_TEMPLATE,
  DEFAULT_CHAT_TEMPLATE,
  DEFAULT_EXPAND_PLAN_TEMPLATE,
  DEFAULT_GENERATE_TEMPLATE,
  DEFAULT_PLAN_RULES,
  DEFAULT_PLAN_TEMPLATE,
  DEFAULT_REWRITE_TEMPLATE,
  addCommentMark,
  applyCommentMarks,
  buildAutoDraftPrompt,
  buildChatPrompt,
  buildExpandPlanPrompt,
  buildGeneratePrompt,
  buildPlanPrompt,
  buildRewritePrompt,
  canDeleteComment,
  canEditComment,
  createAPIHandler,
  createAutoblogger,
  createCommentsClient,
  createCrudData,
  fetchRssFeeds,
  filterByKeywords,
  formatDate,
  generate,
  generateSlug,
  getDefaultModel,
  getModel,
  getSeoValues,
  htmlToMarkdown,
  markdownToHtml,
  parseGeneratedContent,
  parseMarkdown,
  removeCommentMark,
  renderMarkdown,
  renderMarkdownSanitized,
  resolveModel,
  runAutoDraft,
  scrollToComment,
  truncate,
  validateSchema,
  wordCount
};
//# sourceMappingURL=index.mjs.map