'use client'

import { useMemo, useRef } from 'react'
import Link from 'next/link'
import { motion, useInView } from 'framer-motion'
import { ArrowRight, ChevronDown, Sparkles, BarChart3, Bot } from 'lucide-react'
import type { Movie } from '../components/ui/MovieCard'
import MovieCard from '../components/ui/MovieCard'
import SectionHeader from '../components/ui/SectionHeader'
import HorizontalScrollRow from '../components/ui/HorizontalScrollRow'
import CinematicDivider from '../components/ui/CinematicDivider'
import SpotlightCard from '../components/ui/SpotlightCard'
import AnimatedCounter from '../components/ui/AnimatedCounter'
import CinemaBackground from '../components/graphics/CinemaBackground'
import FilmStripDecoration from '../components/graphics/FilmStripDecoration'
import TickerBar from '../components/graphics/TickerBar'

interface Props {
  movies: Movie[]
  blogs: any[]
  recentTitles: string[]
  totalMovies: number
  totalBlogs: number
}

const barColors = [
  'from-accent-gold to-accent-gold-dim',
  'from-accent-red to-accent-red-bright',
  'from-accent-rose to-accent-rose-bright',
  'from-accent-emerald to-accent-emerald-bright',
  'from-accent-purple to-accent-purple-bright',
  'from-accent-blue to-accent-blue-bright',
  'from-accent-teal to-accent-teal-bright',
  'from-accent-amber to-accent-amber-bright',
]

const statCards = [
  { label: 'Movies', suffix: '+', color: 'gold' as const },
  { label: 'Years', suffix: '+', color: 'teal' as const },
  { label: 'Reviews', suffix: '+', color: 'purple' as const },
  { label: 'AI Powered', suffix: '', color: 'rose' as const },
]

export default function HomePageClient({ movies, blogs, recentTitles, totalMovies, totalBlogs }: Props) {
  const section2Ref = useRef(null)
  const section2InView = useInView(section2Ref, { once: true, margin: '-100px' })

  const featuredBlog = blogs[0]

  // Compute real genre stats from the fetched movies data
  // Note: totalMovies/totalBlogs come from server-side count queries for accurate totals
  const { genreStats, avgRating } = useMemo(() => {
    const genreMap = new Map<string, number>()
    let ratingSum = 0
    let ratingCount = 0

    movies.forEach((m) => {
      const genres = Array.isArray(m.genre) ? m.genre : m.genre ? [m.genre] : []
      genres.forEach((g) => {
        if (g) genreMap.set(g, (genreMap.get(g) || 0) + 1)
      })
      if (m.rating) {
        ratingSum += m.rating
        ratingCount++
      }
    })

    const sortedGenres = Array.from(genreMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, count], i) => ({
        name,
        count,
        pct: Math.round((count / Math.max(...Array.from(genreMap.values()))) * 100),
        color: barColors[i % barColors.length],
      }))

    return {
      genreStats: sortedGenres,
      avgRating: ratingCount > 0 ? Math.round((ratingSum / ratingCount) * 10) / 10 : 0,
    }
  }, [movies])

  return (
    <>
      {/* TICKER */}
      {recentTitles.length > 0 && <TickerBar items={recentTitles} />}

      {/* ═══ SECTION 1 — HERO ═══ */}
      <section className="relative min-h-[100svh] flex flex-col items-center justify-center text-center px-6 sm:px-8 lg:px-10 overflow-hidden">
        <CinemaBackground />

        {/* Overline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-accent-gold text-[11px] font-mono tracking-[0.3em] uppercase mb-8 relative z-10"
        >
          Kollywood Archive · Est. 2000
        </motion.p>

        {/* H1 */}
        <h1 className="font-playfair text-[clamp(48px,12vw,130px)] leading-[0.9] tracking-tight relative z-10 mb-8">
          <motion.span
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="block text-text-primary"
          >
            Tamil
          </motion.span>
          <motion.span
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="block text-text-primary"
          >
            Cinema,
          </motion.span>
          <motion.span
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="block text-gradient-gold text-glow"
          >
            Redefined.
          </motion.span>
        </h1>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-text-secondary text-base lg:text-lg max-w-xl mb-12 relative z-10 leading-relaxed"
        >
          A high-fidelity archive of Tamil films. Discover, explore, and rediscover Kollywood.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-4 relative z-10"
        >
          <Link
            href="/movies"
            className="bg-accent-gold text-text-inverse font-semibold px-10 py-4 rounded-xl relative overflow-hidden group min-h-[52px] flex items-center justify-center shadow-lg shadow-accent-gold/20 hover:shadow-accent-gold/30 transition-shadow"
          >
            Browse Database
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
          </Link>
          <Link
            href="/recommendations"
            className="border border-accent-gold text-accent-gold px-10 py-4 rounded-xl hover:bg-accent-gold-muted backdrop-blur-sm min-h-[52px] flex items-center justify-center transition-all duration-300"
          >
            AI Recommendations
          </Link>
        </motion.div>

        {/* Stats - using real computed data */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="mt-24 grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8 relative z-10 w-full max-w-4xl"
        >
          {[
            { value: totalMovies, suffix: '+', label: 'Movies' },
            { value: totalBlogs, suffix: '+', label: 'Reviews' },
            { value: avgRating > 0 ? avgRating : 0, suffix: avgRating > 0 ? '' : '', label: 'Avg Rating' },
            { value: 1, suffix: '', label: 'AI Powered' },
          ].map((stat, i) => (
            <SpotlightCard key={stat.label} className="bg-bg-card/80 border border-border-subtle p-6 text-center card-shine">
              {i > 0 && (
                <div className="absolute left-0 top-1/4 bottom-1/4 w-px bg-border-accent hidden sm:block" />
              )}
              <div className="text-[clamp(32px,5vw,48px)] font-playfair text-gradient-gold leading-none mb-2">
                {stat.label === 'AI Powered' ? (
                  <span className="inline-block"><Bot className="text-accent-gold mx-auto" size={36} /></span>
                ) : (
                  <AnimatedCounter to={stat.value} suffix={stat.suffix} />
                )}
              </div>
              <p className="text-text-muted text-xs font-mono uppercase tracking-wider">{stat.label}</p>
            </SpotlightCard>
          ))}
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-text-muted"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <span className="text-xs tracking-widest uppercase font-mono">Scroll</span>
          <ChevronDown size={16} />
        </motion.div>
      </section>

      <FilmStripDecoration className="opacity-40" />

      {/* ═══ SECTION 2 — RECENT ADDITIONS ═══ */}
      <section ref={section2Ref} className="section-padding max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={section2InView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <SectionHeader
            title="Latest Additions"
            viewAllHref="/movies"
            viewAllLabel="View All"
          />
          <HorizontalScrollRow>
            {movies.map((movie) => (
              <div key={movie._id} className="w-[44vw] sm:w-[200px]">
                <MovieCard movie={movie} />
              </div>
            ))}
          </HorizontalScrollRow>
        </motion.div>
      </section>

      <CinematicDivider className="max-w-7xl mx-auto px-6 sm:px-8" />

      {/* ═══ SECTION 3 — FEATURED REVIEW ═══ */}
      {featuredBlog && (
        <section className="section-padding max-w-7xl mx-auto">
          <div className="border-gradient-animate rounded-2xl overflow-hidden bg-bg-elevated grid grid-cols-1 md:grid-cols-[1fr_280px]">
            <div className="p-8 md:p-12 lg:p-14">
              <span className="text-[10px] font-mono text-accent-gold tracking-widest uppercase bg-accent-gold-muted px-3 py-1.5 rounded-lg">
                Featured Review
              </span>
              <p className="text-text-muted text-xs mt-3 mb-5">
                {new Date(featuredBlog.publishedAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </p>
              <h3 className="font-playfair text-2xl md:text-3xl lg:text-4xl text-text-primary leading-snug mb-5">
                {featuredBlog.title}
              </h3>
              <p className="text-text-secondary text-sm leading-relaxed mb-8 line-clamp-3 max-w-[55ch]">
                {featuredBlog.excerpt}
              </p>
              <Link
                href={`/blogs/${featuredBlog.slug}`}
                className="text-accent-gold text-sm font-semibold inline-flex items-center gap-2 hover:underline group"
              >
                Read Full Review <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="hidden md:flex items-center justify-center bg-gradient-to-br from-accent-gold/[0.08] via-accent-red/5 to-accent-purple/5">
              <span className="text-[140px] font-playfair text-accent-gold/[0.08] select-none">&ldquo;</span>
            </div>
          </div>
        </section>
      )}

      <CinematicDivider className="max-w-7xl mx-auto px-6 sm:px-8" />

      {/* ═══ SECTION 4 — LATEST REVIEWS ═══ */}
      {blogs.length > 0 && (
        <section className="section-padding max-w-7xl mx-auto">
          <SectionHeader
            overline="Critics Choice"
            title="Latest Reviews"
            viewAllHref="/blogs"
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {blogs.slice(0, 3).map((blog: any) => (
              <SpotlightCard key={blog._id} className="bg-bg-card border border-border-subtle p-6 lg:p-8 hover:bg-bg-elevated transition-all duration-300 card-shine group">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-mono text-accent-gold tracking-widest uppercase bg-accent-gold-muted px-2.5 py-1 rounded-lg">
                    {blog.category || 'Review'}
                  </span>
                  <span className="text-text-muted text-xs">
                    {new Date(blog.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <h3 className="font-playfair text-lg text-text-primary line-clamp-2 mb-3 group-hover:text-accent-gold transition-colors">{blog.title}</h3>
                <p className="text-text-secondary text-sm leading-relaxed line-clamp-3 mb-5">{blog.excerpt}</p>
                <div className="flex items-center justify-between pt-4 border-t border-border-subtle">
                  <span className="text-text-muted text-xs">{blog.author}</span>
                  <Link href={`/blogs/${blog.slug}`} className="text-accent-gold text-xs font-semibold flex items-center gap-1.5 group-hover:gap-2 transition-all">
                    Read <ArrowRight size={10} />
                  </Link>
                </div>
              </SpotlightCard>
            ))}
          </div>
        </section>
      )}

      {/* ═══ SECTION 5 — ANALYTICS TEASER (Real Data) ═══ */}
      <section className="section-padding max-w-7xl mx-auto">
        <SpotlightCard className="bg-bg-card border border-border-subtle p-8 md:p-12 lg:p-14 grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <p className="text-accent-gold text-[11px] font-mono tracking-[0.3em] uppercase mb-3">By The Numbers</p>
            <h2 className="font-playfair text-3xl md:text-4xl text-text-primary mb-10">Kollywood in Data</h2>

            <div className="grid grid-cols-2 gap-4 mb-10">
              {[
                { label: 'Total Films', value: totalMovies.toLocaleString(), accent: 'accent-gold' },
                { label: 'Top Genre', value: genreStats[0]?.name || '—', accent: 'accent-purple' },
                { label: 'Avg Rating', value: avgRating > 0 ? String(avgRating) : '—', accent: 'accent-emerald' },
                { label: 'AI Powered', value: '✦', accent: 'accent-gold' },
              ].map((s) => (
                <div
                  key={s.label}
                  className="bg-bg-primary border border-border-accent rounded-xl px-5 py-4 animate-borderGlow"
                >
                  <p className={`text-${s.accent} font-playfair text-xl`}>{s.value}</p>
                  <p className="text-text-muted text-xs mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>

            <Link
              href="/analytics"
              className="inline-flex items-center gap-2 bg-accent-gold text-text-inverse font-semibold px-7 py-3.5 rounded-xl hover:bg-accent-gold-dim transition-colors shadow-lg shadow-accent-gold/20"
            >
              <BarChart3 size={16} />
              Explore Full Analytics
            </Link>
          </div>

          {/* Genre bars - REAL DATA from Sanity */}
          <div className="flex flex-col justify-center gap-5">
            {genreStats.map((g) => (
              <div key={g.name} className="flex items-center gap-4">
                <span className="text-text-secondary text-sm w-20 shrink-0 font-medium">{g.name}</span>
                <div className="flex-1 h-7 bg-bg-primary rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${g.pct}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 0.2 }}
                    className={`h-full bg-gradient-to-r ${g.color} rounded-full`}
                  />
                </div>
                <span className="text-accent-gold font-mono text-xs w-14 text-right shrink-0 font-bold">{g.count}</span>
              </div>
            ))}
          </div>
        </SpotlightCard>
      </section>

      {/* ═══ SECTION 6 — AI CTA ═══ */}
      <section className="py-32 sm:py-36 relative overflow-hidden bg-bg-secondary">
        {/* Animated blobs */}
        <div className="absolute top-20 left-1/4 w-80 h-80 rounded-full blob-1 opacity-60" />
        <div className="absolute bottom-20 right-1/4 w-64 h-64 rounded-full blob-2 opacity-60" />
        <div className="absolute top-1/3 right-1/3 w-48 h-48 rounded-full blob-3 opacity-40" />

        {/* Floating ghost cards from real data */}
        {movies.slice(0, 3).map((m, i) => (
          <div
            key={m._id}
            className="absolute opacity-[0.05] blur-[2px] animate-floatUp pointer-events-none"
            style={{
              left: `${15 + i * 30}%`,
              top: `${20 + i * 15}%`,
              rotate: `${i === 0 ? -6 : i === 1 ? 3 : -2}deg`,
              animationDelay: `${i * 1.5}s`,
            }}
          >
            <div className="w-24 h-36 rounded-lg bg-bg-elevated border border-border-subtle" />
          </div>
        ))}

        <div className="relative z-10 text-center px-6 sm:px-8">
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="inline-block mb-8"
          >
            <span className="text-5xl">🤖</span>
          </motion.div>
          <h2 className="font-playfair text-3xl md:text-5xl lg:text-6xl text-gradient-gold mb-6">
            Find Your Perfect Tamil Film
          </h2>
          <p className="text-text-secondary text-base sm:text-lg max-w-lg mx-auto mb-10 leading-relaxed">
            Our AI assistant knows every film in the database. Ask for recommendations, discover hidden gems, or explore by mood.
          </p>
          <Link
            href="/recommendations"
            className="inline-flex items-center gap-2 bg-accent-gold text-text-inverse font-semibold px-10 py-4 rounded-xl hover:bg-accent-gold-dim transition-colors shadow-lg shadow-accent-gold/20"
          >
            <Sparkles size={16} />
            Start Exploring
          </Link>
        </div>
      </section>
    </>
  )
}
