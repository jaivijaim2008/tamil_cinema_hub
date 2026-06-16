'use client'

import { Bookmark, BookmarkCheck } from 'lucide-react'
import { useWatchlist } from '@/hooks/useWatchlist'
import type { Movie } from '@/lib/types'

interface Props {
  movie: Movie
  size?: 'sm' | 'md'
  className?: string
}

export default function WatchlistButton({ movie, size = 'sm', className = '' }: Props) {
  const { isInWatchlist, toggleWatchlist } = useWatchlist()
  const inList = isInWatchlist(movie.slug)

  function handleClick(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    toggleWatchlist({
      slug: movie.slug,
      title: movie.title,
      year: movie.year,
      rating: movie.rating,
      posterUrl: movie.posterUrl || null,
    })
  }

  const iconSize = size === 'sm' ? 14 : 18

  return (
    <button
      onClick={handleClick}
      className={`flex items-center justify-center rounded-lg transition-all duration-200 ${
        inList
          ? 'text-accent-gold bg-accent-gold/10 border border-accent-gold/20'
          : 'text-text-muted bg-bg-elevated/80 border border-border hover:text-accent-gold hover:border-accent-gold/30'
      } ${size === 'sm' ? 'w-8 h-8' : 'w-10 h-10'} ${className}`}
      aria-label={inList ? 'Remove from watchlist' : 'Add to watchlist'}
    >
      {inList ? <BookmarkCheck size={iconSize} className="fill-accent-gold" /> : <Bookmark size={iconSize} />}
    </button>
  )
}
