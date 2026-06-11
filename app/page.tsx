import { client } from '../sanity/client'
import { latestMoviesQuery, latestBlogsQuery } from '../lib/queries'
import type { Movie } from '../components/ui/MovieCard'
import HomePageClient from './HomePageClient'

export default async function Home() {
  let movies: Movie[] = []
  let blogs: any[] = []

  try {
    ;[movies, blogs] = await Promise.all([
      client.fetch<Movie[]>(latestMoviesQuery).catch(() => []),
      client.fetch<any[]>(latestBlogsQuery).catch(() => []),
    ])
  } catch {
    // fallback
  }

  const recentTitles = movies.slice(0, 20).map((m) => m.title)

  return <HomePageClient movies={movies} blogs={blogs} recentTitles={recentTitles} />
}
