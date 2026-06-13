'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Calendar, User, Monitor, ArrowLeft, Film } from 'lucide-react'
import type { Movie, CastMember } from '@/lib/types'
import RatingStars from '@/components/ui/RatingStars'
import { urlFor } from '@/sanity/lib/image'
import PortableText from '@/components/ui/PortableText'
import AdUnit from '@/components/ui/AdUnit'
import MLMoreLikeThis from '@/components/ui/MLMoreLikeThis'

interface Props {
  movie: Movie
  posterUrl: string | null
  backdropUrl: string | null
}

export default function MovieDetailClient({ movie, posterUrl, backdropUrl }: Props) {
  const [posterError, setPosterError] = useState(false)
  const [backdropError, setBackdropError] = useState(false)

  const displayPoster = !posterError && posterUrl
  const displayBackdrop = !backdropError && backdropUrl

  return (
    <div className="min-h-screen pt-16 md:pt-20 pb-16">
      {/* Cinematic Full Screen Backdrop */}
      {displayBackdrop && (
        <div className="fixed inset-0 z-[-1] pointer-events-none">
          <Image src={displayBackdrop} alt="" fill className="object-cover opacity-[0.15]" priority onError={() => setBackdropError(true)} />
          <div className="absolute inset-0 bg-gradient-to-b from-bg-primary/40 via-bg-primary/80 to-bg-primary" />
          <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-bg-primary/90 to-transparent" />
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
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
            <div className="relative aspect-[2/3] rounded-xl overflow-hidden glass-card">
              {displayPoster ? (
                <Image
                  src={displayPoster}
                  alt={movie.title}
                  fill
                  sizes="(max-width: 768px) 192px, 256px"
                  className="object-cover"
                  priority
                  onError={() => setPosterError(true)}
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
                <h2 className="text-sm font-semibold text-text-primary mb-3 uppercase tracking-wide">Cast</h2>
                <div className="flex flex-wrap gap-3">
                  {movie.cast.map((castItem: string | CastMember, idx) => {
                    const isObj = typeof castItem !== 'string';
                    const castName = isObj ? (castItem?.name || 'Unknown') : castItem;
                    const castChar = isObj ? castItem?.character : null;
                    const castPhotoUrl = isObj && castItem?.photo?.asset ? urlFor(castItem.photo).width(80).height(80).url() : null;

                    return (
                      <div
                        key={castName + idx}
                        className="flex items-center gap-2 glassmorphism rounded-full pr-4 pl-1 py-1 hover:bg-white/5 transition-colors"
                      >
                        {castPhotoUrl ? (
                          <div className="relative w-8 h-8 rounded-full overflow-hidden shrink-0 border border-white/10">
                            <Image src={castPhotoUrl} alt={castName} fill className="object-cover" />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-bg-surface flex items-center justify-center shrink-0 border border-white/10 ml-1">
                            <User size={14} className="text-text-muted" />
                          </div>
                        )}
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-text-primary leading-none">{castName}</span>
                          {castChar && <span className="text-[10px] text-text-muted mt-1 leading-none">{castChar}</span>}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ML-Powered More Like This */}
        <MLMoreLikeThis movieSlug={movie.slug} />

        {/* Ad: Between Details and Review */}
        <div className="mt-10 md:mt-14">
          <AdUnit adSlot="0000000003" className="max-w-3xl" minHeight="100px" />
        </div>

        {/* Full Review */}
        {movie.review && (
          <div className="mt-10 md:mt-14 max-w-3xl">
            <h2 className="text-lg font-bold text-text-primary mb-4">Full Review</h2>
            <div className="prose prose-invert prose-sm max-w-none">
              {Array.isArray(movie.review) ? (
                <PortableText value={movie.review} />
              ) : (
                <p className="text-text-secondary leading-relaxed">{String(movie.review)}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
