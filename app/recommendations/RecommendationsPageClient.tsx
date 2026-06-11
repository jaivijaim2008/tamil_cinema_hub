'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Star, TrendingUp, Gem, ArrowRight } from 'lucide-react'
import { urlFor } from '@/sanity/lib/image'
import MovieCard from '@/components/ui/MovieCard'
import PageHeader from '@/components/ui/PageHeader'

interface MovieMinimal {
  _id: string
  title: string
  slug: string
  year: number
  director?: string
  genre?: string[]
  rating?: number
  poster?: any
  posterUrl?: string | null
}

interface Props {
  topRated: MovieMinimal[]
  hiddenGems: MovieMinimal[]
  genreSections: [string, MovieMinimal[]][]
}

export default function RecommendationsPageClient({ topRated, hiddenGems, genreSections }: Props) {
  return (
    <div className="min-h-screen pt-20 md:pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <PageHeader
          label="AI Picks"
          title="Recommendations"
          description="Curated picks for every type of Tamil cinema fan"
        />

        {/* Top Rated */}
        {topRated.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center gap-2 mb-4">
              <Star size={18} className="text-accent-gold fill-accent-gold" />
              <h2 className="text-lg font-bold text-text-primary">Top Rated</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {topRated.map((m, i) => (
                <MovieCard key={m._id} movie={m} index={i} />
              ))}
            </div>
          </section>
        )}

        {/* Hidden Gems */}
        {hiddenGems.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center gap-2 mb-4">
              <Gem size={18} className="text-purple-400" />
              <h2 className="text-lg font-bold text-text-primary">Hidden Gems</h2>
            </div>
            <p className="text-sm text-text-muted mb-4">Great movies you might have missed</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {hiddenGems.map((m, i) => (
                <MovieCard key={m._id} movie={m} index={i} />
              ))}
            </div>
          </section>
        )}

        {/* Genre Sections */}
        {genreSections.map(([genre, movies]) => (
          <section key={genre} className="mb-12">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-text-primary">{genre}</h2>
              <Link
                href={`/movies?genre=${encodeURIComponent(genre)}`}
                className="flex items-center gap-1 text-xs text-accent-gold hover:text-accent-gold-dim transition-colors font-medium"
              >
                View all <ArrowRight size={12} />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {movies.slice(0, 6).map((m, i) => (
                <MovieCard key={m._id} movie={m} index={i} />
              ))}
            </div>
          </section>
        ))}

        {/* Empty state */}
        {topRated.length === 0 && hiddenGems.length === 0 && genreSections.length === 0 && (
          <div className="text-center py-20">
            <TrendingUp size={48} className="text-text-muted mx-auto mb-4" />
            <h3 className="text-lg font-bold text-text-primary mb-2">No recommendations yet</h3>
            <p className="text-sm text-text-muted">We need more movies in the database to generate recommendations.</p>
          </div>
        )}
      </div>
    </div>
  )
}
