import Link from 'next/link'
import { client } from '../sanity/client'
import { latestMoviesQuery, latestBlogsQuery } from '../lib/queries'
import MovieCard, { Movie } from '../components/MovieCard'
import BlogCard, { Blog } from '../components/BlogCard'
import ChatWithAIButton from '../components/ChatWithAIButton'
import StatCounter from '../components/StatCounter'

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
  description: 'The ultimate Tamil cinema database. Discover 1600+ Tamil movies from 2000 to 2026, read reviews, and get AI-powered personalized recommendations.',
  openGraph: {
    title: 'TamilCinemaHub — Tamil Movie Reviews, Database & Recommendations',
    description: 'The ultimate Tamil cinema database. Discover 1600+ Tamil movies from 2000 to 2026.',
    type: 'website' as const,
    url: 'https://tamilcinemahub.xyz',
    images: [{ url: 'https://tamilcinemahub.xyz/opengraph-image', width: 1200, height: 630, alt: 'TamilCinemaHub' }],
  },
  twitter: {
    card: 'summary_large_image' as const,
    title: 'TamilCinemaHub — Tamil Movie Reviews, Database & Recommendations',
    description: 'The ultimate Tamil cinema database. 1600+ movies, reviews, AI recommendations.',
    images: ['https://tamilcinemahub.xyz/opengraph-image'],
  },
  alternates: { canonical: 'https://tamilcinemahub.xyz' },
}

export default async function HomePage() {
  const { movies, blogs } = await getData()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'TamilCinemaHub',
    url: 'https://tamilcinemahub.xyz',
    description: 'Your complete guide to Tamil cinema. 1600+ movies from 2000 to 2026.',
    potentialAction: { '@type': 'SearchAction', target: 'https://tamilcinemahub.xyz/movies?q={search_term_string}', 'query-input': 'required name=search_term_string' },
    publisher: { '@type': 'Organization', name: 'TamilCinemaHub', url: 'https://tamilcinemahub.xyz' },
  }

  return (
    <div className="min-h-screen" style={{ background: '#F7F7F5' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* ── HERO ────────────────────────────────────────────── */}
      <section className="overflow-hidden" style={{ background: '#FFFFFF' }}>
        <div className="mx-auto max-w-[1280px] px-6 pt-28 pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text */}
            <div>
              <p className="hero-label text-[11px] font-semibold uppercase tracking-[0.1em] text-[#D4291A] mb-4" style={{ fontFamily: "'Inter', sans-serif" }}>
                &#x1F3AC; KOLLYWOOD&apos;S #1 DATABASE
              </p>
              <h1 className="hero-title text-5xl sm:text-6xl lg:text-7xl font-extrabold text-[#111] leading-[1.05] mb-6" style={{ fontFamily: "'Fraunces', serif" }}>
                Tamil Cinema, Discovered.
              </h1>
              <p className="hero-sub text-[17px] text-[#666] leading-[1.7] max-w-[480px] mb-10" style={{ fontFamily: "'Inter', sans-serif" }}>
                The ultimate database for Tamil movies. Browse reviews, discover hidden gems, and get recommendations powered by AI — all in one place.
              </p>
              <div className="hero-btns flex flex-wrap gap-4 mb-10">
                <Link href="/movies" className="inline-flex items-center gap-2 px-7 py-3.5 text-[14px] font-semibold text-white transition-all hover:-translate-y-0.5" style={{ background: '#D4291A', borderRadius: '6px', fontFamily: "'Inter', sans-serif", boxShadow: '0 4px 16px rgba(212,41,26,0.25)' }}>
                  Browse 1,600+ Movies
                </Link>
                <Link href="/blogs" className="inline-flex items-center gap-2 px-7 py-3.5 text-[14px] font-semibold transition-all hover:bg-[#FFF5F5]" style={{ background: 'transparent', border: '1.5px solid #D4291A', color: '#D4291A', borderRadius: '6px', fontFamily: "'Inter', sans-serif" }}>
                  Read Reviews
                </Link>
              </div>
              <div className="hero-stats flex flex-wrap gap-3">
                {['1,600+ Movies', '2000–2026', 'AI Chatbot'].map((stat) => (
                  <span key={stat} className="inline-block px-3.5 py-1.5 text-[13px] font-medium text-[#444] bg-white rounded-full" style={{ border: '1px solid #E8E7E3', boxShadow: 'var(--shadow-sm)', fontFamily: "'Inter', sans-serif" }}>
                    {stat}
                  </span>
                ))}
              </div>
            </div>

            {/* Right: Decorative visual */}
            <div className="relative hidden lg:flex items-center justify-center" style={{ minHeight: '400px' }}>
              <div className="absolute w-80 h-80 rounded-full" style={{ background: '#FFF5F5', filter: 'blur(60px)' }} />
              <div className="relative flex gap-4">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="w-32 h-48 rounded-xl shadow-lg" style={{
                    background: i === 0 ? 'linear-gradient(135deg, #D4291A, #8B1A0F)' : i === 1 ? 'linear-gradient(135deg, #111, #333)' : 'linear-gradient(135deg, #C8973A, #8B6914)',
                    transform: `rotate(${i === 0 ? -8 : i === 1 ? 3 : -4}deg) translateY(${i === 1 ? -20 : 0}px)`,
                  }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ───────────────────────────────────────── */}
      <div className="reveal" style={{ background: '#F2F1EE', borderTop: '1px solid #E8E7E3', borderBottom: '1px solid #E8E7E3' }}>
        <div className="mx-auto max-w-[1280px] px-6 py-12">
          <div className="flex flex-wrap items-center justify-center gap-12">
            <div className="flex flex-col items-center gap-1">
              <span className="text-[40px] font-bold text-[#D4291A]" style={{ fontFamily: "'Fraunces', serif", lineHeight: 1 }}>
                <StatCounter end={1600} suffix="+" />
              </span>
              <span className="text-[13px] text-[#888]" style={{ fontFamily: "'Inter', sans-serif" }}>Movies</span>
            </div>
            <div className="hidden sm:block w-px h-12" style={{ background: '#E8E7E3' }} />
            <div className="flex flex-col items-center gap-1">
              <span className="text-[40px] font-bold text-[#D4291A]" style={{ fontFamily: "'Fraunces', serif", lineHeight: 1 }}>
                2000–2026
              </span>
              <span className="text-[13px] text-[#888]" style={{ fontFamily: "'Inter', sans-serif" }}>Years</span>
            </div>
            <div className="hidden sm:block w-px h-12" style={{ background: '#E8E7E3' }} />
            <div className="flex flex-col items-center gap-1">
              <span className="text-[40px] font-bold text-[#D4291A]" style={{ fontFamily: "'Fraunces', serif", lineHeight: 1 }}>
                Live
              </span>
              <span className="text-[13px] text-[#888]" style={{ fontFamily: "'Inter', sans-serif" }}>AI Chatbot</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── LATEST MOVIES ───────────────────────────────────── */}
      <section className="reveal mx-auto max-w-[1280px] px-6 py-20" style={{ background: '#FFFFFF' }}>
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#D4291A] mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>Recently Added</p>
            <h2 className="text-[36px] font-bold text-[#111] leading-tight" style={{ fontFamily: "'Fraunces', serif" }}>Latest Movies</h2>
          </div>
          <Link href="/movies" className="hidden sm:flex items-center gap-1.5 text-[13px] font-medium text-[#D4291A] hover:underline" style={{ fontFamily: "'Inter', sans-serif" }}>
            View all →
          </Link>
        </div>
        {movies.length > 0 ? (
          <div className="reveal-group grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
            {movies.map((movie) => (<MovieCard key={movie._id} movie={movie} />))}
          </div>
        ) : (
          <div className="text-center py-16 rounded-xl bg-white" style={{ border: '1px solid #E8E7E3' }}>
            <p className="text-4xl mb-4">&#x1F3AC;</p>
            <p className="text-[#888] text-sm">No movies found. Add them in Sanity Studio.</p>
          </div>
        )}
        <div className="mt-8 sm:hidden text-center">
          <Link href="/movies" className="inline-block px-8 py-3 text-[14px] font-semibold text-[#D4291A] rounded-md transition-all hover:bg-[#FFF5F5]" style={{ border: '1px solid #D4291A', fontFamily: "'Inter', sans-serif" }}>
            View all movies →
          </Link>
        </div>
      </section>

      {/* ── LATEST BLOGS ────────────────────────────────────── */}
      <section className="reveal mx-auto max-w-[1280px] px-6 py-20" style={{ background: '#F7F7F5' }}>
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#D4291A] mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>Latest Articles</p>
            <h2 className="text-[36px] font-bold text-[#111] leading-tight" style={{ fontFamily: "'Fraunces', serif" }}>Reviews &amp; Blogs</h2>
          </div>
          <Link href="/blogs" className="hidden sm:flex items-center gap-1.5 text-[13px] font-medium text-[#D4291A] hover:underline" style={{ fontFamily: "'Inter', sans-serif" }}>
            View all →
          </Link>
        </div>
        {blogs.length > 0 ? (
          <div className="reveal-group grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogs.map((blog) => (<BlogCard key={blog._id} blog={blog} />))}
          </div>
        ) : (
          <div className="text-center py-16 rounded-xl bg-white" style={{ border: '1px solid #E8E7E3' }}>
            <p className="text-4xl mb-4">&#x270D;&#xFE0F;</p>
            <p className="text-[#888] text-sm">No blog posts yet. Write reviews in Sanity Studio.</p>
          </div>
        )}
      </section>

      {/* ── AI CTA ──────────────────────────────────────────── */}
      <section className="reveal" style={{ background: '#111111' }}>
        <div className="mx-auto max-w-[1280px] px-6 py-20 text-center relative overflow-hidden">
          <div className="absolute inset-0" style={{ background: 'repeating-linear-gradient(45deg, transparent, transparent 40px, rgba(255,255,255,0.012) 40px, rgba(255,255,255,0.012) 80px)' }} />
          <div className="relative z-10">
            <p className="text-[56px] mb-3">&#x1F3AC;</p>
            <h3 className="text-[42px] font-bold text-white mb-3" style={{ fontFamily: "'Fraunces', serif" }}>Not sure what to watch?</h3>
            <p className="text-[17px] text-[#AAAAAA] mb-8 max-w-md mx-auto" style={{ fontFamily: "'Inter', sans-serif" }}>Ask our AI for personalised Tamil movie recommendations.</p>
            <ChatWithAIButton />
          </div>
        </div>
      </section>
    </div>
  )
}
