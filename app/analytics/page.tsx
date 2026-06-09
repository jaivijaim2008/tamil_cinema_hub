import type { Metadata } from 'next'
import { client } from '../../sanity/client'
import AnalyticsDashboard from '../../components/AnalyticsDashboard'

export const revalidate = 300

// ─── SEO ──────────────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: 'Movie Database Dashboard | TamilCinemaHub',
  description:
    'Explore analytics from 1,600+ Tamil movies (2000–2026). Deep insights on genres, ratings, OTT platforms, top directors, and year-by-year release trends.',
  keywords: [
    'Tamil movies analytics', 'Kollywood statistics', 'Tamil cinema data',
    'Tamil film dashboard', 'TamilCinemaHub analytics', 'Tamil OTT platforms',
    'Tamil movie ratings', 'top Tamil directors',
  ],
  openGraph: {
    title: 'Movie Database Dashboard | TamilCinemaHub',
    description: 'Analytics from 1,600+ Tamil movies — genres, ratings, OTT platforms, top directors, and more.',
    url: 'https://tamilcinemahub.xyz/analytics',
    siteName: 'TamilCinemaHub',
    type: 'website',
    images: [{ url: 'https://tamilcinemahub.xyz/opengraph-image', width: 1200, height: 630, alt: 'TamilCinemaHub Analytics Dashboard' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Movie Database Dashboard | TamilCinemaHub',
    description: 'Analytics from 1,600+ Tamil movies — genres, ratings, OTT, directors.',
    images: ['https://tamilcinemahub.xyz/opengraph-image'],
  },
  alternates: { canonical: 'https://tamilcinemahub.xyz/analytics' },
  robots: { index: true, follow: true },
}

// ─── OTT normaliser ───────────────────────────────────────────────────────────
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
const normaliseOTT = (raw: string) => OTT_ALIAS[raw.toLowerCase().trim()] ?? raw.trim()

// ─── Movie type ───────────────────────────────────────────────────────────────
type Movie = {
  title: string
  year: number | string | null
  rating: number | string | null
  genre: string[]
  ottPlatform?: string
  director?: string
}

// ─── Data fetcher (paginated) ─────────────────────────────────────────────────
async function getStats() {
  try {
    const PAGE_SIZE = 500
    let allMovies: Movie[] = []
    let page = 0

    while (true) {
      const from = page * PAGE_SIZE
      const to = from + PAGE_SIZE - 1

      // KEY FIX: Use GROQ params ($from / $to) instead of string interpolation.
      // String interpolation like `[${from}...${to}]` is treated as a static
      // expression by the Sanity client and silently falls back to the default
      // limit (60). Passing them as typed params forces the client to send the
      // correct slice values.
      const batch = await client.fetch<Movie[]>(
        `*[_type == "movie"][$from...$to]{
          title,
          "year": coalesce(year, 0),
          rating,
          genre,
          ottPlatform,
          director
        }`,
        { from, to }
      )

      console.log(`Page ${page} [${from}...${to}]: fetched ${batch.length} movies`)
      allMovies = [...allMovies, ...batch]
      if (batch.length < PAGE_SIZE) break
      page++
    }

    console.log(`✅ Total movies fetched: ${allMovies.length}`)

    const movies = allMovies
    const total  = movies.length

    // ─── Year ─────────────────────────────────────────────────────────────
    const yearMap = new Map<number, number>()
    movies.forEach(m => {
      const y = Number(m.year)
      if (y && !isNaN(y) && y > 1900 && y <= 2030) {
        yearMap.set(y, (yearMap.get(y) || 0) + 1)
      }
    })
    const years = Array.from(yearMap.entries())
      .map(([year, count]) => ({ year, count }))
      .sort((a, b) => a.year - b.year)

    // ─── Genre ────────────────────────────────────────────────────────────
    const genreMap = new Map<string, number>()
    movies.forEach(m => {
      (m.genre || []).forEach(g => {
        if (g) genreMap.set(g, (genreMap.get(g) || 0) + 1)
      })
    })
    const genres = Array.from(genreMap.entries())
      .map(([genre, count]) => ({ genre, count }))
      .sort((a, b) => b.count - a.count)

    // ─── Rating ───────────────────────────────────────────────────────────
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

    // ─── OTT ──────────────────────────────────────────────────────────────
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

    // ─── Directors ────────────────────────────────────────────────────────
    const directorMap = new Map<string, number>()
    movies.forEach(m => {
      const d = m.director?.trim()
      if (d && !['unknown', 'n/a', '-', ''].includes(d.toLowerCase())) {
        directorMap.set(d, (directorMap.get(d) || 0) + 1)
      }
    })
    const topDirectors = Array.from(directorMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    const maxYear    = years.length ? years[years.length - 1].year : 2026
    const minYear    = years.length ? years[0].year : 2000
    const totalRated = ratingBuckets.reduce((a, b) => a + b, 0)

    return { total, years, genres, ratingBuckets, ottPlatforms, topDirectors, avgRating, minYear, maxYear, totalRated }
  } catch (e) {
    console.error('[Analytics] fetch error:', e)
    return null
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function AnalyticsPage() {
  const stats = await getStats()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: 'TamilCinemaHub Movie Database',
    description: `Comprehensive analytics covering ${stats?.total ?? 1600}+ Tamil movies from ${stats?.minYear ?? 2000} to ${stats?.maxYear ?? 2026}`,
    url: 'https://tamilcinemahub.xyz/analytics',
    creator: { '@type': 'Organization', name: 'TamilCinemaHub', url: 'https://tamilcinemahub.xyz' },
    temporalCoverage: `${stats?.minYear ?? 2000}/${stats?.maxYear ?? 2026}`,
    inLanguage: 'ta',
    keywords: 'Tamil cinema, Kollywood, Tamil movies, analytics',
  }

  if (!stats) {
    return (
      <div style={{ background: 'var(--ink)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 32, marginBottom: 12 }}>⚠️</p>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 15 }}>Failed to load analytics data.</p>
          <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 13, marginTop: 6 }}>Please try refreshing the page.</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <AnalyticsDashboard stats={stats} />
    </>
  )
}