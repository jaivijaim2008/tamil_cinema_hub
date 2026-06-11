import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
      {/* Animated film reel */}
      <svg viewBox="0 0 120 120" className="w-24 h-24 text-text-muted mb-8 animate-rotateReel">
        <circle cx="60" cy="60" r="50" fill="none" stroke="currentColor" strokeWidth="2" />
        <circle cx="60" cy="60" r="20" fill="none" stroke="currentColor" strokeWidth="2" />
        {[0, 60, 120, 180, 240, 300].map((angle) => (
          <line
            key={angle}
            x1="60"
            y1="60"
            x2={60 + 35 * Math.cos((angle * Math.PI) / 180)}
            y2={60 + 35 * Math.sin((angle * Math.PI) / 180)}
            stroke="currentColor"
            strokeWidth="2"
          />
        ))}
        {[0, 60, 120, 180, 240, 300].map((angle) => (
          <circle
            key={angle}
            cx={60 + 40 * Math.cos((angle * Math.PI) / 180)}
            cy={60 + 40 * Math.sin((angle * Math.PI) / 180)}
            r="5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        ))}
      </svg>

      <h1 className="font-playfair text-6xl lg:text-8xl text-gradient-gold mb-4">404</h1>
      <h2 className="font-playfair text-xl text-text-primary mb-4">Reel Not Found</h2>
      <p className="text-text-secondary text-sm max-w-md mb-8">
        The page you&apos;re looking for doesn&apos;t exist or has been moved. Let&apos;s get you back to the archive.
      </p>
      <Link
        href="/"
        className="bg-accent-gold text-text-inverse font-semibold px-8 py-3 rounded-xl hover:bg-accent-gold-dim transition-colors"
      >
        Return Home
      </Link>
    </div>
  )
}
