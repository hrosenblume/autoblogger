'use client'

import { useState, useRef, useEffect, useCallback, useContext } from 'react'
import { createPortal } from 'react-dom'
import { Loader2, X, Copy, Check, ArrowUp, Pencil, Undo2, ChevronDown, MessageSquare, Globe, Brain, Square, List } from 'lucide-react'
import { useChatContext, type ChatMode } from '../hooks/useChat'
import { DEFAULT_MODELS, type AIModelOption } from '../../lib/models'
import { ControlButton } from './ControlButton'
import { ModelSelector } from './ModelSelector'
import { markdownToHtml } from '../../lib/markdown'
import { DashboardContext } from '../context'

/** Default prose classes for chat messages */
const DEFAULT_PROSE_CLASSES = 'prose prose-gray dark:prose-invert max-w-none prose-p:leading-relaxed prose-a:underline'

/** Strip <plan> tags for display during streaming */
function stripPlanTags(content: string): string {
  return content
    .replace(/<plan>/gi, '')
    .replace(/<\/plan>/gi, '')
}

interface ChatPanelProps {
  /** @deprecated Models are now fetched from DashboardContext */
  modelsApiPath?: string
  /** Optional prose classes for message rendering */
  proseClasses?: string
  /** Optional callback when navigating (e.g., for expandPlan navigation) */
  onNavigate?: (path: string) => void
  /** Whether currently on an editor page (controls Draft Essay behavior) */
  isOnEditor?: boolean
}

export function ChatPanel({ 
  proseClasses = DEFAULT_PROSE_CLASSES,
  onNavigate: onNavigateProp,
  isOnEditor: isOnEditorProp,
}: ChatPanelProps) {
  const { 
    messages, 
    isStreaming, 
    isOpen: open, 
    setIsOpen,
    sendMessage: contextSendMessage,
    stopStreaming,
    essayContext,
    mode,
    setMode,
    undoEdit,
    webSearchEnabled,
    setWebSearchEnabled,
    thinkingEnabled,
    setThinkingEnabled,
    selectedModel,
    setSelectedModel,
    expandPlan,
  } = useChatContext()
  
  // Try to get navigate from dashboard context as fallback
  const dashboardContext = useContext(DashboardContext)
  const onNavigate = onNavigateProp ?? dashboardContext?.navigate
  
  // Use essayContext presence to detect if we're editing (works with autoblogger)
  const isOnEditor = isOnEditorProp ?? !!essayContext
  
  const [input, setInput] = useState('')
  const [isAnimating, setIsAnimating] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const [modeMenuOpen, setModeMenuOpen] = useState(false)
  const modeMenuRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const prevMessageCountRef = useRef(0)
  const savedScrollPositionRef = useRef<number | null>(null)
  const lastUserMessageRef = useRef<HTMLDivElement>(null)
  
  
  // Get models from dashboard context or use defaults
  const contextModels = dashboardContext?.sharedData?.aiSettings?.availableModels as AIModelOption[] | undefined
  const models = (contextModels && contextModels.length > 0) ? contextModels : DEFAULT_MODELS
  const currentModel = models.find(m => m.id === selectedModel)
  
  const onClose = useCallback(() => setIsOpen(false), [setIsOpen])
  
  const copyToClipboard = useCallback(async (text: string, index: number) => {
    await navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }, [])
  
  // Handle Draft Essay button - either expand in current editor or navigate to new editor
  const handleDraftEssay = useCallback(() => {
    // Find the last assistant message (the plan)
    const lastAssistantMessage = [...messages].reverse().find(m => m.role === 'assistant')
    if (!lastAssistantMessage?.content) return
    
    if (isOnEditor) {
      // Already on editor page - use the registered handler and switch to agent mode
      expandPlan()
      setMode('agent')
    } else if (onNavigate) {
      // Not on editor - store plan in sessionStorage and navigate to new editor
      sessionStorage.setItem('pendingPlan', lastAssistantMessage.content)
      setIsOpen(false)
      onNavigate('/editor?fromPlan=1')
    } else {
      // Fallback: try to navigate directly if no handler (browser navigation)
      sessionStorage.setItem('pendingPlan', lastAssistantMessage.content)
      setIsOpen(false)
      window.location.href = '/writer/editor?fromPlan=1'
    }
  }, [messages, isOnEditor, expandPlan, setIsOpen, setMode, onNavigate])
  
  // Close mode menu on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (modeMenuRef.current && !modeMenuRef.current.contains(e.target as Node)) {
        setModeMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])
  
  // Client-side only for portal
  useEffect(() => {
    setMounted(true)
  }, [])

  // Handle open/close - just set visibility
  useEffect(() => {
    if (open) {
      setIsVisible(true)
      // Lock body scroll on iOS
      document.body.style.overflow = 'hidden'
      document.body.style.position = 'fixed'
      document.body.style.width = '100%'
      document.body.style.top = `-${window.scrollY}px`
    } else {
      setIsAnimating(false)
      // Restore body scroll
      const scrollY = document.body.style.top
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.width = ''
      document.body.style.top = ''
      window.scrollTo(0, parseInt(scrollY || '0') * -1)
      // Wait for animation to complete before hiding
      const timer = setTimeout(() => {
        setIsVisible(false)
      }, 200)
      return () => clearTimeout(timer)
    }
  }, [open])

  // Start animation AFTER visibility is set (separate render cycle)
  useEffect(() => {
    if (isVisible && open && !isAnimating) {
      // Element is now in DOM with translate-x-full, trigger transition
      requestAnimationFrame(() => {
        setIsAnimating(true)
      })
    }
  }, [isVisible, open, isAnimating])

  // Save scroll position when panel closes
  useEffect(() => {
    if (!open && messagesContainerRef.current) {
      savedScrollPositionRef.current = messagesContainerRef.current.scrollTop
    }
  }, [open])

  // Restore scroll position or scroll to bottom for new messages
  useEffect(() => {
    if (!open || !isVisible) return
    
    const container = messagesContainerRef.current
    if (!container) return
    
    const prevCount = prevMessageCountRef.current
    const currentCount = messages.length
    
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (currentCount > prevCount) {
          // Scroll when new messages added (user sends message)
          const behavior = prevCount === 0 ? 'instant' : 'smooth'
          messagesEndRef.current?.scrollIntoView({ behavior })
        } else if (savedScrollPositionRef.current !== null) {
          // Re-opening panel - restore scroll position
          container.scrollTop = savedScrollPositionRef.current
        }
        
        prevMessageCountRef.current = currentCount
      })
    })
  }, [messages.length, open, isVisible])

  // During streaming, scroll until user's message reaches top of container
  useEffect(() => {
    if (!isStreaming) return
    
    const container = messagesContainerRef.current
    const userMessage = lastUserMessageRef.current
    if (!container || !userMessage) return
    
    // Get positions
    const containerRect = container.getBoundingClientRect()
    const messageRect = userMessage.getBoundingClientRect()
    
    // If user message is still below the top of container, scroll down
    const distanceFromTop = messageRect.top - containerRect.top
    if (distanceFromTop > 10) {
      // Scroll by a portion of the distance, creates smooth catching up
      container.scrollTop += Math.min(distanceFromTop * 0.3, 30)
    }
  }, [messages, isStreaming])

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`
    }
  }, [input])


  const sendMessage = useCallback(async () => {
    if (!input.trim() || isStreaming) return
    const content = input.trim()
    setInput('')
    await contextSendMessage(content)
  }, [input, isStreaming, contextSendMessage])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
    if (e.key === 'Escape') {
      e.stopPropagation()
      onClose()
    }
  }
  
  // Keyboard shortcut to toggle agent/ask mode (Cmd/Ctrl + Shift + A)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault()
        if (essayContext) {
          // With essay context: open chat if closed, toggle agent/ask if open
          if (!open) {
            setIsOpen(true)
          }
          setMode(mode === 'agent' ? 'ask' : 'agent')
        } else {
          // No essay context (dashboard): toggle chat open/closed
          setIsOpen(!open)
          setMode('ask')
        }
      }
    }
    
    document.addEventListener('keydown', handleGlobalKeyDown)
    return () => document.removeEventListener('keydown', handleGlobalKeyDown)
  }, [open, setIsOpen, setMode, essayContext, mode])

  if (!isVisible || !mounted) return null
  
  return createPortal(
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 h-[100dvh] bg-black/20 z-[60] transition-opacity duration-200 ${isAnimating ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />
      
      {/* Panel */}
      <div 
        role="dialog"
        aria-modal="true"
        aria-label="Chat"
        className={`autoblogger fixed z-[70] flex flex-col bg-background shadow-xl transition-transform duration-200 ease-out overflow-hidden inset-x-0 top-0 h-[100dvh] md:left-auto md:w-full md:max-w-[380px] md:border-l md:border-border ${isAnimating ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className="flex-shrink-0 border-b border-border px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="font-medium">Chat</h2>
            {essayContext && (
              <span className="inline-block px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 truncate max-w-[140px]">
                {essayContext.title || 'Untitled'}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-md hover:bg-accent flex items-center justify-center text-muted-foreground"
            aria-label="Close chat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Messages */}
        <div ref={messagesContainerRef} className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center max-w-xs px-6">
                <p className="text-muted-foreground text-sm">
                  {mode === 'plan'
                    ? "Describe your essay idea and I'll create a structured outline with section headers and key points."
                    : essayContext 
                      ? "Chat about your essay — ask for feedback, discuss ideas, or get help with specific sections."
                      : "Chat with AI to brainstorm ideas, get feedback, or explore topics."
                  }
                </p>
              </div>
            </div>
          ) : (
            <div className="px-4 py-4 space-y-4">
              {messages.map((message, index) => {
                // Track last user message for scroll behavior
                const isLastUserMessage = message.role === 'user' && 
                  !messages.slice(index + 1).some(m => m.role === 'user')
                
                return (
                <div
                  key={index}
                  ref={isLastUserMessage ? lastUserMessageRef : undefined}
                  className={`flex gap-3 group ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm relative ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
                  >
                    {message.role === 'assistant' ? (
                      <div 
                        className={`${proseClasses} [&>*:first-child]:mt-0 [&>*:last-child]:mb-0`}
                        dangerouslySetInnerHTML={{ __html: markdownToHtml(stripPlanTags(message.content)) }}
                      />
                    ) : (
                      <div className="whitespace-pre-wrap break-words">
                        {message.content}
                      </div>
                    )}
                    {isStreaming && index === messages.length - 1 && message.role === 'assistant' && (
                      <span className="inline-block w-1.5 h-3 bg-current ml-0.5 animate-pulse" />
                    )}
                    {/* Applied edit indicator with undo button */}
                    {message.appliedEdits && message.previousState && (
                      <div className="flex items-center gap-2 mt-1.5">
                        <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                          <Pencil className="w-3 h-3" />
                          <span>Edit applied</span>
                        </div>
                        <button
                          onClick={() => undoEdit(index)}
                          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                          aria-label="Undo edit"
                        >
                          <Undo2 className="w-3 h-3" />
                          <span>Undo</span>
                        </button>
                      </div>
                    )}
                    {/* Action buttons for assistant messages */}
                    {message.role === 'assistant' && !isStreaming && (
                      <div className="absolute -bottom-6 left-0 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => copyToClipboard(message.content, index)}
                          className="text-muted-foreground hover:text-foreground p-1 rounded"
                          aria-label="Copy message"
                        >
                          {copiedIndex === index ? (
                            <Check className="w-3.5 h-3.5 text-green-500" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                        {/* Draft Essay button for plan mode */}
                        {message.mode === 'plan' && index === messages.length - 1 && message.content && (
                          <button
                            onClick={handleDraftEssay}
                            className="text-xs text-muted-foreground hover:text-foreground px-1 rounded"
                          >
                            Draft Essay
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )})}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <form 
          onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
          className="flex-shrink-0 border-t border-border bg-background p-3 pb-[calc(1rem+env(safe-area-inset-bottom,0px))]"
        >
          {/* Controls Row: Mode Dropdown, Globe Toggle, Model Dropdown */}
          <div className="mb-2 flex items-center gap-2">
            {/* Mode Dropdown */}
            <div ref={modeMenuRef} className="relative">
              <button
                type="button"
                onClick={() => setModeMenuOpen(!modeMenuOpen)}
                title="Switch mode (⌘⇧A)"
                className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full transition-colors ${
                  mode === 'ask' 
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                    : mode === 'agent' 
                      ? 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                      : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                }`}
              >
                {mode === 'ask' && <MessageSquare className="w-3 h-3" />}
                {mode === 'agent' && <Pencil className="w-3 h-3" />}
                {mode === 'plan' && <List className="w-3 h-3" />}
                {mode === 'ask' ? 'Ask' : mode === 'agent' ? 'Agent' : 'Plan'}
                <ChevronDown className="w-2.5 h-2.5 opacity-60" />
              </button>
              {modeMenuOpen && (
                <div className="absolute bottom-full left-0 mb-1 min-w-[160px] bg-popover border border-border rounded-lg shadow-lg z-[100] py-1">
                  <button
                    type="button"
                    onClick={() => { setMode('agent'); setModeMenuOpen(false); textareaRef.current?.focus() }}
                    disabled={!essayContext}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-accent flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Pencil className="w-4 h-4" />
                    <span className="flex-1">Agent</span>
                    <span className="text-xs text-muted-foreground">⌘⇧A</span>
                    {mode === 'agent' && <Check className="w-4 h-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setMode('plan'); setModeMenuOpen(false); textareaRef.current?.focus() }}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-accent flex items-center gap-2"
                  >
                    <List className="w-4 h-4" />
                    <span className="flex-1">Plan</span>
                    {mode === 'plan' && <Check className="w-4 h-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setMode('ask'); setModeMenuOpen(false); textareaRef.current?.focus() }}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-accent flex items-center gap-2"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span className="flex-1">Ask</span>
                    {mode === 'ask' && <Check className="w-4 h-4" />}
                  </button>
                </div>
              )}
            </div>
            
            {/* Web Search Toggle */}
            <ControlButton
              onClick={() => { setWebSearchEnabled(!webSearchEnabled); textareaRef.current?.focus() }}
              active={webSearchEnabled}
              title={webSearchEnabled ? "Web search enabled (works with all models)" : "Enable web search (works with all models)"}
              tabIndex={-1}
            >
              <Globe className="w-4 h-4" />
            </ControlButton>
            
            {/* Thinking Mode Toggle */}
            <ControlButton
              onClick={() => { setThinkingEnabled(!thinkingEnabled); textareaRef.current?.focus() }}
              active={thinkingEnabled}
              title={thinkingEnabled ? "Thinking mode enabled" : "Enable thinking mode"}
              tabIndex={-1}
            >
              <Brain className="w-4 h-4" />
            </ControlButton>
            
            {/* Model Dropdown */}
            <ModelSelector
              models={models}
              selectedModel={selectedModel}
              onModelChange={(id) => { setSelectedModel(id); textareaRef.current?.focus() }}
              currentModel={currentModel}
            />
          </div>
          <div className="flex items-end gap-2">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                mode === 'plan'
                  ? "Describe your essay idea..."
                  : mode === 'agent' && essayContext
                    ? "Ask me to edit your essay..."
                    : essayContext 
                      ? "Ask about your essay..." 
                      : "Ask anything..."
              }
              className="flex-1 min-h-[40px] max-h-[120px] resize-none px-3 py-2 border border-input rounded-md bg-transparent text-sm focus:outline-none"
              rows={1}
              autoFocus
            />
            <button
              type={isStreaming ? 'button' : 'submit'}
              onClick={isStreaming ? stopStreaming : undefined}
              disabled={!isStreaming && !input.trim()}
              className="rounded-full w-10 h-10 flex-shrink-0 border border-input bg-secondary text-secondary-foreground hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center touch-manipulation"
            >
              {isStreaming ? (
                <Square className="h-4 w-4 fill-current" />
              ) : (
                <ArrowUp className="h-5 w-5" />
              )}
            </button>
          </div>
        </form>
      </div>
    </>,
    document.body
  )
}
