'use client'

import { useState, useCallback, useRef, useEffect, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import {
  SlidersHorizontal,
  X,
  Search,
  Grid3X3,
  List,
  LayoutGrid,
  ArrowUpDown,
  ChevronDown,
  Film,
  Star,
  Calendar,
  Clock,
  TrendingUp,
  Sparkles,
  Filter,
  RotateCcw,
  ChevronRight,
  ArrowRight,
} from 'lucide-react'
import { client } from '../../sanity/client'
import { paginatedMoviesQuery, moviesCountQuery } from '../../lib/queries'
import MovieCard from '../../components/ui/MovieCard'
import SkeletonCard from '../../components/ui/SkeletonCard'
import SpotlightCard from '../../components/ui/SpotlightCard'
import SectionHeader from '../../components/ui/SectionHeader'
import CinematicDivider from '../../components/ui/CinematicDivider'
import CinemaBackground from '../../components/graphics/CinemaBackground'
import type { Movie } from '../../components/ui/MovieCard'

/* ═══════════════════════════════════════════════════════════════════════════════
   TYPES & INTERFACES
   ═══════════════════════════════════════════════════════════════════════════════ */

interface Props {
  initialMovies: Movie[]
  totalCount: number
  genres: string[]
  initialGenre: string
  initialQ: string
  currentPage: number
  totalPages: number
}

type ViewMode = 'grid' | 'large-grid' | 'list'
type SortMode = 'default' | 'rating' | 'year' | 'title'

/* ═══════════════════════════════════════════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════════════════════════════════════════ */

const genreIcons: Record<string, string> = {
  Action: '🔥',
  Drama: '🎭',
  Comedy: '😂',
  Romance: '💕',
  Thriller: '😱',
  Horror: '👻',
  'Sci-Fi': '🚀',
  Crime: '🔍',
  Adventure: '🗺️',
  Fantasy: '✨',
  Family: '👨‍👩‍👧',
  Musical: '🎵',
  War: '⚔️',
  History: '📜',
  Mystery: '🔎',
  Western: '🤠',
}

const genreDescriptions: Record<string, string> = {
  Action: 'High-octane stunts, fight choreography, and adrenaline-pumping sequences',
  Drama: 'Character-driven stories exploring human emotions and relationships',
  Comedy: 'Humor, wit, and entertainment that brings laughter',
  Romance: 'Love stories that touch the heart',
  Thriller: 'Suspense, tension, and edge-of-your-seat excitement',
  Horror: 'Frightening tales that send shivers down your spine',
  'Sci-Fi': 'Visionary stories exploring science and the future',
  Crime: 'Gritty tales of law, crime, and justice',
  Adventure: 'Epic journeys and daring quests',
  Fantasy: 'Magical worlds and mythical adventures',
  Family: 'Heartwarming stories for all ages',
  Musical: 'Songs, dance, and musical storytelling',
  War: 'Stories of conflict, bravery, and sacrifice',
  History: 'Epics drawn from historical events and figures',
  Mystery: 'Puzzling enigmas waiting to be solved',
  Western: 'Frontier stories with gunslingers and outlaws',
}

const sortOptions: { value: SortMode; label: string; icon: any }[] = [
  { value: 'default', label: 'Default', icon: Film },
  { value: 'rating', label: 'Top Rated', icon: Star },
  { value: 'year', label: 'Newest First', icon: Calendar },
  { value: 'title', label: 'A–Z', icon: ArrowUpDown },
]

/* ═══════════════════════════════════════════════════════════════════════════════
   SUB-COMPONENTS
   ═══════════════════════════════════════════════════════════════════════════════ */

/* ── Active Filter Chip ───────────────────────────────────────────────────── */
function FilterChip({
  label,
  onRemove,
  accent = 'gold',
}: {
  label: string
  onRemove: () => void
  accent?: string
}) {
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="shrink-0 px-3.5 py-2 rounded-full bg-accent-gold text-text-inverse text-xs font-medium flex items-center gap-1.5 shadow-lg shadow-accent-gold/20"
    >
      {label}
      <button
        onClick={onRemove}
        className="w-4 h-4 rounded-full bg-text-inverse/20 flex items-center justify-center hover:bg-text-inverse/30 transition-colors"
        aria-label={`Remove ${label} filter`}
      >
        <X size={10} />
      </button>
    </motion.span>
  )
}

/* ── Genre Card (for expanded view) ───────────────────────────────────────── */
function GenreCard({
  genre,
  count,
  isSelected,
  onClick,
  index,
}: {
  genre: string
  count: number
  isSelected: boolean
  onClick: () => void
  index: number
}) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.04 }}
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl p-5 text-left transition-all duration-300 group ${
        isSelected
          ? 'bg-accent-gold/10 border-2 border-accent-gold/40 shadow-lg shadow-accent-gold/10'
          : 'bg-bg-card border border-border-subtle hover:border-border-accent'
      }`}
    >
      {/* Background glow */}
      <div
        className={`absolute -top-8 -right-8 w-24 h-24 rounded-full transition-opacity duration-300 ${
          isSelected ? 'bg-accent-gold/10 opacity-100' : 'bg-accent-gold/5 opacity-0 group-hover:opacity-100'
        }`}
      />

      <span className="text-2xl mb-2 block">{genreIcons[genre] || '🎬'}</span>
      <h3
        className={`font-medium text-sm mb-1 transition-colors ${
          isSelected ? 'text-accent-gold' : 'text-text-primary group-hover:text-accent-gold'
        }`}
      >
        {genre}
      </h3>
      <p className="text-text-muted text-xs">{count.toLocaleString()} films</p>

      {/* Selected indicator */}
      {isSelected && (
        <motion.div
          layoutId="genre-selected"
          className="absolute top-3 right-3 w-5 h-5 rounded-full bg-accent-gold flex items-center justify-center"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M2 5L4 7L8 3" stroke="#080808" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </motion.div>
      )}
    </motion.button>
  )
}

/* ── Sort Dropdown ─────────────────────────────────────────────────────────── */
function SortDropdown({
  value,
  onChange,
}: {
  value: SortMode
  onChange: (v: SortMode) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const current = sortOptions.find((o) => o.value === value) || sortOptions[0]

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border-subtle text-text-secondary text-sm hover:border-border-accent hover:text-text-primary transition-all"
      >
        <ArrowUpDown size={14} />
        <span className="hidden sm:inline">{current.label}</span>
        <ChevronDown size={12} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 z-50 glass-premium rounded-xl border border-border-subtle py-1.5 min-w-[180px] shadow-xl"
          >
            {sortOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  onChange(opt.value)
                  setOpen(false)
                }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                  value === opt.value
                    ? 'text-accent-gold bg-accent-gold-muted'
                    : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated'
                }`}
              >
                <opt.icon size={14} />
                {opt.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ── Movie List Item (List View) ──────────────────────────────────────────── */
function MovieListItem({ movie, index }: { movie: Movie; index: number }) {
  const ratingColor =
    (movie.rating || 0) >= 8
      ? 'text-accent-gold'
      : (movie.rating || 0) >= 6
        ? 'text-accent-emerald'
        : 'text-accent-amber'

  const genreList = Array.isArray(movie.genre) ? movie.genre : movie.genre ? [movie.genre] : []

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: index * 0.03 }}
    >
      <a
        href={`/movies/${movie.slug}`}
        className="group flex items-center gap-5 p-4 rounded-2xl bg-bg-card border border-border-subtle hover:border-border-accent hover:bg-bg-elevated transition-all duration-300 card-shine"
      >
        {/* Poster thumbnail */}
        <div className="w-14 h-20 rounded-lg overflow-hidden shrink-0 bg-bg-elevated border border-border-subtle">
          {movie.posterUrl ? (
            <img
              src={movie.posterUrl}
              alt={movie.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-text-muted text-lg font-playfair">
              {movie.title[0]}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-playfair text-base text-text-primary group-hover:text-accent-gold transition-colors truncate">
            {movie.title}
          </h3>
          <p className="text-text-muted text-xs mt-0.5">
            {movie.year} · {movie.director}
          </p>
          <div className="flex gap-1.5 mt-2">
            {genreList.slice(0, 3).map((g: string) => (
              <span key={g} className="text-[10px] px-2 py-0.5 rounded-full bg-bg-elevated text-text-muted border border-border-subtle">
                {g}
              </span>
            ))}
          </div>
        </div>

        {/* Rating */}
        {movie.rating && (
          <div className="text-right shrink-0">
            <span className={`font-mono text-lg font-bold ${ratingColor}`}>{movie.rating.toFixed(1)}</span>
            <p className="text-text-muted text-[10px] font-mono">/ 10</p>
          </div>
        )}

        {/* Arrow */}
        <ChevronRight size={16} className="text-text-muted group-hover:text-accent-gold group-hover:translate-x-1 transition-all shrink-0" />
      </a>
    </motion.div>
  )
}

/* ── Stats Bar ─────────────────────────────────────────────────────────────── */
function StatsBar({
  totalCount,
  filteredCount,
  genre,
  query,
}: {
  totalCount: number
  filteredCount: number
  genre: string
  query: string
}) {
  const isFiltered = !!genre || !!query
  return (
    <div className="flex flex-wrap items-center gap-3 py-3">
      <div className="flex items-center gap-2 text-text-muted text-xs">
        <Film size={12} className="text-accent-gold/60" />
        <span className="font-mono">
          {isFiltered ? (
            <>
              <span className="text-text-primary font-semibold">{filteredCount.toLocaleString()}</span>
              {' of '}
              <span>{totalCount.toLocaleString()}</span>
            </>
          ) : (
            <span className="text-text-primary font-semibold">{totalCount.toLocaleString()}</span>
          )}
          {' '}films
        </span>
      </div>
      {genre && (
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-text-muted">in</span>
          <span className="text-accent-gold font-medium">{genre}</span>
        </div>
      )}
      {query && (
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-text-muted">matching</span>
          <span className="text-accent-gold font-medium">&ldquo;{query}&rdquo;</span>
        </div>
      )}
    </div>
  )
}

/* ── Empty State ───────────────────────────────────────────────────────────── */
function EmptyState({ onClear }: { onClear: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center gap-6 py-28 text-center"
    >
      <motion.div
        animate={{ rotate: [0, 10, -10, 0] }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        <div className="w-20 h-20 rounded-3xl bg-bg-elevated border border-border-subtle flex items-center justify-center">
          <Film size={32} className="text-text-muted" />
        </div>
      </motion.div>
      <div>
        <p className="font-playfair text-2xl text-text-secondary mb-2">No films found</p>
        <p className="text-text-muted text-sm max-w-xs leading-relaxed">
          Try adjusting your search or filters to discover more Tamil cinema
        </p>
      </div>
      <button
        onClick={onClear}
        className="flex items-center gap-2 text-accent-gold border border-accent-gold/30 rounded-xl px-7 py-3 hover:bg-accent-gold-muted transition-colors font-medium text-sm"
      >
        <RotateCcw size={14} />
        Clear All Filters
      </button>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════════════════ */

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
  const headerRef = useRef(null)
  const headerInView = useInView(headerRef, { once: true })

  /* ── State ─────────────────────────────────────────────────────────────────── */
  const [movies, setMovies] = useState<Movie[]>(initialMovies)
  const [loading, setLoading] = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)
  const [selectedGenre, setSelectedGenre] = useState(initialGenre)
  const [searchQuery, setSearchQuery] = useState(initialQ)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [sortMode, setSortMode] = useState<SortMode>('default')
  const [showGenreExplorer, setShowGenreExplorer] = useState(false)
  const [localSearch, setLocalSearch] = useState('')
  const sentinelRef = useRef<HTMLDivElement>(null)
  const pageRef = useRef(currentPage)

  /* ── Infinite scroll ───────────────────────────────────────────────────────── */
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

  /* ── Load more ─────────────────────────────────────────────────────────────── */
  const loadMore = useCallback(async () => {
    if (loading) return
    setLoading(true)
    const nextPage = pageRef.current + 1
    const start = (nextPage - 1) * 24
    const end = start + 24
    try {
      const newMovies = await client.fetch<Movie[]>(paginatedMoviesQuery(start, end), {
        genre: selectedGenre,
        q: searchQuery,
      })
      setMovies((prev) => [...prev, ...newMovies])
      pageRef.current = nextPage
    } catch {}
    setLoading(false)
  }, [loading, selectedGenre, searchQuery])

  /* ── Apply filters ─────────────────────────────────────────────────────────── */
  const applyFilters = useCallback(
    (genre: string, q: string) => {
      setSelectedGenre(genre)
      setSearchQuery(q)
      setFilterOpen(false)
      pageRef.current = 1

      const params = new URLSearchParams()
      if (genre) params.set('genre', genre)
      if (q) params.set('q', q)
      router.push(`/movies?${params.toString()}`, { scroll: false })

      setLoading(true)
      Promise.all([
        client.fetch<Movie[]>(paginatedMoviesQuery(0, 24), { genre, q }),
        client.fetch<number>(moviesCountQuery, { genre, q }),
      ])
        .then(([data]) => {
          setMovies(data || [])
          setLoading(false)
        })
        .catch(() => setLoading(false))
    },
    [router]
  )

  /* ── Clear all filters ─────────────────────────────────────────────────────── */
  const clearFilters = useCallback(() => {
    applyFilters('', '')
  }, [applyFilters])

  /* ── Sorted movies ─────────────────────────────────────────────────────────── */
  const sortedMovies = useMemo(() => {
    const sorted = [...movies]
    switch (sortMode) {
      case 'rating':
        return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0))
      case 'year':
        return sorted.sort((a, b) => (b.year || 0) - (a.year || 0))
      case 'title':
        return sorted.sort((a, b) => a.title.localeCompare(b.title))
      default:
        return sorted
    }
  }, [movies, sortMode])

  /* ── Genre counts ──────────────────────────────────────────────────────────── */
  const genreCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    movies.forEach((m) => {
      const gs = Array.isArray(m.genre) ? m.genre : m.genre ? [m.genre] : []
      gs.forEach((g: string) => {
        counts[g] = (counts[g] || 0) + 1
      })
    })
    return counts
  }, [movies])

  /* ── Filtered genres for search ────────────────────────────────────────────── */
  const filteredGenres = useMemo(() => {
    if (!localSearch) return genres
    return genres.filter((g) => g.toLowerCase().includes(localSearch.toLowerCase()))
  }, [genres, localSearch])

  const hasActiveFilters = !!selectedGenre || !!searchQuery

  /* ═══════════════════════════════════════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════════════════════════════════════ */

  return (
    <div className="min-h-screen pt-24 lg:pt-28 pb-12">
      {/* ═══ HERO HEADER ═══ */}
      <section ref={headerRef} className="relative overflow-hidden py-16 sm:py-20 px-6 sm:px-8 lg:px-10">
        <CinemaBackground />

        {/* Decorative elements */}
        <div className="absolute top-10 right-10 opacity-[0.03] pointer-events-none">
          <Film size={200} className="text-accent-gold" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-accent-gold-muted/60 backdrop-blur-sm border border-accent-gold/20 rounded-full px-4 py-2 mb-6">
              <Film size={14} className="text-accent-gold" />
              <span className="text-accent-gold text-[11px] font-mono tracking-[0.2em] uppercase">Database</span>
            </div>

            <h1 className="font-playfair text-[clamp(32px,6vw,64px)] text-text-primary leading-tight mb-4">
              Tamil <span className="text-gradient-gold">Movies</span>
            </h1>
            <p className="text-text-secondary text-base sm:text-lg max-w-xl leading-relaxed">
              Explore our comprehensive archive of {totalCount.toLocaleString()} Tamil films spanning decades of cinematic excellence.
            </p>
          </motion.div>

          {/* Quick stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-wrap gap-6 mt-8"
          >
            {[
              { icon: Film, label: 'Films', value: totalCount.toLocaleString() },
              { icon: Star, label: 'Genres', value: String(genres.length) },
              { icon: TrendingUp, label: 'Decades', value: '7+' },
            ].map((stat) => (
              <div key={stat.label} className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-bg-card border border-border-subtle flex items-center justify-center">
                  <stat.icon size={14} className="text-accent-gold" />
                </div>
                <div>
                  <p className="text-text-primary text-sm font-semibold leading-none">{stat.value}</p>
                  <p className="text-text-muted text-[10px] font-mono uppercase tracking-wider">{stat.label}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
        {/* ═══ FILTER TOOLBAR ═══ */}
        <div className="sticky top-16 lg:top-16 z-40 py-4 -mx-6 sm:-mx-8 lg:-mx-10 px-6 sm:px-8 lg:px-10 bg-bg-primary/80 backdrop-blur-xl border-b border-border-subtle">
          {/* Desktop filter bar */}
          <div className="hidden lg:flex items-center gap-3 flex-wrap">
            <button
              onClick={() => setFilterOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border-subtle text-text-secondary text-sm hover:border-border-accent hover:text-text-primary transition-all"
            >
              <SlidersHorizontal size={14} />
              All Filters
            </button>

            <div className="w-px h-6 bg-border-subtle mx-1" />

            <button
              onClick={() => applyFilters('', '')}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                !selectedGenre
                  ? 'bg-accent-gold text-text-inverse shadow-lg shadow-accent-gold/20'
                  : 'border border-border-subtle text-text-secondary hover:border-border-accent hover:text-text-primary'
              }`}
            >
              All
            </button>
            {genres.slice(0, 12).map((g) => (
              <button
                key={g}
                onClick={() => applyFilters(g, searchQuery)}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                  selectedGenre === g
                    ? 'bg-accent-gold text-text-inverse shadow-lg shadow-accent-gold/20'
                    : 'border border-border-subtle text-text-secondary hover:border-border-accent hover:text-text-primary'
                }`}
              >
                {genreIcons[g] || '🎬'} {g}
              </button>
            ))}
            {genres.length > 12 && (
              <button
                onClick={() => setFilterOpen(true)}
                className="px-4 py-2.5 rounded-xl text-sm text-accent-gold border border-accent-gold/30 hover:bg-accent-gold-muted transition-colors"
              >
                +{genres.length - 12} more
              </button>
            )}

            <div className="ml-auto flex items-center gap-2">
              <SortDropdown value={sortMode} onChange={setSortMode} />

              {/* View mode toggles */}
              <div className="flex items-center border border-border-subtle rounded-xl overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2.5 transition-colors ${viewMode === 'grid' ? 'bg-accent-gold text-text-inverse' : 'text-text-muted hover:text-text-primary'}`}
                  aria-label="Grid view"
                >
                  <LayoutGrid size={14} />
                </button>
                <button
                  onClick={() => setViewMode('large-grid')}
                  className={`p-2.5 transition-colors ${viewMode === 'large-grid' ? 'bg-accent-gold text-text-inverse' : 'text-text-muted hover:text-text-primary'}`}
                  aria-label="Large grid view"
                >
                  <Grid3X3 size={14} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2.5 transition-colors ${viewMode === 'list' ? 'bg-accent-gold text-text-inverse' : 'text-text-muted hover:text-text-primary'}`}
                  aria-label="List view"
                >
                  <List size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* Mobile filter bar */}
          <div className="lg:hidden flex items-center gap-3">
            <div className="flex-1 overflow-x-auto scrollbar-hide flex gap-2">
              <AnimatePresence>
                {selectedGenre && (
                  <FilterChip label={selectedGenre} onRemove={() => applyFilters('', searchQuery)} />
                )}
                {searchQuery && (
                  <FilterChip label={`"${searchQuery}"`} onRemove={() => applyFilters(selectedGenre, '')} />
                )}
              </AnimatePresence>
              {!hasActiveFilters && (
                <span className="text-text-muted text-xs py-2">
                  {totalCount.toLocaleString()} films
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <SortDropdown value={sortMode} onChange={setSortMode} />
              <button
                onClick={() => setFilterOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-border-subtle text-text-secondary text-xs font-medium hover:border-border-accent transition-colors"
              >
                <Filter size={12} />
                Filters
              </button>
            </div>
          </div>
        </div>

        {/* ═══ ACTIVE FILTERS INFO ═══ */}
        <StatsBar totalCount={totalCount} filteredCount={movies.length} genre={selectedGenre} query={searchQuery} />

        {/* ═══ GENRE EXPLORER TOGGLE ═══ */}
        <div className="mb-8">
          <button
            onClick={() => setShowGenreExplorer(!showGenreExplorer)}
            className="flex items-center gap-2 text-sm text-accent-gold hover:text-accent-gold-bright transition-colors"
          >
            <Sparkles size={14} />
            {showGenreExplorer ? 'Hide' : 'Explore'} by Genre
            <ChevronDown size={12} className={`transition-transform ${showGenreExplorer ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {showGenreExplorer && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 mt-4">
                  {genres.map((g, i) => (
                    <GenreCard
                      key={g}
                      genre={g}
                      count={genreCounts[g] || 0}
                      isSelected={selectedGenre === g}
                      onClick={() => applyFilters(selectedGenre === g ? '' : g, searchQuery)}
                      index={i}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ═══ MOVIE GRID ═══ */}
        {viewMode === 'list' ? (
          <div className="space-y-3">
            {sortedMovies.map((movie, i) => (
              <MovieListItem key={movie._id} movie={movie} index={i} />
            ))}
          </div>
        ) : (
          <div
            className={`grid gap-4 sm:gap-5 lg:gap-6 ${
              viewMode === 'large-grid'
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
            }`}
          >
            {sortedMovies.map((movie, i) => (
              <motion.div
                key={movie._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: Math.min(i, 12) * 0.05 }}
              >
                <MovieCard movie={movie} />
              </motion.div>
            ))}
          </div>
        )}

        {/* Loading skeletons */}
        {loading && (
          <div
            className={`grid gap-4 sm:gap-5 lg:gap-6 mt-8 ${
              viewMode === 'list'
                ? 'grid-cols-1'
                : viewMode === 'large-grid'
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                  : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
            }`}
          >
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* Sentinel for infinite scroll */}
        <div ref={sentinelRef} className="h-4" />

        {/* Empty state */}
        {!loading && movies.length === 0 && <EmptyState onClear={clearFilters} />}

        {/* Desktop pagination */}
        {totalPages > 1 && (
          <div className="hidden lg:flex justify-center gap-2.5 mt-16">
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
                  className={`w-11 h-11 rounded-xl text-sm font-medium transition-all ${
                    p === currentPage
                      ? 'bg-accent-gold text-text-inverse shadow-lg shadow-accent-gold/20'
                      : 'border border-border-subtle text-text-secondary hover:border-border-accent hover:text-text-primary'
                  }`}
                >
                  {p}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* ═══ FILTER BOTTOM SHEET (Mobile) ═══ */}
      <AnimatePresence>
        {filterOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              onClick={() => setFilterOpen(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-x-0 bottom-0 z-50 glass rounded-t-3xl border-t border-border-subtle max-h-[85vh] overflow-y-auto safe-bottom"
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-10 h-1 rounded-full bg-text-muted/40" />
              </div>

              <div className="px-6 pb-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-text-primary font-playfair text-xl">Filter Movies</h3>
                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="text-accent-gold text-xs font-medium flex items-center gap-1.5"
                    >
                      <RotateCcw size={12} />
                      Clear All
                    </button>
                  )}
                </div>

                {/* Search */}
                <div className="mb-6">
                  <p className="text-text-muted text-xs uppercase tracking-wider mb-3 font-medium">Search</p>
                  <div className="relative">
                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Title, director, actor..."
                      className="w-full bg-bg-elevated text-text-primary pl-11 pr-5 py-3.5 rounded-xl border border-border-subtle outline-none focus:border-accent-gold focus:shadow-[0_0_0_3px_rgba(232,184,75,0.12)] text-base transition-all"
                    />
                  </div>
                </div>

                {/* Genre grid */}
                <p className="text-text-muted text-xs uppercase tracking-wider mb-3 font-medium">Genre</p>
                <div className="grid grid-cols-2 gap-2.5 mb-6">
                  <button
                    onClick={() => setSelectedGenre('')}
                    className={`px-4 py-3 rounded-xl text-sm text-left transition-all ${
                      !selectedGenre
                        ? 'bg-accent-gold text-text-inverse font-medium shadow-lg shadow-accent-gold/20'
                        : 'bg-bg-elevated text-text-secondary border border-border-subtle hover:border-border-accent'
                    }`}
                  >
                    🎬 All Genres
                  </button>
                  {genres.map((g) => (
                    <button
                      key={g}
                      onClick={() => setSelectedGenre(g)}
                      className={`px-4 py-3 rounded-xl text-sm text-left transition-all ${
                        selectedGenre === g
                          ? 'bg-accent-gold text-text-inverse font-medium shadow-lg shadow-accent-gold/20'
                          : 'bg-bg-elevated text-text-secondary border border-border-subtle hover:border-border-accent'
                      }`}
                    >
                      {genreIcons[g] || '🎬'} {g}
                    </button>
                  ))}
                </div>

                {/* Apply */}
                <button
                  onClick={() => applyFilters(selectedGenre, searchQuery)}
                  className="w-full bg-accent-gold text-text-inverse font-semibold py-4 rounded-xl shadow-lg shadow-accent-gold/20 flex items-center justify-center gap-2"
                >
                  <Search size={16} />
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
