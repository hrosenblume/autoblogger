export interface AIModel {
  id: string
  name: string
  provider: 'anthropic' | 'openai'
  modelId: string
  description?: string
}

export const AI_MODELS: AIModel[] = [
  {
    id: 'claude-sonnet',
    name: 'Claude Sonnet 4',
    provider: 'anthropic',
    modelId: 'claude-sonnet-4-20250514',
    description: 'Fast and capable for most tasks',
  },
  {
    id: 'claude-opus',
    name: 'Claude Opus 4',
    provider: 'anthropic',
    modelId: 'claude-opus-4-20250514',
    description: 'Most capable for complex tasks',
  },
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'openai',
    modelId: 'gpt-4o',
    description: 'OpenAI flagship model',
  },
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'openai',
    modelId: 'gpt-4o-mini',
    description: 'Fast and affordable',
  },
]

export function getModel(id: string): AIModel | undefined {
  return AI_MODELS.find(m => m.id === id)
}

export function getDefaultModel(): AIModel {
  return AI_MODELS[0]
}
