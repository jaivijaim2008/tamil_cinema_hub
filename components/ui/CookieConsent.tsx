'use client'

import { useState, useEffect, useCallback } from 'react'
import { Shield, ChevronDown } from 'lucide-react'

type ConsentType = 'accepted' | 'rejected' | null

const CONSENT_KEY = 'tamil-cinema-hub-cookie-consent'

function getStoredConsent(): ConsentType {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(CONSENT_KEY) as ConsentType
}

export function setConsent(value: ConsentType) {
  if (typeof window === 'undefined') return
  if (value) {
    localStorage.setItem(CONSENT_KEY, value)
  } else {
    localStorage.removeItem(CONSENT_KEY)
  }
  window.dispatchEvent(new Event('consent-changed'))
}

export function getConsent(): ConsentType {
  return getStoredConsent()
}

export default function CookieConsent() {
  const [consent, setLocalConsent] = useState<ConsentType>(null)
  const [showBanner, setShowBanner] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    const stored = getStoredConsent()
    setLocalConsent(stored)
    // Show banner only if no consent decision has been made
    if (!stored) {
      // Small delay to avoid flash on page load
      const timer = setTimeout(() => setShowBanner(true), 1000)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleAccept = useCallback(() => {
    setConsent('accepted')
    setLocalConsent('accepted')
    setShowBanner(false)
  }, [])

  const handleReject = useCallback(() => {
    setConsent('rejected')
    setLocalConsent('rejected')
    setShowBanner(false)
  }, [])

  const handleWithdraw = useCallback(() => {
    setConsent(null)
    setLocalConsent(null)
    setShowBanner(true)
    setShowDetails(false)
  }, [])

  // Dispatch event so other components can listen for consent withdrawal
  useEffect(() => {
    function onWithdrawRequest() {
      handleWithdraw()
    }
    window.addEventListener('withdraw-consent', onWithdrawRequest)
    return () => window.removeEventListener('withdraw-consent', onWithdrawRequest)
  }, [handleWithdraw])

  if (!showBanner || consent) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[90] animate-slide-up">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Banner */}
      <div className="relative bg-bg-card border-t border-border shadow-2xl shadow-black/40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 sm:py-5">
          {/* Main row */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center gap-3 shrink-0">
              <div className="w-10 h-10 rounded-xl bg-accent-gold/10 flex items-center justify-center">
                <Shield size={20} className="text-accent-gold" />
              </div>
              <div className="sm:hidden">
                <p className="text-sm font-semibold text-text-primary">Cookie Preferences</p>
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <p className="hidden sm:block text-sm font-semibold text-text-primary mb-1">Cookie Preferences</p>
              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                We use cookies and third-party services (Google AdSense, Plausible Analytics) to
                enhance your experience and support our site. You can accept or reject non-essential cookies.
              </p>

              {/* Expandable details */}
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="flex items-center gap-1 text-xs text-accent-gold hover:text-accent-gold-dim mt-2 transition-colors"
              >
                <ChevronDown
                  size={12}
                  className={`transition-transform ${showDetails ? 'rotate-180' : ''}`}
                />
                {showDetails ? 'Hide details' : 'Learn more'}
              </button>

              {showDetails && (
                <div className="mt-3 space-y-2 text-xs text-text-muted">
                  <div className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent-gold mt-1.5 shrink-0" />
                    <p>
                      <span className="text-text-secondary font-medium">Google AdSense:</span>{' '}
                      Serves advertisements. Uses cookies to personalize ads and measure ad performance.
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-success mt-1.5 shrink-0" />
                    <p>
                      <span className="text-text-secondary font-medium">Plausible Analytics:</span>{' '}
                      Privacy-friendly analytics with no cookies. Tracks page views only.
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#3b82f6] mt-1.5 shrink-0" />
                    <p>
                      <span className="text-text-secondary font-medium">Essential cookies:</span>{' '}
                      Required for site functionality (theme, watchlist). Always active.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
              <button
                onClick={handleReject}
                className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs font-semibold border border-border text-text-secondary hover:text-text-primary hover:border-border-light transition-all"
              >
                Reject
              </button>
              <button
                onClick={handleAccept}
                className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs font-semibold bg-accent-gold text-text-inverse hover:bg-accent-gold-dim transition-all glow-button"
              >
                Accept All
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
