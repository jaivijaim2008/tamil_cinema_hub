'use client'

import Link from 'next/link'
import Image from 'next/image'
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

const GRADIENT_CLASSES = ['mp-thriller', 'mp-drama', 'mp-romance', 'mp-fantasy', 'mp-comedy', 'mp-horror']
const GLOW_COLORS = ['crimson', 'electric', 'rose', 'violet', 'gold', 'slate']

export default function MovieCard({ movie, index = 0 }: MovieCardProps) {
  const imageUrl = movie.poster
    ? urlFor(movie.poster).width(400).height(600).quality(90).fit('max').url()
    : movie.posterUrl || null

  const gradientClass = GRADIENT_CLASSES[index % GRADIENT_CLASSES.length]
  const glowColor = GLOW_COLORS[index % GLOW_COLORS.length]
  const initial = movie.title.charAt(0).toUpperCase()

  return (
    <TiltCard className="movie-card-dark" data-glow={glowColor} maxTilt={8} perspective={800} scale={1.02}>
      <Link href={`/movies/${movie.slug}`} style={{ display: 'block', height: '100%' }}>
        {imageUrl ? (
          <div className="movie-card-image-dark">
            <Image src={imageUrl} alt={movie.title} fill sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw" style={{ objectFit: 'cover' }} />
            {movie.genre?.[0] && <span className="genre-badge-dark">{movie.genre[0]}</span>}
            {movie.ottPlatform && <span className="ott-badge-dark">{movie.ottPlatform}</span>}
            <div className="poster-gradient-overlay-dark" />
          </div>
        ) : (
          <div className={`movie-poster-dark ${gradientClass}`}>
            <span className="initial">{initial}</span>
            <div className="perfs"><span /><span /><span /><span /><span /><span /></div>
            {movie.genre?.[0] && <span className="genre-badge-dark">{movie.genre[0]}</span>}
            {movie.ottPlatform && <span className="ott-badge-dark">{movie.ottPlatform}</span>}
            <div className="poster-gradient-overlay-dark" />
          </div>
        )}
        <div className="movie-card-body-dark">
          {movie.director && <p className="movie-director-dark">🎬 {movie.director}</p>}
          <h3 className="movie-title-dark">{movie.title}</h3>
          <div className="movie-meta-dark">
            <span className="movie-year-dark">{movie.year}</span>
            <span className="movie-rating-dark">★ {movie.rating.toFixed(1)}</span>
          </div>
        </div>
      </Link>
    </TiltCard>
  )
}
