'use client'

import { useState, useEffect } from 'react'
import { ExpandableSection } from './ExpandableSection'
import { Dropdown, DropdownItem } from './Dropdown'

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
    <ExpandableSection
      title="Tags"
      summary={tagSummary}
      expanded={isExpanded}
      onExpandedChange={setIsExpanded}
    >
      {/* Selected tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map(tag => (
            <span
              key={tag.id}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-muted text-muted-foreground text-sm"
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
            <p className="text-sm text-muted-foreground">Loading tags...</p>
          ) : unselectedTags.length > 0 ? (
            <div className="max-w-[200px]">
              <Dropdown
                open={dropdownOpen}
                onOpenChange={setDropdownOpen}
                align="left"
                className="max-h-48 overflow-auto"
                trigger={
                  <button
                    type="button"
                    className="w-full h-8 px-3 text-sm text-left border border-border rounded-md bg-transparent flex items-center justify-between"
                  >
                    <span className="text-muted-foreground">Add tag...</span>
                    <svg className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                }
              >
                {unselectedTags.map(tag => (
                  <DropdownItem
                    key={tag.id}
                    onClick={() => handleAddTag(tag.id)}
                  >
                    {tag.name}
                  </DropdownItem>
                ))}
              </Dropdown>
            </div>
          ) : availableTags.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No tags available. Create tags in Settings.
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">All tags added</p>
          )}
        </>
      )}
    </ExpandableSection>
  )
}
