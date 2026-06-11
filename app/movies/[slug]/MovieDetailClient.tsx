'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Share2, Copy, Check } from 'lucide-react'
import RatingStars from '../../../components/graphics/RatingStars'
import GenreBadge from '../../../components/ui/GenreBadge'
import CinematicDivider from '../../../components/ui/CinematicDivider'
import { toArray } from '../../../lib/utils'

interface Props {
  movie: any
  posterUrl: string | null
  backdropUrl: string | null
}

export default function MovieDetailClient({ movie, posterUrl, backdropUrl }: Props) {
  const [copied, setCopied] = useState(false)

  const shareUrl = typeof window !== 'undefined' ? window.location.href : ''
  const ottList = toArray(movie.ottPlatform)
  const genreList = toArray(movie.genre)
  const castList = toArray(movie.cast)

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const ratingColor =
    (movie.rating || 0) >= 8
      ? 'text-accent-gold'
      : (movie.rating || 0) >= 6
        ? 'text-green-400'
        : 'text-amber-400'

  return (
    <>
      {/* ═══ MOBILE LAYOUT (< 768px) ═══ */}
      <div className="lg:hidden">
        {/* Full-bleed poster header */}
        <div className="relative w-full h-[60vh] overflow-hidden">
          {posterUrl ? (
            <Image src={posterUrl} alt={movie.title} fill className="object-cover object-top" priority />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#2A1F08] via-bg-elevated to-bg-card flex items-center justify-center">
              <span className="font-playfair text-6xl text-text-muted">{movie.title[0]}</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-bg-primary/70 to-transparent" />

          {/* Back button */}
          <Link
            href="/movies"
            className="absolute top-4 left-4 z-10 w-10 h-10 rounded-full glass flex items-center justify-center"
          >
            <ArrowLeft size={18} className="text-text-primary" />
          </Link>

          {/* Genre + rating overlaid */}
          <div className="absolute bottom-20 left-4 flex items-center gap-2">
            {genreList.map((g) => <GenreBadge key={g} genre={g} />)}
            {movie.rating && (
              <span className={`text-xs font-mono font-bold ${ratingColor} bg-bg-elevated/80 px-2 py-0.5 rounded`}>
                ★ {movie.rating.toFixed(1)}
              </span>
            )}
          </div>

          {/* Title overlaid */}
          <div className="absolute bottom-4 left-4 right-4 z-10">
            <h1 className="font-playfair text-3xl text-text-primary leading-tight">{movie.title}</h1>
          </div>
        </div>

        {/* Content card overlapping poster */}
        <div className="bg-bg-primary rounded-t-3xl -mt-8 relative z-10 px-5 pt-6 pb-24">
          <div className="flex items-center gap-3 mb-4">
            <p className="text-text-secondary text-sm">{movie.year} · {movie.director}</p>
          </div>
          {movie.rating && (
            <div className="mb-4">
              <RatingStars rating={movie.rating} />
            </div>
          )}

          {/* Cast */}
          {castList.length > 0 && (
            <div className="mb-6">
              <h3 className="text-text-muted text-xs uppercase tracking-wider mb-3">Cast</h3>
              <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
                {castList.map((c) => (
                  <span key={c} className="shrink-0 px-3 py-1.5 rounded-full bg-bg-elevated text-text-secondary text-xs border border-border-subtle">
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* OTT */}
          {ottList.length > 0 && (
            <div className="mb-6">
              <h3 className="text-text-muted text-xs uppercase tracking-wider mb-3">Available On</h3>
              <div className="flex gap-2 flex-wrap">
                {ottList.map((p) => (
                  <span key={p} className="px-3 py-1.5 rounded-full bg-accent-gold-muted text-accent-gold text-xs border border-border-accent">
                    {p}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Synopsis */}
          {movie.synopsis && (
            <div className="mb-6">
              <h3 className="text-text-muted text-xs uppercase tracking-wider mb-3">Synopsis</h3>
              <p className="text-text-secondary text-sm leading-relaxed">{movie.synopsis}</p>
            </div>
          )}

          {/* Share */}
          <div className="flex gap-3">
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border-subtle text-text-secondary text-sm"
            >
              {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
              {copied ? 'Copied!' : 'Copy Link'}
            </button>
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(movie.title + ' - TamilCinemaHub')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border-subtle text-text-secondary text-sm"
            >
              <Share2 size={14} />
              Share
            </a>
          </div>
        </div>
      </div>

      {/* ═══ DESKTOP LAYOUT (≥ 768px) ═══ */}
      <div className="hidden lg:block min-h-screen pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-6">
          {/* Back */}
          <Link href="/movies" className="inline-flex items-center gap-2 text-text-secondary text-sm hover:text-accent-gold mb-8 transition-colors">
            <ArrowLeft size={16} /> Back to Movies
          </Link>

          <div className="grid grid-cols-[320px_1fr] gap-10">
            {/* Poster with ambient glow */}
            <div className="relative">
              {posterUrl && (
                <div className="absolute inset-0 -z-10 scale-110">
                  <Image src={posterUrl} alt="" fill className="object-cover blur-[60px] opacity-[0.15]" />
                </div>
              )}
              <div className="aspect-[2/3] rounded-2xl overflow-hidden border border-border-subtle relative">
                {posterUrl ? (
                  <Image src={posterUrl} alt={movie.title} fill className="object-cover" priority sizes="320px" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#2A1F08] via-bg-elevated to-bg-card flex items-center justify-center">
                    <span className="font-playfair text-6xl text-text-muted">{movie.title[0]}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Details */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                {genreList.map((g) => <GenreBadge key={g} genre={g} />)}
              </div>

              <h1 className="font-playfair text-4xl lg:text-5xl text-text-primary leading-tight mb-2">
                {movie.title}
              </h1>

              {movie.titleTanglish && (
                <p className="text-text-muted text-sm mb-4">{movie.titleTanglish}</p>
              )}

              <div className="flex items-center gap-4 mb-6">
                <span className="text-text-secondary text-sm">{movie.year}</span>
                <span className="text-text-muted">·</span>
                <span className="text-text-secondary text-sm">{movie.director}</span>
                {movie.rating && (
                  <>
                    <span className="text-text-muted">·</span>
                    <span className={`font-mono text-2xl font-bold ${ratingColor}`} style={{ textShadow: '0 0 40px currentColor' }}>
                      {movie.rating.toFixed(1)}
                    </span>
                  </>
                )}
              </div>

              {movie.rating && (
                <div className="mb-6">
                  <RatingStars rating={movie.rating} />
                </div>
              )}

              <CinematicDivider className="my-6" />

              {/* Cast */}
              {castList.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-text-muted text-xs uppercase tracking-wider mb-3">Cast</h3>
                  <div className="flex gap-2 flex-wrap">
                    {castList.map((c) => (
                      <span key={c} className="px-3 py-1.5 rounded-full bg-bg-elevated text-text-secondary text-sm border border-border-subtle">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* OTT */}
              {ottList.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-text-muted text-xs uppercase tracking-wider mb-3">Available On</h3>
                  <div className="flex gap-2 flex-wrap">
                    {ottList.map((p) => (
                      <span key={p} className="px-4 py-2 rounded-full bg-accent-gold-muted text-accent-gold text-sm border border-border-accent flex items-center gap-1.5">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Synopsis */}
              {movie.synopsis && (
                <div className="mb-8">
                  <h3 className="text-text-muted text-xs uppercase tracking-wider mb-3">Synopsis</h3>
                  <p className="text-text-secondary leading-relaxed max-w-[60ch]">{movie.synopsis}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl border border-border-subtle text-text-secondary text-sm hover:border-border-accent transition-colors"
                >
                  {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                  {copied ? 'Copied!' : 'Copy Link'}
                </button>
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(movie.title + ' - TamilCinemaHub')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-5 py-3 rounded-xl border border-border-subtle text-text-secondary text-sm hover:border-border-accent transition-colors"
                >
                  <Share2 size={14} />
                  Share
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
