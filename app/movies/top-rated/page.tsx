import { client } from '../../../sanity/client'
import TopRatedPageClient from './TopRatedPageClient'

export const metadata = {
  title: 'Top Rated Tamil Movies',
  description: 'The highest rated Tamil films in our archive',
}

export default async function TopRatedPage() {
  let movies: any[] = []

  try {
    movies = await client.fetch<any[]>(
      `*[_type == "movie" && rating >= 1] | order(rating desc) {
        _id, title, titleTanglish, "slug": slug.current, year, director, cast, genre, rating, poster, posterUrl, synopsis
      }`
    ).catch(() => [])
  } catch {}

  return <TopRatedPageClient movies={movies} />
}
