'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useTransition } from 'react'

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
    if (value) { sp.set(key, value) } else { sp.delete(key) }
    if (key !== 'page') sp.set('page', '1')
    startTransition(() => {
      router.replace(`/movies?${sp.toString()}`, { scroll: false })
    })
  }

  return (
    <>
      {/* Search bar */}
      <div style={{ maxWidth: 512, margin: '0 auto 32px' }}>
        <div style={{ position: 'relative' }}>
          <svg style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: 'rgba(255,255,255,0.35)', pointerEvents: 'none' }} viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
          </svg>
          <input
            type="text"
            value={localQ}
            onChange={(e) => setLocalQ(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') updateParam('q', localQ.trim()) }}
            placeholder="Search by title or director..."
            style={{
              width: '100%', borderRadius: 100, paddingLeft: 44, paddingRight: 20, paddingTop: 14, paddingBottom: 14,
              fontSize: 14, color: '#fff', background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.08)', outline: 'none', fontFamily: "'DM Sans', sans-serif",
              transition: 'border-color 0.2s, box-shadow 0.2s',
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(212,41,26,0.5)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(212,41,26,0.08)' }}
            onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.boxShadow = 'none' }}
          />
          {localQ && (
            <button
              onClick={() => { setLocalQ(''); updateParam('q', '') }}
              style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.35)', border: 'none', background: 'none', cursor: 'pointer', fontSize: 14 }}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Genre pills */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 40 }}>
        {genres.map((genre) => {
          const isActive = genre === activeGenre
          return (
            <button
              key={genre}
              onClick={() => updateParam('genre', genre === 'All' ? '' : genre)}
              disabled={isPending && isActive}
              style={{
                borderRadius: 100, paddingLeft: 18, paddingRight: 18, paddingTop: 8, paddingBottom: 8,
                fontSize: 13, fontWeight: 500, cursor: isPending ? 'wait' : 'pointer', border: 'none',
                fontFamily: "'DM Sans', sans-serif", transition: 'all 0.2s',
                ...(isActive
                  ? { background: 'var(--crimson)', color: '#fff' }
                  : { background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)' }
                ),
              }}
            >
              {genre.charAt(0).toUpperCase() + genre.slice(1)}
            </button>
          )
        })}
      </div>
    </>
  )
}
