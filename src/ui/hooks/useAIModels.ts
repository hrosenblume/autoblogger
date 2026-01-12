'use client'

import { useState, useEffect } from 'react'
import type { AIModelOption } from '../../lib/models'

interface UseAIModelsOptions {
  /** External selected model state (for context-managed selection) */
  externalSelectedModel?: string
  /** External setter (for context-managed selection) */
  externalSetSelectedModel?: (id: string) => void
  /** Custom API path for settings (defaults to /api/cms/ai/settings) */
  apiPath?: string
}

interface UseAIModelsResult {
  models: AIModelOption[]
  selectedModel: string
  setSelectedModel: (id: string) => void
  currentModel: AIModelOption | undefined
  isLoading: boolean
}

/**
 * Hook to fetch available AI models and manage selection.
 * Fetches models from AI settings endpoint and sets default model on mount.
 * 
 * Can use internal state (default) or external state (for context-managed selection).
 */
export function useAIModels(options?: UseAIModelsOptions): UseAIModelsResult {
  const [models, setModels] = useState<AIModelOption[]>([])
  const [internalSelectedModel, setInternalSelectedModel] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  // Use external state if provided, otherwise internal
  const selectedModel = options?.externalSelectedModel ?? internalSelectedModel
  const setSelectedModel = options?.externalSetSelectedModel ?? setInternalSelectedModel
  
  const apiPath = options?.apiPath ?? '/api/cms/ai/settings'

  useEffect(() => {
    fetch(apiPath)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then(data => {
        // Handle both wrapped { data: {...} } and unwrapped response formats
        const settings = data.data || data
        setModels(settings.availableModels || [])
        if (settings.defaultModel && !selectedModel) {
          setSelectedModel(settings.defaultModel)
        }
      })
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }, [apiPath]) // eslint-disable-line react-hooks/exhaustive-deps
  // Intentionally omit selectedModel/setSelectedModel - we only want to set default on mount

  const currentModel = models.find(m => m.id === selectedModel)

  return {
    models,
    selectedModel,
    setSelectedModel,
    currentModel,
    isLoading,
  }
}
