import { client } from '../../sanity/client'
import AnalyticsPageClient from './AnalyticsPageClient'

export default async function AnalyticsPage() {
  let movies: any[] = []
  let totalCount = 0

  try {
    // Fetch all movies for analytics (batched)
    const batchSize = 500
    let start = 0
    let batch: any[] = []
    do {
      batch = await client.fetch<any[]>(
        `*[_type == "movie"] | order(year asc)[${start}...${start + batchSize}] {
          _id, title, year, director, genre, rating
        }`
      ).catch(() => [])
      movies = [...movies, ...batch]
      start += batchSize
    } while (batch.length === batchSize)
    totalCount = movies.length
  } catch {}

  return <AnalyticsPageClient movies={movies} totalCount={totalCount} />
}
