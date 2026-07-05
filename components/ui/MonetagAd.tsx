'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { monetagConfig, getMonetagZone } from '@/lib/monetag'

interface MonetagAdProps {
  /** Placement key matching a zone in monetagConfig.zones */
  placement: keyof typeof monetagConfig.zones
  /** Optional CSS class for the wrapper */
  className?: string
  /** Minimum height to prevent layout shift */
  minHeight?: string
}

/**
 * Monetag Banner Ad Component — drop-in replacement for AdUnit.
 *
 * After signing up at https://monetag.com:
 * 1. Add your site and verify ownership
 * 2. Create ad zones (banner format) for each placement
 * 3. Copy the script URL and zone IDs into lib/monetag.ts
 *
 * Usage:
 *   <MonetagAd placement="banner" />
 *   <MonetagAd placement="bannerMovie" className="max-w-3xl" minHeight="100px" />
 */
export default function MonetagAd({
  placement,
  className = '',
  minHeight = '90px',
}: MonetagAdProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()
  const scriptRef = useRef<HTMLScriptElement | null>(null)

  const zoneId = getMonetagZone(placement)
  const { scriptUrl, enabled } = monetagConfig

  useEffect(() => {
    // Don't render if not configured
    if (!enabled || !zoneId || !scriptUrl || !containerRef.current) return

    // Clean up any previous ad content in this container
    containerRef.current.innerHTML = ''
    scriptRef.current = null

    // Inject Monetag script into the container div
    const script = document.createElement('script')
    script.type = 'text/javascript'
    script.src = scriptUrl
    script.async = true
    script.setAttribute('data-monetag-zone', zoneId)

    containerRef.current.appendChild(script)
    scriptRef.current = script

    return () => {
      // Remove script and any child elements it created (iframes, divs)
      if (containerRef.current) {
        containerRef.current.innerHTML = ''
      }
      scriptRef.current = null
    }
  }, [zoneId, scriptUrl, enabled, pathname])

  // Don't render anything if not configured
  if (!enabled || !zoneId || !scriptUrl) return null

  return (
    <div
      ref={containerRef}
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
