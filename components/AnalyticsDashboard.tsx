'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

// ─── Types ────────────────────────────────────────────────────────────────────
interface Stats {
  total: number
  years: { year: number; count: number }[]
  genres: { genre: string; count: number }[]
  ratingBuckets: number[]
  ottPlatforms: { name: string; count: number }[]
  topDirectors: { name: string; count: number }[]
  avgRating: string
  minYear: number
  maxYear: number
  totalRated: number
}

// ─── Palettes ─────────────────────────────────────────────────────────────────
const GENRE_COLORS = ['#D4291A','#7C3AED','#F0B429','#3B82F6','#0D9488','#F43F5E','#84CC16','#FF6B35','#A78BFA','#2DD4BF']
const RATING_DATA  = [
  { label: 'Excellent', range: '4.5–5.0', color: '#F0B429', idx: 4 },
  { label: 'Great',     range: '3.5–4.4', color: '#FF8C00', idx: 3 },
  { label: 'Good',      range: '2.5–3.4', color: '#FF4D1C', idx: 2 },
  { label: 'Fair',      range: '1.5–2.4', color: '#D4291A', idx: 1 },
  { label: 'Poor',      range: '0–1.4',   color: '#555555', idx: 0 },
]

// ─── Tooltip (desktop only) ───────────────────────────────────────────────────
function Tooltip({ text }: { text: string }) {
  return (
    <span className="tooltip-box" style={{
      position: 'absolute', top: '50%', left: '50%',
      transform: 'translate(-50%, -140%)',
      background: 'rgba(20,20,25,0.95)', color: 'rgba(255,255,255,0.92)',
      fontSize: 11, fontWeight: 600, padding: '5px 10px', borderRadius: 6,
      whiteSpace: 'nowrap', pointerEvents: 'none',
      border: '1px solid rgba(255,255,255,0.1)',
      boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
      zIndex: 10,
    }}>{text}</span>
  )
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function AnalyticsDashboard({ stats }: { stats: Stats }) {
  const [animated, setAnimated]         = useState(false)
  const [hoveredGenre, setHoveredGenre] = useState<number | null>(null)

  useEffect(() => { const t = setTimeout(() => setAnimated(true), 150); return () => clearTimeout(t) }, [])

  const safeGenres  = Array.isArray(stats?.genres)        ? stats.genres        : []
  const safeBuckets = Array.isArray(stats?.ratingBuckets) ? stats.ratingBuckets : [0,0,0,0,0]
  const safeTotal   = stats?.total ?? 0
  const safeMinYear = stats?.minYear ?? 2000
  const safeMaxYear = stats?.maxYear ?? new Date().getFullYear()
  const totalRated  = stats?.totalRated ?? safeBuckets.reduce((a, b) => a + b, 0)

  const maxGenreCount = Math.max(...safeGenres.slice(0, 10).map(g => g.count), 1)
  const maxRating     = Math.max(...safeBuckets, 1)

  return (
    <>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(20px) } to { opacity:1; transform:translateY(0) } }
        @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }

        * { box-sizing: border-box; }

        .dash-card  { animation: fadeUp 0.6s ease both; transition: border-color 0.3s, transform 0.3s, box-shadow 0.3s !important; }
        .dash-card:hover { transform: translateY(-3px) !important; box-shadow: 0 20px 50px rgba(0,0,0,0.55) !important; }

        .bar-row  { transition: background 0.2s; border-radius: 6px; cursor: default; }
        .bar-row:hover { background: rgba(255,255,255,0.025) !important; }
        .bar-fill { transition: width 0.7s cubic-bezier(.4,0,.2,1), filter 0.2s !important; }
        .bar-row:hover .bar-fill { filter: brightness(1.25) !important; }

        .tooltip-box { animation: fadeIn 0.15s ease; }
        .bar-wrap    { position: relative; }
        .bar-wrap .tooltip-box { display: none; }
        @media (hover: hover) { .bar-wrap:hover .tooltip-box { display: block; } }

        .dash-two-col {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
        }
        @media (min-width: 900px) {
          .dash-two-col { grid-template-columns: 1fr 1fr; gap: 24px; }
        }

        .main-content { padding: 20px 16px; }
        .dash-card    { padding: 20px 16px; }
        @media (min-width: 640px) {
          .main-content { padding: 36px 24px; }
          .dash-card    { padding: 28px; }
        }

        .page-header { padding: 36px 16px 28px; }
        @media (min-width: 640px) { .page-header { padding: 52px 24px 44px; } }

        .bar-label { font-size: 10px; }
        @media (min-width: 480px) { .bar-label { font-size: 11px; } }
        @media (min-width: 640px) { .bar-label { font-size: 12px; } }

        .genre-label { width: 64px !important; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        @media (min-width: 480px) { .genre-label { width: 80px !important; } }
      `}</style>

      <div style={{ background: 'var(--ink)', minHeight: '100vh', paddingBottom: 80 }}>

        {/* ── HEADER ─────────────────────────────────────────────────────── */}
        <section style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.25)' }}>
          <div className="page-header" style={{ maxWidth: 1280, margin: '0 auto' }}>
            <Link href="/movies" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              fontSize: 13, fontWeight: 500, marginBottom: 24,
              color: 'rgba(255,255,255,0.3)', textDecoration: 'none',
              transition: 'color 0.2s',
            }}
              onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.3)')}
            >
              <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              Back to Movies
            </Link>

            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--rose-light)', marginBottom: 10, fontFamily: "'Syne', sans-serif" }}>
              TamilCinemaHub · Analytics
            </p>
            <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 'clamp(24px, 6vw, 54px)', fontWeight: 800, lineHeight: 1.1, marginBottom: 12, color: 'rgba(255,255,255,0.93)' }}>
              Movie Database{' '}
              <span style={{ background: 'linear-gradient(90deg, var(--crimson) 0%, #7C3AED 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Dashboard
              </span>
            </h1>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.36)', maxWidth: 540, lineHeight: 1.65 }}>
              Insights from{' '}
              <strong style={{ color: 'rgba(255,255,255,0.65)', fontWeight: 700 }}>
                {safeTotal.toLocaleString()} Tamil films
              </strong>{' '}
              spanning {safeMinYear}–{safeMaxYear}
            </p>
          </div>
        </section>

        {/* ── MAIN ───────────────────────────────────────────────────────── */}
        <main className="main-content" style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div className="dash-two-col">

            {/* Genre Distribution */}
            <div className="dash-card" style={{ borderRadius: 16, background: 'linear-gradient(145deg, rgba(124,58,237,0.04) 0%, rgba(13,148,136,0.01) 100%), rgba(255,255,255,0.01)', border: '1px solid rgba(124,58,237,0.18)', animationDelay: '0.1s' }}>
              <p style={{ fontFamily: "'Syne', sans-serif", fontSize: 15, fontWeight: 800, color: 'rgba(255,255,255,0.9)', marginBottom: 4 }}>Genre Distribution</p>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginBottom: 18 }}>Top 10 most popular categories</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                {safeGenres.slice(0, 10).map((g, i) => {
                  const pct = safeTotal > 0 ? Math.round((g.count / safeTotal) * 100) : 0
                  return (
                    <div
                      key={g.genre}
                      className="bar-row"
                      style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '2px 4px' }}
                      onMouseEnter={() => setHoveredGenre(i)}
                      onMouseLeave={() => setHoveredGenre(null)}
                    >
                      <div style={{ width: 7, height: 7, borderRadius: '50%', background: GENRE_COLORS[i] ?? '#888', flexShrink: 0, transition: 'transform 0.2s', transform: hoveredGenre === i ? 'scale(1.5)' : 'scale(1)' }} />
                      <span className="bar-label genre-label" style={{ color: hoveredGenre === i ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.5)', textTransform: 'capitalize', transition: 'color 0.2s' }}>{g.genre}</span>
                      <div className="bar-wrap" style={{ flex: 1, height: 18, borderRadius: 4, background: 'rgba(255,255,255,0.04)', overflow: 'visible', position: 'relative' }}>
                        <div className="bar-fill" style={{
                          height: '100%', borderRadius: 4,
                          width: animated ? `${(g.count / maxGenreCount) * 100}%` : '0%',
                          background: GENRE_COLORS[i] ?? '#888',
                          opacity: hoveredGenre === i ? 1 : 0.8,
                          transitionDelay: `${i * 0.04}s`,
                        }} />
                        <Tooltip text={`${g.genre}: ${g.count} films (${pct}%)`} />
                      </div>
                      <span className="bar-label" style={{ fontWeight: 700, color: 'rgba(255,255,255,0.4)', width: 28, textAlign: 'right', flexShrink: 0 }}>{g.count}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Rating Distribution */}
            <div className="dash-card" style={{ borderRadius: 16, background: 'linear-gradient(145deg, rgba(240,180,41,0.04) 0%, rgba(212,41,26,0.01) 100%), rgba(255,255,255,0.01)', border: '1px solid rgba(240,180,41,0.18)', animationDelay: '0.15s' }}>
              <p style={{ fontFamily: "'Syne', sans-serif", fontSize: 15, fontWeight: 800, color: 'rgba(255,255,255,0.9)', marginBottom: 4 }}>Rating Distribution</p>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginBottom: 18 }}>
                Quality spread · <strong style={{ color: 'rgba(255,255,255,0.5)' }}>{totalRated.toLocaleString()}</strong> rated films
              </p>

              {/* Stacked bar */}
              <div style={{ display: 'flex', height: 12, borderRadius: 6, overflow: 'hidden', marginBottom: 20, gap: 2 }}>
                {RATING_DATA.map(r => {
                  const count = safeBuckets[r.idx] ?? 0
                  const w = totalRated > 0 ? (count / totalRated) * 100 : 0
                  return (
                    <div key={r.label} style={{
                      height: '100%', borderRadius: 3,
                      width: animated ? `${w}%` : '0%',
                      background: r.color, opacity: 0.9,
                      transition: `width 0.9s cubic-bezier(.4,0,.2,1) ${RATING_DATA.indexOf(r) * 0.07}s`,
                      minWidth: w > 0 ? 2 : 0,
                    }} title={`${r.label}: ${count} films`} />
                  )
                })}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {RATING_DATA.map(r => {
                  const count = safeBuckets[r.idx] ?? 0
                  const pct   = totalRated > 0 ? Math.round((count / totalRated) * 100) : 0
                  return (
                    <div key={r.label}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                          <span style={{ fontSize: 11, fontWeight: 700, color: r.color, width: 60 }}>{r.label}</span>
                          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.26)' }}>{r.range}</span>
                        </div>
                        <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.45)' }}>{count.toLocaleString()} · {pct}%</span>
                      </div>
                      <div style={{ height: 6, borderRadius: 4, background: 'rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                        <div style={{
                          height: '100%', borderRadius: 4,
                          width: animated ? `${maxRating > 0 ? (count / maxRating) * 100 : 0}%` : '0%',
                          background: r.color, opacity: 0.85,
                          transition: `width 0.7s cubic-bezier(.4,0,.2,1) ${RATING_DATA.indexOf(r) * 0.06}s`,
                        }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

          </div>
        </main>
      </div>
    </>
  )
}
