import { client } from '../sanity/client'
import { latestMoviesQuery, latestBlogsQuery, genreCountsQuery, avgRatingQuery } from '../lib/queries'
import type { Movie } from '../components/ui/MovieCard'
import HomePageClient from './HomePageClient'

export default async function Home() {
  let movies: Movie[] = []
  let blogs: any[] = []
  let totalMovies = 0
  let totalBlogs = 0
  let genreCounts: { genre: string; count: number }[] = []
  let avgRating = 0

  try {
    ;[movies, blogs, totalMovies, totalBlogs, genreCounts, avgRating] = await Promise.all([
      client.fetch<Movie[]>(latestMoviesQuery).catch(() => []),
      client.fetch<any[]>(latestBlogsQuery).catch(() => []),
      client.fetch<number>('count(*[_type == "movie"])').catch(() => 0),
      client.fetch<number>('count(*[_type == "blog"])').catch(() => 0),
      client.fetch<{ genre: string; count: number }[]>(genreCountsQuery).catch(() => []),
      client.fetch<number>(avgRatingQuery).catch(() => 0),
    ])
  } catch {
    // fallback
  }

  const recentTitles = movies.slice(0, 20).map((m) => m.title)

  return <HomePageClient movies={movies} blogs={blogs} recentTitles={recentTitles} totalMovies={totalMovies} totalBlogs={totalBlogs} genreCounts={genreCounts} avgRating={avgRating} />
}
