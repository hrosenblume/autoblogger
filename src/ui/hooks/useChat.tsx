'use client'

import { createContext, useContext, useState, useCallback, useRef, useEffect, useMemo, type ReactNode } from 'react'

export interface EssaySnapshot {
  title: string
  subtitle: string
  markdown: string
}

export interface Message {
  role: 'user' | 'assistant'
  content: string
  mode?: ChatMode
  appliedEdits?: boolean
  previousState?: EssaySnapshot
}

export interface EssayContext {
  title: string
  subtitle?: string
  markdown: string
}

export type ChatMode = 'ask' | 'agent' | 'plan' | 'search'

export interface EssayEdit {
  type: 'replace_all' | 'replace_section' | 'insert' | 'delete'
  title?: string
  subtitle?: string
  markdown?: string
  find?: string
  replace?: string
  position?: 'before' | 'after' | 'start' | 'end'
}

export type EditHandler = (edit: EssayEdit) => boolean
export type ExpandPlanHandler = (plan: string, wordCount: number) => void

interface ChatContextValue {
  messages: Message[]
  essayContext: EssayContext | null
  isStreaming: boolean
  isOpen: boolean
  mode: ChatMode
  webSearchEnabled: boolean
  thinkingEnabled: boolean
  selectedModel: string
  
  setEssayContext: (context: EssayContext | null) => void
  sendMessage: (content: string) => Promise<void>
  stopStreaming: () => void
  addMessage: (role: 'user' | 'assistant', content: string) => void
  clearMessages: () => void
  setIsOpen: (open: boolean) => void
  setMode: (mode: ChatMode) => void
  setWebSearchEnabled: (enabled: boolean) => void
  setThinkingEnabled: (enabled: boolean) => void
  setSelectedModel: (modelId: string) => void
  registerEditHandler: (handler: EditHandler | null) => void
  undoEdit: (messageIndex: number) => void
  registerExpandPlanHandler: (handler: ExpandPlanHandler | null) => void
  expandPlan: (wordCount?: number) => void
}

const ChatContext = createContext<ChatContextValue | null>(null)

// Parse edit blocks from agent mode responses
function parseEditBlocks(content: string): { edits: EssayEdit[], cleanContent: string } {
  const editRegex = /:::edit\s*([\s\S]*?)\s*:::/g
  const edits: EssayEdit[] = []
  let cleanContent = content
  
  let match
  while ((match = editRegex.exec(content)) !== null) {
    try {
      const edit = JSON.parse(match[1]) as EssayEdit
      edits.push(edit)
      cleanContent = cleanContent.replace(match[0], '')
    } catch {
      console.warn('Failed to parse edit block:', match[1])
    }
  }
  
  cleanContent = cleanContent.replace(/\n{3,}/g, '\n\n').trim()
  
  return { edits, cleanContent }
}

/**
 * Clean plan mode output by extracting content from <plan> tags and stripping trailing text.
 */
function cleanPlanOutput(content: string): string {
  let cleaned = content
  
  // Extract content from <plan> tags if present
  const planMatch = cleaned.match(/<plan>([\s\S]*?)<\/plan>/i)
  if (planMatch) {
    cleaned = planMatch[1]
  } else {
    const openTagMatch = cleaned.match(/<plan>([\s\S]*)/i)
    if (openTagMatch) {
      cleaned = openTagMatch[1]
    }
  }
  
  // Strip any text after the last bullet point
  const lines = cleaned.split('\n')
  let lastBulletIndex = -1
  for (let i = lines.length - 1; i >= 0; i--) {
    if (lines[i].trim().startsWith('- ')) {
      lastBulletIndex = i
      break
    }
  }
  
  if (lastBulletIndex === -1) {
    return cleaned.trim()
  }
  
  return lines.slice(0, lastBulletIndex + 1).join('\n').trim()
}

interface ChatProviderProps {
  children: ReactNode
  apiBasePath?: string
  chatApiPath?: string // Custom path for chat API (defaults to apiBasePath + '/ai/chat' or '/api/ai/chat')
  historyApiPath?: string // Custom path for history API (defaults to '/api/chat/history')
}

export function ChatProvider({ 
  children, 
  apiBasePath = '/api/cms',
  chatApiPath,
  historyApiPath = '/api/chat/history',
}: ChatProviderProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [essayContext, setEssayContext] = useState<EssayContext | null>(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [mode, setMode] = useState<ChatMode>('ask')
  const [webSearchEnabled, setWebSearchEnabled] = useState(false)
  const [thinkingEnabled, setThinkingEnabled] = useState(false)
  const [selectedModel, setSelectedModel] = useState('claude-sonnet')
  
  const editHandlerRef = useRef<EditHandler | null>(null)
  const expandPlanHandlerRef = useRef<ExpandPlanHandler | null>(null)
  const historyLoadedRef = useRef(false)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Resolve chat API path
  const resolvedChatApiPath = chatApiPath || '/api/ai/chat'
  
  const registerEditHandler = useCallback((handler: EditHandler | null) => {
    editHandlerRef.current = handler
  }, [])

  const registerExpandPlanHandler = useCallback((handler: ExpandPlanHandler | null) => {
    expandPlanHandlerRef.current = handler
  }, [])

  const stopStreaming = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
    setIsStreaming(false)
  }, [])

  // Preload history on mount
  useEffect(() => {
    if (historyLoadedRef.current) return
    historyLoadedRef.current = true
    
    fetch(historyApiPath)
      .then(res => res.ok ? res.json() : [])
      .then((data: { role: 'user' | 'assistant'; content: string }[]) => {
        if (data.length > 0) {
          setMessages(data.map(m => ({ role: m.role, content: m.content })))
        }
      })
      .catch(() => {})
  }, [historyApiPath])

  const saveMessage = useCallback((role: 'user' | 'assistant', content: string) => {
    fetch(historyApiPath, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role, content }),
    }).catch(() => {})
  }, [historyApiPath])

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isStreaming) return

    abortControllerRef.current = new AbortController()
    const signal = abortControllerRef.current.signal

    const userMessage: Message = { role: 'user', content: content.trim() }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setIsStreaming(true)

    saveMessage('user', content.trim())

    const assistantMessage: Message = { role: 'assistant', content: '', mode }
    setMessages([...newMessages, assistantMessage])

    try {
      const response = await fetch(resolvedChatApiPath, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: newMessages,
          essayContext: essayContext,
          mode: mode,
          modelId: selectedModel,
          useWebSearch: webSearchEnabled,
          useThinking: thinkingEnabled,
        }),
        signal,
      })

      if (!response.ok) {
        if (response.status === 503) {
          throw new Error('AI service temporarily unavailable. Please try again.')
        }
        if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please wait before trying again.')
        }
        const errorText = await response.text()
        try {
          const error = JSON.parse(errorText)
          throw new Error(error.error || 'Failed to send message')
        } catch {
          throw new Error(`Server error (${response.status}). Please try again.`)
        }
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No response body')

      const decoder = new TextDecoder()
      let assistantContent = ''
      let appliedEdits = false

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        assistantContent += chunk

        setMessages(prev => {
          const updated = [...prev]
          updated[updated.length - 1] = { role: 'assistant', content: assistantContent, mode }
          return updated
        })
      }
      
      // Process agent mode edits
      if (mode === 'agent' && editHandlerRef.current && essayContext) {
        const { edits, cleanContent } = parseEditBlocks(assistantContent)
        
        const previousState: EssaySnapshot = {
          title: essayContext.title,
          subtitle: essayContext.subtitle || '',
          markdown: essayContext.markdown,
        }
        
        for (const edit of edits) {
          const success = editHandlerRef.current(edit)
          if (success) appliedEdits = true
        }
        
        if (edits.length > 0) {
          const finalContent = cleanContent || 'Edit applied.'
          setMessages(prev => {
            const updated = [...prev]
            updated[updated.length - 1] = { 
              role: 'assistant', 
              content: finalContent,
              mode,
              appliedEdits,
              previousState: appliedEdits ? previousState : undefined,
            }
            return updated
          })
          saveMessage('assistant', finalContent)
        } else {
          saveMessage('assistant', assistantContent)
        }
      } else if (mode === 'plan') {
        const cleanedContent = cleanPlanOutput(assistantContent)
        
        setMessages(prev => {
          const updated = [...prev]
          updated[updated.length - 1] = { 
            role: 'assistant', 
            content: cleanedContent,
            mode,
          }
          return updated
        })
        
        saveMessage('assistant', cleanedContent)
      } else {
        saveMessage('assistant', assistantContent)
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return
      }
      console.error('Chat error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Something went wrong'
      setMessages(prev => {
        const updated = [...prev]
        updated[updated.length - 1] = { role: 'assistant', content: `Error: ${errorMessage}` }
        return updated
      })
    } finally {
      abortControllerRef.current = null
      setIsStreaming(false)
    }
  }, [messages, isStreaming, essayContext, mode, webSearchEnabled, thinkingEnabled, selectedModel, saveMessage, resolvedChatApiPath])

  const clearMessages = useCallback(() => {
    setMessages([])
  }, [])

  const addMessage = useCallback((role: 'user' | 'assistant', content: string) => {
    const message: Message = { role, content }
    setMessages(prev => [...prev, message])
    saveMessage(role, content)
  }, [saveMessage])

  const undoEdit = useCallback((messageIndex: number) => {
    const message = messages[messageIndex]
    if (!message?.previousState || !editHandlerRef.current) return
    
    const success = editHandlerRef.current({
      type: 'replace_all',
      title: message.previousState.title,
      subtitle: message.previousState.subtitle,
      markdown: message.previousState.markdown,
    })
    
    if (success) {
      setMessages(prev => {
        const updated = [...prev]
        updated[messageIndex] = {
          ...updated[messageIndex],
          appliedEdits: false,
          previousState: undefined,
        }
        return updated
      })
    }
  }, [messages])

  const expandPlan = useCallback((wordCount: number = 800) => {
    if (!expandPlanHandlerRef.current) return
    
    const lastAssistantMessage = [...messages].reverse().find(m => m.role === 'assistant')
    if (!lastAssistantMessage?.content) return
    
    expandPlanHandlerRef.current(lastAssistantMessage.content, wordCount)
    
    setIsOpen(false)
  }, [messages])

  const value = useMemo<ChatContextValue>(() => ({
    messages,
    essayContext,
    isStreaming,
    isOpen,
    mode,
    webSearchEnabled,
    thinkingEnabled,
    selectedModel,
    setEssayContext,
    sendMessage,
    stopStreaming,
    addMessage,
    clearMessages,
    setIsOpen,
    setMode,
    setWebSearchEnabled,
    setThinkingEnabled,
    setSelectedModel,
    registerEditHandler,
    undoEdit,
    registerExpandPlanHandler,
    expandPlan,
  }), [
    messages,
    essayContext,
    isStreaming,
    isOpen,
    mode,
    webSearchEnabled,
    thinkingEnabled,
    selectedModel,
    sendMessage,
    stopStreaming,
    addMessage,
    clearMessages,
    registerEditHandler,
    undoEdit,
    registerExpandPlanHandler,
    expandPlan,
  ])

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  )
}

export function useChatContext() {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider')
  }
  return context
}

export { ChatContext }
