'use client'

import { useEffect, useState } from 'react'
import Script from 'next/script'
import { getConsent } from './CookieConsent'

const ADSENSE_CLIENT_ID = 'ca-pub-9250311764302161'

export default function AdSenseScript() {
  const [consented, setConsented] = useState(false)

  useEffect(() => {
    // Check initial consent
    setConsented(getConsent() === 'accepted')

    // Listen for consent changes
    function onConsentChange() {
      const current = getConsent()
      setConsented(current === 'accepted')

      // If consent was withdrawn, remove existing AdSense elements
      if (current !== 'accepted') {
        document.querySelectorAll('ins.adsbygoogle').forEach((el) => {
          el.remove()
        })
      }
    }

    window.addEventListener('consent-changed', onConsentChange)
    return () => window.removeEventListener('consent-changed', onConsentChange)
  }, [])

  if (!consented) return null

  return (
    <Script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  )
}
