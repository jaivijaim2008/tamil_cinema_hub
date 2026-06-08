'use client'

import Link from 'next/link'
import { urlFor } from '../sanity/lib/image'
import TiltCard from './TiltCard'

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

  return (
    <TiltCard className="movie-card" maxTilt={8} perspective={800} scale={1.02}>
      <Link href={`/movies/${movie.slug}`} className="block h-full">
        <div className="movie-card-image">
          {imageUrl ? (
            <img src={imageUrl} alt={movie.title} loading="lazy" />
          ) : (
            <div style={{ display: 'flex', height: '100%', width: '100%', alignItems: 'center', justifyContent: 'center', padding: 16, textAlign: 'center' }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5">
                <rect x="2" y="7" width="20" height="15" rx="2" />
                <path d="M2 11h20M2 7l4-4M8 7l4-4M14 7l4-4" />
              </svg>
              <span style={{ display: 'block', marginTop: 8, fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#888' }}>
                {movie.genre?.[0] || 'Tamil Movie'}
              </span>
              <span style={{ display: 'block', marginTop: 8, fontSize: 14, fontWeight: 700, color: '#111', lineHeight: 1.3 }}>
                {movie.title}
              </span>
            </div>
          )}
          {movie.genre?.[0] && <span className="genre-badge">{movie.genre[0]}</span>}
          {movie.ottPlatform && <span className="ott-badge">{movie.ottPlatform}</span>}
        </div>
        <div className="movie-card-body">
          {movie.director && <p className="movie-director">🎬 {movie.director}</p>}
          <h3 className="movie-title">{movie.title}</h3>
          <div className="movie-meta">
            <span className="movie-year">{movie.year}</span>
            <span className="movie-rating">{movie.rating.toFixed(1)}</span>
          </div>
        </div>
      </Link>
    </TiltCard>
  )
}
