'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useTransition } from 'react'

const CATEGORIES = ['All', 'Review', 'Top List', 'News', 'Actor', 'Director']

const CAT_STYLES: Record<string, { color: string; bg: string }> = {
  All:        { color: '#a78bfa', bg: 'rgba(124,58,237,0.2)' },
  Review:     { color: '#D4291A', bg: 'rgba(212,41,26,0.2)' },
  'Top List': { color: '#F0B429', bg: 'rgba(240,180,41,0.2)' },
  News:       { color: '#3B82F6', bg: 'rgba(59,130,246,0.2)' },
  Actor:      { color: '#7C3AED', bg: 'rgba(124,58,237,0.2)' },
  Director:   { color: '#0D9488', bg: 'rgba(13,148,136,0.2)' },
}

interface BlogFiltersProps {
  totalCount: number
}

export default function BlogFilters({ totalCount }: BlogFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const activeCategory = searchParams.get('category') || 'All'
  const initialQ = searchParams.get('q')?.replace(/\*$/, '') || ''
  const [localQ, setLocalQ] = useState(initialQ)

  function updateParam(key: string, value: string) {
    const sp = new URLSearchParams(searchParams.toString())
    if (value) { sp.set(key, value) } else { sp.delete(key) }
    if (key !== 'page') sp.set('page', '1')
    startTransition(() => {
      router.replace(`/blogs?${sp.toString()}`, { scroll: false })
    })
  }

  const activeStyle = CAT_STYLES[activeCategory] ?? CAT_STYLES.All

  return (
    <>
      {/* Search */}
      <div style={{ maxWidth: 512, margin: '0 auto 32px' }}>
        <div style={{ position: 'relative' }}>
          <svg
            style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: isPending ? 'var(--gold)' : 'rgba(255,255,255,0.35)', pointerEvents: 'none', transition: 'color 0.2s' }}
            viewBox="0 0 20 20" fill="currentColor"
          >
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
          </svg>
          <input
            type="text"
            value={localQ}
            onChange={(e) => setLocalQ(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') updateParam('q', localQ.trim()) }}
            placeholder="Search articles, reviews, authors..."
            style={{
              width: '100%', borderRadius: 100, paddingLeft: 44, paddingRight: 20, paddingTop: 14, paddingBottom: 14,
              fontSize: 14, color: '#fff', background: 'rgba(255,255,255,0.06)',
              border: `1px solid ${isPending ? 'rgba(240,180,41,0.5)' : 'rgba(255,255,255,0.08)'}`,
              outline: 'none', fontFamily: "'DM Sans', sans-serif", transition: 'all 0.2s',
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(212,41,26,0.5)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(212,41,26,0.08)' }}
            onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.boxShadow = 'none' }}
          />
          {localQ && !isPending && (
            <button
              onClick={() => { setLocalQ(''); updateParam('q', '') }}
              style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.35)', border: 'none', background: 'none', cursor: 'pointer', fontSize: 14 }}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Category pills */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 40 }}>
        {CATEGORIES.map((cat) => {
          const s = CAT_STYLES[cat] ?? CAT_STYLES.All
          const isActive = cat === activeCategory
          return (
            <button
              key={cat}
              onClick={() => updateParam('category', cat === 'All' ? '' : cat)}
              disabled={isPending && isActive}
              style={{
                borderRadius: 100, paddingLeft: 20, paddingRight: 20, paddingTop: 6, paddingBottom: 6,
                fontSize: 12, fontWeight: 700, cursor: isPending ? 'wait' : 'pointer', border: 'none',
                fontFamily: "'Syne', sans-serif", letterSpacing: '0.04em', textTransform: 'uppercase' as const,
                transition: 'all 0.2s',
                ...(isActive
                  ? { background: s.color, color: '#0A0008', boxShadow: `0 0 16px ${s.color}55` }
                  : { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.45)', border: '1px solid rgba(255,255,255,0.08)' }
                ),
              }}
            >
              {cat}
            </button>
          )
        })}
      </div>
    </>
  )
}
