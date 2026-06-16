import { client } from '../../sanity/client'
import RecommendationsPageClient from './RecommendationsPageClient'
import { RECOMMENDER_API_URL } from '@/lib/constants'

// Don't pre-render during build — fetch ML API + Sanity at runtime
export const dynamic = 'force-dynamic'

interface MlMovie {
  title: string
  slug: string
  year: number
  director: string
  genre: string[]
  rating: number
  score?: number
}

interface MlResponse {
  total_results: number
  recommendations: MlMovie[]
  algorithm: string
}

async function fetchMlRecommendations(endpoint: string): Promise<MlMovie[]> {
  try {
    const res = await fetch(`${RECOMMENDER_API_URL}${endpoint}`, {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(6000), // 6s timeout — fall back to Sanity fast
    })
    if (!res.ok) return []
    const data: MlResponse = await res.json()
    return data.recommendations || []
  } catch {
    return []
  }
}

interface SanityMovie {
  _id: string
  title: string
  slug: string
  year: number
  director: string
  genre: string[]
  rating: number
  poster?: { asset?: { _ref?: string } }
  posterUrl?: string | null
}

async function enrichWithSanityData(mlMovies: MlMovie[]) {
  if (mlMovies.length === 0) return []

  const slugs = mlMovies.map((m) => m.slug)
  
  try {
    const sanityMovies = await client.fetch<SanityMovie[]>(
      `*[_type == "movie" && slug.current in $slugs] {
        _id, title, "slug": slug.current, year, director, genre, rating, poster, posterUrl
      }`,
      { slugs }
    )

    const sanityMap = new Map(sanityMovies.map((m) => [m.slug, m]))

    return mlMovies
      .map((ml) => {
        const sanity = sanityMap.get(ml.slug)
        return sanity || {
          _id: ml.slug,
          title: ml.title,
          slug: ml.slug,
          year: ml.year,
          director: ml.director,
          genre: ml.genre,
          rating: ml.rating,
        }
      })
      .filter(Boolean)
  } catch {
    return mlMovies.map((m) => ({
      _id: m.slug,
      title: m.title,
      slug: m.slug,
      year: m.year,
      director: m.director,
      genre: m.genre,
      rating: m.rating,
    }))
  }
}

export default async function RecommendationsPage() {
  // Fetch ML-powered recommendations filtered for 2026 only
  const [mlTopPicks, mlTrending, mlAction, mlDrama, mlRomance] = await Promise.all([
    fetchMlRecommendations('/recommend/top-picks?n=12&year=2026'),
    fetchMlRecommendations('/recommend/trending?n=12&year=2026'),
    fetchMlRecommendations('/recommend/genre/action?n=8&year=2026'),
    fetchMlRecommendations('/recommend/genre/drama?n=8&year=2026'),
    fetchMlRecommendations('/recommend/genre/romance?n=8&year=2026'),
  ])

  // Enrich with Sanity poster/image data
  const [topPicks, trending, actionMovies, dramaMovies, romanceMovies] = await Promise.all([
    enrichWithSanityData(mlTopPicks),
    enrichWithSanityData(mlTrending),
    enrichWithSanityData(mlAction),
    enrichWithSanityData(mlDrama),
    enrichWithSanityData(mlRomance),
  ])

  // Fallback to Sanity-only data if ML engine is down — 2026 movies only
  let fallbackTopRated: SanityMovie[] = []
  let fallbackAllMovies: SanityMovie[] = []

  if (topPicks.length === 0 && trending.length === 0) {
    try {
      ;[fallbackTopRated, fallbackAllMovies] = await Promise.all([
        client.fetch<SanityMovie[]>(
          `*[_type == "movie" && year == 2026 && rating >= 7] | order(rating desc)[0...12] {
            _id, title, "slug": slug.current, year, director, genre, rating, poster, posterUrl
          }`
        ).catch(() => []),
        client.fetch<SanityMovie[]>(
          `*[_type == "movie" && year == 2026] | order(year desc)[0...12] {
            _id, title, "slug": slug.current, year, director, genre, rating, poster, posterUrl
          }`
        ).catch(() => []),
      ])
    } catch {}
  }

  // Build genre sections from ML data, fallback to Sanity
  const genreSections: [string, SanityMovie[]][] = []
  if (actionMovies.length > 0) genreSections.push(['action', actionMovies])
  if (dramaMovies.length > 0) genreSections.push(['drama', dramaMovies])
  if (romanceMovies.length > 0) genreSections.push(['romance', romanceMovies])

  if (genreSections.length === 0) {
    try {
      const [actionFallback, dramaFallback, romanceFallback] = await Promise.all([
        client.fetch<SanityMovie[]>(
          `*[_type == "movie" && year == 2026 && "Action" in genre] | order(rating desc)[0...8]{ _id, title, "slug": slug.current, year, director, genre, rating, poster, posterUrl }`
        ).catch(() => []),
        client.fetch<SanityMovie[]>(
          `*[_type == "movie" && year == 2026 && "Drama" in genre] | order(rating desc)[0...8]{ _id, title, "slug": slug.current, year, director, genre, rating, poster, posterUrl }`
        ).catch(() => []),
        client.fetch<SanityMovie[]>(
          `*[_type == "movie" && year == 2026 && "Romance" in genre] | order(rating desc)[0...8]{ _id, title, "slug": slug.current, year, director, genre, rating, poster, posterUrl }`
        ).catch(() => []),
      ])
      if (actionFallback.length) genreSections.push(['action', actionFallback])
      if (dramaFallback.length) genreSections.push(['drama', dramaFallback])
      if (romanceFallback.length) genreSections.push(['romance', romanceFallback])
    } catch {}
  }

  // Use ML top picks, or fallback to Sanity top rated
  const finalTopRated = topPicks.length > 0 ? topPicks : fallbackTopRated
  const finalTrending = trending.length > 0 ? trending : (fallbackAllMovies.length > 0 ? fallbackAllMovies.slice(0, 12) : [])

  return (
    <RecommendationsPageClient
      topRated={finalTopRated}
      trending={finalTrending}
      genreSections={genreSections}
      mlPowered={topPicks.length > 0}
    />
  )
}
