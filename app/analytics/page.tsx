import { client } from '../../sanity/client'
import Link from 'next/link'

export const revalidate = 300

// ─── OTT name normaliser ─────────────────────────────────────────────────────
const OTT_ALIAS: Record<string, string> = {
  'amazon prime video': 'Amazon Prime',
  'amazon prime':       'Amazon Prime',
  'hotstar':            'Disney+ Hotstar',
  'disney hotstar':     'Disney+ Hotstar',
  'disney+hotstar':     'Disney+ Hotstar',
  'zee 5':              'Zee5',
  'sun nxt':            'Sun NXT',
  'sun next':           'Sun NXT',
}
function normaliseOTT(raw: string): string {
  return OTT_ALIAS[raw.toLowerCase().trim()] ?? raw.trim()
}

// ─── Data fetcher ─────────────────────────────────────────────────────────────
async function getStats() {
  try {
    const movies = await client.fetch<
      { title: string; year: number; rating: number | string | null; genre: string[]; ottPlatform?: string; director?: string }[]
    >(`*[_type == "movie"]{ title, year, rating, genre, ottPlatform, director }`)

    const total = movies.length

    // ── Year ──
    const yearMap = new Map<number, number>()
    movies.forEach(m => { if (m.year) yearMap.set(m.year, (yearMap.get(m.year) || 0) + 1) })
    const years = Array.from(yearMap.entries())
      .map(([year, count]) => ({ year, count }))
      .sort((a, b) => a.year - b.year)

    // ── Genre ──
    const genreMap = new Map<string, number>()
    movies.forEach(m => { (m.genre || []).forEach(g => { if (g) genreMap.set(g, (genreMap.get(g) || 0) + 1) }) })
    const genres = Array.from(genreMap.entries())
      .map(([genre, count]) => ({ genre, count }))
      .sort((a, b) => b.count - a.count)

    // ── Rating (fix NaN: parse string → float) ──
    const ratingBuckets = [0, 0, 0, 0, 0]
    let ratingSum = 0, ratingCount = 0
    movies.forEach(m => {
      const r = parseFloat(String(m.rating ?? ''))
      if (!isNaN(r)) {
        ratingSum += r; ratingCount++
        if      (r >= 4.5) ratingBuckets[4]++
        else if (r >= 3.5) ratingBuckets[3]++
        else if (r >= 2.5) ratingBuckets[2]++
        else if (r >= 1.5) ratingBuckets[1]++
        else               ratingBuckets[0]++
      }
    })
    const avgRating = ratingCount ? (ratingSum / ratingCount).toFixed(1) : 'N/A'

    // ── OTT (normalise duplicates) ──
    const ottMap = new Map<string, number>()
    movies.forEach(m => {
      if (m.ottPlatform) {
        const key = normaliseOTT(m.ottPlatform)
        ottMap.set(key, (ottMap.get(key) || 0) + 1)
      }
    })
    const ottPlatforms = Array.from(ottMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8)

    // ── Directors (skip blanks / "Unknown") ──
    const directorMap = new Map<string, number>()
    movies.forEach(m => {
      const d = m.director?.trim()
      if (d && d.toLowerCase() !== 'unknown' && d.toLowerCase() !== 'n/a') {
        directorMap.set(d, (directorMap.get(d) || 0) + 1)
      }
    })
    const topDirectors = Array.from(directorMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    const maxYear = years.length ? years[years.length - 1].year : 2026
    const minYear = years.length ? years[0].year : 2000

    return { total, years, genres, ratingBuckets, ottPlatforms, topDirectors, avgRating, minYear, maxYear }
  } catch {
    return null
  }
}

// ─── Accent palette ───────────────────────────────────────────────────────────
const GENRE_COLORS  = ['#D4291A','#7C3AED','#F0B429','#3B82F6','#0D9488','#F43F5E','#84CC16','#FF6B35','#A78BFA','#2DD4BF']
const OTT_COLORS    = ['#E50914','#00A8E1','#FF6600','#1E3C72','#FF3333','#BF0A2B','#00A859','#00358C']

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function AnalyticsPage() {
  const stats = await getStats()

  if (!stats) return (
    <div style={{ background: 'var(--ink)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 15 }}>Failed to load analytics data.</p>
    </div>
  )

  const maxYearCount  = Math.max(...stats.years.map(y => y.count))
  const maxGenreCount = Math.max(...stats.genres.slice(0, 10).map(g => g.count))
  const maxOTT        = Math.max(...stats.ottPlatforms.map(p => p.count))
  const maxRating     = Math.max(...stats.ratingBuckets)
  const totalRated    = stats.ratingBuckets.reduce((a, b) => a + b, 0)

  return (
    <div style={{ background: 'var(--ink)', minHeight: '100vh', paddingBottom: 96 }}>

      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <section style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.2)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '48px 24px 40px' }}>
          <Link href="/movies" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            fontSize: 13, fontWeight: 500, marginBottom: 28,
            color: 'rgba(255,255,255,0.3)', textDecoration: 'none',
            transition: 'color 0.2s',
          }}>
            <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Back to Movies
          </Link>

          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <p style={{
                fontSize: 11, fontWeight: 700, letterSpacing: '0.18em',
                textTransform: 'uppercase', color: 'var(--rose-light)',
                marginBottom: 10, fontFamily: "'Syne', sans-serif",
              }}>
                TamilCinemaHub · Analytics
              </p>
              <h1 style={{
                fontFamily: "'Syne', sans-serif",
                fontSize: 'clamp(30px, 5vw, 52px)', fontWeight: 800,
                color: 'rgba(255,255,255,0.93)', lineHeight: 1.08, marginBottom: 12,
              }}>
                Movie Database<br />
                <span style={{ background: 'linear-gradient(90deg, var(--crimson), var(--violet))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Dashboard
                </span>
              </h1>
              <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.38)', maxWidth: 520, lineHeight: 1.6 }}>
                Insights from <strong style={{ color: 'rgba(255,255,255,0.6)' }}>{stats.total.toLocaleString()} Tamil films</strong> ({stats.minYear}–{stats.maxYear}).
              </p>
            </div>
          </div>
        </div>
      </section>

      <main style={{ maxWidth: 1280, margin: '0 auto', padding: '36px 24px' }}>

        {/* ── KPI CARDS ──────────────────────────────────────────────────────── */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 40,
        }} className="stat-grid">
          {[
            { label: 'Total Movies',   value: stats.total.toLocaleString(), sub: 'Films in database',   icon: '🎬', color: 'var(--crimson)' },
            { label: 'Avg Rating',     value: `${stats.avgRating}/5`,       sub: 'Community score',     icon: '⭐', color: '#F0B429'        },
            { label: 'Genres',         value: String(stats.genres.length),  sub: 'Unique categories',   icon: '🎭', color: 'var(--violet)'  },
            { label: 'OTT Platforms',  value: String(stats.ottPlatforms.length), sub: 'Streaming services', icon: '📺', color: '#0D9488'    },
          ].map(k => (
            <div key={k.label} className="kpi-card" style={{
              borderRadius: 16, padding: '22px 20px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
              transition: 'transform 0.25s, box-shadow 0.25s',
              position: 'relative', overflow: 'hidden',
            }}>
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: 2,
                background: `linear-gradient(90deg, ${k.color}, transparent)`,
                borderRadius: '16px 16px 0 0',
              }} />
              <div style={{ fontSize: 22, marginBottom: 10 }}>{k.icon}</div>
              <p style={{ fontFamily: "'Syne', sans-serif", fontSize: 34, fontWeight: 800, color: k.color, lineHeight: 1 }}>{k.value}</p>
              <p style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.65)', marginTop: 6 }}>{k.label}</p>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.28)', marginTop: 2 }}>{k.sub}</p>
            </div>
          ))}
        </div>

        {/* ── ROW 1: Year + Genre ─────────────────────────────────────────────── */}
        <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>

          {/* Movies by Year */}
          <div className="dashboard-card" style={{ borderRadius: 16, padding: 28, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <p style={{ fontFamily: "'Syne', sans-serif", fontSize: 15, fontWeight: 800, color: 'rgba(255,255,255,0.9)', marginBottom: 4 }}>Movies by Year</p>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.32)', marginBottom: 22 }}>Films released per year · last 15 years</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {stats.years.slice(-15).map(y => (
                <div key={y.year} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.38)', width: 36, textAlign: 'right', flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>{y.year}</span>
                  <div style={{ flex: 1, height: 18, borderRadius: 4, background: 'rgba(255,255,255,0.04)', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', borderRadius: 4,
                      width: `${(y.count / maxYearCount) * 100}%`,
                      background: 'linear-gradient(90deg, var(--crimson) 0%, var(--vermillion, #E85D04) 100%)',
                      transition: 'width 0.6s cubic-bezier(.4,0,.2,1)',
                    }} />
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.45)', width: 28, textAlign: 'right', flexShrink: 0 }}>{y.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Genre Distribution */}
          <div className="dashboard-card" style={{ borderRadius: 16, padding: 28, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <p style={{ fontFamily: "'Syne', sans-serif", fontSize: 15, fontWeight: 800, color: 'rgba(255,255,255,0.9)', marginBottom: 4 }}>Genre Distribution</p>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.32)', marginBottom: 22 }}>Most popular categories</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {stats.genres.slice(0, 10).map((g, i) => (
                <div key={g.genre} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', width: 90, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flexShrink: 0, textTransform: 'capitalize' }}>{g.genre}</span>
                  <div style={{ flex: 1, height: 18, borderRadius: 4, background: 'rgba(255,255,255,0.04)', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', borderRadius: 4,
                      width: `${(g.count / maxGenreCount) * 100}%`,
                      background: GENRE_COLORS[i % GENRE_COLORS.length],
                      opacity: 0.85, transition: 'width 0.6s cubic-bezier(.4,0,.2,1)',
                    }} />
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.45)', width: 32, textAlign: 'right', flexShrink: 0 }}>{g.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── ROW 2: OTT + Rating ─────────────────────────────────────────────── */}
        <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>

          {/* Streaming Platforms */}
          <div className="dashboard-card" style={{ borderRadius: 16, padding: 28, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <p style={{ fontFamily: "'Syne', sans-serif", fontSize: 15, fontWeight: 800, color: 'rgba(255,255,255,0.9)', marginBottom: 4 }}>Streaming Platforms</p>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.32)', marginBottom: 22 }}>Where Tamil movies are available</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {stats.ottPlatforms.map((o, i) => (
                <div key={o.name} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: OTT_COLORS[i % OTT_COLORS.length], flexShrink: 0 }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.7)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.name}</span>
                  <div style={{ width: 90, height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.05)', overflow: 'hidden', flexShrink: 0 }}>
                    <div style={{ height: '100%', borderRadius: 4, width: `${(o.count / maxOTT) * 100}%`, background: OTT_COLORS[i % OTT_COLORS.length], opacity: 0.85 }} />
                  </div>
                  <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 13, fontWeight: 800, color: 'rgba(255,255,255,0.88)', width: 30, textAlign: 'right', flexShrink: 0 }}>{o.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Rating Distribution */}
          <div className="dashboard-card" style={{ borderRadius: 16, padding: 28, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <p style={{ fontFamily: "'Syne', sans-serif", fontSize: 15, fontWeight: 800, color: 'rgba(255,255,255,0.9)', marginBottom: 4 }}>Rating Distribution</p>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.32)', marginBottom: 22 }}>Quality spread across {totalRated.toLocaleString()} rated films</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { label: 'Excellent', range: '4.5 – 5.0', count: stats.ratingBuckets[4], color: '#F0B429', stars: 5 },
                { label: 'Great',     range: '3.5 – 4.4', count: stats.ratingBuckets[3], color: '#FF8C00', stars: 4 },
                { label: 'Good',      range: '2.5 – 3.4', count: stats.ratingBuckets[2], color: '#FF4D1C', stars: 3 },
                { label: 'Fair',      range: '1.5 – 2.4', count: stats.ratingBuckets[1], color: '#D4291A', stars: 2 },
                { label: 'Poor',      range: '0 – 1.4',   count: stats.ratingBuckets[0], color: '#555',    stars: 1 },
              ].map(r => {
                const pct = totalRated ? Math.round((r.count / totalRated) * 100) : 0
                return (
                  <div key={r.label}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: r.color, width: 60 }}>{r.label}</span>
                        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.28)' }}>{r.range}</span>
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.45)' }}>
                        {r.count.toLocaleString()} · {pct}%
                      </span>
                    </div>
                    <div style={{ height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', borderRadius: 4, opacity: 0.85,
                        width: `${maxRating ? (r.count / maxRating) * 100 : 0}%`,
                        background: r.color, transition: 'width 0.6s cubic-bezier(.4,0,.2,1)',
                      }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* ── TOP DIRECTORS ───────────────────────────────────────────────────── */}
        <div className="dashboard-card" style={{ borderRadius: 16, padding: 28, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', marginBottom: 32 }}>
          <p style={{ fontFamily: "'Syne', sans-serif", fontSize: 15, fontWeight: 800, color: 'rgba(255,255,255,0.9)', marginBottom: 4 }}>Top Directors</p>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.32)', marginBottom: 22 }}>Most prolific directors in the database</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
            {stats.topDirectors.map((d, i) => (
              <div key={d.name} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 16px', borderRadius: 10,
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.05)',
                transition: 'transform 0.2s, border-color 0.2s',
              }}>
                <div style={{
                  width: 38, height: 38, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: i === 0 ? 'var(--crimson)' : i === 1 ? '#C0A030' : i === 2 ? '#8B6914' : i < 5 ? 'var(--violet)' : 'rgba(255,255,255,0.07)',
                  color: '#fff', fontWeight: 900, fontSize: 14, flexShrink: 0,
                  fontFamily: "'Syne', sans-serif",
                }}>
                  {i + 1}
                </div>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.9)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.name}</p>
                  <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.32)', marginTop: 1 }}>{d.count} film{d.count !== 1 ? 's' : ''}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── CTA ─────────────────────────────────────────────────────────────── */}
        <div style={{
          textAlign: 'center', padding: '48px 24px', borderRadius: 16,
          background: 'linear-gradient(135deg, rgba(124,58,237,0.08) 0%, rgba(212,41,26,0.08) 100%)',
          border: '1px solid rgba(255,255,255,0.06)',
        }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 10, color: 'var(--rose-light)', fontFamily: "'Syne', sans-serif" }}>
            Powered by AI · TF-IDF + Cosine Similarity
          </p>
          <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 800, color: 'rgba(255,255,255,0.92)', marginBottom: 10 }}>
            Movie Recommendation Engine
          </h3>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.38)', maxWidth: 500, margin: '0 auto 28px', lineHeight: 1.65 }}>
            Personalised picks based on genre, cast, and director patterns — for every film in the database.
          </p>
          <Link
            href="/recommendations"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'linear-gradient(135deg, var(--crimson), var(--violet))',
              color: '#fff', fontFamily: "'Syne', sans-serif", fontSize: 14, fontWeight: 700,
              padding: '14px 32px', borderRadius: 12,
              boxShadow: '0 8px 32px rgba(212,41,26,0.35)',
              textDecoration: 'none', transition: 'transform 0.25s, box-shadow 0.25s',
            }}
          >
            🎬 Browse Recommendations
          </Link>
        </div>

      </main>
    </div>
  )
}