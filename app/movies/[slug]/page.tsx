import { client } from '../../../sanity/client'
import { urlFor } from '../../../sanity/lib/image'
import { movieBySlugQuery } from '../../../lib/queries'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import MovieDetailClient from './MovieDetailClient'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const movie = await client.fetch<any>(movieBySlugQuery, { slug })
  if (!movie) return { title: 'Movie Not Found' }
  return {
    title: `${movie.title} (${movie.year})`,
    description: movie.synopsis || `${movie.title} - Tamil movie directed by ${movie.director}`,
    openGraph: {
      title: `${movie.title} (${movie.year})`,
      description: movie.synopsis || '',
      images: movie.poster ? [urlFor(movie.poster).width(800).url()] : [],
    },
  }
}

export default async function MovieDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  let movie: any = null
  try {
    movie = await client.fetch<any>(movieBySlugQuery, { slug })
  } catch {}

  if (!movie) notFound()

  const posterUrl = movie.poster
    ? urlFor(movie.poster).width(800).url()
    : movie.posterUrl || null

  const backdropUrl = movie.backdropUrl || null

  return <MovieDetailClient movie={movie} posterUrl={posterUrl} backdropUrl={backdropUrl} />
}
