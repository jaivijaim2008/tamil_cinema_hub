import { client } from '../../../sanity/client'
import LatestPageClient from './LatestPageClient'
import type { Movie } from '@/lib/types'

export const metadata = {
  title: 'Latest Tamil Movie Releases',
  description: 'The newest Tamil films added to our archive',
}

export default async function LatestPage() {
  let movies: Movie[] = []

  try {
    movies = await client.fetch<Movie[]>(
      `*[_type == "movie"] | order(year desc, _createdAt desc) {
        _id, title, titleTanglish, "slug": slug.current, year, director, cast, genre, rating, poster, posterUrl, synopsis, ottPlatform
      }`
    ).catch(() => [])
  } catch {}

  return <LatestPageClient movies={movies} />
}
