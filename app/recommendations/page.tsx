import { client } from '../../sanity/client'
import { urlFor } from '../../sanity/lib/image'
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
      next: { revalidate: 3600 }, // Cache for 1 hour
    })
    if (!res.ok) return []
    const data: MlResponse = await res.json()
    return data.recommendations || []
  } catch {
    return []
  }
}

async function enrichWithSanityData(mlMovies: MlMovie[]) {
  if (mlMovies.length === 0) return []

  const slugs = mlMovies.map((m) => m.slug)
  
  try {
    const sanityMovies = await client.fetch<any[]>(
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
  // Fetch ML-powered recommendations in parallel
  const [mlTopPicks, mlTrending, mlAction, mlDrama, mlRomance] = await Promise.all([
    fetchMlRecommendations('/recommend/top-picks?n=12'),
    fetchMlRecommendations('/recommend/trending?n=12'),
    fetchMlRecommendations('/recommend/genre/action?n=8'),
    fetchMlRecommendations('/recommend/genre/drama?n=8'),
    fetchMlRecommendations('/recommend/genre/romance?n=8'),
  ])

  // Enrich with Sanity poster/image data
  const [topPicks, trending, actionMovies, dramaMovies, romanceMovies] = await Promise.all([
    enrichWithSanityData(mlTopPicks),
    enrichWithSanityData(mlTrending),
    enrichWithSanityData(mlAction),
    enrichWithSanityData(mlDrama),
    enrichWithSanityData(mlRomance),
  ])

  // Fallback to Sanity-only data if ML engine is down
  let fallbackTopRated: any[] = []
  let fallbackAllMovies: any[] = []

  if (topPicks.length === 0 && trending.length === 0) {
    try {
      ;[fallbackTopRated, fallbackAllMovies] = await Promise.all([
        client.fetch<any[]>(
          `*[_type == "movie" && rating >= 7] | order(rating desc)[0...12] {
            _id, title, "slug": slug.current, year, director, genre, rating, poster, posterUrl
          }`
        ).catch(() => []),
        client.fetch<any[]>(
          `*[_type == "movie"] | order(year desc) {
            _id, title, "slug": slug.current, year, director, genre, rating, poster, posterUrl
          }`
        ).catch(() => []),
      ])
    } catch {}
  }

  const genreSections: [string, any[]][] = []
  if (actionMovies.length > 0) genreSections.push(['action', actionMovies])
  if (dramaMovies.length > 0) genreSections.push(['drama', dramaMovies])
  if (romanceMovies.length > 0) genreSections.push(['romance', romanceMovies])

  // Use ML top picks, or fallback to Sanity top rated
  const finalTopRated = topPicks.length > 0 ? topPicks : fallbackTopRated
  const finalTrending = trending.length > 0 ? trending : []

  return (
    <RecommendationsPageClient
      topRated={finalTopRated}
      trending={finalTrending}
      genreSections={genreSections}
      mlPowered={topPicks.length > 0}
    />
  )
}
