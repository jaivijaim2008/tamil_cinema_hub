import { client } from '../../../sanity/client'
import { urlFor } from '../../../sanity/lib/image'
import { movieBySlugQuery } from '../../../lib/queries'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import MovieDetailClient from './MovieDetailClient'
import type { Movie } from '@/lib/types'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  let movie: Movie | null = null
  try {
    movie = await client.fetch<Movie>(movieBySlugQuery, { slug })
  } catch (error) {
    console.error("Failed to fetch movie for metadata:", error)
  }

  if (!movie) return { title: 'Movie Not Found' }

  return {
    title: `${movie.title} (${movie.year})`,
    description: movie.synopsis || `${movie.title} - Tamil movie directed by ${movie.director}`,
    openGraph: {
      title: `${movie.title} (${movie.year})`,
      description: movie.synopsis || '',
      images: movie.poster?.asset ? [urlFor(movie.poster).width(800).url()] : [],
    },
  }
}

export default async function MovieDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  let movie: Movie | null = null
  try {
    movie = await client.fetch<Movie>(movieBySlugQuery, { slug })
  } catch {}

  if (!movie) notFound()

  const posterUrl = movie.poster?.asset
    ? urlFor(movie.poster).width(800).url()
    : movie.posterUrl || null

  const backdropUrl = movie.backdropUrl || null

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Movie',
            name: movie.title,
            image: posterUrl,
            description: movie.synopsis || '',
            director: movie.director ? { '@type': 'Person', name: movie.director } : undefined,
            dateCreated: movie.year ? `${movie.year}` : undefined,
          }),
        }}
      />
      <MovieDetailClient movie={movie} posterUrl={posterUrl} backdropUrl={backdropUrl} />
    </>
  )
}
