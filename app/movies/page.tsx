import { Suspense } from 'react'
import { client } from '../../sanity/client'
import { paginatedMoviesQuery, moviesCountQuery, allGenresQuery } from '../../lib/queries'
import MovieCard, { Movie } from '../../components/MovieCard'
import MovieFilters from '../../components/MovieFilters'
import Pagination from '../../components/Pagination'

export const revalidate = 60

const PAGE_SIZE = 24

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ page?: string; genre?: string; q?: string }> }) {
  const params = await searchParams
  const genre = params.genre || 'All'
  const q = params.q?.replace(/\*$/, '') || ''

  const title = q
    ? `Search "${q}" Movies`
    : genre !== 'All'
      ? `${genre.charAt(0).toUpperCase() + genre.slice(1)} Tamil Movies`
      : 'All Tamil Movies — Database'

  return {
    title,
    description: 'Browse and search Tamil movies from 2000 to 2026. Ratings, cast, reviews, and OTT availability.',
  }
}

export default async function MoviesPage({ searchParams }: { searchParams: Promise<{ page?: string; genre?: string; q?: string }> }) {
  const params = await searchParams
  const page = Math.max(1, parseInt(params.page || '1') || 1)
  const genre = params.genre || 'All'
  const rawQ = params.q || ''
  const q = rawQ.replace(/\*$/, '')

  const sanitizedQ = q.replace(/[^a-zA-Z0-9\s]/g, '').trim()
  const searchQ = sanitizedQ.length >= 2 ? `${sanitizedQ}*` : ''

  const start = (page - 1) * PAGE_SIZE
  const end = start + PAGE_SIZE

  const filteredCountQ = moviesCountQuery
  const totalCountQ = `count(*[_type == "movie"])`

  const [movies, filteredCount, totalMovieCount, allGenres] = await Promise.all([
    client.fetch<Movie[]>(paginatedMoviesQuery(start, end), { genre, q: searchQ }).catch(() => []),
    client.fetch<number>(filteredCountQ, { genre, q: searchQ }).catch(() => 0),
    client.fetch<number>(totalCountQ).catch(() => 0),
    client.fetch<string[]>(allGenresQuery).catch(() => []),
  ])
  const totalCount = filteredCount

  const genres = ['All', ...Array.from(new Set(allGenres ?? [])).sort()]
  const totalPages = Math.ceil(totalCount / PAGE_SIZE)
  const safePage = Math.min(page, totalPages || 1)

  return (
    <div className="min-h-screen pb-24" style={{ background: '#07070f' }}>

      {/* ── HERO HEADER ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-20 pb-16 text-center">
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(109,40,217,0.4) 0%, transparent 70%)',
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundSize: '200px',
          }}
        />
        <div className="relative z-10 mx-auto max-w-3xl px-4">
          <p className="text-xs font-bold uppercase tracking-widest text-violet-400 mb-3">
            TamilCinemaHub
          </p>
          <h1
            className="text-4xl sm:text-6xl font-black text-white tracking-tight"
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
            Movies{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #a78bfa, #f97316)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Database
            </span>
          </h1>
          <p className="mt-4 text-sm text-white/40 max-w-md mx-auto">
            {totalMovieCount.toLocaleString()} Tamil movies from 2000 to 2026 — with ratings, cast, and reviews.
          </p>
        </div>
        <div
          className="absolute bottom-0 left-0 right-0 h-16"
          style={{ background: 'linear-gradient(to bottom, transparent, #07070f)' }}
        />
      </section>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* ── FILTERS (client component) ──────────────────────────────── */}
        <Suspense fallback={<div className="h-28 mb-4" />}>
          <MovieFilters genres={genres} />
        </Suspense>

        {/* Result count */}
        <p className="text-xs text-white/25 text-center mb-6">
          Showing page{' '}
          <span className="font-bold text-violet-400">{safePage}</span>{' '}
          of {totalPages} · {filteredCount.toLocaleString()} movies
          {q ? ` matching "${q}"` : ''}
        </p>

        {/* ── GRID ────────────────────────────────────────────────────── */}
        {movies.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {movies.map((movie) => (
              <MovieCard key={movie._id} movie={movie} />
            ))}
          </div>
        ) : (
          <div
            className="text-center py-24 rounded-2xl"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <p className="text-4xl mb-4">🎬</p>
            <h3 className="text-lg font-black text-white mb-2">No Movies Found</h3>
            <p className="text-sm text-white/30 max-w-xs mx-auto">
              No results for{q ? ` "${q}"` : ''}{genre !== 'All' ? ` in ${genre}` : ''}. Try a different search or genre.
            </p>
          </div>
        )}

        {/* ── PAGINATION ─────────────────────────────────────────────── */}
        <Pagination
          currentPage={safePage}
          totalPages={totalPages}
          baseUrl="/movies"
          params={{ genre: genre !== 'All' ? genre : '', q: rawQ }}
        />
      </main>
    </div>
  )
}
