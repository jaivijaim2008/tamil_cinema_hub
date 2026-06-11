export default function FilmStripDecoration({ className = '' }: { className?: string }) {
  return (
    <div className={`relative w-full h-16 overflow-hidden ${className}`}>
      {/* Main strip body */}
      <div className="absolute inset-y-2 left-0 right-0 bg-bg-secondary border-y border-border-subtle" />
      {/* Sprocket holes — top row */}
      <div className="absolute top-0 left-0 right-0 flex justify-around px-4">
        {Array.from({ length: 14 }).map((_, i) => (
          <div
            key={i}
            className="w-4 h-3 rounded-sm border border-border-mid bg-bg-primary mt-0.5"
          />
        ))}
      </div>
      {/* Sprocket holes — bottom row */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-around px-4">
        {Array.from({ length: 14 }).map((_, i) => (
          <div
            key={i}
            className="w-4 h-3 rounded-sm border border-border-mid bg-bg-primary mb-0.5"
          />
        ))}
      </div>
      {/* Film frame slots (middle area) */}
      <div className="absolute inset-y-3 left-0 right-0 flex gap-1 px-8 overflow-hidden opacity-20">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="shrink-0 w-20 h-10 border border-border-mid rounded-sm bg-bg-elevated"
          />
        ))}
      </div>
    </div>
  )
}
