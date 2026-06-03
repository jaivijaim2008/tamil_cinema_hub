'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useTransition } from 'react'

const GENRE_COLORS: Record<string, string> = {
  All:       '#a78bfa',
  action:    '#ef4444',
  thriller:  '#f97316',
  drama:     '#a78bfa',
  comedy:    '#facc15',
  horror:    '#6366f1',
  romance:   '#ec4899',
  history:   '#d97706',
  biography: '#34d399',
  crime:     '#f43f5e',
  adventure: '#22d3ee',
  'sci-fi':  '#06b6d4',
  fantasy:   '#8b5cf6',
  animation: '#f472b6',
  mystery:   '#64748b',
  family:    '#22c55e',
}

interface MovieFiltersProps {
  genres: string[]
}

export default function MovieFilters({ genres }: MovieFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const activeGenre = searchParams.get('genre') || 'All'
  const initialQ = searchParams.get('q')?.replace(/\*$/, '') || ''
  const [localQ, setLocalQ] = useState(initialQ)

  function updateParam(key: string, value: string) {
    const sp = new URLSearchParams(searchParams.toString())
    if (value) {
      sp.set(key, value)
    } else {
      sp.delete(key)
    }
    if (key !== 'page') sp.set('page', '1')

    startTransition(() => {
      router.replace(`/movies?${sp.toString()}`, { scroll: false })
    })
  }

  return (
    <>
      {/* ── LOADING BAR ─────────────────────────────────────────────── */}
      <div className="relative h-0.5 mb-6 overflow-hidden rounded-full" style={{ background: 'rgba(255,255,255,0.04)' }}>
        <div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-violet-500 to-orange-500 rounded-full transition-all duration-300"
          style={{
            width: isPending ? '70%' : '100%',
            opacity: isPending ? 1 : 0,
            transition: isPending ? 'width 0.8s ease-out, opacity 0.3s' : 'width 0.5s ease-in-out, opacity 0.4s ease-out 0.2s',
          }}
        />
      </div>

      {/* ── SEARCH ──────────────────────────────────────────────────── */}
      <div className="max-w-lg mx-auto mb-8">
        <div className="relative">
          <svg
            className={`absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none transition-colors duration-200 ${isPending ? 'text-violet-400 animate-pulse' : 'text-white/25'}`}
            viewBox="0 0 20 20" fill="currentColor"
          >
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
          </svg>
          <input
            type="text"
            value={localQ}
            onChange={(e) => setLocalQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                updateParam('q', localQ.trim())
              }
            }}
            placeholder="Search by title or director..."
            className="w-full rounded-full pl-11 pr-5 py-3.5 text-sm text-white placeholder:text-white/25 outline-none transition-all duration-300"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: `1px solid ${isPending ? 'rgba(167,139,250,0.5)' : 'rgba(255,255,255,0.1)'}`,
              opacity: isPending ? 0.85 : 1,
            }}
          />
          {localQ && !isPending && (
            <button
              onClick={() => {
                setLocalQ('')
                updateParam('q', '')
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* ── GENRE PILLS ─────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
        {genres.map((genre) => {
          const color = GENRE_COLORS[genre] ?? '#a78bfa'
          const isActive = genre === activeGenre
          return (
            <button
              key={genre}
              onClick={() => updateParam('genre', genre === 'All' ? '' : genre)}
              disabled={isPending && isActive}
              className="rounded-full px-4 py-1.5 text-xs font-bold transition-all duration-200 active:scale-95 disabled:cursor-wait"
              style={
                isActive
                  ? { background: color, color: '#07070f', boxShadow: isPending ? `0 0 20px ${color}77` : `0 0 16px ${color}55`, transform: isPending ? 'scale(1.05)' : 'scale(1)' }
                  : { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.45)', border: '1px solid rgba(255,255,255,0.08)', opacity: isPending ? 0.6 : 1 }
              }
            >
              {genre.charAt(0).toUpperCase() + genre.slice(1)}
            </button>
          )
        })}
      </div>
    </>
  )
}
