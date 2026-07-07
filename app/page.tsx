import { client } from '../sanity/client'
import { latestMoviesQuery, latestBlogsQuery } from '../lib/queries'
import { toArray } from '../lib/utils'
import type { Movie } from '../components/ui/MovieCard'
import type { Blog } from '@/lib/types'
import HomePageClient from './HomePageClient'

const allGenresQuery = `*[_type == "movie"){ genre }`

interface GenreCount {
  genre: string
  count: number
}

export default async function Home() {
  let movies: Movie[] = []
  let blogs: Blog[] = []
  let totalMovies = 0
  let genreCounts: GenreCount[] = []

  try {
    ;[movies, blogs, totalMovies] = await Promise.all([
      client.fetch<Movie[]>(latestMoviesQuery).catch(() => []),
      client.fetch<Blog[]>(latestBlogsQuery).catch(() => []),
      client.fetch<number>('count(*[_type == "movie"])').catch(() => 0),
    ])

    // Fetch all genres to compute real stats
    const allData = await client.fetch<{ genre: string | string[] | null }[]>(allGenresQuery).catch(() => [])

    // Compute genre counts from all movies in the database
    const genreMap = new Map<string, number>()

    for (const item of allData) {
      const genres = toArray(item.genre)
      for (const g of genres) {
        if (g) genreMap.set(g, (genreMap.get(g) || 0) + 1)
      }
    }

    genreCounts = Array.from(genreMap.entries())
      .map(([genre, count]) => ({ genre, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8)
  } catch {
    // fallback
  }

  return <HomePageClient movies={movies} blogs={blogs} totalMovies={totalMovies} genreCounts={genreCounts} />
}
