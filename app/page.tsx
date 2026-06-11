import { client } from '../sanity/client'
import { latestMoviesQuery, latestBlogsQuery } from '../lib/queries'
import { toArray } from '../lib/utils'
import type { Movie } from '../components/ui/MovieCard'
import HomePageClient from './HomePageClient'

const allGenresAndRatingsQuery = `*[_type == "movie"]{ genre, rating }`

interface GenreCount {
  genre: string
  count: number
}

export default async function Home() {
  let movies: Movie[] = []
  let blogs: any[] = []
  let totalMovies = 0
  let totalBlogs = 0
  let genreCounts: GenreCount[] = []
  let avgRating = 0

  try {
    ;[movies, blogs, totalMovies, totalBlogs] = await Promise.all([
      client.fetch<Movie[]>(latestMoviesQuery).catch(() => []),
      client.fetch<any[]>(latestBlogsQuery).catch(() => []),
      client.fetch<number>('count(*[_type == "movie"])').catch(() => 0),
      client.fetch<number>('count(*[_type == "blog"])').catch(() => 0),
    ])

    // Fetch all genres and ratings to compute real stats
    const allData = await client.fetch<{ genre: string | string[] | null; rating: number | null }[]>(allGenresAndRatingsQuery).catch(() => [])

    // Compute genre counts from all movies in the database
    const genreMap = new Map<string, number>()
    let ratingSum = 0
    let ratingCount = 0

    for (const item of allData) {
      const genres = toArray(item.genre)
      for (const g of genres) {
        if (g) genreMap.set(g, (genreMap.get(g) || 0) + 1)
      }
      if (item.rating) {
        ratingSum += item.rating
        ratingCount++
      }
    }

    genreCounts = Array.from(genreMap.entries())
      .map(([genre, count]) => ({ genre, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8)

    avgRating = ratingCount > 0 ? Math.round((ratingSum / ratingCount) * 10) / 10 : 0
  } catch {
    // fallback
  }

  const recentTitles = movies.slice(0, 20).map((m) => m.title)

  return <HomePageClient movies={movies} blogs={blogs} recentTitles={recentTitles} totalMovies={totalMovies} totalBlogs={totalBlogs} genreCounts={genreCounts} avgRating={avgRating} />
}
