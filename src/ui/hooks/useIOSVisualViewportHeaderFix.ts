'use client'

import { useEffect } from 'react'

/**
 * iOS Safari Visual Viewport Header Fix
 * 
 * On iOS Safari, when the user drags text selection handles, Safari scrolls
 * the visual viewport (not the layout viewport), causing position: fixed
 * headers to appear to jump/disappear.
 * 
 * This hook tracks visualViewport.offsetTop and sets a CSS variable --vv-top
 * that can be used to translate fixed headers to stay anchored to the visual
 * viewport.
 * 
 * Usage:
 * 1. Call this hook in a component that wraps the editor page
 * 2. Apply to fixed header: transform: translate3d(0, var(--vv-top), 0)
 */
export function useIOSVisualViewportHeaderFix() {
  useEffect(() => {
    // Only needed on iOS Safari where visualViewport exists
    if (typeof window === 'undefined' || !window.visualViewport) {
      return
    }

    let rafId = 0
    let lastTop: number | null = null

    const apply = () => {
      const vv = window.visualViewport
      const top = vv ? vv.offsetTop : 0

      // Skip if unchanged (avoid unnecessary style recalcs)
      if (top === lastTop) return
      lastTop = top

      document.documentElement.style.setProperty('--vv-top', `${top}px`)
    }

    const schedule = () => {
      if (rafId) return
      rafId = window.requestAnimationFrame(() => {
        rafId = 0
        apply()
      })
    }

    // Apply immediately on mount
    apply()

    // Listen to viewport events
    const vv = window.visualViewport
    vv?.addEventListener('scroll', schedule)
    vv?.addEventListener('resize', schedule)
    window.addEventListener('scroll', schedule)
    window.addEventListener('resize', schedule)

    return () => {
      vv?.removeEventListener('scroll', schedule)
      vv?.removeEventListener('resize', schedule)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      if (rafId) cancelAnimationFrame(rafId)
      // Reset the CSS variable on cleanup
      document.documentElement.style.removeProperty('--vv-top')
    }
  }, [])
}
