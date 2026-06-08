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
      <section style={{ background: '#FFFFFF' }}>
        <div className="hero-section">
          {/* Left: Text */}
          <div>
            <span className="hero-eyebrow">
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#D4291A', display: 'inline-block' }} />
              KOLLYWOOD&apos;S #1 DATABASE
            </span>
            <h1 className="hero-title">Tamil Cinema, Discovered.</h1>
            <p className="hero-subtitle">
              The ultimate database for Tamil movies. Browse reviews, discover hidden gems, and get recommendations powered by AI — all in one place.
            </p>
            <div className="hero-buttons">
              <Link href="/movies" className="btn-primary">
                Browse 1,600+ Movies
              </Link>
              <Link href="/blogs" className="btn-secondary">
                Read Reviews
              </Link>
            </div>
            <div className="hero-stats">
              {[
                { label: '1,600+ Movies', dot: true },
                { label: '2000–2026', dot: true },
                { label: 'AI Chatbot', dot: true },
              ].map((stat) => (
                <span key={stat.label} className="stat-chip">
                  {stat.dot && <span className="dot" />}
                  {stat.label}
                </span>
              ))}
            </div>
          </div>

          {/* Right: Poster Cards Visual */}
          <div className="hero-visual">
            <div className="poster-card">
              <div className="card-label" style={{ position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)', zIndex: 20, background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 6, padding: '5px 12px', color: 'white', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                ⭐ Top Rated
              </div>
            </div>
            <div className="poster-card" />
            <div className="poster-card" />
          </div>
        </div>
      </section>

      {/* ── STATS BAR ───────────────────────────────────────── */}
      <div className="stats-bar reveal">
        <div className="stats-inner">
          <div className="stat-item">
            <span className="stat-number">
              <StatCounter end={1600} suffix="+" />
            </span>
            <span className="stat-label">Movies</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">2000–2026</span>
            <span className="stat-label">Years</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">Live</span>
            <span className="stat-label">AI Chatbot</span>
          </div>
        </div>
      </div>

      {/* ── LATEST MOVIES ───────────────────────────────────── */}
      <section className="reveal" style={{ background: '#FFFFFF' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '80px 32px' }}>
          <div className="section-header">
            <div>
              <span className="section-eyebrow">Recently Added</span>
              <h2 className="section-title">Latest Movies</h2>
            </div>
            <Link href="/movies" className="view-all-link">
              View all
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
            </Link>
          </div>
          {movies.length > 0 ? (
            <div className="reveal-group movies-grid">
              {movies.map((movie) => (<MovieCard key={movie._id} movie={movie} />))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '64px 0', borderRadius: 12, background: '#FFFFFF', border: '1px solid #EBEBEB' }}>
              <p style={{ fontSize: 40, marginBottom: 16 }}>🎬</p>
              <p style={{ color: '#888', fontSize: 14 }}>No movies found. Add them in Sanity Studio.</p>
            </div>
          )}
          <div style={{ marginTop: 32, textAlign: 'center' }} className="md:hidden">
            <Link href="/movies" className="view-all-link" style={{ justifyContent: 'center' }}>
              View all movies
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ── LATEST BLOGS ────────────────────────────────────── */}
      <section className="reveal" style={{ background: '#F7F7F5' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '80px 32px' }}>
          <div className="section-header">
            <div>
              <span className="section-eyebrow">Latest Articles</span>
              <h2 className="section-title">Reviews &amp; Blogs</h2>
            </div>
            <Link href="/blogs" className="view-all-link">
              View all
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
            </Link>
          </div>
          {blogs.length > 0 ? (
            <div className="reveal-group blogs-grid">
              {blogs.map((blog) => (<BlogCard key={blog._id} blog={blog} />))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '64px 0', borderRadius: 12, background: '#FFFFFF', border: '1px solid #EBEBEB' }}>
              <p style={{ fontSize: 40, marginBottom: 16 }}>✍️</p>
              <p style={{ color: '#888', fontSize: 14 }}>No blog posts yet. Write reviews in Sanity Studio.</p>
            </div>
          )}
        </div>
      </section>

      {/* ── AI CTA ──────────────────────────────────────────── */}
      <section className="reveal" style={{ background: '#111111' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '80px 32px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(45deg, transparent, transparent 40px, rgba(255,255,255,0.012) 40px, rgba(255,255,255,0.012) 80px)' }} />
          <div style={{ position: 'relative', zIndex: 10 }}>
            <p style={{ fontSize: 56, marginBottom: 12 }}>🎬</p>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(32px, 5vw, 42px)', fontWeight: 800, color: '#FFFFFF', marginBottom: 12 }}>Not sure what to watch?</h3>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 17, color: '#AAAAAA', marginBottom: 32, maxWidth: 480, marginLeft: 'auto', marginRight: 'auto' }}>Ask our AI for personalised Tamil movie recommendations.</p>
            <ChatWithAIButton />
          </div>
        </div>
      </section>
    </div>
  )
}
