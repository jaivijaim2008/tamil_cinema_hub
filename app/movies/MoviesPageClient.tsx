'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react'
import { client } from '../../sanity/client'
import { paginatedMoviesQuery, moviesCountQuery } from '../../lib/queries'
import MovieCard from '../../components/ui/MovieCard'
import SkeletonCard from '../../components/ui/SkeletonCard'
import type { Movie } from '../../components/ui/MovieCard'

interface Props {
  initialMovies: Movie[]
  totalCount: number
  genres: string[]
  initialGenre: string
  initialQ: string
  currentPage: number
  totalPages: number
}

export default function MoviesPageClient({
  initialMovies,
  totalCount,
  genres,
  initialGenre,
  initialQ,
  currentPage,
  totalPages,
}: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [movies, setMovies] = useState<Movie[]>(initialMovies)
  const [loading, setLoading] = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)
  const [selectedGenre, setSelectedGenre] = useState(initialGenre)
  const [searchQuery, setSearchQuery] = useState(initialQ)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const pageRef = useRef(currentPage)

  // Infinite scroll on mobile
  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && pageRef.current < totalPages) {
          loadMore()
        }
      },
      { rootMargin: '200px' }
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [loading, totalPages])

  const loadMore = useCallback(async () => {
    if (loading) return
    setLoading(true)
    const nextPage = pageRef.current + 1
    const start = (nextPage - 1) * 24
    const end = start + 24

    try {
      const newMovies = await client.fetch<Movie[]>(
        paginatedMoviesQuery(start, end),
        { genre: selectedGenre, q: searchQuery }
      )
      setMovies((prev) => [...prev, ...newMovies])
      pageRef.current = nextPage
    } catch {}
    setLoading(false)
  }, [loading, selectedGenre, searchQuery])

  const applyFilters = (genre: string, q: string) => {
    setSelectedGenre(genre)
    setSearchQuery(q)
    setFilterOpen(false)
    pageRef.current = 1

    const params = new URLSearchParams()
    if (genre) params.set('genre', genre)
    if (q) params.set('q', q)
    router.push(`/movies?${params.toString()}`, { scroll: false })

    // Refetch
    setLoading(true)
    Promise.all([
      client.fetch<Movie[]>(paginatedMoviesQuery(0, 24), { genre, q }),
      client.fetch<number>(moviesCountQuery, { genre, q }),
    ]).then(([data, count]) => {
      setMovies(data || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }

  return (
    <div className="min-h-screen pt-20 lg:pt-24 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="mb-8">
          <p className="text-accent-gold text-[11px] font-mono tracking-[0.3em] uppercase mb-2">Database</p>
          <h1 className="font-playfair text-[clamp(28px,5vw,48px)] text-text-primary">Tamil Movies</h1>
          <p className="text-text-secondary text-sm mt-2">{totalCount.toLocaleString()} films in the archive</p>
        </div>

        {/* Desktop filter bar */}
        <div className="hidden lg:flex items-center gap-3 mb-8 flex-wrap">
          <button
            onClick={() => setFilterOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border-subtle text-text-secondary text-sm hover:border-border-accent transition-colors"
          >
            <SlidersHorizontal size={14} />
            Filters
          </button>
          <button
            onClick={() => applyFilters('', '')}
            className={`px-4 py-2 rounded-xl text-sm transition-colors ${
              !selectedGenre
                ? 'bg-accent-gold text-text-inverse'
                : 'border border-border-subtle text-text-secondary hover:border-border-accent'
            }`}
          >
            All
          </button>
          {genres.slice(0, 10).map((g) => (
            <button
              key={g}
              onClick={() => applyFilters(g, searchQuery)}
              className={`px-4 py-2 rounded-xl text-sm transition-colors ${
                selectedGenre === g
                  ? 'bg-accent-gold text-text-inverse'
                  : 'border border-border-subtle text-text-secondary hover:border-border-accent'
              }`}
            >
              {g}
            </button>
          ))}
        </div>

        {/* Mobile filter bar */}
        <div className="lg:hidden flex items-center gap-3 mb-6">
          <div className="flex-1 overflow-x-auto scrollbar-hide flex gap-2">
            {selectedGenre && (
              <span className="shrink-0 px-3 py-1.5 rounded-full bg-accent-gold text-text-inverse text-xs font-medium flex items-center gap-1">
                {selectedGenre}
                <button onClick={() => applyFilters('', searchQuery)}>
                  <X size={12} />
                </button>
              </span>
            )}
          </div>
          <button
            onClick={() => setFilterOpen(true)}
            className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border-subtle text-text-secondary text-xs"
          >
            <SlidersHorizontal size={12} />
            Filters
          </button>
        </div>

        {/* Movie Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
          {movies.map((movie, i) => (
            <div
              key={movie._id}
              className="animate-fadeInUp"
              style={{ animationDelay: `${Math.min(i, 12) * 0.05}s`, animationFillMode: 'both' }}
            >
              <MovieCard movie={movie} />
            </div>
          ))}
        </div>

        {/* Loading skeletons */}
        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6 mt-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* Sentinel for infinite scroll */}
        <div ref={sentinelRef} className="h-4" />

        {/* No results */}
        {!loading && movies.length === 0 && (
          <div className="flex flex-col items-center gap-6 py-24 text-center">
            <svg viewBox="0 0 120 120" className="w-24 h-24 text-text-muted">
              <circle cx="60" cy="60" r="50" fill="none" stroke="currentColor" strokeWidth="2" />
              <circle cx="60" cy="60" r="20" fill="none" stroke="currentColor" strokeWidth="2" />
              {[0, 60, 120, 180, 240, 300].map((angle) => (
                <line
                  key={angle}
                  x1="60"
                  y1="60"
                  x2={60 + 35 * Math.cos((angle * Math.PI) / 180)}
                  y2={60 + 35 * Math.sin((angle * Math.PI) / 180)}
                  stroke="currentColor"
                  strokeWidth="2"
                />
              ))}
            </svg>
            <p className="font-playfair text-2xl text-text-secondary">No films found</p>
            <p className="text-text-muted text-sm max-w-xs">
              Try adjusting your filters or explore the full database
            </p>
            <button
              onClick={() => applyFilters('', '')}
              className="text-accent-gold border border-border-accent rounded-xl px-6 py-3 hover:bg-accent-gold-muted transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        )}

        {/* Desktop pagination */}
        {totalPages > 1 && (
          <div className="hidden lg:flex justify-center gap-2 mt-12">
            {Array.from({ length: Math.min(totalPages, 10) }).map((_, i) => {
              const p = i + 1
              return (
                <button
                  key={p}
                  onClick={() => {
                    const params = new URLSearchParams()
                    if (selectedGenre) params.set('genre', selectedGenre)
                    if (searchQuery) params.set('q', searchQuery)
                    params.set('page', String(p))
                    router.push(`/movies?${params.toString()}`)
                  }}
                  className={`w-10 h-10 rounded-xl text-sm transition-colors ${
                    p === currentPage
                      ? 'bg-accent-gold text-text-inverse'
                      : 'border border-border-subtle text-text-secondary hover:border-border-accent'
                  }`}
                >
                  {p}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Filter Bottom Sheet (Mobile) */}
      <AnimatePresence>
        {filterOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/60"
              onClick={() => setFilterOpen(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-x-0 bottom-0 z-50 glass rounded-t-3xl border-t border-border-subtle max-h-[80vh] overflow-y-auto safe-bottom"
            >
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-10 h-1 rounded-full bg-text-muted/40" />
              </div>
              <div className="px-6 pb-8">
                <h3 className="text-text-primary font-semibold mb-6">Filter Movies</h3>

                {/* Genre grid */}
                <p className="text-text-muted text-xs uppercase tracking-wider mb-3">Genre</p>
                <div className="grid grid-cols-2 gap-2 mb-6">
                  {['', ...genres].map((g) => (
                    <button
                      key={g || 'all'}
                      onClick={() => setSelectedGenre(g)}
                      className={`px-3 py-2 rounded-xl text-sm text-left transition-colors ${
                        selectedGenre === g
                          ? 'bg-accent-gold text-text-inverse'
                          : 'bg-bg-elevated text-text-secondary border border-border-subtle'
                      }`}
                    >
                      {g || 'All Genres'}
                    </button>
                  ))}
                </div>

                {/* Search */}
                <p className="text-text-muted text-xs uppercase tracking-wider mb-3">Search</p>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Title, director..."
                  className="w-full bg-bg-elevated text-text-primary px-4 py-3 rounded-xl border border-border-subtle outline-none focus:border-accent-gold text-base"
                />

                {/* Apply */}
                <button
                  onClick={() => applyFilters(selectedGenre, searchQuery)}
                  className="w-full mt-6 bg-accent-gold text-text-inverse font-semibold py-4 rounded-xl"
                >
                  Apply Filters
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
