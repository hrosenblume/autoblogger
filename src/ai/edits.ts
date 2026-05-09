// Server-side equivalent of the dashboard's :::edit block parser + applier.
// Mirrors src/ui/hooks/useChat.tsx::parseEditBlocks and
// src/ui/pages/EditorPage.tsx::handleEdit so /v1/posts/:id/agent produces
// the same final markdown the dashboard would.

import type { EditCommand } from '../types/editor'

export interface EssaySnapshot {
  title: string
  subtitle: string
  markdown: string
}

export interface ApplyResult {
  snapshot: EssaySnapshot
  applied: number
  failed: number
  cleanContent: string
}

/**
 * Extract :::edit { ...json } ::: blocks from a model response. Returns the
 * parsed commands plus the model's prose with edit blocks stripped (handy
 * for surfacing what the AI "said" alongside what it did).
 */
export function parseEditBlocks(content: string): {
  edits: EditCommand[]
  cleanContent: string
} {
  const editRegex = /:::edit\s*([\s\S]*?)\s*:::/g
  const edits: EditCommand[] = []
  let cleanContent = content

  let match
  while ((match = editRegex.exec(content)) !== null) {
    try {
      const edit = JSON.parse(match[1]) as EditCommand
      edits.push(edit)
      cleanContent = cleanContent.replace(match[0], '')
    } catch {
      // skip malformed blocks; the dashboard does the same
    }
  }

  cleanContent = cleanContent.replace(/\n{3,}/g, '\n\n').trim()
  return { edits, cleanContent }
}

/**
 * Apply a single edit command to a snapshot. Returns the new snapshot, or
 * null if the command couldn't be applied (e.g. the `find` text isn't
 * present). Logic mirrors EditorPage.handleEdit exactly.
 */
function applyOne(snapshot: EssaySnapshot, edit: EditCommand): EssaySnapshot | null {
  if (edit.type === 'replace_all') {
    return {
      title: edit.title ?? snapshot.title,
      subtitle: edit.subtitle ?? snapshot.subtitle,
      markdown: edit.markdown ?? snapshot.markdown,
    }
  }

  if (edit.type === 'replace_section' && edit.find && edit.replace !== undefined) {
    if (!snapshot.markdown.includes(edit.find)) return null
    return {
      ...snapshot,
      markdown: snapshot.markdown.replace(edit.find, edit.replace),
    }
  }

  if (edit.type === 'insert' && edit.replace !== undefined) {
    if (edit.position === 'start') {
      return { ...snapshot, markdown: edit.replace + snapshot.markdown }
    }
    if (edit.position === 'end') {
      return { ...snapshot, markdown: snapshot.markdown + edit.replace }
    }
    if (edit.find) {
      if (!snapshot.markdown.includes(edit.find)) return null
      const idx = snapshot.markdown.indexOf(edit.find)
      const insertPoint = edit.position === 'before' ? idx : idx + edit.find.length
      return {
        ...snapshot,
        markdown:
          snapshot.markdown.slice(0, insertPoint) +
          edit.replace +
          snapshot.markdown.slice(insertPoint),
      }
    }
    return null
  }

  if (edit.type === 'delete' && edit.find) {
    if (!snapshot.markdown.includes(edit.find)) return null
    return { ...snapshot, markdown: snapshot.markdown.replace(edit.find, '') }
  }

  return null
}

/**
 * Apply a list of edits sequentially. Each edit operates on the result of
 * the previous one — same order the dashboard uses (it iterates the parsed
 * array and fires handleEdit in turn).
 */
export function applyEdits(
  snapshot: EssaySnapshot,
  edits: EditCommand[]
): { snapshot: EssaySnapshot; applied: number; failed: number } {
  let current = snapshot
  let applied = 0
  let failed = 0

  for (const edit of edits) {
    const next = applyOne(current, edit)
    if (next) {
      current = next
      applied++
    } else {
      failed++
    }
  }

  return { snapshot: current, applied, failed }
}

/**
 * Convenience: parse + apply in one step.
 */
export function parseAndApplyEdits(
  snapshot: EssaySnapshot,
  modelOutput: string
): ApplyResult {
  const { edits, cleanContent } = parseEditBlocks(modelOutput)
  const { snapshot: result, applied, failed } = applyEdits(snapshot, edits)
  return { snapshot: result, applied, failed, cleanContent }
}
