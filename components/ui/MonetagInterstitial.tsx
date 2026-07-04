'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

interface MonetagInterstitialProps {
  /** Monetag zone ID for interstitial ads */
  zoneId: string
  /** The actual script URL provided by Monetag dashboard */
  scriptUrl: string
  /** Delay in ms before showing interstitial (default 0 = on navigation) */
  delay?: number
}

/**
 * Monetag Interstitial Ad Component
 *
 * Shows a full-screen ad between page navigations.
 * Only triggers on client-side navigation (not initial page load).
 *
 * After signing up at https://monetag.com:
 * 1. Create an interstitial ad zone
 * 2. Copy the script URL from Monetag dashboard
 *
 * Usage:
 *   <MonetagInterstitial
 *     zoneId="12345"
 *     scriptUrl="https://your-actual-monetag-url.com/watch.js"
 *   />
 */
export default function MonetagInterstitial({
  zoneId,
  scriptUrl,
  delay = 0,
}: MonetagInterstitialProps) {
  const pathname = usePathname()
  const [showAd, setShowAd] = useState(false)
  const [adKey, setAdKey] = useState(0)
  const isFirstLoad = useState(true)

  useEffect(() => {
    // Skip first load (initial page load)
    if (isFirstLoad[0]) {
      isFirstLoad[1](false)
      return
    }

    // Show ad on navigation
    const timer = setTimeout(() => {
      setShowAd(true)
      setAdKey(prev => prev + 1)
    }, delay)

    return () => clearTimeout(timer)
  }, [pathname, delay])

  // Load Monetag script
  useEffect(() => {
    if (!showAd || !zoneId || !scriptUrl) return

    const script = document.createElement('script')
    script.type = 'text/javascript'
    script.src = scriptUrl
    script.async = true
    script.setAttribute('data-monetag-zone', zoneId)
    script.setAttribute('data-type', 'interstitial')

    document.head.appendChild(script)

    return () => {
      script.remove()
      setShowAd(false)
    }
  }, [showAd, zoneId, scriptUrl, adKey])

  const handleClose = () => {
    setShowAd(false)
  }

  if (!showAd) return null

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center"
      onClick={handleClose}
    >
      <div
        className="relative bg-bg-primary rounded-2xl p-4 max-w-[90vw] max-h-[90vh] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
          aria-label="Close ad"
        >
          ✕
        </button>

        {/* Ad content */}
        <div
          id={`monetag-interstitial-${zoneId}`}
          data-monetag-zone={zoneId}
          data-type="interstitial"
          className="monetag-ad-container"
          style={{ minHeight: '250px', minWidth: '300px' }}
        />
      </div>
    </div>
  )
}
