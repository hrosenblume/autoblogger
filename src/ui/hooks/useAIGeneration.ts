'use client'

import { useState, useRef, useCallback } from 'react'
import { consumeSSEStream } from '../../lib/sse'
import type { Post } from './usePost'

export type GenerationStatus = 'complete' | 'stopped' | 'error'

export interface GenerateOptions {
  wordCount?: number
  model?: string
  useWebSearch?: boolean
  useThinking?: boolean
}

export interface UseAIGenerationOptions {
  apiBasePath: string
  /** Callback when title is parsed from stream */
  onTitleParsed: (title: string) => void
  /** Callback when subtitle is parsed from stream */
  onSubtitleParsed: (subtitle: string) => void
  /** Callback when markdown body updates during streaming */
  onMarkdownUpdate: (markdown: string) => void
  /** Optional callback for chat messages */
  onChatMessage?: (role: 'user' | 'assistant', content: string) => void
}

export interface UseAIGenerationReturn {
  generating: boolean
  /** Generate essay from a prompt */
  generate: (prompt: string, opts: GenerateOptions) => Promise<GenerationStatus>
  /** Expand a plan outline into a full essay */
  expandPlan: (plan: string, wordCount?: number, model?: string) => Promise<GenerationStatus>
  /** Stop current generation */
  stop: () => void
}

/**
 * Hook for AI essay generation with streaming title/subtitle parsing.
 * Extracted from EditorPage for reusability and to eliminate duplicate SSE parsing code.
 */
export function useAIGeneration({
  apiBasePath,
  onTitleParsed,
  onSubtitleParsed,
  onMarkdownUpdate,
  onChatMessage,
}: UseAIGenerationOptions): UseAIGenerationReturn {
  const [generating, setGenerating] = useState(false)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Parse streaming content and extract title/subtitle/body
  const parseAndUpdateContent = useCallback((fullContent: string): {
    titleExtracted: boolean
    subtitleExtracted: boolean
    bodyStartIndex: number
  } => {
    let titleExtracted = false
    let subtitleExtracted = false
    let bodyStartIndex = 0

    // Parse title from first line
    if (fullContent.includes('\n')) {
      const firstLine = fullContent.split('\n')[0]
      if (firstLine.startsWith('# ')) {
        const title = firstLine.slice(2).trim()
        onTitleParsed(title)
        titleExtracted = true
        bodyStartIndex = firstLine.length + 1 // +1 for newline
      }
    }

    // Parse subtitle from second line (if italic)
    if (titleExtracted) {
      const afterTitle = fullContent.slice(bodyStartIndex)
      if (afterTitle.includes('\n')) {
        const lines = afterTitle.split('\n')
        let lineOffset = 0
        let rawSubtitleLine = ''
        
        for (let i = 0; i < lines.length - 1; i++) {
          if (lines[i].trim()) {
            rawSubtitleLine = lines[i]
            break
          }
          lineOffset += lines[i].length + 1
        }
        
        if (rawSubtitleLine) {
          const subtitleLine = rawSubtitleLine.trim()
          const italicMatch = subtitleLine.match(/^\*(.+)\*$/) || subtitleLine.match(/^_(.+)_$/)
          if (italicMatch) {
            onSubtitleParsed(italicMatch[1])
            subtitleExtracted = true
            bodyStartIndex += lineOffset + rawSubtitleLine.length + 1
          } else {
            // Non-italic line - treat as body start
            subtitleExtracted = true
            bodyStartIndex += lineOffset
          }
        }
      }
    }

    // Update markdown body
    if (titleExtracted) {
      const bodyContent = fullContent.slice(bodyStartIndex).trim()
      onMarkdownUpdate(bodyContent)
    }

    return { titleExtracted, subtitleExtracted, bodyStartIndex }
  }, [onTitleParsed, onSubtitleParsed, onMarkdownUpdate])

  // Core generation function that handles SSE streaming
  const generateWithSSE = useCallback(async (
    endpoint: string,
    body: Record<string, unknown>,
    promptForChat?: string
  ): Promise<GenerationStatus> => {
    if (generating) return 'error'

    const abortController = new AbortController()
    abortControllerRef.current = abortController
    setGenerating(true)

    try {
      const res = await fetch(`${apiBasePath}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: abortController.signal,
      })

      if (!res.ok) {
        const error = await res.json().catch(() => ({ error: 'Generation failed' }))
        console.error('Generation failed:', error)
        return 'error'
      }

      let lastState = { titleExtracted: false, subtitleExtracted: false, bodyStartIndex: 0 }

      // Consume SSE stream and parse content in real-time
      const fullContent = await consumeSSEStream(res, (event) => {
        if (event.error) {
          throw new Error(event.error)
        }
        // Parse title/subtitle from accumulated content
        lastState = parseAndUpdateContent(event.fullContent)
      }, abortController.signal)

      // Final cleanup
      if (lastState.titleExtracted) {
        const finalBody = fullContent.slice(lastState.bodyStartIndex).trim()
        onMarkdownUpdate(finalBody)
      }

      // Add chat message on success
      if (onChatMessage && promptForChat) {
        onChatMessage('user', promptForChat)
        onChatMessage('assistant', '✓ Essay generated successfully. You can now edit it or ask me questions about it.')
      }

      return 'complete'
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        // Generation was cancelled
        if (onChatMessage && promptForChat) {
          onChatMessage('user', promptForChat)
          onChatMessage('assistant', '⏹ Generation stopped. You can continue editing what was generated.')
        }
        return 'stopped'
      } else {
        console.error('Generation error:', err)
        if (onChatMessage && promptForChat) {
          onChatMessage('user', promptForChat)
          onChatMessage('assistant', '⚠ Generation was interrupted. You can try again or continue editing.')
        }
        return 'error'
      }
    } finally {
      setGenerating(false)
      abortControllerRef.current = null
    }
  }, [generating, apiBasePath, parseAndUpdateContent, onMarkdownUpdate, onChatMessage])

  // Generate essay from prompt
  const generate = useCallback(async (
    prompt: string,
    opts: GenerateOptions
  ): Promise<GenerationStatus> => {
    return generateWithSSE('/ai/generate', {
      prompt,
      wordCount: opts.wordCount ?? 800,
      model: opts.model,
      useWebSearch: opts.useWebSearch,
      useThinking: opts.useThinking,
    }, `Generate essay: ${prompt}`)
  }, [generateWithSSE])

  // Expand plan into full essay
  const expandPlan = useCallback(async (
    plan: string,
    wordCount: number = 800,
    model?: string
  ): Promise<GenerationStatus> => {
    return generateWithSSE('/ai/generate', {
      mode: 'expand_plan',
      plan,
      wordCount,
      model,
    })
  }, [generateWithSSE])

  // Stop current generation
  const stop = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
  }, [])

  return {
    generating,
    generate,
    expandPlan,
    stop,
  }
}
