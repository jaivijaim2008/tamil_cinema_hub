import { Suspense } from 'react'
import { client } from '../../sanity/client'
import { paginatedMoviesQuery, moviesCountQuery, allGenresQuery } from '../../lib/queries'
import MovieCard, { Movie } from '../../components/MovieCard'
import MovieCardErrorBoundary from '../../components/MovieCardErrorBoundary'
import MovieFilters from '../../components/MovieFilters'
import Pagination from '../../components/Pagination'
import { Film, Database, Sparkles } from 'lucide-react'

export const revalidate = 60

const PAGE_SIZE = 24

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ page?: string; genre?: string; q?: string }> }) {
  const params = await searchParams
  const genre = params.genre || 'All'
  const q = params.q?.replace(/\*$/, '') || ''
  return {
    title: q ? `Search "${q}" | TamilCinemaHub` : `${genre} Movies | TamilCinemaHub`,
    description: 'Explore the definitive archive of Tamil cinema.',
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

  const [movies, filteredCount, totalMovieCount, allGenres] = await Promise.all([
    client.fetch<Movie[]>(paginatedMoviesQuery(start, end), { genre, q: searchQ }).catch(() => []),
    client.fetch<number>(moviesCountQuery, { genre, q: searchQ }).catch(() => 0),
    client.fetch<number>(`count(*[_type == "movie"])`).catch(() => 0),
    client.fetch<string[]>(allGenresQuery).catch(() => []),
  ])

  const genres = ['All', ...Array.from(new Set(allGenres ?? [])).sort()]
  const totalPages = Math.ceil(filteredCount / PAGE_SIZE)
  const safePage = Math.min(page, totalPages || 1)

  return (
    <div className="bg-ink min-h-screen pb-24">
      
      {/* ── HEADER ── */}
      <section className="relative pt-40 pb-20 border-b border-white/5 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-10">
           <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-crimson rounded-full blur-[120px]" />
        </div>

        <div className="section-container relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg glass border-white/10 mb-6">
                <Database size={12} className="text-crimson" />
                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/40">Real-time Archive</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-display font-black text-white leading-[0.9] uppercase mb-6">
                Movie <span className="text-gradient">Database</span>
              </h1>
              <p className="text-lg text-white/30 font-medium">
                Sifting through <span className="text-white/60">{totalMovieCount.toLocaleString()}</span> indexed titles from 2000 to 2026.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FILTERS & GRID ── */}
      <main className="section-container">
        <div className="mb-20">
          <Suspense fallback={<div className="h-32 bg-white/5 rounded-3xl animate-pulse" />}>
            <MovieFilters genres={genres} />
          </Suspense>
        </div>

        {movies.length > 0 ? (
          <div className="bento-grid grid-fix">
            {movies.map((movie, i) => (
              <div key={movie._id} className="col-span-12 md:col-span-6 lg:col-span-3">
                <MovieCardErrorBoundary title={movie.title}>
                  <MovieCard movie={movie} index={i} />
                </MovieCardErrorBoundary>
              </div>
            ))}
          </div>
        ) : (
          <div className="bento-card p-24 text-center">
            <Film size={64} className="text-white/5 mx-auto mb-8" />
            <h3 className="text-2xl font-display font-black text-white uppercase mb-4">Zero Matches Found</h3>
            <p className="text-white/30 font-medium max-w-sm mx-auto">
              Our archive doesn&apos;t contain records for {q ? `"${q}"` : 'this category'} yet. Try a broader search parameter.
            </p>
          </div>
        )}

        <div className="mt-20">
          <Pagination
            currentPage={safePage}
            totalPages={totalPages}
            baseUrl="/movies"
            params={{ genre: genre !== 'All' ? genre : '', q: rawQ }}
          />
        </div>
      </main>
    </div>
  )
}
