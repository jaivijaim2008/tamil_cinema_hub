'use client'

import Link from 'next/link'
import { ArrowRight, Sparkles } from 'lucide-react'
import type { Movie, Blog } from '@/lib/types'
import { GENRE_COLORS } from '@/lib/constants'
import MovieCard from '@/components/ui/MovieCard'
import BlogCard from '@/components/ui/BlogCard'
import InteractiveHero from '@/components/ui/InteractiveHero'
import MonetagAd from '@/components/ui/MonetagAd'
import { motion } from 'framer-motion'

interface GenreCountItem {
  genre: string
  count: number
}

interface Props {
  movies: Movie[]
  blogs: Blog[]
  recentTitles: string[]
  totalMovies: number
  totalBlogs: number
  genreCounts: GenreCountItem[]
  avgRating: number
}

export default function HomePageClient({
  movies,
  blogs,
  totalMovies,
  genreCounts,
}: Props) {
  return (
    <div className="min-h-screen">
      <InteractiveHero totalMovies={totalMovies} />

      {/* ── Ad: Below Hero ─────────────────────────────────────────────────── */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <MonetagAd placement="banner" className="max-w-4xl mx-auto" minHeight="100px" />
        </div>
      </section>

      {/* ── Latest Movies ─────────────────────────────────────────────────── */}
      {movies.length > 0 && (
        <section className="py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeader
              label="Now Showing"
              title="Latest Movies"
              href="/movies"
              linkText="View all"
            />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
              {movies.slice(0, 12).map((movie, i) => (
                <MovieCard key={movie._id} movie={movie} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Ad: Between Movies and Genres ──────────────────────────────────── */}
      <section className="py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <MonetagAd placement="banner" className="max-w-4xl mx-auto" />
        </div>
      </section>

      {/* ── Genre Explorer ────────────────────────────────────────────────── */}
      {genreCounts.length > 0 && (
        <section className="py-16 md:py-24 relative">
          {/* Subtle background shift */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-bg-secondary/50 to-transparent pointer-events-none" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeader
              label="Explore"
              title="Browse by Genre"
            />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {genreCounts.map((g, i) => {
                const color = GENRE_COLORS[g.genre] || '#E8B84B'
                return (
                  <motion.div
                    key={g.genre}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: Math.min(i * 0.05, 0.4) }}
                  >
                    <Link
                      href={`/movies?genre=${encodeURIComponent(g.genre)}`}
                      className="group flex items-center gap-3 p-4 rounded-xl bg-bg-card border border-border hover:border-opacity-60 transition-all duration-300"
                    >
                      <div
                        className="w-1 h-8 rounded-full shrink-0 transition-all duration-300 group-hover:h-10"
                        style={{ backgroundColor: color }}
                      />
                      <div className="flex-1 flex items-center justify-between min-w-0">
                        <span className="text-sm font-medium text-text-primary group-hover:text-accent-gold transition-colors truncate">
                          {g.genre}
                        </span>
                        <span className="text-xs text-text-muted bg-bg-elevated px-2 py-0.5 rounded-full shrink-0 ml-2">
                          {g.count}
                        </span>
                      </div>
                    </Link>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── Latest Reviews ────────────────────────────────────────────────── */}
      {blogs.length > 0 && (
        <section className="py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeader
              label="Fresh Reviews"
              title="Latest Reviews"
              href="/blogs"
              linkText="View all"
            />

            {/* Featured first */}
            {blogs[0] && (
              <div className="mb-8">
                <BlogCard blog={blogs[0]} variant="featured" />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogs.slice(1, 7).map((blog) => (
                <BlogCard key={blog._id} blog={blog} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Ad: Before CTA ──────────────────────────────────────────────────── */}
      <section className="py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <MonetagAd placement="banner" className="max-w-4xl mx-auto" />
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-2xl bg-bg-card border border-border p-10 md:p-16 text-center">
            {/* Background glow effects */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-accent-gold/5 rounded-full blur-[120px]" />
              <div className="absolute bottom-0 right-0 w-[300px] h-[200px] bg-[#8b5cf6]/5 rounded-full blur-[80px]" />
            </div>
            <div className="relative">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-gold/10 text-accent-gold text-xs font-semibold mb-6">
                  <Sparkles size={12} />
                  Powered by AI
                </span>
                <h2 className="text-2xl md:text-4xl font-bold text-text-primary mb-4">
                  Find Your Next Favorite Film
                </h2>
                <p className="text-sm text-text-secondary max-w-lg mx-auto mb-8 leading-relaxed">
                  Let our AI analyze your preferences and recommend Tamil films you&apos;ll love.
                  Discover hidden gems and timeless classics tailored to your taste.
                </p>
                <Link
                  href="/recommendations"
                  className="inline-flex items-center gap-2 bg-accent-gold text-text-inverse px-8 py-3.5 rounded-xl text-sm font-semibold hover:bg-accent-gold-dim transition-all duration-300 glow-button"
                >
                  Get Recommendations <ArrowRight size={16} />
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

/* ── Section Header ───────────────────────────────────────────────────────── */
function SectionHeader({
  label,
  title,
  href,
  linkText,
}: {
  label: string
  title: string
  href?: string
  linkText?: string
}) {
  return (
    <div className="flex items-end justify-between mb-8">
      <div>
        <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-accent-gold mb-2 block">
          {label}
        </span>
        <h2 className="text-xl md:text-2xl font-bold text-text-primary">{title}</h2>
      </div>
      {href && linkText && (
        <Link
          href={href}
          className="flex items-center gap-1.5 text-sm text-accent-gold hover:text-accent-gold-dim transition-colors font-medium shrink-0"
        >
          {linkText} <ArrowRight size={14} />
        </Link>
      )}
    </div>
  )
}
