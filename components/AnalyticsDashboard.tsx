'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
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

// ─── Animated Counter ─────────────────────────────────────────────────────────
function Counter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [display, setDisplay] = useState(0)
  const started = useRef(false)
  useEffect(() => {
    if (started.current) return
    started.current = true
    const duration = 1400
    const startTime = performance.now()
    const tick = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 4) // ease-out-quart
      setDisplay(Math.round(eased * value))
      if (progress < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [value])
  return <>{display.toLocaleString()}{suffix}</>
}

// ─── Scroll Progress Bar ──────────────────────────────────────────────────────
function ScrollProgress() {
  const [pct, setPct] = useState(0)
  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement
      const scrolled = el.scrollTop
      const total = el.scrollHeight - el.clientHeight
      setPct(total > 0 ? (scrolled / total) * 100 : 0)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 3, zIndex: 999, background: 'rgba(255,255,255,0.06)' }}>
      <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg, var(--crimson), var(--violet, #7C3AED))', transition: 'width 0.1s linear' }} />
    </div>
  )
}

// ─── Back To Top ──────────────────────────────────────────────────────────────
function BackToTop() {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 500)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  if (!visible) return null
  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Back to top"
      style={{
        position: 'fixed', bottom: 28, right: 24, zIndex: 50,
        width: 44, height: 44, borderRadius: '50%',
        background: 'linear-gradient(135deg, var(--crimson), var(--violet, #7C3AED))',
        border: 'none', cursor: 'pointer', color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 4px 20px rgba(212,41,26,0.45)',
        transition: 'transform 0.2s, box-shadow 0.2s',
        animation: 'fadeIn 0.25s ease',
      }}
      onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.1) translateY(-2px)')}
      onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
    >
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
      </svg>
    </button>
  )
}

// ─── Tooltip ──────────────────────────────────────────────────────────────────
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

// ─── Palettes ─────────────────────────────────────────────────────────────────
const GENRE_COLORS  = ['#D4291A','#7C3AED','#F0B429','#3B82F6','#0D9488','#F43F5E','#84CC16','#FF6B35','#A78BFA','#2DD4BF']
const OTT_COLORS    = ['#E50914','#00A8E1','#FF6600','#1E3C72','#FF3333','#BF0A2B','#00A859','#00358C']
const RATING_DATA   = [
  { label: 'Excellent', range: '4.5–5.0', color: '#F0B429', idx: 4 },
  { label: 'Great',     range: '3.5–4.4', color: '#FF8C00', idx: 3 },
  { label: 'Good',      range: '2.5–3.4', color: '#FF4D1C', idx: 2 },
  { label: 'Fair',      range: '1.5–2.4', color: '#D4291A', idx: 1 },
  { label: 'Poor',      range: '0–1.4',   color: '#555555', idx: 0 },
]
const MEDAL = ['🥇', '🥈', '🥉']

// ─── Main Dashboard ───────────────────────────────────────────────────────────
type Decade = 'all' | '2000s' | '2010s' | '2020s'

export default function AnalyticsDashboard({ stats }: { stats: Stats }) {
  const [animated, setAnimated]       = useState(false)
  const [decade, setDecade]           = useState<Decade>('all')
  const [hoveredGenre, setHoveredGenre] = useState<number | null>(null)
  const [hoveredOTT, setHoveredOTT]   = useState<number | null>(null)
  const [hoveredYear, setHoveredYear]  = useState<number | null>(null)

  // Trigger bar animations shortly after mount
  useEffect(() => { const t = setTimeout(() => setAnimated(true), 150); return () => clearTimeout(t) }, [])

  // Year filter
  const filteredYears = useCallback(() => {
    if (decade === '2000s') return stats.years.filter(y => y.year >= 2000 && y.year < 2010)
    if (decade === '2010s') return stats.years.filter(y => y.year >= 2010 && y.year < 2020)
    if (decade === '2020s') return stats.years.filter(y => y.year >= 2020)
    return stats.years.slice(-15)
  }, [decade, stats.years])

  const years         = filteredYears()
  const maxYearCount  = Math.max(...years.map(y => y.count), 1)
  const maxGenreCount = Math.max(...stats.genres.slice(0, 10).map(g => g.count), 1)
  const maxOTT        = Math.max(...stats.ottPlatforms.map(p => p.count), 1)
  const maxRating     = Math.max(...stats.ratingBuckets, 1)
  const totalRated    = stats.totalRated

  return (
    <>
      {/* ── Global CSS ────────────────────────────────────────────────────── */}
      <style>{`
        @keyframes fadeUp    { from { opacity:0; transform:translateY(20px) } to { opacity:1; transform:translateY(0) } }
        @keyframes fadeIn    { from { opacity:0 } to { opacity:1 } }
        @keyframes pulse     { 0%,100% { opacity:1 } 50% { opacity:0.5 } }
        @keyframes glow      { 0%,100% { box-shadow:0 0 0 0 rgba(212,41,26,0) } 50% { box-shadow:0 0 20px 4px rgba(212,41,26,0.25) } }

        .kpi-card    { animation: fadeUp 0.5s ease both; transition: transform 0.25s, box-shadow 0.25s, border-color 0.25s !important; }
        .kpi-card:hover { transform: translateY(-5px) !important; box-shadow: 0 16px 40px rgba(0,0,0,0.45) !important; border-color: rgba(255,255,255,0.14) !important; }
        .kpi-card:nth-child(1) { animation-delay:0.05s }
        .kpi-card:nth-child(2) { animation-delay:0.12s }
        .kpi-card:nth-child(3) { animation-delay:0.19s }
        .kpi-card:nth-child(4) { animation-delay:0.26s }

        .dash-card   { animation: fadeUp 0.6s ease both; transition: border-color 0.25s !important; }
        .dash-card:hover { border-color: rgba(255,255,255,0.1) !important; }

        .bar-row     { transition: background 0.2s; border-radius: 6px; cursor: default; }
        .bar-row:hover { background: rgba(255,255,255,0.025) !important; }
        .bar-fill    { transition: width 0.7s cubic-bezier(.4,0,.2,1), filter 0.2s !important; }
        .bar-row:hover .bar-fill { filter: brightness(1.25) !important; }

        .decade-btn  { transition: all 0.2s; cursor: pointer; border: none; outline: none; }
        .decade-btn:hover { background: rgba(255,255,255,0.08) !important; }
        .decade-btn.active { background: var(--crimson) !important; color: #fff !important; }

        .dir-card    { transition: transform 0.2s, border-color 0.2s, background 0.2s; }
        .dir-card:hover { transform: translateY(-2px); border-color: rgba(255,255,255,0.1) !important; background: rgba(255,255,255,0.04) !important; }

        .tooltip-box { animation: fadeIn 0.15s ease; }
        .bar-wrap    { position: relative; }
        .bar-wrap .tooltip-box { display: none; }
        .bar-wrap:hover .tooltip-box { display: block; }

        /* ── Responsive ─────────────────────────────────────────────────── */
        @media (max-width: 960px) {
          .stat-grid      { grid-template-columns: repeat(2, 1fr) !important; }
          .dash-two-col   { grid-template-columns: 1fr !important; }
          .dir-grid       { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 520px) {
          .stat-grid      { grid-template-columns: 1fr 1fr !important; gap: 10px !important; }
          .dir-grid       { grid-template-columns: 1fr 1fr !important; }
          .page-header    { padding: 36px 16px 28px !important; }
          .main-content   { padding: 20px 16px !important; }
          .dash-card      { padding: 20px 16px !important; }
          .decade-tabs    { gap: 6px !important; }
          .decade-btn     { padding: 6px 12px !important; font-size: 11px !important; }
        }
      `}</style>

      <ScrollProgress />

      <div style={{ background: 'var(--ink)', minHeight: '100vh', paddingBottom: 96 }}>

        {/* ── HEADER ─────────────────────────────────────────────────────── */}
        <section style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.25)' }}>
          <div className="page-header" style={{ maxWidth: 1280, margin: '0 auto', padding: '52px 24px 44px' }}>
            <Link href="/movies" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              fontSize: 13, fontWeight: 500, marginBottom: 28,
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
            <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 'clamp(28px, 6vw, 54px)', fontWeight: 800, lineHeight: 1.07, marginBottom: 14, color: 'rgba(255,255,255,0.93)' }}>
              Movie Database{' '}
              <span style={{ background: 'linear-gradient(90deg, var(--crimson) 0%, #7C3AED 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Dashboard
              </span>
            </h1>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.36)', maxWidth: 540, lineHeight: 1.65 }}>
              Insights from{' '}
              <strong style={{ color: 'rgba(255,255,255,0.65)', fontWeight: 700 }}>
                {stats.total.toLocaleString()} Tamil films
              </strong>{' '}
              spanning {stats.minYear}–{stats.maxYear}
            </p>
          </div>
        </section>

        {/* ── MAIN ───────────────────────────────────────────────────────── */}
        <main className="main-content" style={{ maxWidth: 1280, margin: '0 auto', padding: '36px 24px' }}>

          {/* KPI CARDS */}
          <div className="stat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 40 }}>
            {[
              { label: 'Total Movies',  value: stats.total,     suffix: '',   icon: '🎬', color: 'var(--crimson)',        desc: 'Films in database' },
              { label: 'Avg Rating',    value: null,            suffix: '',   icon: '⭐', color: '#F0B429',               desc: 'Community score out of 5' },
              { label: 'Genres',        value: stats.genres.length, suffix:'',icon: '🎭', color: '#7C3AED',               desc: 'Unique categories' },
              { label: 'OTT Platforms', value: stats.ottPlatforms.length, suffix:'',icon:'📺',color:'#0D9488',            desc: 'Streaming services' },
            ].map((k, i) => (
              <div key={k.label} className="kpi-card" style={{
                borderRadius: 16, padding: '22px 20px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                position: 'relative', overflow: 'hidden',
              }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${k.color}, transparent)`, borderRadius: '16px 16px 0 0' }} />
                <div style={{ fontSize: 22, marginBottom: 10 }}>{k.icon}</div>
                <p style={{ fontFamily: "'Syne', sans-serif", fontSize: 'clamp(24px,3vw,36px)', fontWeight: 800, color: k.color, lineHeight: 1 }}>
                  {i === 1
                    ? <>{stats.avgRating}/5</>
                    : <Counter value={k.value!} />
                  }
                </p>
                <p style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.65)', marginTop: 7 }}>{k.label}</p>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.27)', marginTop: 2 }}>{k.desc}</p>
              </div>
            ))}
          </div>

          {/* ROW 1: Year + Genre */}
          <div className="dash-two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>

            {/* Movies by Year */}
            <div className="dash-card" style={{ borderRadius: 16, padding: 28, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', animationDelay: '0.1s' }}>
              <p style={{ fontFamily: "'Syne', sans-serif", fontSize: 15, fontWeight: 800, color: 'rgba(255,255,255,0.9)', marginBottom: 4 }}>Movies by Year</p>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginBottom: 16 }}>Films released per year</p>

              {/* Decade tabs */}
              <div className="decade-tabs" style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
                {(['all', '2000s', '2010s', '2020s'] as Decade[]).map(d => (
                  <button
                    key={d}
                    className={`decade-btn${decade === d ? ' active' : ''}`}
                    onClick={() => setDecade(d)}
                    style={{
                      padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700,
                      background: decade === d ? 'var(--crimson)' : 'rgba(255,255,255,0.05)',
                      color: decade === d ? '#fff' : 'rgba(255,255,255,0.45)',
                      fontFamily: "'Syne', sans-serif",
                    }}
                  >
                    {d === 'all' ? 'Last 15' : d}
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                {years.map((y, i) => (
                  <div
                    key={y.year}
                    className="bar-row"
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '3px 6px' }}
                    onMouseEnter={() => setHoveredYear(i)}
                    onMouseLeave={() => setHoveredYear(null)}
                  >
                    <span style={{ fontSize: 11, color: hoveredYear === i ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.38)', width: 36, textAlign: 'right', flexShrink: 0, transition: 'color 0.2s', fontVariantNumeric: 'tabular-nums' }}>{y.year}</span>
                    <div className="bar-wrap" style={{ flex: 1, height: 20, borderRadius: 4, background: 'rgba(255,255,255,0.04)', overflow: 'visible', position: 'relative' }}>
                      <div className="bar-fill" style={{
                        height: '100%', borderRadius: 4,
                        width: animated ? `${(y.count / maxYearCount) * 100}%` : '0%',
                        background: 'linear-gradient(90deg, var(--crimson) 0%, #E85D04 100%)',
                        transitionDelay: `${i * 0.03}s`,
                      }} />
                      <Tooltip text={`${y.year}: ${y.count} films`} />
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: hoveredYear === i ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.4)', width: 28, textAlign: 'right', flexShrink: 0, transition: 'color 0.2s' }}>{y.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Genre Distribution */}
            <div className="dash-card" style={{ borderRadius: 16, padding: 28, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', animationDelay: '0.15s' }}>
              <p style={{ fontFamily: "'Syne', sans-serif", fontSize: 15, fontWeight: 800, color: 'rgba(255,255,255,0.9)', marginBottom: 4 }}>Genre Distribution</p>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginBottom: 22 }}>Top 10 most popular categories</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {stats.genres.slice(0, 10).map((g, i) => {
                  const pct = Math.round((g.count / stats.total) * 100)
                  return (
                    <div
                      key={g.genre}
                      className="bar-row"
                      style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '3px 6px' }}
                      onMouseEnter={() => setHoveredGenre(i)}
                      onMouseLeave={() => setHoveredGenre(null)}
                    >
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: GENRE_COLORS[i], flexShrink: 0, transition: 'transform 0.2s', transform: hoveredGenre === i ? 'scale(1.5)' : 'scale(1)' }} />
                      <span style={{ fontSize: 12, color: hoveredGenre === i ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.5)', width: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flexShrink: 0, textTransform: 'capitalize', transition: 'color 0.2s' }}>{g.genre}</span>
                      <div className="bar-wrap" style={{ flex: 1, height: 20, borderRadius: 4, background: 'rgba(255,255,255,0.04)', overflow: 'visible', position: 'relative' }}>
                        <div className="bar-fill" style={{
                          height: '100%', borderRadius: 4,
                          width: animated ? `${(g.count / maxGenreCount) * 100}%` : '0%',
                          background: GENRE_COLORS[i],
                          opacity: hoveredGenre === i ? 1 : 0.8,
                          transitionDelay: `${i * 0.04}s`,
                        }} />
                        <Tooltip text={`${g.genre}: ${g.count} films (${pct}%)`} />
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', width: 32, textAlign: 'right', flexShrink: 0 }}>{g.count}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* ROW 2: OTT + Rating */}
          <div className="dash-two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>

            {/* Streaming Platforms */}
            <div className="dash-card" style={{ borderRadius: 16, padding: 28, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', animationDelay: '0.2s' }}>
              <p style={{ fontFamily: "'Syne', sans-serif", fontSize: 15, fontWeight: 800, color: 'rgba(255,255,255,0.9)', marginBottom: 4 }}>Streaming Platforms</p>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginBottom: 22 }}>Where Tamil movies are available</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {stats.ottPlatforms.map((o, i) => {
                  const pct = Math.round((o.count / stats.total) * 100)
                  const isHovered = hoveredOTT === i
                  return (
                    <div
                      key={o.name}
                      className="bar-row"
                      style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '4px 6px', borderRadius: 8 }}
                      onMouseEnter={() => setHoveredOTT(i)}
                      onMouseLeave={() => setHoveredOTT(null)}
                    >
                      <div style={{ width: 10, height: 10, borderRadius: 3, background: OTT_COLORS[i], flexShrink: 0, transition: 'transform 0.2s', transform: isHovered ? 'scale(1.3)' : 'scale(1)' }} />
                      <span style={{ fontSize: 13, fontWeight: 600, color: isHovered ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.65)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', transition: 'color 0.2s' }}>{o.name}</span>
                      <div className="bar-wrap" style={{ width: 100, height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.05)', overflow: 'visible', flexShrink: 0, position: 'relative' }}>
                        <div className="bar-fill" style={{
                          height: '100%', borderRadius: 4,
                          width: animated ? `${(o.count / maxOTT) * 100}%` : '0%',
                          background: OTT_COLORS[i], opacity: 0.9,
                          transitionDelay: `${i * 0.05}s`,
                        }} />
                        <Tooltip text={`${o.count} films · ${pct}%`} />
                      </div>
                      <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 13, fontWeight: 800, color: isHovered ? '#fff' : 'rgba(255,255,255,0.85)', width: 30, textAlign: 'right', flexShrink: 0, transition: 'color 0.2s' }}>{o.count}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Rating Distribution */}
            <div className="dash-card" style={{ borderRadius: 16, padding: 28, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', animationDelay: '0.25s' }}>
              <p style={{ fontFamily: "'Syne', sans-serif", fontSize: 15, fontWeight: 800, color: 'rgba(255,255,255,0.9)', marginBottom: 4 }}>Rating Distribution</p>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginBottom: 22 }}>
                Quality spread · <strong style={{ color: 'rgba(255,255,255,0.5)' }}>{totalRated.toLocaleString()}</strong> rated films
              </p>

              {/* Stacked bar */}
              <div style={{ display: 'flex', height: 12, borderRadius: 6, overflow: 'hidden', marginBottom: 24, gap: 2 }}>
                {RATING_DATA.map(r => {
                  const w = totalRated ? (stats.ratingBuckets[r.idx] / totalRated) * 100 : 0
                  return (
                    <div key={r.label} style={{
                      height: '100%', borderRadius: 3,
                      width: animated ? `${w}%` : '0%',
                      background: r.color, opacity: 0.9,
                      transition: `width 0.9s cubic-bezier(.4,0,.2,1) ${RATING_DATA.indexOf(r) * 0.07}s`,
                      minWidth: w > 0 ? 2 : 0,
                    }} title={`${r.label}: ${stats.ratingBuckets[r.idx]} films`} />
                  )
                })}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
                {RATING_DATA.map(r => {
                  const count = stats.ratingBuckets[r.idx]
                  const pct   = totalRated ? Math.round((count / totalRated) * 100) : 0
                  return (
                    <div key={r.label}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 12, fontWeight: 700, color: r.color, width: 64 }}>{r.label}</span>
                          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.26)' }}>{r.range}</span>
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.45)' }}>{count.toLocaleString()} · {pct}%</span>
                      </div>
                      <div style={{ height: 7, borderRadius: 4, background: 'rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                        <div style={{
                          height: '100%', borderRadius: 4,
                          width: animated ? `${(count / maxRating) * 100}%` : '0%',
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

          {/* TOP DIRECTORS */}
          <div className="dash-card" style={{ borderRadius: 16, padding: 28, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', marginBottom: 32, animationDelay: '0.3s' }}>
            <p style={{ fontFamily: "'Syne', sans-serif", fontSize: 15, fontWeight: 800, color: 'rgba(255,255,255,0.9)', marginBottom: 4 }}>Top Directors</p>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginBottom: 24 }}>Most prolific directors in the database</p>
            <div className="dir-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: 12 }}>
              {stats.topDirectors.map((d, i) => (
                <div
                  key={d.name}
                  className="dir-card"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 16px', borderRadius: 10,
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.05)',
                    animationDelay: `${0.3 + i * 0.04}s`,
                  }}
                >
                  <div style={{
                    width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: i < 3 ? 20 : 14, fontWeight: 900,
                    background: i < 3 ? 'transparent' : i < 5 ? '#7C3AED' : 'rgba(255,255,255,0.07)',
                    color: '#fff', fontFamily: "'Syne', sans-serif",
                  }}>
                    {i < 3 ? MEDAL[i] : i + 1}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.88)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.name}</p>
                    <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 1 }}>{d.count} film{d.count !== 1 ? 's' : ''}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div style={{
            textAlign: 'center', padding: '52px 24px', borderRadius: 16,
            background: 'linear-gradient(135deg, rgba(124,58,237,0.09) 0%, rgba(212,41,26,0.09) 100%)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--rose-light)', marginBottom: 12, fontFamily: "'Syne', sans-serif" }}>
              Powered by AI · TF-IDF + Cosine Similarity
            </p>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 'clamp(18px,3vw,24px)', fontWeight: 800, color: 'rgba(255,255,255,0.92)', marginBottom: 10 }}>
              Movie Recommendation Engine
            </h2>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.36)', maxWidth: 480, margin: '0 auto 28px', lineHeight: 1.65 }}>
              Personalised picks based on genre, cast, and director patterns — for every film in the database.
            </p>
            <Link
              href="/recommendations"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: 'linear-gradient(135deg, var(--crimson), #7C3AED)',
                color: '#fff', fontFamily: "'Syne', sans-serif", fontSize: 14, fontWeight: 700,
                padding: '14px 32px', borderRadius: 12,
                boxShadow: '0 8px 32px rgba(212,41,26,0.35)',
                textDecoration: 'none', transition: 'transform 0.2s, box-shadow 0.2s',
                animation: 'glow 3s ease-in-out infinite',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 40px rgba(212,41,26,0.5)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 32px rgba(212,41,26,0.35)' }}
            >
              🎬 Browse Recommendations
            </Link>
          </div>

        </main>
      </div>

      <BackToTop />
    </>
  )
}