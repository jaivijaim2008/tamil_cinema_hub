'use client'

import { useRef, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Film, ExternalLink } from 'lucide-react'
import { urlFor } from '../../sanity/lib/image'
import { toArray } from '../../lib/utils'
import GenreBadge from './GenreBadge'
import RatingBadge from './RatingBadge'

export interface Movie {
  _id: string
  title: string
  slug: string
  year: number
  director: string
  cast?: string[] | string
  genre?: string[] | string
  rating?: number
  poster?: any
  posterUrl?: string
  backdropUrl?: string
  synopsis?: string
  ottPlatform?: string[] | string
}

interface Props {
  movie: Movie
  variant?: 'compact' | 'featured'
}

export default function MovieCard({ movie, variant = 'compact' }: Props) {
  const cardRef = useRef<HTMLAnchorElement>(null)

  const imageUrl = movie.poster
    ? urlFor(movie.poster).width(500).height(750).url()
    : movie.posterUrl

  const ottList = toArray(movie.ottPlatform)
  const genreList = toArray(movie.genre)

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!cardRef.current || window.innerWidth < 1024) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    cardRef.current.style.transform = `perspective(600px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) scale(1.02)`
  }, [])

  const handleMouseLeave = useCallback(() => {
    if (!cardRef.current) return
    cardRef.current.style.transform = 'perspective(600px) rotateY(0deg) rotateX(0deg) scale(1)'
  }, [])

  if (variant === 'featured') {
    return (
      <Link
        href={`/movies/${movie.slug}`}
        className="glass rounded-2xl p-4 border-gradient-animate grid grid-cols-[120px_1fr] sm:grid-cols-[160px_1fr] gap-4 hover:bg-bg-elevated/50 transition-colors"
      >
        <div className="aspect-[2/3] rounded-xl overflow-hidden relative">
          {imageUrl ? (
            <Image src={imageUrl} alt={movie.title} fill className="object-cover" sizes="160px" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#2A1F08] via-bg-elevated to-bg-card flex items-center justify-center">
              <span className="font-playfair text-3xl text-text-muted">{movie.title[0]}</span>
            </div>
          )}
        </div>
        <div className="flex flex-col justify-center min-w-0">
          <div className="flex items-center gap-2 mb-2">
            {genreList[0] && <GenreBadge genre={genreList[0]} />}
            {movie.rating && <RatingBadge rating={movie.rating} />}
          </div>
          <h3 className="font-playfair text-xl sm:text-2xl text-text-primary line-clamp-2 mb-1">{movie.title}</h3>
          <p className="text-text-muted text-sm mb-2">{movie.year} · {movie.director}</p>
          {movie.synopsis && (
            <p className="text-text-secondary text-sm line-clamp-3 mb-3">{movie.synopsis}</p>
          )}
          <span className="text-accent-gold text-sm font-medium flex items-center gap-1">
            View <ExternalLink size={12} />
          </span>
        </div>
      </Link>
    )
  }

  return (
    <Link
      ref={cardRef}
      href={`/movies/${movie.slug}`}
      className="rounded-xl overflow-hidden bg-bg-card block"
      style={{ transition: 'transform 0.15s ease' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Poster */}
      <div className="aspect-[2/3] relative overflow-hidden rounded-t-xl bg-gradient-to-br from-[#2A1F08] via-bg-elevated to-bg-card">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={movie.title}
            fill
            className="object-cover"
            sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 20vw"
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-playfair text-3xl text-text-muted">{movie.title[0]}</span>
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <span className="text-white text-sm font-semibold">View Details →</span>
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <div className="flex items-center justify-between mb-1.5">
          {genreList[0] && <GenreBadge genre={genreList[0]} />}
          {movie.rating && <RatingBadge rating={movie.rating} />}
        </div>
        <h3 className="font-playfair text-sm text-text-primary line-clamp-1 mb-0.5">{movie.title}</h3>
        <p className="text-text-muted text-xs">{movie.year} · {movie.director}</p>
        {ottList.length > 0 && (
          <div className="flex gap-1.5 mt-2">
            {ottList.slice(0, 3).map((p) => (
              <span key={p} className="text-[9px] px-1.5 py-0.5 rounded bg-bg-elevated text-text-secondary border border-border-subtle">
                {p}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  )
}
