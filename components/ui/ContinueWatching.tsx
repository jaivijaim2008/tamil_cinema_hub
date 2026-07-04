'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Clock, X, Film } from 'lucide-react'
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed'

export default function ContinueWatching() {
  const { recent, mounted, clearRecent } = useRecentlyViewed()

  // Don't render until mounted (avoid hydration mismatch)
  if (!mounted || recent.length === 0) return null

  return (
    <section className="py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Clock size={18} className="text-accent-gold" />
            <h2 className="text-lg font-bold text-text-primary">Continue Watching</h2>
          </div>
          <button
            onClick={clearRecent}
            className="flex items-center gap-1.5 text-xs text-text-muted hover:text-accent-gold transition-colors font-medium"
          >
            <X size={12} />
            Clear
          </button>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4">
          {recent.map((movie) => (
            <Link
              key={movie.slug}
              href={`/movies/${movie.slug}`}
              className="group shrink-0 w-36 md:w-40"
            >
              <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-bg-card border border-border/30 mb-2">
                {movie.posterUrl ? (
                  <Image
                    src={movie.posterUrl}
                    alt={movie.title}
                    fill
                    sizes="160px"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-text-muted">
                    <Film size={24} />
                  </div>
                )}
                {/* Viewed indicator */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-[10px] font-medium text-white bg-accent-gold/80 px-2 py-0.5 rounded-full">
                    Viewed
                  </span>
                </div>
              </div>
              <h3 className="text-xs font-semibold text-text-primary group-hover:text-accent-gold transition-colors line-clamp-2 leading-tight">
                {movie.title}
              </h3>
              <div className="flex items-center gap-1.5 mt-1">
                {movie.year && (
                  <span className="text-[10px] text-text-muted">{movie.year}</span>
                )}
                {movie.rating != null && movie.rating > 0 && (
                  <span className="text-[10px] text-accent-gold font-medium">★ {movie.rating}</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
