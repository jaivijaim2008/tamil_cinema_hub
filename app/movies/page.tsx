import { Suspense } from 'react'
import { client } from '../../sanity/client'
import { paginatedMoviesQuery, moviesCountQuery, allGenresQuery } from '../../lib/queries'
import MoviesPageClient from './MoviesPageClient'
import type { Movie } from '@/lib/types'

export default async function MoviesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>
}) {
  const params = await searchParams
  const genre = params.genre || ''
  const q = params.q || ''
  const page = parseInt(params.page || '1')
  const pageSize = 24
  const start = (page - 1) * pageSize
  const end = start + pageSize

  let movies: Movie[] = []
  let totalCount = 0
  let genres: string[] = []

  try {
    ;[movies, totalCount, genres] = await Promise.all([
      client.fetch<Movie[]>(paginatedMoviesQuery(start, end), { genre, q }).catch(() => []),
      client.fetch<number>(moviesCountQuery, { genre, q }).catch(() => 0),
      client.fetch<string[]>(allGenresQuery).catch(() => []),
    ])
  } catch {}

  const uniqueGenres = [...new Set(genres)].filter(Boolean).sort()
  const totalPages = Math.ceil(totalCount / pageSize)

  return (
    <Suspense fallback={null}>
      <MoviesPageClient
        initialMovies={movies}
        totalCount={totalCount}
        genres={uniqueGenres}
        initialGenre={genre}
        initialQ={q}
        currentPage={page}
        totalPages={totalPages}
      />
    </Suspense>
  )
}
