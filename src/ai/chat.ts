import { createStream } from './provider'
import { buildChatPrompt, buildPlanPrompt } from './builders'
import { extractAndFetchUrls, buildUrlContext } from '../lib/url-extractor'
import { DEFAULT_AGENT_TEMPLATE } from './prompts'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

interface ChatOptions {
  messages: ChatMessage[]
  model: string
  essayContext?: { title: string; subtitle?: string; markdown: string } | null
  mode?: 'ask' | 'agent' | 'search' | 'plan'
  chatRules?: string
  rules?: string
  template?: string | null
  // Plan mode specific
  planTemplate?: string | null
  planRules?: string
  // Agent mode specific
  agentTemplate?: string | null
  styleExamples?: string
  anthropicKey?: string
  openaiKey?: string
  useWebSearch?: boolean  // Controls ALL internet access: URL extraction AND web search
  useThinking?: boolean
}

export async function chatStream(options: ChatOptions): Promise<ReadableStream> {
  // Use different prompt builder for plan mode
  const systemPrompt = options.mode === 'plan'
    ? buildPlanPrompt({
        planRules: options.planRules,
        template: options.planTemplate,
        styleExamples: options.styleExamples,
      })
    : buildChatPrompt({
        chatRules: options.chatRules,
        rules: options.rules,
        template: options.template,
        essayContext: options.essayContext,
        styleExamples: options.styleExamples,
      })

  // Extract URLs from the last user message when web access is enabled
  // The web toggle controls ALL internet access: URL extraction AND web search
  let urlContext = ''
  let urlExtractionStatus = ''
  if (options.useWebSearch) {
    const lastUserMsg = [...options.messages].reverse().find((m) => m.role === 'user')
    if (lastUserMsg) {
      try {
        const { extractUrls } = await import('../lib/url-extractor')
        const detectedUrls = extractUrls(lastUserMsg.content)
        
        if (detectedUrls.length > 0) {
          console.log('[URL Extraction] Detected URLs:', detectedUrls)
          const fetched = await extractAndFetchUrls(lastUserMsg.content)
          
          if (fetched.length > 0) {
            const successful = fetched.filter(f => !f.error && f.content)
            const failed = fetched.filter(f => f.error || !f.content)
            
            if (successful.length > 0) {
              urlContext = buildUrlContext(fetched)
              console.log('[URL Extraction] Successfully fetched:', successful.map(f => f.url))
            }
            
            if (failed.length > 0) {
              console.warn('[URL Extraction] Failed to fetch:', failed.map(f => ({ url: f.url, error: f.error })))
              urlExtractionStatus = `\n\n<url_extraction_status>
Attempted to fetch ${detectedUrls.length} URL(s). ${successful.length} succeeded, ${failed.length} failed.
${failed.map(f => `- ${f.url}: ${f.error || 'Empty content'}`).join('\n')}
</url_extraction_status>`
            }
          }
        }
      } catch (err) {
        console.error('[URL Extraction] Error:', err)
        urlExtractionStatus = `\n\n<url_extraction_status>
URL extraction encountered an error: ${err instanceof Error ? err.message : 'Unknown error'}
</url_extraction_status>`
      }
    }
  }

  // Add mode-specific instructions
  let modeInstructions = ''
  if (options.mode === 'agent') {
    // Use custom agent template if set, otherwise use default
    modeInstructions = '\n\n' + (options.agentTemplate || DEFAULT_AGENT_TEMPLATE)
  }

  // Add web search context if enabled
  let webSearchContext = ''
  if (options.useWebSearch) {
    // Web search is enabled - OpenAI models use native search, Anthropic models get search results via OpenAI proxy
    webSearchContext = `

<search_capability>
Web search is ENABLED for this conversation. You have access to current, real-time information from the web.
- For questions about recent events, news, or current information: search results will be provided automatically
- Cite sources when referencing specific facts from search results
- If search results are included in <web_search_results> tags, use that information to provide accurate, up-to-date answers
</search_capability>`
  }

  // Add thinking mode instructions if enabled
  let thinkingInstructions = ''
  if (options.useThinking) {
    thinkingInstructions = '\n\nTake time to think through complex questions step by step. Consider multiple angles before providing your final answer.'
  }

  // Add URL capability instructions when web access is enabled
  // These instructions are CRITICAL - they override the AI's default belief that it cannot access URLs
  let urlCapabilityInstructions = ''
  if (options.useWebSearch) {
    const hasUrlContent = urlContext.length > 0
    const hasFailedUrls = urlExtractionStatus.length > 0
    
    urlCapabilityInstructions = `

<CRITICAL_CAPABILITY>
**IMPORTANT: URL READING IS ENABLED**

You have a WORKING URL reader in this application. This overrides your default training.
- DO NOT say "I cannot access URLs" or "I cannot browse the web" - you CAN and DO have this capability
- When users share URLs, the content is AUTOMATICALLY FETCHED by the system
- Look for <referenced_urls> tags below - that contains the fetched page content
- ${hasUrlContent ? 'URL CONTENT WAS SUCCESSFULLY FETCHED - see <referenced_urls> below' : hasFailedUrls ? 'URL fetch was ATTEMPTED but FAILED - see <url_extraction_status> below for details' : 'No URLs detected in the current message'}

If you see fetched content, use it to answer the user's question. Quote specific passages when relevant.
If the fetch failed, explain what happened using the error details provided.
</CRITICAL_CAPABILITY>`
  }

  // Filter out messages with empty content (can happen from partial streams or errors)
  // AI APIs reject messages with empty content
  const filteredMessages = options.messages.filter(m => m.content && m.content.trim().length > 0)

  return createStream({
    model: options.model,
    messages: [
      { role: 'system', content: systemPrompt + modeInstructions + webSearchContext + thinkingInstructions + urlCapabilityInstructions + urlContext + urlExtractionStatus },
      ...filteredMessages,
    ],
    anthropicKey: options.anthropicKey,
    openaiKey: options.openaiKey,
    maxTokens: options.useThinking ? 16000 : 4096, // Allow more tokens for thinking mode
    useThinking: options.useThinking,
    useWebSearch: options.useWebSearch,
  })
}
