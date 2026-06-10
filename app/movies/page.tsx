import { Suspense } from 'react'
import { client } from '../../sanity/client'
import { paginatedMoviesQuery, moviesCountQuery, allGenresQuery } from '../../lib/queries'
import MovieCard, { Movie } from '../../components/MovieCard'
import MovieCardErrorBoundary from '../../components/MovieCardErrorBoundary'
import MovieFilters from '../../components/MovieFilters'
import Pagination from '../../components/Pagination'
import AnalyticsLink from '../../components/AnalyticsLink'

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
      url: 'https://tamilcinemahub.xyz/movies',
      images: [{ url: 'https://tamilcinemahub.xyz/opengraph-image', width: 1200, height: 630, alt: 'TamilCinemaHub Movies Database' }],
    },
    twitter: {
      card: 'summary_large_image' as const,
      title,
      description: 'Browse and search Tamil movies from 2000 to 2026. Ratings, cast, reviews, and OTT availability.',
      images: ['https://tamilcinemahub.xyz/opengraph-image'],
    },
    alternates: { canonical: 'https://tamilcinemahub.xyz/movies' },
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
    <div style={{ background: 'var(--ink)', minHeight: '100vh', paddingBottom: 96 }}>
      {/* Page Header */}
      <section style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '48px 0' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ flexWrap: 'wrap' }} className="flex md:flex-row flex-col md:items-center items-start justify-between gap-5">
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--rose-light)', marginBottom: 8, fontFamily: "'Syne', sans-serif" }}>
                TamilCinemaHub
              </p>
              <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 800, color: 'rgba(255,255,255,0.92)', marginBottom: 8, lineHeight: 1.1 }}>
                Movies Database
              </h1>
              <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.4)' }}>
                {totalMovieCount.toLocaleString()} Tamil movies from 2000 to 2026 — with ratings, cast, and reviews.
              </p>
            </div>
            <AnalyticsLink />
          </div>
        </div>
      </section>

      <main style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px 0' }}>
        <Suspense fallback={<div style={{ height: 112, marginBottom: 16 }} />}>
          <MovieFilters genres={genres} />
        </Suspense>

        <p style={{ fontSize: 12, textAlign: 'center', marginBottom: 24, color: 'rgba(255,255,255,0.35)' }}>
          Showing page <span style={{ fontWeight: 700, color: 'var(--crimson)' }}>{safePage}</span> of {totalPages} · {filteredCount.toLocaleString()} movies{q ? ` matching "${q}"` : ''}
        </p>

        {movies.length > 0 ? (
          <div className="movies-grid-pill reveal-group">
            {movies.map((movie, i) => (
              <MovieCardErrorBoundary key={movie._id} title={movie.title}>
                <MovieCard movie={movie} index={i} />
              </MovieCardErrorBoundary>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '96px 24px', borderRadius: 16, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <p style={{ fontSize: 40, marginBottom: 16 }}>🎬</p>
            <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 800, color: 'rgba(255,255,255,0.92)', marginBottom: 8 }}>No Movies Found</h3>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.35)', maxWidth: 320, margin: '0 auto' }}>
              No results for{q ? ` "${q}"` : ''}{genre !== 'All' ? ` in ${genre}` : ''}. Try a different search or genre.
            </p>
          </div>
        )}

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