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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(window as any).adsbygoogle = (window as any).adsbygoogle || []
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(window as any).adsbygoogle.push({})
    } catch (err) {
      console.error('AdSense error:', err)
    }
  }, [])

  return (
    <div
      className={`relative overflow-hidden rounded-xl bg-bg-card/50 border border-border/30 ${className}`}
      style={{ minHeight }}
    >
      {/* Subtle "Advertisement" label */}
      <span className="absolute top-1.5 right-2 text-[9px] uppercase tracking-widest text-text-muted/40 font-medium z-10">
        Ad
      </span>
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
  )
}
