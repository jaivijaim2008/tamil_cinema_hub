'use client'

import type { Movie } from '@/lib/types'
import MovieCard from '@/components/ui/MovieCard'
import PageHeader from '@/components/ui/PageHeader'
import EmptyState from '@/components/ui/EmptyState'
import { Film } from 'lucide-react'

interface Props {
  movies: Movie[]
}

export default function LatestPageClient({ movies }: Props) {
  // Group by year
  const byYear = new Map<number, Movie[]>()
  movies.forEach((m) => {
    const arr = byYear.get(m.year) || []
    arr.push(m)
    byYear.set(m.year, arr)
  })

  const years = Array.from(byYear.entries()).sort((a, b) => b[0] - a[0])

  return (
    <div className="min-h-screen pt-20 md:pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <PageHeader
          label="New Releases"
          title="Latest Movies"
          description={`${movies.length} Tamil films, sorted by year`}
        />

        {years.length > 0 ? (
          <div className="space-y-12">
            {years.map(([year, yearMovies]) => (
              <section key={year}>
                <h2 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
                  <span className="text-accent-gold">{year}</span>
                  <span className="text-xs text-text-muted font-normal">({yearMovies.length} films)</span>
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
                  {yearMovies.map((movie, i) => (
                    <MovieCard key={movie._id} movie={movie} index={i} />
                  ))}
                </div>

              </section>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Film size={48} />}
            title="No movies found"
            description="The archive is being populated."
          />
        )}
      </div>
    </div>
  )
}
