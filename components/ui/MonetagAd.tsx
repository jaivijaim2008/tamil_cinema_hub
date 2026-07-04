'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { monetagConfig, isMonetagConfigured, getMonetagZone } from '@/lib/monetag'

interface MonetagAdProps {
  /** Monetag zone ID from your dashboard */
  zoneId: string
  /** The actual script URL provided by Monetag dashboard */
  scriptUrl?: string
  /** Optional CSS class for the wrapper */
  className?: string
  /** Minimum height to prevent layout shift */
  minHeight?: string
}

/**
 * Monetag Banner Ad Component
 *
 * After signing up at https://monetag.com:
 * 1. Add your site and verify ownership
 * 2. Create an ad zone (banner format)
 * 3. Copy the script URL from Monetag dashboard
 * 4. Pass it as the scriptUrl prop
 *
 * Usage:
 *   <MonetagAd
 *     zoneId="12345"
 *     scriptUrl="https://your-actual-monetag-url.com/watch.js"
 *   />
 */
export default function MonetagAd({
  zoneId,
  scriptUrl,
  className = '',
  minHeight = '90px',
}: MonetagAdProps) {
  const adRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (!zoneId || !scriptUrl) return

    // Remove existing script for this zone
    const existing = document.querySelector(`script[data-monetag-zone="${zoneId}"]`)
    if (existing) existing.remove()

    // Inject Monetag script
    const script = document.createElement('script')
    script.type = 'text/javascript'
    script.src = scriptUrl
    script.async = true
    script.setAttribute('data-monetag-zone', zoneId)

    document.head.appendChild(script)

    script.onload = () => setLoaded(true)

    return () => {
      script.remove()
      setLoaded(false)
    }
  }, [zoneId, scriptUrl, pathname])

  if (!zoneId || !scriptUrl) return null

  return (
    <div
      ref={adRef}
      className={`relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.03] to-transparent backdrop-blur-sm ${className}`}
      style={{ minHeight }}
    >
      {/* Top bar: Sponsored label */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/[0.04]">
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent-gold/50" />
          <span className="text-[10px] uppercase tracking-[0.15em] text-text-muted/50 font-medium">
            Sponsored
          </span>
        </div>
        <span className="text-[9px] text-text-muted/30">Ad</span>
      </div>

      {/* Ad content area */}
      <div
        className="flex items-center justify-center"
        style={{ minHeight: `calc(${minHeight} - 32px)` }}
      >
        <div
          id={`monetag-${zoneId}`}
          data-monetag-zone={zoneId}
          className="monetag-ad-container w-full"
        />
      </div>
    </div>
  )
}
