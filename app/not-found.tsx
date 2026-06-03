// app/not-found.tsx — Global 404 page
import Link from 'next/link'

export default function NotFound() {
  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-4 text-center"
      style={{ background: '#07070f', fontFamily: "'Outfit', sans-serif" }}
    >
      {/* background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 60% 40% at 50% 40%, rgba(168,85,247,0.12) 0%, transparent 70%)',
        }}
      />
      {/* film grain */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")',
          backgroundSize: '180px',
        }}
      />

      <div className="relative z-10 max-w-md">
        {/* 404 number */}
        <p
          className="text-[120px] sm:text-[160px] font-black leading-none select-none"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.04em',
          }}
        >
          404
        </p>

        {/* film reel icon */}
        <div
          className="mx-auto -mt-6 mb-6 flex h-16 w-16 items-center justify-center rounded-2xl"
          style={{
            background: 'rgba(168,85,247,0.12)',
            border: '1px solid rgba(168,85,247,0.25)',
          }}
        >
          <svg
            className="h-8 w-8"
            style={{ color: '#c084fc' }}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h1.5C5.496 19.5 6 18.996 6 18.375m-3.75.125c0-.621.504-1.125 1.125-1.125H6m0 0v-2.25m0 2.25h1.5m0 0c.621 0 1.125-.504 1.125-1.125V6.375m0 11.25h4.5m-4.5 0V6.375m4.5 11.25c0 .621.504 1.125 1.125 1.125H18m-4.5-1.125V6.375m0 11.25H18m0 0v-2.25m0 2.25h1.5m0 0c.621 0 1.125-.504 1.125-1.125V6.375m0 0H18m0 0H6M6 6.375C6 5.754 5.496 5.25 4.875 5.25H3.375m0 1.125c0-.621.504-1.125 1.125-1.125H6m12 0c.621 0 1.125.504 1.125 1.125v12m0-12h1.5c.621 0 1.125.504 1.125 1.125v10.875c0 .621-.504 1.125-1.125 1.125H18" />
          </svg>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-white mb-3">
          Scene Not Found
        </h1>
        <p className="text-white/45 text-base leading-relaxed mb-8">
          Looks like this page got cut from the final edit. The reel you're looking for doesn't exist or has been moved.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-bold text-white transition-opacity hover:opacity-85"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #ea580c)' }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Back to Home
          </Link>
          <Link
            href="/movies"
            className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-bold transition-colors"
            style={{
              background: 'rgba(255,255,255,0.05)',
              color: 'rgba(255,255,255,0.7)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            Browse Movies
          </Link>
        </div>
      </div>
    </main>
  )
}