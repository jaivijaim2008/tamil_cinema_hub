export default function RatingBadge({ rating }: { rating: number }) {
  let colorClass = 'text-text-muted'
  let glowClass = ''

  if (rating >= 8) {
    colorClass = 'text-accent-gold'
    glowClass = 'shadow-[0_0_12px_rgba(232,184,75,0.4)]'
  } else if (rating >= 6) {
    colorClass = 'text-green-400'
    glowClass = 'shadow-[0_0_12px_rgba(34,197,94,0.3)]'
  } else if (rating >= 4) {
    colorClass = 'text-amber-400'
  } else {
    colorClass = 'text-red-400'
  }

  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-mono font-bold ${colorClass} ${glowClass} bg-bg-elevated/80 px-1.5 py-0.5 rounded`}>
      ★ {rating.toFixed(1)}
    </span>
  )
}
