import { client } from '../../../sanity/client'
import LatestPageClient from './LatestPageClient'

export const metadata = {
  title: 'Latest Tamil Movie Releases',
  description: 'The newest Tamil films added to our archive',
}

export default async function LatestPage() {
  let movies: any[] = []

  try {
    movies = await client.fetch<any[]>(
      `*[_type == "movie"] | order(year desc, _createdAt desc) {
        _id, title, titleTanglish, "slug": slug.current, year, director, cast, genre, rating, poster, posterUrl, synopsis, ottPlatform
      }`
    ).catch(() => [])
  } catch {}

  return <LatestPageClient movies={movies} />
}
