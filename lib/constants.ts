export const BLOG_CATEGORIES = [
  'All',
  'Review',
  'Top List',
  'News',
  'Actor',
  'Director',
  'Feature',
] as const

export const GENRE_COLORS: Record<string, string> = {
  Action: '#ef4444',
  Drama: '#3b82f6',
  Comedy: '#eab308',
  Romance: '#ec4899',
  Thriller: '#8b5cf6',
  Horror: '#dc2626',
  SciFi: '#06b6d4',
  'Sci-Fi': '#06b6d4',
  Fantasy: '#a855f7',
  Animation: '#22c55e',
  Musical: '#f97316',
  Family: '#14b8a6',
  Crime: '#6b7280',
  Mystery: '#6366f1',
  Adventure: '#10b981',
  History: '#b45309',
  War: '#78716c',
  Documentary: '#0ea5e9',
  Sport: '#059669',
  'Period Drama': '#92400e',
}

export const RATING_CONFIG = {
  colors: [
    { min: 0, max: 2, color: '#ef4444', label: 'Poor' },
    { min: 2, max: 3, color: '#f97316', label: 'Fair' },
    { min: 3, max: 4, color: '#eab308', label: 'Good' },
    { min: 4, max: 4.5, color: '#22c55e', label: 'Great' },
    { min: 4.5, max: 5, color: '#E8B84B', label: 'Excellent' },
  ] as const,
}

export function getRatingColor(rating: number): string {
  for (const r of RATING_CONFIG.colors) {
    if (rating >= r.min && rating < r.max) return r.color
  }
  return '#E8B84B'
}

export function getRatingLabel(rating: number): string {
  for (const r of RATING_CONFIG.colors) {
    if (rating >= r.min && rating < r.max) return r.label
  }
  return 'Excellent'
}

export const PLACEHOLDER_POSTER = '/placeholder-poster.svg'
