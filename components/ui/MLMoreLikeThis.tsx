'use client'

import { useState, useEffect } from 'react'
import { Sparkles } from 'lucide-react'
import { RECOMMENDER_API_URL } from '@/lib/constants'
import MovieCard from '@/components/ui/MovieCard'

interface MlRecommendation {
  title: string
  slug: string
  year: number
  director: string
  genre: string[]
  rating: number
  score: number
}

interface MlResponse {
  movie: string
  total_results: number
  recommendations: MlRecommendation[]
  algorithm: string
}

interface EnrichedMovie {
  _id: string
  title: string
  slug: string
  year: number
  director: string
  genre: string[]
  rating: number
}

interface Props {
  movieSlug: string
}

export default function MLMoreLikeThis({ movieSlug }: Props) {
  const [recommendations, setRecommendations] = useState<EnrichedMovie[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [algorithm, setAlgorithm] = useState('')

  useEffect(() => {
    let cancelled = false

    async function fetchRecommendations() {
      try {
        const res = await fetch(
          `${RECOMMENDER_API_URL}/recommend/${encodeURIComponent(movieSlug)}?n=6`
        )
        if (!res.ok) throw new Error('ML API unavailable')
        const data: MlResponse = await res.json()

        if (cancelled) return
        setAlgorithm(data.algorithm || 'ensemble-hybrid')

        // Enrich with Sanity poster data
        const slugs = data.recommendations.map((r) => r.slug)
        try {
          const sanityRes = await fetch('/api/movies/by-slugs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ slugs }),
          })

          if (sanityRes.ok) {
            const sanityData: { movies?: EnrichedMovie[] } = await sanityRes.json()
            const sanityMap = new Map(
              (sanityData.movies || []).map((m: EnrichedMovie) => [m.slug, m])
            )

            const enriched: EnrichedMovie[] = data.recommendations.map((r) => {
              const sanity = sanityMap.get(r.slug)
              return sanity || {
                _id: r.slug,
                title: r.title,
                slug: r.slug,
                year: r.year,
                director: r.director,
                genre: r.genre,
                rating: r.rating,
              }
            })
            setRecommendations(enriched)
          } else {
            setRecommendations(
              data.recommendations.map((r) => ({
                _id: r.slug,
                title: r.title,
                slug: r.slug,
                year: r.year,
                director: r.director,
                genre: r.genre,
                rating: r.rating,
              }))
            )
          }
        } catch {
          setRecommendations(
            data.recommendations.map((r) => ({
              _id: r.slug,
              title: r.title,
              slug: r.slug,
              year: r.year,
              director: r.director,
              genre: r.genre,
              rating: r.rating,
            }))
          )
        }
      } catch {
        if (!cancelled) setError(true)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchRecommendations()
    return () => {
      cancelled = true
    }
  }, [movieSlug])

  if (loading) {
    return (
      <div className="mt-10 md:mt-14">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles size={18} className="text-accent-gold" />
          <h2 className="text-lg font-bold text-text-primary">More Like This</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="aspect-[2/3] rounded-xl bg-bg-card border border-border/30 animate-pulse"
            />
          ))}
        </div>
      </div>
    )
  }

  if (error || recommendations.length === 0) return null

  return (
    <div className="mt-10 md:mt-14">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles size={18} className="text-accent-gold" />
          <h2 className="text-lg font-bold text-text-primary">More Like This</h2>
        </div>
        {algorithm && (
          <span className="text-[10px] uppercase tracking-wider text-text-muted/50 font-medium px-2 py-1 rounded-full bg-white/[0.03] border border-white/[0.06]">
            {algorithm}
          </span>
        )}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {recommendations.map((m, i) => (
          <MovieCard key={m._id} movie={m} index={i} />
        ))}
      </div>
    </div>
  )
}
