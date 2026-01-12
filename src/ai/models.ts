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
    name: 'Sonnet 4.5',
    provider: 'anthropic',
    modelId: 'claude-sonnet-4-5-20250929',
    description: 'Fast, capable, best value',
  },
  {
    id: 'claude-opus',
    name: 'Opus 4.5',
    provider: 'anthropic',
    modelId: 'claude-opus-4-5-20251101',
    description: 'Highest quality, slower',
  },
  {
    id: 'gpt-5.2',
    name: 'GPT-5.2',
    provider: 'openai',
    modelId: 'gpt-5.2',
    description: 'Latest OpenAI flagship',
  },
  {
    id: 'gpt-5-mini',
    name: 'GPT-5 Mini',
    provider: 'openai',
    modelId: 'gpt-5-mini',
    description: 'Fast and cost-efficient',
  },
]

export function getModel(id: string): AIModel | undefined {
  return AI_MODELS.find(m => m.id === id)
}

export function getDefaultModel(): AIModel {
  return AI_MODELS[0]
}
