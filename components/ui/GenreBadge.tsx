const genreColors: Record<string, string> = {
  Action: 'bg-accent-red/20 text-red-400 border-red-500/30',
  Drama: 'bg-accent-gold-muted text-accent-gold border-border-accent',
  Romance: 'bg-pink-500/15 text-pink-400 border-pink-500/30',
  Comedy: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  Thriller: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
  Horror: 'bg-red-600/15 text-red-500 border-red-600/30',
  'Sci-Fi': 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  Fantasy: 'bg-violet-500/15 text-violet-400 border-violet-500/30',
  Crime: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  Mystery: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
  Family: 'bg-teal-500/15 text-teal-400 border-teal-500/30',
  Musical: 'bg-fuchsia-500/15 text-fuchsia-400 border-fuchsia-500/30',
  History: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  War: 'bg-stone-500/15 text-stone-400 border-stone-500/30',
  Adventure: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
}

export default function GenreBadge({ genre }: { genre: string }) {
  const colorClass = genreColors[genre] || 'bg-bg-elevated text-text-secondary border-border-subtle'
  return (
    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${colorClass}`}>
      {genre}
    </span>
  )
}
