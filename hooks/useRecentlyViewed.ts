'use client'

import { useState, useEffect, useCallback } from 'react'

export interface RecentMovie {
  slug: string
  title: string
  year?: number
  rating?: number
  posterUrl?: string | null
  viewedAt: number
}

const STORAGE_KEY = 'tamilcinema_recently_viewed'
const MAX_RECENT = 20

function readRecent(): RecentMovie[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function writeRecent(movies: RecentMovie[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(movies.slice(0, MAX_RECENT)))
}

/**
 * Add a movie to the recently viewed list.
 * Called by useTrackView when a movie is viewed.
 */
export function addRecentlyViewed(movie: Omit<RecentMovie, 'viewedAt'>) {
  if (typeof window === 'undefined') return
  const current = readRecent()
  // Remove existing entry for this slug (move to top)
  const filtered = current.filter((m) => m.slug !== movie.slug)
  const updated = [{ ...movie, viewedAt: Date.now() }, ...filtered]
  writeRecent(updated)
  // Dispatch event so same-tab hooks can re-read
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('recently-viewed-updated'))
  }
}

/**
 * React hook that provides the list of recently viewed movies.
 * Updates reactively when localStorage changes (cross-tab).
 */
export function useRecentlyViewed() {
  const [recent, setRecent] = useState<RecentMovie[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setRecent(readRecent())
    setMounted(true)

    // Listen for storage changes (cross-tab sync)
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        setRecent(readRecent())
      }
    }
    // Listen for same-tab updates from addRecentlyViewed
    const onSameTab = () => setRecent(readRecent())
    window.addEventListener('storage', onStorage)
    window.addEventListener('recently-viewed-updated', onSameTab)
    return () => {
      window.removeEventListener('storage', onStorage)
      window.removeEventListener('recently-viewed-updated', onSameTab)
    }
  }, [])

  const clearRecent = useCallback(() => {
    writeRecent([])
    setRecent([])
  }, [])

  return { recent, mounted, clearRecent }
}
