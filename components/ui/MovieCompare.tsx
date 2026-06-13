'use client'

import { useState } from 'react'
import Link from 'next/link'
import { GitCompareArrows, ArrowRight, Users, Star, AlertCircle } from 'lucide-react'
import RatingStars from '@/components/ui/RatingStars'

interface SanityDetails {
  sharedGenres: string[]
  sameDirector: boolean
  sharedCast: string[]
  sharedOtt: string[]
  yearGap: number
  movie1: { title: string; year: number; director: string; genre: string[]; rating: number; ott?: string[] }
  movie2: { title: string; year: number; director: string; genre: string[]; rating: number; ott?: string[] }
}

interface ComparisonResult {
  source: 'ml' | 'sanity'
  similarity: {
    overall: string
    contentBased: string
    collaborative: string
  }
  sharedRecommendations: string[]
  individualRecs: Record<string, any[]>
  sanityDetails?: SanityDetails
}

interface Props {
  movieSlug: string
}

export default function MovieCompare({ movieSlug }: Props) {
  const [targetSlug, setTargetSlug] = useState('')
  const [result, setResult] = useState<ComparisonResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleCompare() {
    const target = targetSlug.trim()
    if (!target || target === movieSlug) {
      setError('Please enter a different movie slug')
      return
    }

    setLoading(true)
    setError('')
    setResult(null)

    try {
      const res = await fetch(
        `/api/recommend/compare?slug1=${encodeURIComponent(movieSlug)}&slug2=${encodeURIComponent(target)}`
      )
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Comparison failed')
      }
      const data = await res.json()
      setResult(data)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to compare movies')
    } finally {
      setLoading(false)
    }
  }

  const isSanity = result?.source === 'sanity'
  const sanityDetails = result?.sanityDetails

  return (
    <div className="mt-10 md:mt-14">
      <div className="flex items-center gap-2 mb-4">
        <GitCompareArrows size={18} className="text-accent-gold" />
        <h2 className="text-lg font-bold text-text-primary">Compare Movies</h2>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <input
          type="text"
          value={targetSlug}
          onChange={(e) => setTargetSlug(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleCompare()}
          placeholder="Enter movie slug (e.g. anniyan-2005)"
          className="flex-1 bg-bg-elevated border border-border rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-accent-gold/50 transition-colors"
        />
        <button
          onClick={handleCompare}
          disabled={loading}
          className="px-5 py-2.5 bg-accent-gold text-text-inverse text-sm font-semibold rounded-xl hover:bg-accent-gold-dim transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {loading ? (
            <span className="animate-spin w-4 h-4 border-2 border-text-inverse/30 border-t-text-inverse rounded-full" />
          ) : (
            <>
              Compare <ArrowRight size={14} />
            </>
          )}
        </button>
      </div>

      {error && (
        <p className="text-sm text-red-400 mb-4">{error}</p>
      )}

      {result && (
        <div className="space-y-6">
          {/* Source indicator for Sanity fallback */}
          {isSanity && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-accent-gold/5 border border-accent-gold/15 text-xs text-accent-gold/70">
              <AlertCircle size={12} />
              <span>ML engine is warming up — showing comparison from movie database</span>
            </div>
          )}

          {/* ML Similarity Scores */}
          {!isSanity && (
            <div className="grid grid-cols-3 gap-3">
              {Object.entries(result.similarity).map(([key, value]) => (
                <div
                  key={key}
                  className="p-3 rounded-xl bg-bg-card border border-border text-center"
                >
                  <p className="text-2xl font-bold text-accent-gold">{value}</p>
                  <p className="text-[10px] uppercase tracking-wider text-text-muted mt-1">
                    {key === 'overall' ? 'Overall' : key === 'contentBased' ? 'Content' : 'Collaborative'}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Sanity-based comparison view */}
          {isSanity && sanityDetails && (
            <div className="space-y-4">
              {/* Movie cards side by side */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-bg-card border border-border">
                  <Link href={`/movies/${movieSlug}`} className="text-sm font-semibold text-text-primary hover:text-accent-gold transition-colors">
                    {sanityDetails.movie1.title}
                  </Link>
                  <p className="text-xs text-text-muted mt-1">{sanityDetails.movie1.year} · {sanityDetails.movie1.director}</p>
                  {sanityDetails.movie1.rating > 0 && (
                    <div className="mt-1">
                      <RatingStars rating={sanityDetails.movie1.rating} />
                    </div>
                  )}
                  {sanityDetails.movie1.genre?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {sanityDetails.movie1.genre.map((g: string) => (
                        <span key={g} className="text-[10px] px-1.5 py-0.5 rounded-full bg-bg-elevated text-text-muted border border-border">
                          {g}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="p-3 rounded-xl bg-bg-card border border-border">
                  <Link href={`/movies/${targetSlug.trim()}`} className="text-sm font-semibold text-text-primary hover:text-accent-gold transition-colors">
                    {sanityDetails.movie2.title}
                  </Link>
                  <p className="text-xs text-text-muted mt-1">{sanityDetails.movie2.year} · {sanityDetails.movie2.director}</p>
                  {sanityDetails.movie2.rating > 0 && (
                    <div className="mt-1">
                      <RatingStars rating={sanityDetails.movie2.rating} />
                    </div>
                  )}
                  {sanityDetails.movie2.genre?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {sanityDetails.movie2.genre.map((g: string) => (
                        <span key={g} className="text-[10px] px-1.5 py-0.5 rounded-full bg-bg-elevated text-text-muted border border-border">
                          {g}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Similarity breakdown */}
              <div className="p-4 rounded-xl bg-bg-card border border-border">
                <div className="text-center mb-3">
                  <p className="text-3xl font-bold text-accent-gold">{result.similarity.overall}</p>
                  <p className="text-[10px] uppercase tracking-wider text-text-muted mt-1">Overall Similarity</p>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div className="text-center p-2 rounded-lg bg-bg-elevated">
                    <p className="text-lg font-bold text-text-primary">{result.similarity.contentBased}</p>
                    <p className="text-[10px] text-text-muted">Genre Match</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-bg-elevated">
                    <p className="text-lg font-bold text-text-primary">{result.similarity.collaborative}</p>
                    <p className="text-[10px] text-text-muted">
                      {sanityDetails.sameDirector ? 'Same Director' : 'Cast Overlap'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Shared details */}
              {(sanityDetails.sharedGenres.length > 0 || sanityDetails.sharedCast.length > 0) && (
                <div className="p-3 rounded-xl bg-bg-card border border-border">
                  <h4 className="text-xs font-semibold text-text-primary mb-2">What they share</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {sanityDetails.sharedGenres.map((g: string) => (
                      <span key={g} className="text-[10px] px-2 py-0.5 rounded-full bg-accent-gold/10 text-accent-gold border border-accent-gold/20">
                        {g}
                      </span>
                    ))}
                    {sanityDetails.sameDirector && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Same director
                      </span>
                    )}
                    {sanityDetails.sharedCast.map((c: string) => (
                      <span key={c} className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Shared Recommendations (ML only) */}
          {!isSanity && result.sharedRecommendations.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-text-primary mb-2 flex items-center gap-2">
                <Users size={14} className="text-accent-gold/60" />
                Movies both recommend ({result.sharedRecommendations.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {result.sharedRecommendations.map((slug) => (
                  <Link
                    key={slug}
                    href={`/movies/${slug}`}
                    className="text-xs font-medium text-text-secondary bg-bg-elevated border border-border rounded-full px-3 py-1 hover:text-accent-gold hover:border-accent-gold/30 transition-all"
                  >
                    {slug.replace(/-/g, ' ')}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
