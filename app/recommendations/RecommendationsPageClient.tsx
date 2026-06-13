'use client'

import Link from 'next/link'
import { Star, TrendingUp, Sparkles, ArrowRight, Cpu } from 'lucide-react'
import MovieCard from '@/components/ui/MovieCard'
import PageHeader from '@/components/ui/PageHeader'
import AdUnit from '@/components/ui/AdUnit'

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
  trending?: MovieMinimal[]
  genreSections: [string, MovieMinimal[]][]
  mlPowered?: boolean
}

export default function RecommendationsPageClient({
  topRated,
  trending = [],
  genreSections,
  mlPowered = false,
}: Props) {
  return (
    <div className="min-h-screen pt-20 md:pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <PageHeader
          label={mlPowered ? 'ML-Powered' : 'AI Picks'}
          title="Recommendations"
          description={
            mlPowered
              ? 'Powered by machine learning — ensemble of content, collaborative & knowledge-based algorithms'
              : 'Curated picks for every type of Tamil cinema fan'
          }
        />

        {/* ML Engine Status */}
        {mlPowered && (
          <div className="mb-8 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent-gold/5 border border-accent-gold/10">
            <Cpu size={14} className="text-accent-gold" />
            <span className="text-xs text-accent-gold/80 font-medium">
              Recommendations powered by ML ensemble engine — content similarity + cast network + knowledge scoring
            </span>
          </div>
        )}

        {/* Top Picks (ML) or Top Rated (Fallback) */}
        {topRated.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center gap-2 mb-4">
              <Star size={18} className="text-accent-gold fill-accent-gold" />
              <h2 className="text-lg font-bold text-text-primary">
                {mlPowered ? 'Top Picks' : 'Top Rated'}
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {topRated.map((m, i) => (
                <MovieCard key={m._id} movie={m} index={i} />
              ))}
            </div>
          </section>
        )}

        {/* Ad between sections */}
        <div className="my-4">
          <AdUnit adSlot="0000000011" className="max-w-4xl mx-auto" minHeight="100px" />
        </div>

        {/* Trending (ML-powered) */}
        {trending.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={18} className="text-emerald-400" />
              <h2 className="text-lg font-bold text-text-primary">Trending Now</h2>
            </div>
            <p className="text-sm text-text-muted mb-4">
              {mlPowered
                ? 'Trending by recency, rating quality, and cast popularity'
                : 'Great movies you might have missed'}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {trending.map((m, i) => (
                <MovieCard key={m._id} movie={m} index={i} />
              ))}
            </div>
          </section>
        )}

        {/* Ad between sections */}
        <div className="my-4">
          <AdUnit adSlot="0000000012" className="max-w-4xl mx-auto" minHeight="100px" />
        </div>

        {/* Genre Sections (ML-ranked) */}
        {genreSections.map(([genre, movies]) => (
          <section key={genre} className="mb-12">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles size={14} className="text-accent-gold/60" />
                <h2 className="text-lg font-bold text-text-primary">{genre}</h2>
              </div>
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
        {topRated.length === 0 && trending.length === 0 && genreSections.length === 0 && (
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
