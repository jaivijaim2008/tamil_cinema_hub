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

  const posterUrl = movie.poster?.asset ? urlFor(movie.poster).width(800).url() : null
  const description = movie.synopsis
    ? movie.synopsis.slice(0, 160)
    : `${movie.title} (${movie.year}) — Tamil movie directed by ${movie.director}. ${movie.genre?.join(', ') || ''}`.trim()

  return {
    title: `${movie.title} (${movie.year})`,
    description,
    keywords: [
      movie.title,
      `${movie.title} ${movie.year}`,
      movie.director,
      ...(movie.genre || []),
      'Tamil movie', 'Kollywood', 'Tamil cinema',
    ],
    openGraph: {
      title: `${movie.title} (${movie.year}) — TamilCinemaHub`,
      description,
      images: posterUrl ? [{ url: posterUrl, width: 800, height: 1200, alt: movie.title }] : [],
      type: 'website',
      siteName: 'TamilCinemaHub',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${movie.title} (${movie.year})`,
      description,
      images: posterUrl ? [posterUrl] : [],
    },
    alternates: {
      canonical: `/movies/${slug}`,
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
            genre: movie.genre,
            aggregateRating: movie.rating ? {
              '@type': 'AggregateRating',
              ratingValue: movie.rating,
              bestRating: 5,
              ratingCount: 1,
            } : undefined,
            actor: movie.cast?.slice(0, 10).map((c) => {
              const name = typeof c === 'string' ? c : c.name
              return name ? { '@type': 'Person', name } : null
            }).filter(Boolean),
          }),
        }}
      />
      <MovieDetailClient movie={movie} posterUrl={posterUrl} backdropUrl={backdropUrl} />
    </>
  )
}
