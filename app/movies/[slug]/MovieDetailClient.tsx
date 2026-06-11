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
        ? 'text-accent-emerald'
        : 'text-accent-amber'

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
            className="absolute top-4 left-4 z-10 w-11 h-11 rounded-full glass flex items-center justify-center"
          >
            <ArrowLeft size={18} className="text-text-primary" />
          </Link>

          {/* Genre + rating overlaid */}
          <div className="absolute bottom-24 left-5 flex items-center gap-2 flex-wrap">
            {genreList.map((g) => <GenreBadge key={g} genre={g} />)}
            {movie.rating && (
              <span className={`text-xs font-mono font-bold ${ratingColor} bg-bg-elevated/80 px-3 py-1 rounded-lg`}>
                ★ {movie.rating.toFixed(1)}
              </span>
            )}
          </div>

          {/* Title overlaid */}
          <div className="absolute bottom-6 left-5 right-5 z-10">
            <h1 className="font-playfair text-3xl text-text-primary leading-tight">{movie.title}</h1>
          </div>
        </div>

        {/* Content card overlapping poster */}
        <div className="bg-bg-primary rounded-t-3xl -mt-8 relative z-10 px-6 pt-8 pb-28">
          <div className="flex items-center gap-3 mb-6">
            <p className="text-text-secondary text-sm">{movie.year} · {movie.director}</p>
          </div>
          {movie.rating && (
            <div className="mb-6">
              <RatingStars rating={movie.rating} />
            </div>
          )}

          {/* Cast */}
          {castList.length > 0 && (
            <div className="mb-8">
              <h3 className="text-text-muted text-xs uppercase tracking-wider mb-3 font-medium">Cast</h3>
              <div className="flex gap-2.5 overflow-x-auto scrollbar-hide pb-2">
                {castList.map((c) => (
                  <span key={c} className="shrink-0 px-4 py-2 rounded-full bg-bg-elevated text-text-secondary text-xs border border-border-subtle">
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* OTT */}
          {ottList.length > 0 && (
            <div className="mb-8">
              <h3 className="text-text-muted text-xs uppercase tracking-wider mb-3 font-medium">Available On</h3>
              <div className="flex gap-2.5 flex-wrap">
                {ottList.map((p) => (
                  <span key={p} className="px-4 py-2 rounded-full bg-accent-gold-muted text-accent-gold text-xs border border-accent-gold/30 font-medium">
                    {p}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Synopsis */}
          {movie.synopsis && (
            <div className="mb-8">
              <h3 className="text-text-muted text-xs uppercase tracking-wider mb-3 font-medium">Synopsis</h3>
              <p className="text-text-secondary text-sm leading-relaxed">{movie.synopsis}</p>
            </div>
          )}

          {/* Share */}
          <div className="flex gap-3">
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-5 py-3 rounded-xl border border-border-subtle text-text-secondary text-sm font-medium hover:border-border-accent transition-colors"
            >
              {copied ? <Check size={14} className="text-accent-emerald" /> : <Copy size={14} />}
              {copied ? 'Copied!' : 'Copy Link'}
            </button>
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(movie.title + ' - TamilCinemaHub')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-3 rounded-xl border border-border-subtle text-text-secondary text-sm font-medium hover:border-border-accent transition-colors"
            >
              <Share2 size={14} />
              Share
            </a>
          </div>
        </div>
      </div>

      {/* ═══ DESKTOP LAYOUT (≥ 768px) ═══ */}
      <div className="hidden lg:block min-h-screen pt-28 pb-20">
        <div className="max-w-6xl mx-auto px-8 lg:px-10">
          {/* Back */}
          <Link href="/movies" className="inline-flex items-center gap-2 text-text-secondary text-sm hover:text-accent-gold mb-10 transition-colors">
            <ArrowLeft size={16} /> Back to Movies
          </Link>

          <div className="grid grid-cols-[320px_1fr] gap-12">
            {/* Poster with ambient glow */}
            <div className="relative">
              {posterUrl && (
                <div className="absolute inset-0 -z-10 scale-110">
                  <Image src={posterUrl} alt="" fill className="object-cover blur-[60px] opacity-[0.15]" />
                </div>
              )}
              <div className="aspect-[2/3] rounded-2xl overflow-hidden border border-border-subtle relative shadow-2xl">
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
              <div className="flex items-center gap-2 mb-4">
                {genreList.map((g) => <GenreBadge key={g} genre={g} />)}
              </div>

              <h1 className="font-playfair text-4xl lg:text-5xl text-text-primary leading-tight mb-3">
                {movie.title}
              </h1>

              {movie.titleTanglish && (
                <p className="text-text-muted text-sm mb-5">{movie.titleTanglish}</p>
              )}

              <div className="flex items-center gap-4 mb-8">
                <span className="text-text-secondary text-sm font-medium">{movie.year}</span>
                <span className="text-text-muted">·</span>
                <span className="text-text-secondary text-sm font-medium">{movie.director}</span>
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
                <div className="mb-8">
                  <RatingStars rating={movie.rating} />
                </div>
              )}

              <CinematicDivider className="my-8" />

              {/* Cast */}
              {castList.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-text-muted text-xs uppercase tracking-wider mb-4 font-medium">Cast</h3>
                  <div className="flex gap-2.5 flex-wrap">
                    {castList.map((c) => (
                      <span key={c} className="px-4 py-2 rounded-full bg-bg-elevated text-text-secondary text-sm border border-border-subtle">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* OTT */}
              {ottList.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-text-muted text-xs uppercase tracking-wider mb-4 font-medium">Available On</h3>
                  <div className="flex gap-2.5 flex-wrap">
                    {ottList.map((p) => (
                      <span key={p} className="px-5 py-2.5 rounded-full bg-accent-gold-muted text-accent-gold text-sm border border-accent-gold/30 flex items-center gap-1.5 font-medium">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Synopsis */}
              {movie.synopsis && (
                <div className="mb-10">
                  <h3 className="text-text-muted text-xs uppercase tracking-wider mb-4 font-medium">Synopsis</h3>
                  <p className="text-text-secondary leading-relaxed max-w-[60ch]">{movie.synopsis}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl border border-border-subtle text-text-secondary text-sm font-medium hover:border-border-accent transition-colors"
                >
                  {copied ? <Check size={14} className="text-accent-emerald" /> : <Copy size={14} />}
                  {copied ? 'Copied!' : 'Copy Link'}
                </button>
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(movie.title + ' - TamilCinemaHub')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-6 py-3 rounded-xl border border-border-subtle text-text-secondary text-sm font-medium hover:border-border-accent transition-colors"
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
