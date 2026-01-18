'use client'

import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, Play, X } from 'lucide-react'
import { useDashboardContext } from '../../context'
import { Skeleton } from '../../components/Skeleton'
import type { Topic } from './types'

export function TopicsSettings() {
  const { apiBasePath } = useDashboardContext()
  const [topics, setTopics] = useState<Topic[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null)
  const [generating, setGenerating] = useState<string | null>(null)

  // Form state
  const [formName, setFormName] = useState('')
  const [formKeywords, setFormKeywords] = useState('')
  const [formFeeds, setFormFeeds] = useState('')
  const [formFrequency, setFormFrequency] = useState('daily')
  const [formMaxPerPeriod, setFormMaxPerPeriod] = useState(3)
  const [formEssayFocus, setFormEssayFocus] = useState('')
  const [formIsActive, setFormIsActive] = useState(true)

  useEffect(() => {
    fetchTopics()
  }, [apiBasePath])

  async function fetchTopics() {
    const res = await fetch(`${apiBasePath}/topics`)
    if (res.ok) {
      const json = await res.json()
      setTopics(json.data || [])
    }
    setLoading(false)
  }

  function resetForm() {
    setFormName('')
    setFormKeywords('')
    setFormFeeds('')
    setFormFrequency('daily')
    setFormMaxPerPeriod(3)
    setFormEssayFocus('')
    setFormIsActive(true)
  }

  function openEditForm(topic: Topic) {
    setEditingTopic(topic)
    setFormName(topic.name)
    setFormKeywords(JSON.parse(topic.keywords).join(', '))
    setFormFeeds(JSON.parse(topic.rssFeeds).join('\n'))
    setFormFrequency(topic.frequency)
    setFormMaxPerPeriod(topic.maxPerPeriod)
    setFormEssayFocus(topic.essayFocus || '')
    setFormIsActive(topic.isActive)
    setShowForm(true)
  }

  function openNewForm() {
    setEditingTopic(null)
    resetForm()
    setShowForm(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const data = {
      name: formName,
      keywords: formKeywords.split(',').map(k => k.trim()).filter(Boolean),
      rssFeeds: formFeeds.split('\n').map(f => f.trim()).filter(Boolean),
      frequency: formFrequency,
      maxPerPeriod: formMaxPerPeriod,
      essayFocus: formEssayFocus || null,
      isActive: formIsActive,
    }

    const url = editingTopic ? `${apiBasePath}/topics/${editingTopic.id}` : `${apiBasePath}/topics`
    const method = editingTopic ? 'PATCH' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (res.ok) {
      setShowForm(false)
      resetForm()
      setEditingTopic(null)
      fetchTopics()
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this topic? This will also delete associated news items.')) return
    const res = await fetch(`${apiBasePath}/topics/${id}`, { method: 'DELETE' })
    if (res.ok) setTopics(topics.filter(t => t.id !== id))
  }

  async function handleGenerate(topicId: string) {
    setGenerating(topicId)
    try {
      const res = await fetch(`${apiBasePath}/topics/${topicId}/generate`, { method: 'POST' })
      if (res.ok) {
        fetchTopics()
      }
    } finally {
      setGenerating(null)
    }
  }

  if (loading) return <Skeleton className="h-32" />

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Topics</h2>
        <button onClick={openNewForm} className="flex items-center gap-1 px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-sm">
          <Plus className="h-4 w-4" /> New Topic
        </button>
      </div>
      <p className="text-muted-foreground text-sm -mt-2">RSS topic subscriptions for auto-generating draft posts.</p>

      {showForm && (
        <div className="border border-border rounded-lg p-4 space-y-4 bg-muted/30">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">{editingTopic ? 'Edit Topic' : 'New Topic'}</h3>
            <button onClick={() => { setShowForm(false); resetForm(); setEditingTopic(null) }} className="text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                value={formName}
                onChange={e => setFormName(e.target.value)}
                required
                className="w-full px-3 py-2 border border-input rounded-md bg-transparent"
                placeholder="e.g. School Lunch Policy"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Keywords (comma-separated)</label>
              <input
                type="text"
                value={formKeywords}
                onChange={e => setFormKeywords(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md bg-transparent"
                placeholder="school lunch, USDA, nutrition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">RSS Feed URLs (one per line)</label>
              <textarea
                value={formFeeds}
                onChange={e => setFormFeeds(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-input rounded-md bg-transparent resize-none font-mono text-sm"
                placeholder="https://example.com/feed.xml"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Frequency</label>
                <select
                  value={formFrequency}
                  onChange={e => setFormFrequency(e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded-md bg-transparent"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="hourly">Hourly</option>
                  <option value="manual">Manual</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Max per period</label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={formMaxPerPeriod}
                  onChange={e => setFormMaxPerPeriod(parseInt(e.target.value) || 3)}
                  className="w-full px-3 py-2 border border-input rounded-md bg-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Essay Focus (optional)</label>
              <textarea
                value={formEssayFocus}
                onChange={e => setFormEssayFocus(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-input rounded-md bg-transparent resize-none"
                placeholder="Specific angle or perspective for essays on this topic"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formIsActive}
                onChange={e => setFormIsActive(e.target.checked)}
              />
              <label htmlFor="isActive" className="text-sm">Active</label>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded-md">
                {editingTopic ? 'Update' : 'Create'}
              </button>
              <button type="button" onClick={() => { setShowForm(false); resetForm(); setEditingTopic(null) }} className="px-4 py-2 border border-input rounded-md">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
      
      <div className="border border-border rounded-lg divide-y divide-border">
        {topics.map(topic => {
          const keywords = JSON.parse(topic.keywords) as string[]
          const feeds = JSON.parse(topic.rssFeeds) as string[]
          return (
            <div key={topic.id} className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{topic.name}</p>
                    {!topic.isActive && <span className="text-xs bg-muted px-1.5 py-0.5 rounded">Paused</span>}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {keywords.slice(0, 3).join(', ')}{keywords.length > 3 && ` +${keywords.length - 3}`}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {feeds.length} feed{feeds.length !== 1 ? 's' : ''} · {topic.frequency} · {topic._count?.posts ?? 0} posts
                    {topic.lastRunAt && ` · Last run: ${new Date(topic.lastRunAt).toLocaleDateString()}`}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleGenerate(topic.id)}
                    disabled={generating !== null}
                    className="p-1.5 text-muted-foreground hover:text-foreground disabled:opacity-50"
                    title="Generate now"
                  >
                    <Play className={`h-4 w-4 ${generating === topic.id ? 'animate-pulse' : ''}`} />
                  </button>
                  <button onClick={() => openEditForm(topic)} className="p-1.5 text-muted-foreground hover:text-foreground">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleDelete(topic.id)} className="p-1.5 text-red-500 hover:text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )
        })}
        {topics.length === 0 && (
          <p className="p-4 text-muted-foreground text-center">No topics configured</p>
        )}
      </div>
    </div>
  )
}
