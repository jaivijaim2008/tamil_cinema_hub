'use client'

import type { Movie } from '@/lib/types'
import MovieCard from '@/components/ui/MovieCard'
import PageHeader from '@/components/ui/PageHeader'
import EmptyState from '@/components/ui/EmptyState'
import AdSenseBanner from '@/components/ui/AdSenseBanner'
import { Star } from 'lucide-react'

interface Props {
  movies: Movie[]
}

export default function TopRatedPageClient({ movies }: Props) {
  return (
    <div className="min-h-screen pt-20 md:pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <PageHeader
          label="Rankings"
          title="Top Rated Movies"
          description="The highest rated Tamil films in our archive"
        />

        {/* AdSense */}
        <div className="mb-8">
          <AdSenseBanner slot="9784001579" format="horizontal" minHeight={100} />
        </div>

        {movies.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
              {movies.slice(0, 12).map((movie, i) => (
                <div key={movie._id} className="relative">
                  {i < 3 && (
                    <div className="absolute -top-1 -left-1 z-10 w-7 h-7 rounded-full bg-accent-gold text-text-inverse flex items-center justify-center text-xs font-bold shadow-lg">
                      {i + 1}
                    </div>
                  )}
                  <MovieCard movie={movie} index={i} />
                </div>
              ))}
            </div>
            {movies.length > 12 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
                {movies.slice(12).map((movie, i) => (
                  <div key={movie._id}>
                    <MovieCard movie={movie} index={i + 12} />
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <EmptyState
            icon={<Star size={48} />}
            title="No rated movies yet"
            description="Movies will appear here once they have ratings."
          />
        )}
      </div>
    </div>
  )
}
