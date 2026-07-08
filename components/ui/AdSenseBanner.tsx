'use client'

import { useEffect, useRef, useState } from 'react'
import { getConsent } from './CookieConsent'

interface AdSenseBannerProps {
  /** Google AdSense ad slot ID from your dashboard */
  slot: string
  /** Ad format: auto, horizontal, vertical, or rectangle */
  format?: 'auto' | 'horizontal' | 'vertical' | 'rectangle'
  /** Full width of the container */
  fullWidth?: boolean
  /** Custom className for the wrapper */
  className?: string
  /** Min height in pixels to prevent layout shift */
  minHeight?: number
  /** Responsive layout (default true) */
  responsive?: boolean
}

export default function AdSenseBanner({
  slot,
  format = 'auto',
  fullWidth = true,
  className = '',
  minHeight = 250,
  responsive = true,
}: AdSenseBannerProps) {
  const adRef = useRef<HTMLModElement>(null)
  const pushed = useRef(false)
  const [consented, setConsented] = useState(false)

  useEffect(() => {
    setConsented(getConsent() === 'accepted')
    function onConsentChange() {
      setConsented(getConsent() === 'accepted')
    }
    window.addEventListener('consent-changed', onConsentChange)
    return () => window.removeEventListener('consent-changed', onConsentChange)
  }, [])

  useEffect(() => {
    if (!consented || pushed.current) return
    try {
      // @ts-expect-error adsbygoogle is defined by the AdSense script
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
      pushed.current = true
    } catch {
      // AdSense not loaded yet or blocked — silently ignore
    }
  }, [consented])

  // Don't render anything until consent is given
  if (!consented) return null

  return (
    <div
      className={`adsense-wrapper overflow-hidden ${fullWidth ? 'w-full' : ''} ${className}`}
      style={{ minHeight: `${minHeight}px` }}
    >
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block', minHeight: `${minHeight}px` }}
        data-ad-client="ca-pub-9250311764302161"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? 'true' : 'false'}
      />
    </div>
  )
}
