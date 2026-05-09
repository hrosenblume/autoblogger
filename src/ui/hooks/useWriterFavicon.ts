import { useEffect } from 'react'

const WRITER_FAVICON_SVG = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'><rect width='512' height='512' rx='114' fill='#000'/><g transform='translate(128 128) scale(10.667)' fill='none' stroke='#fff' stroke-width='1.75' stroke-linecap='round' stroke-linejoin='round'><path d='M12.67 19a2 2 0 0 0 1.416-.586l6.154-6.165a5 5 0 1 0-7.071-7.071L6.99 11.336A2 2 0 0 0 6.41 12.75l-.4 4.444a2 2 0 0 0 2.183 2.182z'/><path d='M16 8 2 22'/><path d='M17.5 15H9'/></g></svg>`

export const WRITER_FAVICON_DATA_URI = `data:image/svg+xml,${encodeURIComponent(WRITER_FAVICON_SVG)}`

type LinkSnapshot = {
  el: HTMLLinkElement
  prevHref: string | null
  prevType: string | null
  created: boolean
}

function swapLink(rel: string, href: string, type?: string): LinkSnapshot {
  const existing = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`)
  if (existing) {
    const prevHref = existing.getAttribute('href')
    const prevType = existing.getAttribute('type')
    existing.setAttribute('href', href)
    if (type) existing.setAttribute('type', type)
    else existing.removeAttribute('type')
    return { el: existing, prevHref, prevType, created: false }
  }
  const link = document.createElement('link')
  link.setAttribute('rel', rel)
  link.setAttribute('href', href)
  if (type) link.setAttribute('type', type)
  document.head.appendChild(link)
  return { el: link, prevHref: null, prevType: null, created: true }
}

function restoreLink(snap: LinkSnapshot) {
  if (snap.created) {
    snap.el.parentNode?.removeChild(snap.el)
    return
  }
  if (snap.prevHref !== null) snap.el.setAttribute('href', snap.prevHref)
  else snap.el.removeAttribute('href')
  if (snap.prevType !== null) snap.el.setAttribute('type', snap.prevType)
  else snap.el.removeAttribute('type')
}

/**
 * Swap the page's favicon and apple-touch-icon to the Writer feather glyph
 * for the lifetime of the mounted dashboard, then restore the host app's
 * originals on unmount. Runs client-side only.
 */
export function useWriterFavicon() {
  useEffect(() => {
    if (typeof document === 'undefined') return
    const icon = swapLink('icon', WRITER_FAVICON_DATA_URI, 'image/svg+xml')
    const apple = swapLink('apple-touch-icon', WRITER_FAVICON_DATA_URI)
    return () => {
      restoreLink(icon)
      restoreLink(apple)
    }
  }, [])
}
