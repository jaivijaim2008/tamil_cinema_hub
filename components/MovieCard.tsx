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
}

const CATEGORY_COLORS: Record<string, string> = {
  action:   '#ef4444',
  thriller: '#f97316',
  drama:    '#a78bfa',
  comedy:   '#facc15',
  horror:   '#6366f1',
  romance:  '#ec4899',
  history:  '#d97706',
  default:  '#7c3aed',
}

export default function MovieCard({ movie }: MovieCardProps) {
  const imageUrl = movie.poster
    ? urlFor(movie.poster).width(400).height(600).quality(90).fit('max').url()
    : movie.posterUrl || null

  const primaryGenre = movie.genre?.[0]?.toLowerCase() || 'default'
  const accentColor = CATEGORY_COLORS[primaryGenre] ?? CATEGORY_COLORS.default

  const ratingOutOf5 = movie.rating / 2
  const fullStars  = Math.floor(ratingOutOf5)
  const hasHalf    = ratingOutOf5 - fullStars >= 0.25

  return (
    <Link href={`/movies/${movie.slug}`} className="group block h-full">
      <div
        className="relative flex h-full flex-col overflow-hidden rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02]"
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.07)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
        }}
      >
        {/* Poster */}
        <div className="relative aspect-[2/3] w-full overflow-hidden" style={{ background: '#111122' }}>
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={movie.title}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div
              className="flex h-full w-full flex-col items-center justify-center p-4 text-center text-white"
              style={{ background: `linear-gradient(135deg, #1a0a2e, ${accentColor}55)` }}
            >
              <svg className="mb-2 h-10 w-10 opacity-40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="2" y="7" width="20" height="15" rx="2" />
                <path d="M2 11h20M2 7l4-4M8 7l4-4M14 7l4-4" />
              </svg>
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-50">
                {movie.genre?.[0] || 'Tamil Movie'}
              </span>
              <span className="mt-2 text-sm font-black line-clamp-2 leading-snug">{movie.title}</span>
            </div>
          )}

          {/* Gradient overlay at bottom */}
          <div
            className="absolute inset-x-0 bottom-0 h-24 pointer-events-none"
            style={{ background: 'linear-gradient(to top, rgba(7,7,15,0.95), transparent)' }}
          />

          {/* OTT badge */}
          {movie.ottPlatform && (
            <div
              className="absolute right-2 top-2 rounded-md px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-white"
              style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.12)' }}
            >
              {movie.ottPlatform}
            </div>
          )}

          {/* Year badge */}
          <div
            className="absolute left-2 top-2 rounded-md px-2 py-0.5 text-[9px] font-bold text-white/70"
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
          >
            {movie.year}
          </div>

          {/* Genre pill at bottom */}
          {movie.genre?.[0] && (
            <div
              className="absolute bottom-2 left-2 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white"
              style={{ background: `${accentColor}cc` }}
            >
              {movie.genre[0]}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col gap-1 p-3">
          <h3 className="text-sm font-black text-white line-clamp-1 leading-snug group-hover:text-violet-300 transition-colors">
            {movie.title}
          </h3>

          {movie.director && (
            <p className="text-[10px] text-white/35 truncate">
              {movie.director}
            </p>
          )}

          {/* Star rating */}
          <div className="flex items-center gap-1 pt-0.5">
            <div className="flex">
              {Array.from({ length: 5 }, (_, i) => {
                const filled = i < fullStars
                const half   = !filled && i === fullStars && hasHalf
                return (
                  <svg
                    key={i}
                    className="h-3 w-3"
                    viewBox="0 0 20 20"
                    fill={filled ? '#fbbf24' : 'none'}
                    stroke={filled || half ? '#fbbf24' : 'rgba(255,255,255,0.15)'}
                    strokeWidth="1.5"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                )
              })}
            </div>
            <span className="text-[10px] font-semibold text-white/40">{movie.rating.toFixed(1)}</span>
          </div>
        </div>

        {/* Hover glow border */}
        <div
          className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{ boxShadow: `inset 0 0 0 1px ${accentColor}55` }}
        />
      </div>
    </Link>
  )
}