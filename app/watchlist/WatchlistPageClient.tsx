'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Bookmark, Trash2, ArrowRight, Star, Film } from 'lucide-react'
import { useWatchlist } from '@/hooks/useWatchlist'
import PageHeader from '@/components/ui/PageHeader'
import type { WatchlistMovie } from '@/hooks/useWatchlist'
import RatingStars from '@/components/ui/RatingStars'
import AdSenseBanner from '@/components/ui/AdSenseBanner'

export default function WatchlistPageClient() {
  const { watchlist, mounted, removeFromWatchlist } = useWatchlist()

  if (!mounted) {
    return (
      <div className="min-h-screen pt-20 md:pt-24 pb-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <PageHeader label="My List" title="Watchlist" description="Movies you want to watch" />
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin w-6 h-6 border-2 border-accent-gold/30 border-t-accent-gold rounded-full" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-20 md:pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <PageHeader
          label="My List"
          title="Watchlist"
          description={
            watchlist.length > 0
              ? `${watchlist.length} movie${watchlist.length === 1 ? '' : 's'} saved`
              : 'Movies you want to watch'
          }
        />

        {/* AdSense */}
        <div className="mb-8">
          <AdSenseBanner slot="0" format="horizontal" minHeight={100} />
        </div>

        {watchlist.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-bg-card border border-border flex items-center justify-center mx-auto mb-4">
              <Bookmark size={28} className="text-text-muted" />
            </div>
            <h3 className="text-lg font-bold text-text-primary mb-2">Your watchlist is empty</h3>
            <p className="text-sm text-text-muted mb-6 max-w-sm mx-auto">
              Browse movies and tap the bookmark icon to save them here for later.
            </p>
            <Link
              href="/movies"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent-gold text-text-inverse text-sm font-semibold rounded-xl hover:bg-accent-gold-dim transition-colors"
            >
              Browse Movies <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {watchlist.map((movie: WatchlistMovie) => (
              <div
                key={movie.slug}
                className="flex items-center gap-4 p-3 sm:p-4 rounded-xl bg-bg-card border border-border hover:border-accent-gold/20 transition-all group"
              >
                {/* Poster thumbnail */}
                <Link href={`/movies/${movie.slug}`} className="shrink-0">
                  {movie.posterUrl ? (
                    <div className="w-14 h-20 sm:w-16 sm:h-24 rounded-lg overflow-hidden bg-bg-elevated">
                      <Image
                        src={movie.posterUrl}
                        alt={movie.title}
                        width={64}
                        height={96}
                        className="w-full h-full object-cover"
                        unoptimized
                      />
                    </div>
                  ) : (
                    <div className="w-14 h-20 sm:w-16 sm:h-24 rounded-lg bg-bg-elevated border border-border flex items-center justify-center">
                      <Film size={20} className="text-text-muted" />
                    </div>
                  )}
                </Link>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/movies/${movie.slug}`}
                    className="text-sm sm:text-base font-semibold text-text-primary hover:text-accent-gold transition-colors line-clamp-1"
                  >
                    {movie.title}
                  </Link>
                  <div className="flex items-center gap-2 mt-1">
                    {movie.year && (
                      <span className="text-xs text-text-muted">{movie.year}</span>
                    )}
                    {movie.rating != null && movie.rating > 0 && (
                      <div className="flex items-center gap-1">
                        <Star size={10} className="text-accent-gold fill-accent-gold" />
                        <span className="text-xs text-text-secondary">{movie.rating}</span>
                      </div>
                    )}
                  </div>
                  {movie.rating != null && movie.rating > 0 && (
                    <div className="mt-1">
                      <RatingStars rating={movie.rating} size={12} />
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href={`/movies/${movie.slug}`}
                    className="px-3 py-1.5 text-xs font-medium text-text-secondary bg-bg-elevated border border-border rounded-lg hover:text-accent-gold hover:border-accent-gold/30 transition-all"
                  >
                    View
                  </Link>
                  <button
                    onClick={() => removeFromWatchlist(movie.slug)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-text-muted hover:text-red-400 hover:bg-red-400/10 border border-transparent hover:border-red-400/20 transition-all"
                    aria-label="Remove from watchlist"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
