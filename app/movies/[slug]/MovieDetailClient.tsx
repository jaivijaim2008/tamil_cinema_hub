'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Star, Calendar, User, Monitor, ArrowLeft, Film } from 'lucide-react'
import type { Movie } from '@/lib/types'
import RatingStars from '@/components/ui/RatingStars'
import { urlFor } from '@/sanity/lib/image'
import PortableText from '@/components/ui/PortableText'

interface Props {
  movie: Movie
  posterUrl: string | null
  backdropUrl: string | null
}

export default function MovieDetailClient({ movie, posterUrl, backdropUrl }: Props) {
  return (
    <div className="min-h-screen pt-16 md:pt-20 pb-16">
      {/* Backdrop */}
      {backdropUrl && (
        <div className="relative h-[30vh] md:h-[40vh] overflow-hidden">
          <Image src={backdropUrl} alt="" fill className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-bg-primary/60 to-transparent" />
        </div>
      )}

      <div className={`max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 ${backdropUrl ? '-mt-24 relative' : 'pt-8'}`}>
        {/* Breadcrumb */}
        <Link
          href="/movies"
          className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary transition-colors mb-6"
        >
          <ArrowLeft size={12} /> Back to Movies
        </Link>

        <div className="flex flex-col md:flex-row gap-6 md:gap-10">
          {/* Poster */}
          <div className="shrink-0 w-48 md:w-64 mx-auto md:mx-0">
            <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-bg-card border border-border">
              {posterUrl ? (
                <Image
                  src={posterUrl}
                  alt={movie.title}
                  fill
                  sizes="(max-width: 768px) 192px, 256px"
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-text-muted">
                  <Film size={48} />
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            {/* Title + year */}
            <div className="flex items-start gap-3 mb-2">
              <h1 className="text-2xl md:text-4xl font-bold text-text-primary leading-tight">
                {movie.title}
              </h1>
            </div>

            {movie.titleTanglish && movie.titleTanglish !== movie.title && (
              <p className="text-sm text-text-muted mb-4 italic">{movie.titleTanglish}</p>
            )}

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="flex items-center gap-1 text-sm text-text-secondary">
                <Calendar size={14} className="text-text-muted" />
                {movie.year}
              </span>
              {movie.director && (
                <span className="flex items-center gap-1 text-sm text-text-secondary">
                  <User size={14} className="text-text-muted" />
                  {movie.director}
                </span>
              )}
              {movie.ottPlatform && (
                <span className="flex items-center gap-1 text-sm text-text-secondary">
                  <Monitor size={14} className="text-text-muted" />
                  {movie.ottPlatform}
                </span>
              )}
            </div>

            {/* Rating */}
            {movie.rating != null && movie.rating > 0 && (
              <div className="mb-4">
                <RatingStars rating={movie.rating} />
              </div>
            )}

            {/* Genres */}
            {movie.genre && movie.genre.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {movie.genre.map((g) => (
                  <Link
                    key={g}
                    href={`/movies?genre=${encodeURIComponent(g)}`}
                    className="text-xs font-medium text-text-secondary bg-bg-elevated border border-border rounded-full px-3 py-1 hover:text-accent-gold hover:border-accent-gold/30 transition-all"
                  >
                    {g}
                  </Link>
                ))}
              </div>
            )}

            {/* Synopsis */}
            {movie.synopsis && (
              <div className="mb-6">
                <h2 className="text-sm font-semibold text-text-primary mb-2 uppercase tracking-wide">Synopsis</h2>
                <p className="text-sm text-text-secondary leading-relaxed">{movie.synopsis}</p>
              </div>
            )}

            {/* Cast */}
            {movie.cast && movie.cast.length > 0 && (
              <div className="mb-6">
                <h2 className="text-sm font-semibold text-text-primary mb-2 uppercase tracking-wide">Cast</h2>
                <div className="flex flex-wrap gap-2">
                  {movie.cast.map((name) => (
                    <span
                      key={name}
                      className="text-sm text-text-secondary bg-bg-card border border-border rounded-lg px-3 py-1.5"
                    >
                      {name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Full Review */}
        {movie.review && movie.review.length > 0 && (
          <div className="mt-10 md:mt-14 max-w-3xl">
            <h2 className="text-lg font-bold text-text-primary mb-4">Full Review</h2>
            <div className="prose prose-invert prose-sm max-w-none">
              <PortableText value={movie.review} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
