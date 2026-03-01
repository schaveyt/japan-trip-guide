// src/components/InstallPrompt.jsx
// Deferred PWA install prompt — shown once, positioned above BottomNav.
// Chrome/Android: captures beforeinstallprompt event, shows after 30s on-site.
// iOS Safari: shows static "Add to Home Screen" hint (no beforeinstallprompt support).
// One-time only: localStorage 'pwa-install-dismissed' flag prevents re-showing.
// Rendered in AppLayout (main.jsx) — affects all navigable pages.
import { useState, useEffect } from 'react'

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [showBanner, setShowBanner] = useState(false)
  const [isIOS, setIsIOS] = useState(false)

  useEffect(() => {
    // Don't show if already dismissed or installed
    if (localStorage.getItem('pwa-install-dismissed')) return

    // Check if running in standalone mode (already installed)
    if (window.matchMedia('(display-mode: standalone)').matches) return

    // Detect iOS (Safari does not support beforeinstallprompt)
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent)

    if (ios) {
      setIsIOS(true)
      // Track visits — show iOS hint on second visit after 30s
      const visitCount = parseInt(localStorage.getItem('pwa-visit-count') || '0') + 1
      localStorage.setItem('pwa-visit-count', String(visitCount))
      if (visitCount >= 2) {
        const timer = setTimeout(() => setShowBanner(true), 30000)
        return () => clearTimeout(timer)
      }
      return
    }

    // Chrome/Android: capture beforeinstallprompt, defer it for 30s
    const handler = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      const timer = setTimeout(() => setShowBanner(true), 30000)
      // Clean up timer if component unmounts before 30s
      return () => clearTimeout(timer)
    }
    window.addEventListener('beforeinstallprompt', handler)

    // Track visits
    const visitCount = parseInt(localStorage.getItem('pwa-visit-count') || '0') + 1
    localStorage.setItem('pwa-visit-count', String(visitCount))

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    // Whether accepted or dismissed, don't show again
    localStorage.setItem('pwa-install-dismissed', '1')
    setShowBanner(false)
    setDeferredPrompt(null)
  }

  const handleDismiss = () => {
    localStorage.setItem('pwa-install-dismissed', '1')
    setShowBanner(false)
  }

  if (!showBanner) return null

  return (
    <div
      className="fixed bottom-16 left-0 right-0 z-40 bg-torii text-white flex items-center justify-between px-4 py-3"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      role="banner"
      aria-label="Install app prompt"
    >
      <span className="text-sm font-medium leading-snug">
        {isIOS
          ? 'Tap Share → "Add to Home Screen" for offline access'
          : 'Add to Home Screen for offline access →'}
      </span>
      <div className="flex items-center gap-3 ml-4 shrink-0">
        {!isIOS && (
          <button
            onClick={handleInstall}
            className="text-sm font-semibold underline underline-offset-2"
            aria-label="Install app"
          >
            Add
          </button>
        )}
        <button
          onClick={handleDismiss}
          className="text-sm opacity-70 hover:opacity-100 transition-opacity"
          aria-label="Dismiss install prompt"
        >
          ✕
        </button>
      </div>
    </div>
  )
}
