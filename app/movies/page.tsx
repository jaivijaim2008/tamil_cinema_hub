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
    openGraph: {
      title,
      description: 'Browse and search Tamil movies from 2000 to 2026. Ratings, cast, reviews, and OTT availability.',
      type: 'website',
      images: [
        {
          url: 'https://tamilcinemahub.xyz/opengraph-image',
          width: 1200,
          height: 630,
          alt: 'TamilCinemaHub Movies Database',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image' as const,
      title,
      description: 'Browse and search Tamil movies from 2000 to 2026. Ratings, cast, reviews, and OTT availability.',
      images: ['https://tamilcinemahub.xyz/opengraph-image'],
    },
    alternates: {
      canonical: 'https://tamilcinemahub.xyz/movies',
    },
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
    <div className="min-h-screen pb-24" style={{ background: '#F7F7F5' }}>

      {/* ── PAGE HEADER ─────────────────────────────────────────────── */}
      <section style={{ background: '#FFFFFF', borderBottom: '1px solid #E8E7E3' }}>
        <div className="mx-auto max-w-[1280px] px-6 py-12">
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] mb-2" style={{ color: '#D4291A' }}>
            TamilCinemaHub
          </p>
          <h1
            className="text-4xl sm:text-5xl font-bold tracking-tight mb-3"
            style={{ fontFamily: "'Fraunces', serif", color: '#111111' }}
          >
            Movies Database
          </h1>
          <p className="text-base" style={{ color: '#666666' }}>
            {totalMovieCount.toLocaleString()} Tamil movies from 2000 to 2026 — with ratings, cast, and reviews.
          </p>
        </div>
      </section>

      <main className="mx-auto max-w-[1280px] px-6 pt-8">

        {/* ── FILTERS (client component) ──────────────────────────────── */}
        <Suspense fallback={<div className="h-28 mb-4" />}>
          <MovieFilters genres={genres} />
        </Suspense>

        {/* Result count */}
        <p className="text-xs text-center mb-6" style={{ color: '#888888' }}>
          Showing page{' '}
          <span className="font-semibold" style={{ color: '#D4291A' }}>{safePage}</span>{' '}
          of {totalPages} · {filteredCount.toLocaleString()} movies
          {q ? ` matching "${q}"` : ''}
        </p>

        {/* ── GRID ────────────────────────────────────────────────────── */}
        {movies.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
            {movies.map((movie) => (
              <MovieCard key={movie._id} movie={movie} />
            ))}
          </div>
        ) : (
          <div
            className="text-center py-24 rounded-xl"
            style={{ background: '#FFFFFF', border: '1px solid #E8E7E3' }}
          >
            <p className="text-4xl mb-4">🎬</p>
            <h3 className="text-lg font-bold mb-2" style={{ fontFamily: "'Fraunces', serif", color: '#111111' }}>No Movies Found</h3>
            <p className="text-sm max-w-xs mx-auto" style={{ color: '#888888' }}>
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
