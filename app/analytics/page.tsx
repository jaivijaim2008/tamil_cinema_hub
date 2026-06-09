import { client } from '../../sanity/client'
import Link from 'next/link'

export const revalidate = 300

async function getStats() {
  try {
    const movies = await client.fetch<{ title: string; year: number; rating: number; genre: string[]; ottPlatform?: string; director?: string }[]>(
      `*[_type == "movie"]{ title, year, rating, genre, ottPlatform, director }`
    )

    const total = movies.length

    const yearMap = new Map<number, number>()
    movies.forEach(m => { if (m.year) yearMap.set(m.year, (yearMap.get(m.year) || 0) + 1) })
    const years = Array.from(yearMap.entries()).map(([year, count]) => ({ year, count })).sort((a, b) => a.year - b.year)

    const genreMap = new Map<string, number>()
    movies.forEach(m => { (m.genre || []).forEach(g => { if (g) genreMap.set(g, (genreMap.get(g) || 0) + 1) }) })
    const genres = Array.from(genreMap.entries()).map(([genre, count]) => ({ genre, count })).sort((a, b) => b.count - a.count)

    const ratingBuckets = [0, 0, 0, 0, 0]
    movies.forEach(m => {
      const r = m.rating || 0
      if (r >= 4.5) ratingBuckets[4]++
      else if (r >= 3.5) ratingBuckets[3]++
      else if (r >= 2.5) ratingBuckets[2]++
      else if (r >= 1.5) ratingBuckets[1]++
      else ratingBuckets[0]++
    })

    const ottMap = new Map<string, number>()
    movies.forEach(m => { if (m.ottPlatform) ottMap.set(m.ottPlatform, (ottMap.get(m.ottPlatform) || 0) + 1) })
    const ottPlatforms = Array.from(ottMap.entries()).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 8)

    const directorMap = new Map<string, number>()
    movies.forEach(m => { if (m.director) directorMap.set(m.director, (directorMap.get(m.director) || 0) + 1) })
    const topDirectors = Array.from(directorMap.entries()).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 10)

    const avgRating = total ? (movies.reduce((sum, m) => sum + (m.rating || 0), 0) / total).toFixed(1) : '0'
    const maxYear = years.length ? years[years.length - 1].year : 2026
    const minYear = years.length ? years[0].year : 2000

    return { total, years, genres, ratingBuckets, ottPlatforms, topDirectors, avgRating, minYear, maxYear, movieCount: total }
  } catch {
    return null
  }
}

export default async function AnalyticsPage() {
  const stats = await getStats()
  if (!stats) {
    return (
      <div style={{ background: 'var(--ink)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 16 }}>Failed to load analytics data.</p>
      </div>
    )
  }

  const maxYearCount = Math.max(...stats.years.map(y => y.count))
  const maxGenreCount = Math.max(...stats.genres.slice(0, 10).map(g => g.count))
  const maxOttCount = Math.max(...stats.ottPlatforms.map(o => o.count))

  return (
    <div style={{ background: 'var(--ink)', minHeight: '100vh', paddingBottom: 96 }}>
      {/* Header */}
      <section style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '48px 0' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
          <Link href="/movies" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 500, marginBottom: 24, color: 'rgba(255,255,255,0.35)', transition: 'color 0.2s' }}>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Back to Movies
          </Link>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--rose-light)', marginBottom: 8, fontFamily: "'Syne', sans-serif" }}>
            TamilCinemaHub Analytics
          </p>
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 800, color: 'rgba(255,255,255,0.92)', marginBottom: 8, lineHeight: 1.1 }}>
            Movie Database Dashboard
          </h1>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.4)' }}>
            Insights and statistics from {stats.movieCount.toLocaleString()} Tamil movies ({stats.minYear}–{stats.maxYear})
          </p>
        </div>
      </section>

      <main style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px' }}>
        {/* KPI Cards */}
        <div className="stat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 40 }}>
          {[
            { label: 'Total Movies', value: stats.total.toLocaleString(), icon: '🎬', color: 'var(--crimson)' },
            { label: 'Avg Rating', value: `${stats.avgRating}/5`, icon: '⭐', color: 'var(--gold)' },
            { label: 'Genres', value: String(stats.genres.length), icon: '🎭', color: 'var(--violet)' },
            { label: 'OTT Platforms', value: String(stats.ottPlatforms.length), icon: '📺', color: 'var(--teal)' },
          ].map(kpi => (
            <div key={kpi.label} style={{ borderRadius: 16, padding: '24px 20px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>{kpi.icon}</div>
              <p style={{ fontFamily: "'Syne', sans-serif", fontSize: 32, fontWeight: 800, color: kpi.color, lineHeight: 1.1 }}>{kpi.value}</p>
              <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginTop: 4 }}>{kpi.label}</p>
            </div>
          ))}
        </div>

        <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 40 }}>
          {/* Movies by Year Chart */}
          <div style={{ borderRadius: 16, padding: 24, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: 16, fontWeight: 800, color: 'rgba(255,255,255,0.92)', marginBottom: 20 }}>Movies by Year</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {stats.years.map(y => (
                <div key={y.year} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', width: 36, textAlign: 'right', flexShrink: 0 }}>{y.year}</span>
                  <div style={{ flex: 1, height: 20, borderRadius: 4, background: 'rgba(255,255,255,0.04)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: 4, width: `${(y.count / maxYearCount) * 100}%`, background: 'linear-gradient(90deg, var(--crimson), var(--vermillion))', transition: 'width 0.5s ease' }} />
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', width: 24, flexShrink: 0 }}>{y.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Genre Distribution */}
          <div style={{ borderRadius: 16, padding: 24, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: 16, fontWeight: 800, color: 'rgba(255,255,255,0.92)', marginBottom: 20 }}>Genre Distribution</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {stats.genres.slice(0, 10).map((g, i) => {
                const colors = ['#D4291A', '#7C3AED', '#F0B429', '#3B82F6', '#0D9488', '#F43F5E', '#84CC16', '#FF6B35', '#A78BFA', '#2DD4BF']
                return (
                  <div key={g.genre} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', width: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flexShrink: 0 }}>{g.genre}</span>
                    <div style={{ flex: 1, height: 20, borderRadius: 4, background: 'rgba(255,255,255,0.04)', overflow: 'hidden' }}>
                      <div style={{ height: '100%', borderRadius: 4, width: `${(g.count / maxGenreCount) * 100}%`, background: colors[i % colors.length], transition: 'width 0.5s ease' }} />
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', width: 24, flexShrink: 0 }}>{g.count}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 40 }}>
          {/* OTT Platform Distribution */}
          <div style={{ borderRadius: 16, padding: 24, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: 16, fontWeight: 800, color: 'rgba(255,255,255,0.92)', marginBottom: 20 }}>Streaming Platforms</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {stats.ottPlatforms.map((o, i) => {
                const colors = ['#E50914', '#00A8E1', '#112350', '#1E3C72', '#FF3333', '#BF0A2B', '#FF6600', '#00358C']
                return (
                  <div key={o.name} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.02)' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: colors[i % colors.length], flexShrink: 0 }} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.7)', flex: 1 }}>{o.name}</span>
                    <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 14, fontWeight: 800, color: 'rgba(255,255,255,0.92)' }}>{o.count}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Rating Distribution */}
          <div style={{ borderRadius: 16, padding: 24, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: 16, fontWeight: 800, color: 'rgba(255,255,255,0.92)', marginBottom: 20 }}>Rating Distribution</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { label: '★★★★★ (4.5-5)', count: stats.ratingBuckets[4], color: '#F0B429' },
                { label: '★★★★☆ (3.5-4)', count: stats.ratingBuckets[3], color: '#FF8C00' },
                { label: '★★★☆☆ (2.5-3)', count: stats.ratingBuckets[2], color: '#FF4D1C' },
                { label: '★★☆☆☆ (1.5-2)', count: stats.ratingBuckets[1], color: '#D4291A' },
                { label: '★☆☆☆☆ (0-1.5)', count: stats.ratingBuckets[0], color: '#666' },
              ].map(r => {
                const maxR = Math.max(...stats.ratingBuckets)
                return (
                  <div key={r.label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', width: 130, flexShrink: 0 }}>{r.label}</span>
                    <div style={{ flex: 1, height: 20, borderRadius: 4, background: 'rgba(255,255,255,0.04)', overflow: 'hidden' }}>
                      <div style={{ height: '100%', borderRadius: 4, width: `${maxR ? (r.count / maxR) * 100 : 0}%`, background: r.color, transition: 'width 0.5s ease' }} />
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', width: 24, flexShrink: 0 }}>{r.count}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Top Directors */}
        <div style={{ borderRadius: 16, padding: 24, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', marginBottom: 40 }}>
          <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: 16, fontWeight: 800, color: 'rgba(255,255,255,0.92)', marginBottom: 20 }}>Top Directors by Filmography</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
            {stats.topDirectors.map((d, i) => (
              <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: i < 3 ? 'var(--crimson)' : 'rgba(255,255,255,0.06)', color: '#fff', fontWeight: 900, fontSize: 14, flexShrink: 0 }}>
                  {d.name.charAt(0)}
                </div>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.92)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.name}</p>
                  <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{d.count} movie{d.count > 1 ? 's' : ''}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ML/AI Footer Note */}
        <div style={{ textAlign: 'center', padding: '32px 24px', borderRadius: 16, background: 'linear-gradient(135deg, rgba(124,58,237,0.08), rgba(212,41,26,0.08))', border: '1px solid rgba(255,255,255,0.06)' }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8, color: 'var(--rose-light)', fontFamily: "'Syne', sans-serif" }}>
            Powered by AI & Data Science
          </p>
          <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 800, color: 'rgba(255,255,255,0.92)', marginBottom: 8 }}>
            Movie Recommendation Engine
          </h3>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', maxWidth: 480, margin: '0 auto', lineHeight: 1.6 }}>
            Using TF-IDF vectorization and cosine similarity to recommend movies based on genre, cast, and director analysis.
          </p>
        </div>
      </main>
    </div>
  )
}
