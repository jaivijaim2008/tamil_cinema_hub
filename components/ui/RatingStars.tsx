import { Star } from 'lucide-react'

interface Props {
  rating: number
  maxStars?: number
  size?: number
  showValue?: boolean
}

export default function RatingStars({ rating, maxStars = 5, size = 14, showValue = true }: Props) {
  const stars = []
  for (let i = 1; i <= maxStars; i++) {
    const fill = Math.min(1, Math.max(0, rating - (i - 1)))
    stars.push(
      <span key={i} className="relative inline-block" style={{ width: size, height: size }}>
        <Star size={size} className="text-text-muted/30 absolute inset-0" />
        {fill > 0 && (
          <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
            <Star size={size} className="text-accent-gold fill-accent-gold" />
          </span>
        )}
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1">
      <span className="inline-flex gap-0.5">{stars}</span>
      {showValue && (
        <span className="text-sm font-bold text-text-primary ml-1">{rating.toFixed(1)}</span>
      )}
    </span>
  )
}
