'use client'

import { ChatIcon } from './Icons'
import { useChatContextOptional } from '../hooks/useChat'

export function ChatButton() {
  const chatContext = useChatContextOptional()
  
  // Don't render if not within ChatProvider
  if (!chatContext) return null
  
  const { setIsOpen, isOpen } = chatContext
  
  return (
    <button
      type="button"
      onClick={() => setIsOpen(!isOpen)}
      className={`w-10 h-10 md:w-9 md:h-9 rounded-md border border-border active:bg-accent md:hover:bg-accent flex items-center justify-center transition-colors ${isOpen ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'}`}
      aria-label="Toggle chat"
      title="Chat (⌘⇧A)"
    >
      <ChatIcon className="w-5 h-5 md:w-4 md:h-4" />
    </button>
  )
}
