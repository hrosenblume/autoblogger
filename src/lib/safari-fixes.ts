/**
 * iOS Safari specific fixes and utilities
 */

/** Detect iOS Safari (mobile Safari or PWA) */
export const isIOSSafari = (): boolean => {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent
  const isIOS = /iPad|iPhone|iPod/.test(ua) || 
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  const isSafari = /Safari/.test(ua) && !/Chrome|CriOS|FxiOS/.test(ua)
  return isIOS && isSafari
}

/** 
 * iOS Safari doesn't repaint the safe-area on theme change.
 * Briefly render an element there to force a repaint with the correct color.
 */
export const repaintIOSSafeArea = (bgColor: string): void => {
  if (!isIOSSafari() || typeof document === 'undefined') return
  
  const el = document.createElement('div')
  el.style.cssText = `position:fixed;bottom:0;left:0;right:0;height:34px;background:${bgColor};z-index:2147483647;pointer-events:none;`
  document.body.appendChild(el)
  setTimeout(() => el.remove(), 50)
}
