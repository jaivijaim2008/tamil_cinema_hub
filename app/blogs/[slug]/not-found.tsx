// app/blogs/[slug]/not-found.tsx — Blog not found
import Link from 'next/link'

export default function BlogNotFound() {
  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-4 text-center"
      style={{ background: '#07070f', fontFamily: "'Outfit', sans-serif" }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 55% 35% at 50% 40%, rgba(168,85,247,0.1) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 max-w-md">
        <div
          className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl"
          style={{ background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.25)' }}
        >
          <svg className="h-8 w-8" style={{ color: '#c084fc' }} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-white mb-3">Article Not Found</h1>
        <p className="text-white/45 text-base leading-relaxed mb-8">
          This article doesn't exist or may have been removed from the archive.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/blogs"
            className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-bold text-white transition-opacity hover:opacity-85"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #ea580c)' }}
          >
            Browse All Articles
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-bold transition-colors"
            style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            Go Home
          </Link>
        </div>
      </div>
    </main>
  )
}