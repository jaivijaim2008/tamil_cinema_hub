import { client } from '../../sanity/client'
import { urlFor } from '../../sanity/lib/image'
import RecommendationsPageClient from './RecommendationsPageClient'

export default async function RecommendationsPage() {
  let topRated: any[] = []
  let allMovies: any[] = []

  try {
    ;[topRated, allMovies] = await Promise.all([
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

  // Hidden gems: low rating count but good rating, or obscure years
  const hiddenGems = allMovies.filter((m) => m.rating && m.rating >= 6 && m.year >= 2020).slice(0, 12)

  // Genre groups
  const genreMap = new Map<string, any[]>()
  allMovies.forEach((m) => {
    m.genre?.forEach((g: string) => {
      if (!genreMap.has(g)) genreMap.set(g, [])
      const arr = genreMap.get(g)!
      if (arr.length < 8) arr.push(m)
    })
  })
  const genreSections = Array.from(genreMap.entries())
    .filter(([, movies]) => movies.length >= 3)
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 6)

  return (
    <RecommendationsPageClient
      topRated={topRated}
      hiddenGems={hiddenGems}
      genreSections={genreSections}
    />
  )
}
