'use client'

import Link from 'next/link'
import { ArrowRight, Film, BookOpen, Star, TrendingUp } from 'lucide-react'
import type { Movie } from '@/lib/types'
import type { Blog } from '@/lib/types'
import type { GenreCount } from '@/lib/types'
import MovieCard from '@/components/ui/MovieCard'
import BlogCard from '@/components/ui/BlogCard'
import { urlFor } from '@/sanity/lib/image'

interface GenreCountItem {
  genre: string
  count: number
}

interface Props {
  movies: Movie[]
  blogs: any[]
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
  totalBlogs,
  genreCounts,
  avgRating,
}: Props) {
  return (
    <div className="min-h-screen">
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-bg-primary pt-20 md:pt-24 pb-12 md:pb-16">
        {/* Subtle background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-accent-gold/5 rounded-full blur-[120px]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-3xl mx-auto text-center">
            <span className="inline-block text-[11px] font-bold uppercase tracking-[0.25em] text-accent-gold mb-4">
              Tamil Cinema Archive
            </span>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-text-primary leading-[1.1] mb-4">
              Discover <span className="text-gradient-gold">Kollywood</span>
            </h1>
            <p className="text-base md:text-lg text-text-secondary max-w-xl mx-auto mb-8">
              A curated archive of {totalMovies.toLocaleString()}+ Tamil films — from timeless classics to modern blockbusters.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Link
                href="/movies"
                className="inline-flex items-center gap-2 bg-accent-gold text-text-inverse px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-accent-gold-dim transition-colors"
              >
                <Film size={16} />
                Browse Movies
              </Link>
              <Link
                href="/analytics"
                className="inline-flex items-center gap-2 bg-bg-card border border-border text-text-secondary px-5 py-2.5 rounded-xl text-sm font-semibold hover:text-text-primary hover:border-border-light transition-all"
              >
                <TrendingUp size={16} />
                View Analytics
              </Link>
            </div>
          </div>

          {/* Stats row */}
          <div className="flex items-center justify-center gap-6 md:gap-10 mt-10 md:mt-14">
            <StatPill icon={<Film size={14} />} value={totalMovies.toLocaleString()} label="Movies" />
            <StatPill icon={<BookOpen size={14} />} value={totalBlogs.toLocaleString()} label="Reviews" />
            <StatPill icon={<Star size={14} />} value={Number(avgRating).toFixed(1)} label="Avg Rating" />
          </div>
        </div>
      </section>

      {/* ── Latest Movies ─────────────────────────────────────────────────── */}
      {movies.length > 0 && (
        <section className="py-10 md:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl md:text-2xl font-bold text-text-primary">Latest Movies</h2>
              <Link
                href="/movies"
                className="flex items-center gap-1.5 text-sm text-accent-gold hover:text-accent-gold-dim transition-colors font-medium"
              >
                View all <ArrowRight size={14} />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
              {movies.slice(0, 6).map((movie, i) => (
                <MovieCard key={movie._id} movie={movie} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Genre Explorer ────────────────────────────────────────────────── */}
      {genreCounts.length > 0 && (
        <section className="py-10 md:py-16 bg-bg-secondary">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl md:text-2xl font-bold text-text-primary mb-6">Browse by Genre</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {genreCounts.map((g) => (
                <Link
                  key={g.genre}
                  href={`/movies?genre=${encodeURIComponent(g.genre)}`}
                  className="group flex items-center justify-between p-4 rounded-xl bg-bg-card border border-border hover:border-accent-gold/30 transition-all"
                >
                  <span className="text-sm font-medium text-text-primary group-hover:text-accent-gold transition-colors">
                    {g.genre}
                  </span>
                  <span className="text-xs text-text-muted">{g.count}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Latest Reviews ────────────────────────────────────────────────── */}
      {blogs.length > 0 && (
        <section className="py-10 md:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl md:text-2xl font-bold text-text-primary">Latest Reviews</h2>
              <Link
                href="/blogs"
                className="flex items-center gap-1.5 text-sm text-accent-gold hover:text-accent-gold-dim transition-colors font-medium"
              >
                View all <ArrowRight size={14} />
              </Link>
            </div>

            {/* Featured first */}
            {blogs[0] && (
              <div className="mb-6">
                <BlogCard blog={blogs[0]} variant="featured" />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogs.slice(1, 7).map((blog, i) => (
                <BlogCard key={blog._id} blog={blog} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <section className="py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-2xl bg-bg-card border border-border p-8 md:p-12 text-center">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-accent-gold/5 rounded-full blur-[100px]" />
            </div>
            <div className="relative">
              <h2 className="text-2xl md:text-3xl font-bold text-text-primary mb-3">
                AI-Powered Recommendations
              </h2>
              <p className="text-sm text-text-secondary max-w-md mx-auto mb-6">
                Let our AI find your next favorite Tamil film based on your taste and preferences.
              </p>
              <Link
                href="/recommendations"
                className="inline-flex items-center gap-2 bg-accent-gold text-text-inverse px-6 py-3 rounded-xl text-sm font-semibold hover:bg-accent-gold-dim transition-colors"
              >
                Get Recommendations <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

function StatPill({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="flex items-center gap-2 bg-bg-card border border-border rounded-xl px-4 py-2.5">
      <span className="text-accent-gold">{icon}</span>
      <div className="flex items-baseline gap-1.5">
        <span className="text-lg font-bold text-text-primary">{value}</span>
        <span className="text-xs text-text-muted">{label}</span>
      </div>
    </div>
  )
}
