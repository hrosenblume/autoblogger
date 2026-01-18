'use client'

import { useState, useEffect } from 'react'
import { ChevronDown, RotateCcw, Loader2 } from 'lucide-react'
import { useDashboardContext } from '../../context'
import { Skeleton } from '../../components/Skeleton'
import { CollapsibleTemplate } from './CollapsibleTemplate'

export function AISettings() {
  const { apiBasePath, refetchSharedData } = useDashboardContext()
  const [rules, setRules] = useState('')
  const [chatRules, setChatRules] = useState('')
  const [rewriteRules, setRewriteRules] = useState('')
  const [autoDraftRules, setAutoDraftRules] = useState('')
  const [planRules, setPlanRules] = useState('')
  const [autoDraftWordCount, setAutoDraftWordCount] = useState(800)
  const [autoDraftEnabled, setAutoDraftEnabled] = useState(false)
  const [defaultModel, setDefaultModel] = useState('claude-sonnet')
  const [models, setModels] = useState<{ id: string; name: string; description: string }[]>([])
  const [generateTemplate, setGenerateTemplate] = useState<string | null>(null)
  const [chatTemplate, setChatTemplate] = useState<string | null>(null)
  const [rewriteTemplate, setRewriteTemplate] = useState<string | null>(null)
  const [autoDraftTemplate, setAutoDraftTemplate] = useState<string | null>(null)
  const [planTemplate, setPlanTemplate] = useState<string | null>(null)
  const [expandPlanTemplate, setExpandPlanTemplate] = useState<string | null>(null)
  const [agentTemplate, setAgentTemplate] = useState<string | null>(null)
  const [defaultGenerateTemplate, setDefaultGenerateTemplate] = useState('')
  const [defaultChatTemplate, setDefaultChatTemplate] = useState('')
  const [defaultRewriteTemplate, setDefaultRewriteTemplate] = useState('')
  const [defaultAutoDraftTemplate, setDefaultAutoDraftTemplate] = useState('')
  const [defaultPlanRules, setDefaultPlanRules] = useState('')
  const [defaultPlanTemplate, setDefaultPlanTemplate] = useState('')
  const [defaultExpandPlanTemplate, setDefaultExpandPlanTemplate] = useState('')
  const [defaultAgentTemplate, setDefaultAgentTemplate] = useState('')
  const [anthropicKey, setAnthropicKey] = useState('')
  const [openaiKey, setOpenaiKey] = useState('')
  const [hasAnthropicEnvKey, setHasAnthropicEnvKey] = useState(false)
  const [hasOpenaiEnvKey, setHasOpenaiEnvKey] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch(`${apiBasePath}/ai/settings`).then(res => res.ok ? res.json() : Promise.reject()),
      fetch(`${apiBasePath}/settings`).then(res => res.ok ? res.json() : Promise.reject()),
    ])
      .then(([aiRes, settingsRes]) => {
        const data = aiRes.data || aiRes || {}
        setRules(data.rules || '')
        setChatRules(data.chatRules || '')
        setRewriteRules(data.rewriteRules || '')
        setAutoDraftRules(data.autoDraftRules || '')
        setPlanRules(data.planRules || '')
        setAutoDraftWordCount(data.autoDraftWordCount ?? 800)
        setDefaultModel(data.defaultModel || 'claude-sonnet')
        setModels(data.availableModels || [
          { id: 'claude-sonnet', name: 'Sonnet 4.5', description: 'Fast, capable, best value' },
          { id: 'claude-opus', name: 'Opus 4.5', description: 'Highest quality, slower' },
          { id: 'gpt-5.2', name: 'GPT-5.2', description: 'Latest OpenAI flagship' },
          { id: 'gpt-5-mini', name: 'GPT-5 Mini', description: 'Fast and cost-efficient' },
        ])
        setGenerateTemplate(data.generateTemplate ?? null)
        setChatTemplate(data.chatTemplate ?? null)
        setRewriteTemplate(data.rewriteTemplate ?? null)
        setAutoDraftTemplate(data.autoDraftTemplate ?? null)
        setPlanTemplate(data.planTemplate ?? null)
        setExpandPlanTemplate(data.expandPlanTemplate ?? null)
        setAgentTemplate(data.agentTemplate ?? null)
        setDefaultGenerateTemplate(data.defaultGenerateTemplate || '')
        setDefaultChatTemplate(data.defaultChatTemplate || '')
        setDefaultRewriteTemplate(data.defaultRewriteTemplate || '')
        setDefaultAutoDraftTemplate(data.defaultAutoDraftTemplate || '')
        setDefaultPlanRules(data.defaultPlanRules || '')
        setDefaultPlanTemplate(data.defaultPlanTemplate || '')
        setDefaultExpandPlanTemplate(data.defaultExpandPlanTemplate || '')
        setDefaultAgentTemplate(data.defaultAgentTemplate || '')
        setAnthropicKey(data.anthropicKey || '')
        setOpenaiKey(data.openaiKey || '')
        setHasAnthropicEnvKey(data.hasAnthropicEnvKey ?? false)
        setHasOpenaiEnvKey(data.hasOpenaiEnvKey ?? false)
        setAutoDraftEnabled(settingsRes.data?.autoDraftEnabled ?? false)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [apiBasePath])

  async function handleSave() {
    setSaving(true)
    setSaved(false)
    await Promise.all([
      fetch(`${apiBasePath}/ai/settings`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          rules, chatRules, rewriteRules, autoDraftRules, planRules, autoDraftWordCount, defaultModel,
          generateTemplate, chatTemplate, rewriteTemplate, autoDraftTemplate, planTemplate, expandPlanTemplate, agentTemplate,
          anthropicKey: anthropicKey || null,
          openaiKey: openaiKey || null,
        }),
      }),
      fetch(`${apiBasePath}/settings`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ autoDraftEnabled }),
      }),
    ])
    setSaving(false)
    setSaved(true)
    await refetchSharedData()
    setTimeout(() => setSaved(false), 2000)
  }

  if (loading) return <Skeleton className="h-32" />

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">AI Settings</h2>
        <p className="text-sm text-muted-foreground">Configure your AI writing assistant.</p>
      </div>

      {/* Section 1: Models */}
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-base font-medium">Models</h3>
            <p className="text-sm text-muted-foreground">API keys and model configuration.</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="anthropicKey" className="text-sm font-medium leading-none">Anthropic API Key</label>
              {hasAnthropicEnvKey && !anthropicKey ? (
                <div className="flex h-10 w-full items-center rounded-md border border-input bg-muted/50 px-3 py-2 text-sm">
                  <span className="text-muted-foreground">••••••••</span>
                  <span className="ml-2 text-xs text-ab-success">(from environment)</span>
                </div>
              ) : (
                <input
                  id="anthropicKey"
                  type="password"
                  value={anthropicKey}
                  onChange={e => setAnthropicKey(e.target.value)}
                  placeholder={hasAnthropicEnvKey ? "Override env variable..." : "sk-ant-..."}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 font-mono"
                  disabled={saving}
                />
              )}
              <p className="text-xs text-muted-foreground">
                {hasAnthropicEnvKey && !anthropicKey 
                  ? 'Using ANTHROPIC_API_KEY from environment. Enter a value above to override.' 
                  : 'Required for Claude models (Sonnet, Opus)'}
              </p>
            </div>
            <div className="space-y-2">
              <label htmlFor="openaiKey" className="text-sm font-medium leading-none">OpenAI API Key</label>
              {hasOpenaiEnvKey && !openaiKey ? (
                <div className="flex h-10 w-full items-center rounded-md border border-input bg-muted/50 px-3 py-2 text-sm">
                  <span className="text-muted-foreground">••••••••</span>
                  <span className="ml-2 text-xs text-ab-success">(from environment)</span>
                </div>
              ) : (
                <input
                  id="openaiKey"
                  type="password"
                  value={openaiKey}
                  onChange={e => setOpenaiKey(e.target.value)}
                  placeholder={hasOpenaiEnvKey ? "Override env variable..." : "sk-..."}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 font-mono"
                  disabled={saving}
                />
              )}
              <p className="text-xs text-muted-foreground">
                {hasOpenaiEnvKey && !openaiKey 
                  ? 'Using OPENAI_API_KEY from environment. Enter a value above to override.' 
                  : 'Required for GPT models'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <label className="text-sm font-medium leading-none shrink-0">Default Model</label>
            <div className="relative max-w-sm flex-1">
              <select
                value={defaultModel}
                onChange={e => setDefaultModel(e.target.value)}
                className="h-10 w-full appearance-none rounded-md border border-input bg-background pl-3 pr-10 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer"
              >
                {models.map(model => (
                  <option key={model.id} value={model.id}>{model.name} — {model.description}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Prompts */}
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-base font-medium">Prompts</h3>
            <p className="text-sm text-muted-foreground">Rules and templates for AI-generated content.</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium leading-none">Essay Writing Rules</label>
            <p className="text-sm text-muted-foreground">
              Style and format rules for generated essays. Applied when generating or rewriting content.
            </p>
            <textarea
              value={rules}
              onChange={e => setRules(e.target.value)}
              placeholder={`- Never use "utilize" — always say "use"
- Avoid passive voice
- Start with concrete scenes, not abstractions
- Short paragraphs (3-4 sentences max)
- Use em-dashes sparingly
- End with forward motion, not tidy conclusions`}
              className="flex min-h-[180px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-mono resize-none"
              disabled={saving}
            />
            <CollapsibleTemplate
              label="Generate"
              value={generateTemplate}
              defaultValue={defaultGenerateTemplate}
              onChange={setGenerateTemplate}
              onReset={() => setGenerateTemplate(null)}
              placeholders="{{RULES}}, {{STYLE_EXAMPLES}}"
              disabled={saving}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium leading-none">Chat Behavior Rules</label>
            <p className="text-sm text-muted-foreground">
              How the assistant should behave during brainstorming conversations.
            </p>
            <textarea
              value={chatRules}
              onChange={e => setChatRules(e.target.value)}
              placeholder={`- Be direct and concise
- Push back on vague ideas
- Ask clarifying questions before drafting
- Challenge my assumptions`}
              className="flex min-h-[140px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-mono resize-none"
              disabled={saving}
            />
            <CollapsibleTemplate
              label="Chat"
              value={chatTemplate}
              defaultValue={defaultChatTemplate}
              onChange={setChatTemplate}
              onReset={() => setChatTemplate(null)}
              placeholders="{{RULES}}, {{CHAT_RULES}}, {{STYLE_EXAMPLES}}"
              disabled={saving}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium leading-none">Rewrite Rules</label>
            <p className="text-sm text-muted-foreground">
              Rules for cleaning up selected text with the rewrite tool.
            </p>
            <textarea
              value={rewriteRules}
              onChange={e => setRewriteRules(e.target.value)}
              placeholder={`- Keep the same meaning, improve clarity
- Maintain sentence length variety
- Remove filler words
- Don't add new ideas`}
              className="flex min-h-[140px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-mono resize-none"
              disabled={saving}
            />
            <CollapsibleTemplate
              label="Rewrite"
              value={rewriteTemplate}
              defaultValue={defaultRewriteTemplate}
              onChange={setRewriteTemplate}
              onReset={() => setRewriteTemplate(null)}
              placeholders="{{RULES}}, {{REWRITE_RULES}}, {{STYLE_EXAMPLES}}"
              disabled={saving}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium leading-none">Auto-Draft Rules</label>
            <p className="text-sm text-muted-foreground">
              Rules for generating essays from news articles via RSS feeds.
            </p>
            <textarea
              value={autoDraftRules}
              onChange={e => setAutoDraftRules(e.target.value)}
              placeholder={`- Write original perspectives, don't summarize
- Take a contrarian angle when appropriate
- Include personal insights and experiences
- Focus on implications, not just facts`}
              className="flex min-h-[140px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-mono resize-none"
              disabled={saving}
            />
            <div className="flex items-center gap-4 pt-2">
              <div className="flex items-center gap-2">
                <label className="text-sm whitespace-nowrap">Target word count:</label>
                <input
                  type="number"
                  min={200}
                  max={3000}
                  value={autoDraftWordCount}
                  onChange={e => setAutoDraftWordCount(parseInt(e.target.value) || 800)}
                  className="flex h-10 w-24 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  disabled={saving}
                />
              </div>
            </div>
            <CollapsibleTemplate
              label="Auto-Draft"
              value={autoDraftTemplate}
              defaultValue={defaultAutoDraftTemplate}
              onChange={setAutoDraftTemplate}
              onReset={() => setAutoDraftTemplate(null)}
              placeholders="{{AUTO_DRAFT_RULES}}, {{AUTO_DRAFT_WORD_COUNT}}, {{RULES}}, {{STYLE_EXAMPLES}}, {{TOPIC_NAME}}, {{ARTICLE_TITLE}}, {{ARTICLE_SUMMARY}}, {{ARTICLE_URL}}"
              disabled={saving}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium leading-none">Plan Format Rules</label>
            <p className="text-sm text-muted-foreground">
              Rules for essay plan structure and format in Plan mode.
            </p>
            <div className="flex items-center justify-end">
              {planRules && (
                <button
                  type="button"
                  onClick={() => setPlanRules('')}
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium h-7 px-2 hover:bg-accent hover:text-accent-foreground"
                >
                  <RotateCcw className="h-3 w-3 mr-1" />
                  Reset to default
                </button>
              )}
            </div>
            <textarea
              value={planRules || defaultPlanRules}
              onChange={e => setPlanRules(e.target.value)}
              className="flex min-h-[250px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-mono resize-none"
              disabled={saving}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium leading-none">Plan Mode Template</label>
            <p className="text-sm text-muted-foreground">
              Prompt template for Plan mode in chat.
            </p>
            <CollapsibleTemplate
              label="Plan"
              value={planTemplate}
              defaultValue={defaultPlanTemplate}
              onChange={setPlanTemplate}
              onReset={() => setPlanTemplate(null)}
              placeholders="{{PLAN_RULES}}, {{STYLE_EXAMPLES}}"
              disabled={saving}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium leading-none">Expand Plan Template</label>
            <p className="text-sm text-muted-foreground">
              Prompt template for expanding a plan into a full essay.
            </p>
            <CollapsibleTemplate
              label="Expand Plan"
              value={expandPlanTemplate}
              defaultValue={defaultExpandPlanTemplate}
              onChange={setExpandPlanTemplate}
              onReset={() => setExpandPlanTemplate(null)}
              placeholders="{{RULES}}, {{STYLE_EXAMPLES}}, {{PLAN}}"
              disabled={saving}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium leading-none">Agent Mode Template</label>
            <p className="text-sm text-muted-foreground">
              Instructions for Agent mode in chat.
            </p>
            <CollapsibleTemplate
              label="Agent"
              value={agentTemplate}
              defaultValue={defaultAgentTemplate}
              onChange={setAgentTemplate}
              onReset={() => setAgentTemplate(null)}
              placeholders="(no placeholders - appended to chat prompt)"
              disabled={saving}
            />
          </div>
        </div>
      </div>

      {/* Section 3: Features */}
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-base font-medium">Features</h3>
            <p className="text-sm text-muted-foreground">Enable or disable AI features.</p>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <label className="text-sm font-medium leading-none">Auto-Draft</label>
              <p className="text-sm text-muted-foreground">
                Enable RSS topic subscriptions and automatic draft generation.
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={autoDraftEnabled}
              onClick={() => setAutoDraftEnabled(!autoDraftEnabled)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${autoDraftEnabled ? 'bg-foreground' : 'bg-input'}`}
            >
              <span
                className={`pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform ${autoDraftEnabled ? 'translate-x-5' : 'translate-x-0'}`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium h-10 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50"
        >
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {saving ? 'Saving...' : 'Save'}
        </button>
        {saved && (
          <span className="text-sm text-ab-success">
            Saved!
          </span>
        )}
      </div>
    </div>
  )
}
