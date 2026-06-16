'use client'

import { useState, useEffect, useCallback } from 'react'

export interface WatchlistMovie {
  slug: string
  title: string
  year?: number
  rating?: number
  posterUrl?: string | null
  addedAt: number
}

const STORAGE_KEY = 'tamilcinema_watchlist'

function readWatchlist(): WatchlistMovie[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function writeWatchlist(movies: WatchlistMovie[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(movies))
}

export function useWatchlist() {
  const [watchlist, setWatchlist] = useState<WatchlistMovie[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setWatchlist(readWatchlist())
    setMounted(true)
  }, [])

  const isInWatchlist = useCallback(
    (slug: string) => watchlist.some((m) => m.slug === slug),
    [watchlist]
  )

  const addToWatchlist = useCallback((movie: Omit<WatchlistMovie, 'addedAt'>) => {
    setWatchlist((prev) => {
      if (prev.some((m) => m.slug === movie.slug)) return prev
      const updated = [{ ...movie, addedAt: Date.now() }, ...prev]
      writeWatchlist(updated)
      return updated
    })
  }, [])

  const removeFromWatchlist = useCallback((slug: string) => {
    setWatchlist((prev) => {
      const updated = prev.filter((m) => m.slug !== slug)
      writeWatchlist(updated)
      return updated
    })
  }, [])

  const toggleWatchlist = useCallback(
    (movie: Omit<WatchlistMovie, 'addedAt'>) => {
      if (watchlist.some((m) => m.slug === movie.slug)) {
        removeFromWatchlist(movie.slug)
      } else {
        addToWatchlist(movie)
      }
    },
    [watchlist, addToWatchlist, removeFromWatchlist]
  )

  return { watchlist, mounted, isInWatchlist, addToWatchlist, removeFromWatchlist, toggleWatchlist }
}
