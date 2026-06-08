'use client'

import Link from 'next/link'
import { urlFor } from '../sanity/lib/image'

export interface Movie {
  _id: string
  title: string
  titleTanglish?: string
  slug: string
  year: number
  director?: string
  cast?: string[]
  genre?: string[]
  rating: number
  poster?: any
  posterUrl?: string
  backdropUrl?: string
  synopsis?: string
  ottPlatform?: string
  tmdbId?: number
}

interface MovieCardProps {
  movie: Movie
  index?: number
}

export default function MovieCard({ movie, index = 0 }: MovieCardProps) {
  const imageUrl = movie.poster
    ? urlFor(movie.poster).width(400).height(600).quality(90).fit('max').url()
    : movie.posterUrl || null

  const fullStars = Math.floor(movie.rating)
  const hasHalf = movie.rating - fullStars >= 0.25

  return (
    <div
      className="group block h-full"
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      <Link href={`/movies/${movie.slug}`} className="block h-full">
        <div
          className="relative flex h-full flex-col overflow-hidden rounded-[10px] transition-all duration-[280ms]"
          style={{
            background: '#FFFFFF',
            border: '1px solid #E8E7E3',
            boxShadow: 'var(--shadow-sm)',
            transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-5px)'
            e.currentTarget.style.boxShadow = 'var(--shadow-hover)'
            e.currentTarget.style.borderColor = '#D4291A33'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = 'var(--shadow-sm)'
            e.currentTarget.style.borderColor = '#E8E7E3'
          }}
        >
          {/* Poster Image */}
          <div
            className="relative w-full overflow-hidden"
            style={{ aspectRatio: '2/3', background: 'linear-gradient(135deg, #F2F1EE 0%, #E8E7E3 100%)' }}
          >
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={movie.title}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-[400ms] ease-out group-hover:scale-[1.04]"
              />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center p-4 text-center">
                <svg className="mb-2 h-10 w-10 text-[#ccc]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="2" y="7" width="20" height="15" rx="2" />
                  <path d="M2 11h20M2 7l4-4M8 7l4-4M14 7l4-4" />
                </svg>
                <span className="text-[10px] font-semibold uppercase tracking-widest text-[#888]">
                  {movie.genre?.[0] || 'Tamil Movie'}
                </span>
                <span className="mt-2 text-sm font-bold text-[#111] line-clamp-2 leading-snug">{movie.title}</span>
              </div>
            )}

            {/* Genre badge - top left */}
            {movie.genre?.[0] && (
              <span
                className="absolute left-2.5 top-2.5 rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#444]"
                style={{ background: 'rgba(255,255,255,0.92)' }}
              >
                {movie.genre[0]}
              </span>
            )}

            {/* OTT badge - top right */}
            {movie.ottPlatform && (
              <span
                className="absolute right-2.5 top-2.5 rounded px-2 py-0.5 text-[10px] font-bold text-white"
                style={{ background: '#D4291A' }}
              >
                {movie.ottPlatform}
              </span>
            )}
          </div>

          {/* Card Body */}
          <div className="flex flex-col gap-1 p-3.5" style={{ padding: '14px 16px 16px' }}>
            {/* Director */}
            {movie.director && (
              <p className="text-[11px] text-[#888]" style={{ marginBottom: '4px' }}>
                🎬 {movie.director}
              </p>
            )}

            {/* Title */}
            <h3
              className="text-[16px] font-semibold text-[#111] line-clamp-2 leading-[1.3]"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              {movie.title}
            </h3>

            {/* Bottom row */}
            <div className="flex items-center justify-between mt-1">
              {/* Year chip */}
              <span
                className="text-[12px] text-[#666] rounded"
                style={{ background: '#F2F1EE', padding: '2px 8px', borderRadius: '4px' }}
              >
                {movie.year}
              </span>

              {/* Rating */}
              <div className="flex items-center gap-1">
                <div className="flex">
                  {Array.from({ length: 5 }, (_, i) => {
                    const filled = i < fullStars
                    const half = !filled && i === fullStars && hasHalf
                    return (
                      <svg key={i} className="h-3 w-3" viewBox="0 0 20 20">
                        <path
                          d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                          fill={filled ? '#C8973A' : 'none'}
                          stroke={filled || half ? '#C8973A' : '#E8E7E3'}
                          strokeWidth="1.5"
                        />
                      </svg>
                    )
                  })}
                </div>
                <span className="text-[12px] font-semibold" style={{ color: '#C8973A' }}>
                  {movie.rating.toFixed(1)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  )
}
