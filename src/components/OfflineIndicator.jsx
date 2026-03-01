// src/components/OfflineIndicator.jsx
// Slim banner shown above BottomNav when navigator.onLine === false.
// Uses torii red per design system. Auto-hides when connectivity returns.
// Rendered in AppLayout (main.jsx) — affects all navigable pages.
import { useState, useEffect } from 'react'

export default function OfflineIndicator() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine)

  useEffect(() => {
    const goOffline = () => setIsOffline(true)
    const goOnline = () => setIsOffline(false)
    window.addEventListener('offline', goOffline)
    window.addEventListener('online', goOnline)
    return () => {
      window.removeEventListener('offline', goOffline)
      window.removeEventListener('online', goOnline)
    }
  }, [])

  if (!isOffline) return null

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-16 left-0 right-0 z-40 bg-torii/90 text-white text-center py-2 text-sm font-medium"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      Offline · showing cached content
    </div>
  )
}
