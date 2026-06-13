'use client'

import { useState } from 'react'
import Link from 'next/link'
import { GitCompareArrows, ArrowRight, Users, Film, Star } from 'lucide-react'
import { RECOMMENDER_API_URL } from '@/lib/constants'
import RatingStars from '@/components/ui/RatingStars'

interface ComparisonResult {
  similarity: {
    overall: string
    contentBased: string
    collaborative: string
  }
  sharedRecommendations: string[]
  individualRecs: Record<string, any[]>
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
    if (!targetSlug.trim() || targetSlug.trim() === movieSlug) {
      setError('Please enter a different movie slug')
      return
    }

    setLoading(true)
    setError('')
    setResult(null)

    try {
      const res = await fetch(
        `/api/recommend/compare?slug1=${encodeURIComponent(movieSlug)}&slug2=${encodeURIComponent(targetSlug.trim())}`
      )
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Comparison failed')
      }
      const data = await res.json()
      setResult(data)
    } catch (err: any) {
      setError(err.message || 'Failed to compare movies')
    } finally {
      setLoading(false)
    }
  }

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
          {/* Similarity Scores */}
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

          {/* Shared Recommendations */}
          {result.sharedRecommendations.length > 0 && (
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
