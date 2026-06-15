'use client'

import { useEffect, useRef } from 'react'

interface AdUnitProps {
  /** The AdSense ad slot ID */
  adSlot: string
  /** Ad format: 'auto' (responsive) or specific format */
  adFormat?: string
  /** Whether the ad should be full-width responsive */
  fullWidthResponsive?: boolean
  /** Optional CSS class for the wrapper */
  className?: string
  /** Minimum height to prevent layout shift */
  minHeight?: string
  /** Lazy load the ad (default true for performance) */
  lazy?: boolean
}

/**
 * Reusable Google AdSense ad unit component.
 *
 * Uses useEffect to call adsbygoogle.push() on mount,
 * which is critical for Next.js App Router SPA navigation.
 *
 * Usage:
 *   <AdUnit adSlot="1234567890" />
 *   <AdUnit adSlot="1234567890" adFormat="horizontal" className="my-8" />
 */
const ADSENSE_CLIENT = 'ca-pub-9250311764302161'

/** Google AdSense global */
declare global {
  interface Window {
    adsbygoogle: Array<Record<string, unknown>>
  }
}

export default function AdUnit({
  adSlot,
  adFormat = 'auto',
  fullWidthResponsive = true,
  className = '',
  minHeight = '90px',
  lazy = true,
}: AdUnitProps) {
  const adRef = useRef<HTMLModElement>(null)
  const pushed = useRef(false)

  useEffect(() => {
    // Prevent double-push on re-renders
    if (pushed.current) return
    pushed.current = true

    try {
      window.adsbygoogle = window.adsbygoogle || []
      window.adsbygoogle.push({})
    } catch (err) {
      console.error('AdSense error:', err)
    }
  }, [])

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.03] to-transparent backdrop-blur-sm ${className}`}
      style={{ minHeight }}
    >
      {/* Top bar: Sponsored label + subtle glow */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/[0.04]">
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent-gold/50" />
          <span className="text-[10px] uppercase tracking-[0.15em] text-text-muted/50 font-medium">
            Sponsored
          </span>
        </div>
        <span className="text-[9px] text-text-muted/30">
          Ad
        </span>
      </div>
      {/* Ad content area */}
      <div className="flex items-center justify-center" style={{ minHeight: `calc(${minHeight} - 32px)` }}>
        <ins
          ref={adRef}
          className="adsbygoogle block"
          style={{
            display: 'block',
            minHeight,
          }}
          data-ad-client={ADSENSE_CLIENT}
          data-ad-slot={adSlot}
          data-ad-format={adFormat}
          data-full-width-responsive={fullWidthResponsive ? 'true' : 'false'}
          {...(lazy ? { 'data-ad-loading-strategy': 'fetching' } : {})}
        />
      </div>
    </div>
  )
}
