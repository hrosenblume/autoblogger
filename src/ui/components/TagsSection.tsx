'use client'

import { useState, useEffect, useRef } from 'react'

interface Tag {
  id: string
  name: string
}

interface TagsSectionProps {
  tags: Tag[]
  onTagsChange: (tags: Tag[]) => void
  apiBasePath: string
  disabled?: boolean
}

export function TagsSection({
  tags,
  onTagsChange,
  apiBasePath,
  disabled = false,
}: TagsSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [availableTags, setAvailableTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Fetch available tags when section expands
  useEffect(() => {
    if (isExpanded && availableTags.length === 0) {
      setLoading(true)
      fetch(`${apiBasePath}/tags`)
        .then(res => res.ok ? res.json() : Promise.reject())
        .then(data => {
          setAvailableTags(data.data || [])
          setLoading(false)
        })
        .catch(() => setLoading(false))
    }
  }, [isExpanded, availableTags.length, apiBasePath])

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!dropdownOpen) return
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [dropdownOpen])

  const handleAddTag = (tagId: string) => {
    const tagToAdd = availableTags.find(t => t.id === tagId)
    if (tagToAdd && !tags.some(t => t.id === tagId)) {
      onTagsChange([...tags, tagToAdd])
    }
    setDropdownOpen(false)
  }

  const handleRemoveTag = (tagId: string) => {
    onTagsChange(tags.filter(t => t.id !== tagId))
  }

  // Tags not already selected
  const unselectedTags = availableTags.filter(
    at => !tags.some(t => t.id === at.id)
  )

  const tagSummary = tags.length === 0
    ? 'no tags'
    : tags.length === 1
    ? '1 tag'
    : `${tags.length} tags`

  return (
    <div className="border-t border-gray-200 dark:border-gray-800 pt-4">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors w-full"
      >
        <svg 
          className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span>Tags</span>
        <span className="ml-auto text-xs text-gray-400">{tagSummary}</span>
      </button>

      {isExpanded && (
        <div className="mt-4 space-y-3 pl-6">
          {/* Selected tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map(tag => (
                <span
                  key={tag.id}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm"
                >
                  {tag.name}
                  {!disabled && (
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag.id)}
                      className="hover:text-red-500 transition-colors"
                    >
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </span>
              ))}
            </div>
          )}

          {/* Add tag dropdown */}
          {!disabled && (
            <>
              {loading ? (
                <p className="text-sm text-gray-500">Loading tags...</p>
              ) : unselectedTags.length > 0 ? (
                <div className="relative max-w-[200px]" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="w-full h-8 px-3 text-sm text-left border border-gray-200 dark:border-gray-700 rounded-md bg-transparent flex items-center justify-between"
                  >
                    <span className="text-gray-500">Add tag...</span>
                    <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {dropdownOpen && (
                    <div className="absolute z-50 top-full left-0 mt-1 w-full bg-popover border border-border rounded-md shadow-lg max-h-48 overflow-auto p-1">
                      {unselectedTags.map(tag => (
                        <button
                          key={tag.id}
                          type="button"
                          onClick={() => handleAddTag(tag.id)}
                          className="w-full px-3 py-2.5 md:px-2 md:py-1.5 min-h-[44px] md:min-h-0 text-left text-sm rounded-sm hover:bg-accent cursor-default"
                        >
                          {tag.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : availableTags.length === 0 ? (
                <p className="text-sm text-gray-500">
                  No tags available. Create tags in Settings.
                </p>
              ) : (
                <p className="text-sm text-gray-500">All tags added</p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
