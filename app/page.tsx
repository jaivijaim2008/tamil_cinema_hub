import Link from 'next/link'
import { client } from '../sanity/client'
import { latestMoviesQuery, latestBlogsQuery } from '../lib/queries'
import MovieCard, { Movie } from '../components/MovieCard'
import BlogCard, { Blog } from '../components/BlogCard'

export const revalidate = 60

async function getData() {
  try {
    const movies = await client.fetch<Movie[]>(latestMoviesQuery)
    const blogs = await client.fetch<Blog[]>(latestBlogsQuery)
    return { movies, blogs }
  } catch (error) {
    console.error('Error fetching homepage data:', error)
    return { movies: [], blogs: [] }
  }
}

export const metadata = {
  title: 'TamilCinemaHub — Tamil Movie Reviews, Database & Recommendations',
  description:
    'The ultimate Tamil cinema database. Discover 1600+ Tamil movies from 2000 to 2026, read reviews, and get AI-powered personalized recommendations.',
  openGraph: {
    title: 'TamilCinemaHub — Tamil Movie Reviews, Database & Recommendations',
    description:
      'The ultimate Tamil cinema database. Discover 1600+ Tamil movies from 2000 to 2026, read reviews, and get AI-powered personalized recommendations.',
    type: 'website',
    url: 'https://tamilcinemahub.xyz',
    images: [
      {
        url: 'https://tamilcinemahub.xyz/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'TamilCinemaHub — Tamil Movie Reviews, Database & Recommendations',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image' as const,
    title: 'TamilCinemaHub — Tamil Movie Reviews, Database & Recommendations',
    description:
      'The ultimate Tamil cinema database. Discover 1600+ Tamil movies from 2000 to 2026, read reviews, and get AI-powered personalized recommendations.',
    images: ['https://tamilcinemahub.xyz/opengraph-image'],
  },
  alternates: {
    canonical: 'https://tamilcinemahub.xyz',
  },
}

export default async function HomePage() {
  const { movies, blogs } = await getData()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'TamilCinemaHub',
    url: 'https://tamilcinemahub.xyz',
    description: 'Your complete guide to Tamil cinema. Explore 1600+ Tamil movies from 2000 to 2026.',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://tamilcinemahub.xyz/movies?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
    publisher: {
      '@type': 'Organization',
      name: 'TamilCinemaHub',
      url: 'https://tamilcinemahub.xyz',
    },
  }

  return (
    <div
      className="min-h-screen text-white"
      style={{ background: '#07070f' }}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* Layered background effects */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(109,40,217,0.55) 0%, transparent 70%), radial-gradient(ellipse 50% 40% at 80% 50%, rgba(234,88,12,0.12) 0%, transparent 60%)',
          }}
        />
        {/* Film grain texture overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            backgroundSize: '200px 200px',
          }}
        />

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-28 pb-24 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-violet-300 mb-8 backdrop-blur-sm">
            <span
              className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse"
            />
            1,600+ Tamil Movies · Updated 2026
          </div>

          {/* Main heading */}
          <h1
            className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight leading-none mb-6"
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
            <span className="block text-white">Tamil</span>
            <span
              className="block"
              style={{
                background: 'linear-gradient(135deg, #a78bfa 0%, #f97316 60%, #fbbf24 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Cinema Hub
            </span>
          </h1>

          <p className="mx-auto max-w-xl text-base sm:text-lg text-white/50 leading-relaxed mb-10">
            The ultimate database for Tamil movies. Browse reviews, discover hidden gems,
            and get recommendations powered by AI — all in one place.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/movies"
              className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full px-8 py-3.5 text-sm font-bold text-white transition-all active:scale-95"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #5b21b6)' }}
            >
              <span
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: 'linear-gradient(135deg, #6d28d9, #4c1d95)' }}
              />
              <svg className="relative w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
              </svg>
              <span className="relative">Browse Movies</span>
            </Link>
            <Link
              href="/blogs"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-8 py-3.5 text-sm font-bold text-white/80 backdrop-blur-sm hover:bg-white/10 hover:text-white transition-all active:scale-95"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Read Reviews
            </Link>
          </div>

          {/* Stats row */}
          <div className="mt-16 flex flex-wrap items-center justify-center gap-8 text-sm text-white/30">
            {[
              { label: 'Movies', value: '1,600+' },
              { label: 'Years Covered', value: '2000–2026' },
              { label: 'AI Chatbot', value: 'Live' },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col items-center gap-0.5">
                <span className="text-2xl font-black text-white/80">{stat.value}</span>
                <span className="uppercase tracking-widest text-xs">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom fade into page */}
        <div
          className="absolute bottom-0 left-0 right-0 h-32"
          style={{ background: 'linear-gradient(to bottom, transparent, #07070f)' }}
        />
      </section>

      {/* ── LATEST MOVIES ────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-12 pb-20">
        {/* Section header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-violet-400 mb-2">
              Recently Added
            </p>
            <h2
              className="text-2xl sm:text-3xl font-black text-white leading-tight"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              Latest Movies
            </h2>
          </div>
          <Link
            href="/movies"
            className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-white/40 hover:text-white transition-colors"
          >
            View all
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>

        {movies.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {movies.map((movie) => (
              <MovieCard key={movie._id} movie={movie} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon="🎬"
            message="No movies found. Import movies using the import script or add them in Sanity Studio."
            linkHref="/studio"
            linkLabel="Open Sanity Studio"
          />
        )}

        <div className="mt-8 sm:hidden text-center">
          <Link
            href="/movies"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-violet-400 hover:text-violet-300"
          >
            View all movies →
          </Link>
        </div>
      </section>

      {/* Divider */}
      <div
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
      >
        <div className="h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(139,92,246,0.3), transparent)' }} />
      </div>

      {/* ── LATEST BLOGS ─────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 pb-24">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-orange-400 mb-2">
              Latest Articles
            </p>
            <h2
              className="text-2xl sm:text-3xl font-black text-white leading-tight"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              Reviews &amp; Blogs
            </h2>
          </div>
          <Link
            href="/blogs"
            className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-white/40 hover:text-white transition-colors"
          >
            View all
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>

        {blogs.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogs.map((blog) => (
              <BlogCard key={blog._id} blog={blog} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon="✍️"
            message="No blog posts yet. Write Tamil movie reviews and articles in Sanity Studio."
            linkHref="/studio"
            linkLabel="Open Sanity Studio"
          />
        )}

        <div className="mt-8 sm:hidden text-center">
          <Link
            href="/blogs"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-orange-400 hover:text-orange-300"
          >
            View all blogs →
          </Link>
        </div>
      </section>

      {/* ── BOTTOM CTA BANNER ────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-24">
        <div
          className="relative overflow-hidden rounded-3xl px-8 py-14 text-center"
          style={{
            background: 'linear-gradient(135deg, rgba(109,40,217,0.25) 0%, rgba(91,33,182,0.15) 50%, rgba(234,88,12,0.1) 100%)',
            border: '1px solid rgba(139,92,246,0.2)',
          }}
        >
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
              backgroundSize: '150px 150px',
            }}
          />
          <div className="relative z-10">
            <p className="text-3xl mb-3">🎬</p>
            <h3
              className="text-2xl sm:text-3xl font-black text-white mb-3"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              Not sure what to watch?
            </h3>
            <p className="text-white/50 text-sm mb-8 max-w-md mx-auto">
              Ask our AI chatbot for personalised Tamil movie recommendations based on your mood, genre, or favourite actor.
            </p>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('open-chatbot'))}
              className="inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-sm font-bold text-white transition-all active:scale-95 hover:shadow-[0_8px_40px_rgba(109,40,217,0.5)]"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #f97316)' }}
              aria-label="Open chatbot"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              Chat with AI
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

/* ── Helper: empty state ─────────────────────────────────────────────── */
function EmptyState({
  icon,
  message,
  linkHref,
  linkLabel,
}: {
  icon: string
  message: string
  linkHref: string
  linkLabel: string
}) {
  return (
    <div
      className="rounded-2xl py-16 px-8 text-center"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
    >
      <p className="text-4xl mb-4">{icon}</p>
      <p className="text-white/40 text-sm max-w-sm mx-auto mb-6">{message}</p>
      <Link
        href={linkHref}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-violet-400 hover:text-violet-300 transition-colors"
      >
        {linkLabel} →
      </Link>
    </div>
  )
}