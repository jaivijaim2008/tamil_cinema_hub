export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-bg-primary">
      {/* Pulsing logo */}
      <div className="animate-pulse mb-8">
        <svg width="40" height="40" viewBox="0 0 20 20" fill="none" className="text-accent-gold">
          <rect x="1" y="1" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.5" />
          <rect x="11" y="1" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.5" />
          <rect x="1" y="11" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.5" />
          <rect x="11" y="11" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </div>
      <p className="text-text-muted text-sm font-mono tracking-widest uppercase animate-pulse">
        Loading...
      </p>
    </div>
  )
}
