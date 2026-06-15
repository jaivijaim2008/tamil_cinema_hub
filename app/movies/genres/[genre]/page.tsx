import { client } from '../../../../sanity/client'
import GenrePageClient from './GenrePageClient'
import type { Movie } from '@/lib/types'

export async function generateStaticParams() {
  try {
    const genres = await client.fetch<string[]>(`*[_type == "movie"].genre[]`)
    const unique = [...new Set(genres)].filter(Boolean)
    return unique.map((genre) => ({ genre }))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: { params: Promise<{ genre: string }> }) {
  const { genre } = await params
  const decoded = decodeURIComponent(genre)
  return {
    title: `${decoded} Tamil Movies`,
    description: `Browse all ${decoded} Tamil films in our archive`,
  }
}

export default async function GenrePage({ params }: { params: Promise<{ genre: string }> }) {
  const { genre } = await params
  const decoded = decodeURIComponent(genre)

  let movies: Movie[] = []
  try {
    movies = await client.fetch<Movie[]>(
      `*[_type == "movie" && $genre in genre] | order(year desc) {
        _id, title, titleTanglish, "slug": slug.current, year, director, cast, genre, rating, poster, posterUrl, synopsis
      }`,
      { genre: decoded }
    ).catch(() => [])
  } catch {}

  return <GenrePageClient genre={decoded} movies={movies} />
}
