'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import type { Movie } from '@/lib/types'
import MovieCard from '@/components/ui/MovieCard'
import PageHeader from '@/components/ui/PageHeader'
import EmptyState from '@/components/ui/EmptyState'
import MonetagAd from '@/components/ui/MonetagAd'

interface Props {
  year: number
  movies: Movie[]
}

export default function YearPageClient({ year, movies }: Props) {
  return (
    <div className="min-h-screen pt-20 md:pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href="/movies"
          className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary transition-colors mb-6"
        >
          <ArrowLeft size={12} /> All Movies
        </Link>

        <PageHeader
          label="Year"
          title={`${year}`}
          description={`${movies.length} Tamil films from ${year}`}
        />

        {movies.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
              {movies.slice(0, 12).map((movie, i) => (
                <MovieCard key={movie._id} movie={movie} index={i} />
              ))}
            </div>
            {movies.length > 12 && (
              <div className="my-8">
                <MonetagAd placement="banner" className="max-w-4xl mx-auto" minHeight="100px" />
              </div>
            )}
            {movies.length > 12 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
                {movies.slice(12).map((movie, i) => (
                  <MovieCard key={movie._id} movie={movie} index={i + 12} />
                ))}
              </div>
            )}
          </>
        ) : (
          <EmptyState title={`No movies from ${year}`} description="Check back later as the archive grows." />
        )}
      </div>
    </div>
  )
}
