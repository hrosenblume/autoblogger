/**
 * SSE (Server-Sent Events) streaming utilities
 * 
 * Shared parsing logic for consuming SSE streams from AI endpoints.
 * Used by useChat, EditorPage, and other components that need streaming.
 */

export interface SSEEvent {
  text?: string
  thinking?: string
  error?: string
}

export interface SSEEventWithAccumulated extends SSEEvent {
  /** Full accumulated text content so far */
  fullContent: string
}

export type SSEEventHandler = (event: SSEEventWithAccumulated) => void

/**
 * Consume an SSE stream, calling onEvent for each parsed event.
 * Returns the accumulated text content.
 * 
 * @param response - Fetch Response object with SSE body
 * @param onEvent - Callback for each parsed event
 * @param signal - Optional AbortSignal for cancellation
 * @returns Promise resolving to full accumulated text content
 */
export async function consumeSSEStream(
  response: Response,
  onEvent: SSEEventHandler,
  signal?: AbortSignal
): Promise<string> {
  const reader = response.body?.getReader()
  if (!reader) throw new Error('No response body')

  const decoder = new TextDecoder()
  let buffer = ''
  let fullContent = ''

  try {
    while (true) {
      // Check for abort
      if (signal?.aborted) break

      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      
      // Process complete SSE lines
      const lines = buffer.split('\n')
      buffer = lines.pop() || '' // Keep incomplete line in buffer

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue
        const data = line.slice(6) // Remove 'data: ' prefix
        
        if (data === '[DONE]') continue

        try {
          const parsed = JSON.parse(data)
          if (parsed.error) {
            onEvent({ error: parsed.error, fullContent })
          } else {
            if (parsed.text) {
              fullContent += parsed.text
            }
            onEvent({ ...parsed, fullContent })
          }
        } catch (parseError) {
          // If it's a real error (not JSON parse), rethrow
          if (parseError instanceof Error && parseError.message !== 'Unexpected token') {
            // Check if the error is from our handler
            if (parseError.message && !parseError.message.includes('Unexpected')) {
              throw parseError
            }
          }
          // Ignore JSON parse errors for incomplete chunks
        }
      }
    }
  } finally {
    reader.releaseLock()
  }

  return fullContent
}

/**
 * Parse title and subtitle from streaming markdown content.
 * 
 * Extracts:
 * - Title from first line starting with "# "
 * - Subtitle from first italic line (*text* or _text_) after title
 * - Body from remaining content
 * 
 * @param content - Full or partial markdown content
 * @returns Parsed title, subtitle, markdown body, and parsing state
 */
export function parseStreamingContent(content: string): {
  title: string | null
  subtitle: string | null
  markdown: string
  titleComplete: boolean
  subtitleComplete: boolean
  bodyStartIndex: number
} {
  let title: string | null = null
  let subtitle: string | null = null
  let titleComplete = false
  let subtitleComplete = false
  let bodyStartIndex = 0

  // Parse title from first line
  if (content.includes('\n')) {
    const firstLine = content.split('\n')[0]
    if (firstLine.startsWith('# ')) {
      title = firstLine.slice(2).trim()
      titleComplete = true
      bodyStartIndex = firstLine.length + 1 // +1 for newline
    }
  }

  // Parse subtitle (first italic line after title)
  if (titleComplete) {
    const afterTitle = content.slice(bodyStartIndex)
    if (afterTitle.includes('\n')) {
      const lines = afterTitle.split('\n')
      let lineOffset = 0
      
      for (let i = 0; i < lines.length - 1; i++) {
        const line = lines[i]
        if (line.trim()) {
          const italicMatch = line.trim().match(/^\*(.+)\*$/) || line.trim().match(/^_(.+)_$/)
          if (italicMatch) {
            subtitle = italicMatch[1]
            subtitleComplete = true
            bodyStartIndex += lineOffset + line.length + 1
          } else {
            // Non-italic line found - treat as body start
            subtitleComplete = true
            bodyStartIndex += lineOffset
          }
          break
        }
        lineOffset += line.length + 1 // +1 for newline
      }
    }
  }

  const markdown = titleComplete ? content.slice(bodyStartIndex).trim() : ''

  return {
    title,
    subtitle,
    markdown,
    titleComplete,
    subtitleComplete,
    bodyStartIndex,
  }
}
