'use client'

import Link from 'next/link'

interface Props {
  genre: string
  count?: number
  active?: boolean
  href?: string
  onClick?: () => void
}

const GENRE_ACCENTS: Record<string, string> = {
  Action: '#ef4444',
  Drama: '#3b82f6',
  Comedy: '#eab308',
  Romance: '#ec4899',
  Thriller: '#8b5cf6',
  Horror: '#dc2626',
  'Sci-Fi': '#06b6d4',
  Fantasy: '#a855f7',
  Animation: '#22c55e',
  Musical: '#f97316',
  Family: '#14b8a6',
  Crime: '#6b7280',
  Mystery: '#6366f1',
  Adventure: '#10b981',
  Documentary: '#0ea5e9',
  Sport: '#059669',
}

export default function GenreChip({ genre, count, active, href, onClick }: Props) {
  const color = GENRE_ACCENTS[genre] || '#E8B84B'

  const classes = `inline-flex items-center gap-1.5 text-xs font-medium rounded-full px-3 py-1.5 transition-all duration-200 shrink-0 ${
    active
      ? 'text-white border'
      : 'bg-bg-card border border-border text-text-secondary hover:text-text-primary hover:border-border-light'
  }`

  const style = active ? { backgroundColor: `${color}20`, borderColor: `${color}60`, color } : undefined

  if (href) {
    return (
      <Link href={href} className={classes} style={style}>
        {genre}
        {count != null && (
          <span className="text-[10px] opacity-60">{count}</span>
        )}
      </Link>
    )
  }

  return (
    <button onClick={onClick} className={classes} style={style}>
      {genre}
      {count != null && (
        <span className="text-[10px] opacity-60">{count}</span>
      )}
    </button>
  )
}
