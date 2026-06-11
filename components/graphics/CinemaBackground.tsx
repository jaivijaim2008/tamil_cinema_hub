'use client'

export default function CinemaBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {/* Deep radial glow — gold top-right */}
      <div
        className="absolute -top-40 -right-40 w-[700px] h-[700px] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(232,184,75,0.07) 0%, transparent 70%)' }}
      />
      {/* Deep radial glow — red bottom-left */}
      <div
        className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(192,57,43,0.05) 0%, transparent 70%)' }}
      />
      {/* Floating bokeh particles */}
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full animate-floatUp"
          style={{
            width: `${4 + (i % 3) * 4}px`,
            height: `${4 + (i % 3) * 4}px`,
            left: `${(i * 8.3) % 100}%`,
            top: `${20 + ((i * 7) % 60)}%`,
            background:
              i % 3 === 0
                ? 'rgba(232,184,75,0.25)'
                : i % 3 === 1
                  ? 'rgba(192,57,43,0.15)'
                  : 'rgba(255,255,255,0.06)',
            animationDelay: `${i * 0.4}s`,
            animationDuration: `${4 + (i % 3) * 2}s`,
          }}
        />
      ))}
      {/* Diagonal grid lines — very subtle */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.025]" aria-hidden>
        <defs>
          <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path
              d="M 60 0 L 0 0 0 60"
              fill="none"
              stroke="rgba(232,184,75,1)"
              strokeWidth="0.5"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
    </div>
  )
}
