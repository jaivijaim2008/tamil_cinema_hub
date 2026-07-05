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
      signal: AbortSignal.timeout(8000),
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
  // Fetch multiple Netflix-style recommendation sections in parallel
  const [
    mlTopPicks,
    mlTrending,
    mlCriticallyAcclaimed,
    mlHiddenGems,
    mlAction,
    mlDrama,
    mlComedy,
    mlThriller,
    mlRomance,
    mlHorror,
    mlDecade2020s,
    mlDecade2010s,
  ] = await Promise.all([
    fetchMlRecommendations('/recommend/top-picks?n=12'),
    fetchMlRecommendations('/recommend/trending?n=12'),
    fetchMlRecommendations('/recommend/critically-acclaimed?n=12'),
    fetchMlRecommendations('/recommend/hidden-gems?n=10'),
    fetchMlRecommendations('/recommend/genre/action?n=8'),
    fetchMlRecommendations('/recommend/genre/drama?n=8'),
    fetchMlRecommendations('/recommend/genre/comedy?n=8'),
    fetchMlRecommendations('/recommend/genre/thriller?n=8'),
    fetchMlRecommendations('/recommend/genre/romance?n=8'),
    fetchMlRecommendations('/recommend/genre/horror?n=8'),
    fetchMlRecommendations('/recommend/decade/2020?n=8'),
    fetchMlRecommendations('/recommend/decade/2010?n=8'),
  ])

  // Enrich all sections with Sanity poster data in parallel
  const [
    topPicks,
    trending,
    criticallyAcclaimed,
    hiddenGems,
    actionMovies,
    dramaMovies,
    comedyMovies,
    thrillerMovies,
    romanceMovies,
    horrorMovies,
    decade2020s,
    decade2010s,
  ] = await Promise.all([
    enrichWithSanityData(mlTopPicks),
    enrichWithSanityData(mlTrending),
    enrichWithSanityData(mlCriticallyAcclaimed),
    enrichWithSanityData(mlHiddenGems),
    enrichWithSanityData(mlAction),
    enrichWithSanityData(mlDrama),
    enrichWithSanityData(mlComedy),
    enrichWithSanityData(mlThriller),
    enrichWithSanityData(mlRomance),
    enrichWithSanityData(mlHorror),
    enrichWithSanityData(mlDecade2020s),
    enrichWithSanityData(mlDecade2010s),
  ])

  // Fallback to Sanity-only data if ML engine is down
  let fallbackTopRated: SanityMovie[] = []
  let fallbackAllMovies: SanityMovie[] = []

  if (topPicks.length === 0 && trending.length === 0) {
    try {
      ;[fallbackTopRated, fallbackAllMovies] = await Promise.all([
        client.fetch<SanityMovie[]>(
          `*[_type == "movie" && rating >= 4] | order(rating desc)[0...12] {
            _id, title, "slug": slug.current, year, director, genre, rating, poster, posterUrl
          }`
        ).catch(() => []),
        client.fetch<SanityMovie[]>(
          `*[_type == "movie"] | order(year desc)[0...12] {
            _id, title, "slug": slug.current, year, director, genre, rating, poster, posterUrl
          }`
        ).catch(() => []),
      ])
    } catch {}
  }

  // Build genre sections from ML data, fallback to Sanity
  const genreSections: [string, SanityMovie[]][] = []
  if (actionMovies.length > 0) genreSections.push(['Action', actionMovies])
  if (dramaMovies.length > 0) genreSections.push(['Drama', dramaMovies])
  if (comedyMovies.length > 0) genreSections.push(['Comedy', comedyMovies])
  if (thrillerMovies.length > 0) genreSections.push(['Thriller', thrillerMovies])
  if (romanceMovies.length > 0) genreSections.push(['Romance', romanceMovies])
  if (horrorMovies.length > 0) genreSections.push(['Horror', horrorMovies])

  // Fallback genre sections from Sanity if ML is down
  if (genreSections.length === 0) {
    try {
      const genres = ['Action', 'Drama', 'Comedy', 'Thriller', 'Romance', 'Horror']
      const fallbackResults = await Promise.all(
        genres.map((g) =>
          client.fetch<SanityMovie[]>(
            `*[_type == "movie" && "${g}" in genre] | order(rating desc)[0...8]{
              _id, title, "slug": slug.current, year, director, genre, rating, poster, posterUrl
            }`
          ).catch(() => [])
        )
      )
      genres.forEach((g, i) => {
        if (fallbackResults[i].length > 0) genreSections.push([g, fallbackResults[i]])
      })
    } catch {}
  }

  const finalTopRated = topPicks.length > 0 ? topPicks : fallbackTopRated
  const finalTrending = trending.length > 0 ? trending : (fallbackAllMovies.length > 0 ? fallbackAllMovies.slice(0, 12) : [])

  return (
    <RecommendationsPageClient
      topRated={finalTopRated}
      trending={finalTrending}
      criticallyAcclaimed={criticallyAcclaimed}
      hiddenGems={hiddenGems}
      decadeSections={[
        ['2020s Hits', decade2020s],
        ['2010s Classics', decade2010s],
      ].filter(([, m]) => m.length > 0) as [string, SanityMovie[]][]}
      genreSections={genreSections}
      mlPowered={topPicks.length > 0}
    />
  )
}
