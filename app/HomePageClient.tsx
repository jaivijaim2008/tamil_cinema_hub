'use client'

import { useEffect, lazy, Suspense } from 'react'
import Link from 'next/link'
import MovieCard, { Movie } from '../components/MovieCard'
import MovieCardErrorBoundary from '../components/MovieCardErrorBoundary'
import BlogCard, { Blog } from '../components/BlogCard'

const ChatWithAIButton = lazy(() => import('../components/ChatWithAIButton'))

const FAKE_MOVIES: Movie[] = [
  { _id: '1', title: 'Coolie', slug: 'coolie', year: 2025, director: 'Lokesh Kanagaraj', genre: ['Action'], rating: 4.5, ottPlatform: 'Netflix' },
  { _id: '2', title: 'Jananayagan', slug: 'jananayagan', year: 2026, director: 'H. Vinoth', genre: ['Drama'], rating: 4.8 },
  { _id: '3', title: 'Thug Life', slug: 'thug-life', year: 2025, director: 'Mani Ratnam', genre: ['Crime'], rating: 4.2 },
  { _id: '4', title: 'Kanguva', slug: 'kanguva', year: 2024, director: 'Siva', genre: ['Fantasy'], rating: 3.5 },
  { _id: '5', title: 'Amaran', slug: 'amaran', year: 2024, director: 'Rajkumar Periasamy', genre: ['War'], rating: 4.7 },
  { _id: '6', title: 'Vidaamuyarchi', slug: 'vidaamuyarchi', year: 2025, director: 'Magizh Thirumeni', genre: ['Thriller'], rating: 4.0 },
]

const FAKE_BLOGS: Blog[] = [
  { _id: 'b1', title: "Coolie — Rajinikanth's Best in a Decade", slug: 'coolie-review', author: 'Karthik Selvara', publishedAt: '2025-12-15', category: 'Review', excerpt: "A career-redefining performance meets Lokesh Kanagaraj's signature universe." },
  { _id: 'b2', title: 'Top 10 Tamil Movies of 2025', slug: 'top-10-2025', author: 'Vikram Madhavan', publishedAt: '2025-12-28', category: 'Top List', excerpt: 'From blockbuster actioners to intimate dramas, 2025 was a stellar year.' },
  { _id: 'b3', title: "Vijay's Final Film: Tamil Cinema's Most Emotional Event", slug: 'vijay-final-film', author: 'Deepa Lakshmi', publishedAt: '2026-01-10', category: 'News', excerpt: 'The Thalapathy era comes to a close with an emotional farewell.' },
  { _id: 'b4', title: "How Lokesh Kanagaraj Became Kollywood's #1", slug: 'lokesh-kanagaraj', author: 'Arun T', publishedAt: '2025-12-01', category: 'Director', excerpt: "From Maanagaram to the Lokesh Cinematic Universe — the rise of Tamil cinema's most ambitious filmmaker." },
  { _id: 'b5', title: 'Thug Life — Art Over Box Office', slug: 'thug-life-review', author: 'Priya Ramachandran', publishedAt: '2025-11-20', category: 'Review', excerpt: "Mani Ratnam's latest is a bold artistic statement." },
]



export default function HomePageClient({ movies, blogs }: { movies: Movie[]; blogs: Blog[] }) {
  const displayMovies = movies.length > 0 ? movies : FAKE_MOVIES
  const displayBlogs = blogs.length > 0 ? blogs : FAKE_BLOGS

  return (
    <div style={{ background: 'var(--ink)' }}>
      {/* ── HERO ── */}
      <section className="hero-section" id="hero">
        <div>
          <div className="hero-eyebrow">🎬 KOLLYWOOD&apos;S #1 DATABASE</div>
          <h1 className="hero-title">
            <span className="line line-1">TAMIL</span>
            <span className="line line-2">CINEMA</span>
            <span className="line line-3">HUB.</span>
          </h1>
          <p className="hero-subtitle">
            Explore 1,600+ Tamil movies, read honest reviews, discover hidden gems, and chat with our AI to find your next favourite film — all in one place.
          </p>
          <div className="hero-buttons">
            <Link href="/movies" className="btn-hero-primary">Browse 1,600+ Movies</Link>
            <Link href="/blogs" className="btn-hero-secondary">Read Reviews</Link>
          </div>
          <div className="hero-stats">
            <span className="stat-chip"><span style={{ color: 'var(--crimson)' }}>●</span> 1,600+ Movies</span>
            <span className="stat-chip"><span style={{ color: 'var(--gold)' }}>●</span> 2000–2026</span>
            <span className="stat-chip"><span style={{ color: 'var(--violet)' }}>●</span> AI Chatbot</span>
          </div>
        </div>

        <div className="hero-visual">
          <div className="bg-orb-1" />
          <div className="bg-orb-2" />
          <div className="ring-outer" />
          <div className="ring-inner" />
          <div className="poster-card poster-card-1">
            <div className="watermark">KOLLYWOOD</div>
          </div>
          <div className="poster-card poster-card-2">
            <div className="film-perfs"><span /><span /><span /><span /><span /><span /></div>
            <div className="now-showing">NOW SHOWING</div>
          </div>
          <div className="poster-card poster-card-3" />
          <div className="floating-orb fo-1" />
          <div className="floating-orb fo-2" />
          <div className="floating-orb fo-3" />
          <div className="floating-orb fo-4" />
          <div className="scan-line" />
        </div>
      </section>

      {/* ── MARQUEE (exactly 2 identical sets for seamless loop) ── */}
      <div className="marquee-wrap">
        <div className="marquee-track">
          <span>⭐ COOLIE — RAJINIKANTH</span><span>•</span>
          <span>🎬 JANANAYAGAN — VIJAY</span><span>•</span>
          <span>🔥 THUG LIFE — KAMAL</span><span>•</span>
          <span>🏆 TOP 10 MOVIES OF 2025</span><span>•</span>
          <span>⭐ COOLIE — RAJINIKANTH</span><span>•</span>
          <span>🎬 JANANAYAGAN — VIJAY</span><span>•</span>
          <span>🔥 THUG LIFE — KAMAL</span><span>•</span>
          <span>🏆 TOP 10 MOVIES OF 2025</span><span>•</span>
        </div>
      </div>

      {/* ── STATS ── */}
      <section className="stats-bar-section" id="stats">
        <div className="stats-inner-pill">
          <div className="stat-card stat-card-1 reveal-scale">
            <span className="stat-number">1,600+</span>
            <span className="stat-label">Movies Catalogued</span>
          </div>
          <div className="stat-card stat-card-2 reveal-scale">
            <span className="stat-number">26+</span>
            <span className="stat-label">Years of Cinema</span>
          </div>
          <div className="stat-card stat-card-3 reveal-scale">
            <span className="stat-number"><span className="live-dot" />LIVE</span>
            <span className="stat-label">AI Chatbot Online</span>
          </div>
        </div>
      </section>

      {/* ── LATEST MOVIES ── */}
      <section className="section-movies" id="movies">
        <div className="container-pill">
          <div className="section-header-pill reveal-up">
            <div className="section-eyebrow">— RECENTLY ADDED —</div>
            <h2 className="section-title-pill"><span className="white">Latest </span><span className="gradient">Movies</span></h2>
            <div className="section-line" />
          </div>
          {displayMovies.length > 0 ? (
            <div className="movies-grid-pill reveal-group">
              {displayMovies.map((movie, i) => (
                <MovieCardErrorBoundary key={movie._id} title={movie.title}>
                  <MovieCard movie={movie} index={i} />
                </MovieCardErrorBoundary>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '64px 0', borderRadius: 16, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p style={{ fontSize: 40, marginBottom: 16 }}>🎬</p>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>No movies found. Add them in Sanity Studio.</p>
            </div>
          )}
          <div style={{ marginTop: 32, textAlign: 'center' }}>
            <Link href="/movies" className="btn-hero-secondary" style={{ fontSize: 13, padding: '10px 22px' }}>
              View all movies →
            </Link>
          </div>
        </div>
      </section>

      {/* ── LATEST BLOGS ── */}
      <section className="section-blogs" id="blogs">
        <div className="container-pill">
          <div className="section-header-pill reveal-left" style={{ marginBottom: 48 }}>
            <div className="section-eyebrow" style={{ color: 'var(--teal-light)' }}>— LATEST ARTICLES —</div>
            <h2 className="section-title-pill" style={{ fontSize: 'clamp(32px, 4vw, 52px)' }}>
              <span style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontWeight: 700, color: '#fff' }}>Reviews</span>
              <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, color: 'transparent', background: 'linear-gradient(135deg, var(--rose), var(--gold))', WebkitBackgroundClip: 'text', backgroundClip: 'text' }}> &amp; Blogs</span>
            </h2>
            <div className="section-line" style={{ background: 'linear-gradient(90deg, var(--teal), transparent)' }} />
          </div>
          {displayBlogs.length > 0 ? (
            <div className="blogs-grid-pill">
              {displayBlogs.map((blog, i) => (
                <BlogCard key={blog._id} blog={blog} index={i} />
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '64px 0', borderRadius: 16, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p style={{ fontSize: 40, marginBottom: 16 }}>✍️</p>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>No blog posts yet. Write reviews in Sanity Studio.</p>
            </div>
          )}
        </div>
      </section>

      {/* ── AI CTA ── */}
      <section className="section-cta-dark">
        <div className="cta-rings-dark">
          <div className="cta-ring-dark ring-1" />
          <div className="cta-ring-dark ring-2" />
          <div className="cta-ring-dark ring-3" />
        </div>
        <div className="cta-content-dark reveal-scale">
          <span className="cta-icon-dark">🎬</span>
          <h2 className="cta-title-dark">
            <span className="white">Not sure what</span><br />
            <span className="gradient">to watch?</span>
          </h2>
          <p className="cta-subtitle-dark">Ask our AI chatbot in Tamil or English — it knows every Kollywood film ever made and will find the perfect movie for your mood.</p>
          <Suspense fallback={null}><ChatWithAIButton /></Suspense>
        </div>
      </section>
    </div>
  )
}
