'use client'

import { useEffect, useRef, useCallback } from 'react'


/**
 * Generates or retrieves a unique session ID for anonymous tracking.
 */
function getSessionId(): string {
  if (typeof window === 'undefined') return 'server'
  let id = localStorage.getItem('kollywoodai_session_id')
  if (!id) {
    id = crypto.randomUUID?.() || Math.random().toString(36).slice(2) + Date.now().toString(36)
    localStorage.setItem('kollywoodai_session_id', id)
  }
  return id
}

/**
 * Track a user interaction with a movie.
 * Fires in the background — does not block the UI.
 */
export function trackInteraction(
  type: 'view' | 'click' | 'rating',
  movieSlug: string,
  rating?: number
) {
  if (typeof window === 'undefined') return

  const sessionId = getSessionId()

  // Fire-and-forget — don't block navigation or UI
  fetch('/api/interactions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, movieSlug, rating, sessionId }),
  }).catch(() => {
    // Silently ignore tracking failures
  })
}

/**
 * React hook that automatically tracks a "view" when a component mounts.
 * Use it on movie detail pages to track which movies users visit.
 *
 * Usage:
 *   useTrackView('anniyan-2005')
 */
export function useTrackView(movieSlug: string) {
  const tracked = useRef(false)

  useEffect(() => {
    if (!tracked.current && movieSlug) {
      tracked.current = true
      trackInteraction('view', movieSlug)
    }
  }, [movieSlug])
}

/**
 * React hook that returns a click handler which tracks user clicks on a movie.
 *
 * Usage:
 *   const handleClick = useTrackClick('anniyan-2005')
 *   <Link onClick={handleClick} href="/movies/anniyan-2005">...</Link>
 */
export function useTrackClick(movieSlug: string) {
  return useCallback(() => {
    trackInteraction('click', movieSlug)
  }, [movieSlug])
}
