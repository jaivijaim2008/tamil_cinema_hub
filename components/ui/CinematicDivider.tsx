export default function CinematicDivider({ className = '' }: { className?: string }) {
  return (
    <div className={`relative flex items-center gap-4 py-2 overflow-hidden ${className}`}>
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border-accent to-transparent" />
      <div className="flex gap-2 items-center">
        {[0, 1, 2].map((i) => (
          <div key={i} className="w-3 h-5 rounded-sm border border-border-accent bg-transparent" />
        ))}
      </div>
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border-accent to-transparent" />
    </div>
  )
}
