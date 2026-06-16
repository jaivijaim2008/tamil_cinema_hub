'use client'

import { useState } from 'react'
import Link from 'next/link'
import { GitCompareArrows, ArrowRight, Users, AlertCircle, Search, Film, X } from 'lucide-react'
import RatingStars from '@/components/ui/RatingStars'
import PageHeader from '@/components/ui/PageHeader'

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
  individualRecs: Record<string, Array<{ slug: string; title?: string; year?: number; score?: number }>>
  sanityDetails?: SanityDetails
}

export default function ComparePageClient() {
  const [slug1, setSlug1] = useState('')
  const [slug2, setSlug2] = useState('')
  const [result, setResult] = useState<ComparisonResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleCompare() {
    const s1 = slug1.trim()
    const s2 = slug2.trim()
    if (!s1 || !s2) {
      setError('Please enter both movie slugs')
      return
    }
    if (s1 === s2) {
      setError('Please enter two different movies')
      return
    }

    setLoading(true)
    setError('')
    setResult(null)

    try {
      const res = await fetch(
        `/api/recommend/compare?slug1=${encodeURIComponent(s1)}&slug2=${encodeURIComponent(s2)}`
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
    <div className="min-h-screen pt-20 md:pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <PageHeader
          label="Tools"
          title="Compare Movies"
          description="Compare two Tamil movies side by side — similarity scores, shared genres, cast overlap & more"
        />

        {/* Input area */}
        <div className="p-5 rounded-2xl bg-bg-card border border-border mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-3 items-end">
            <div>
              <label className="text-xs font-medium text-text-muted mb-1.5 block">First movie slug</label>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  type="text"
                  value={slug1}
                  onChange={(e) => setSlug1(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && slug2 && handleCompare()}
                  placeholder="e.g. anniyan-2005"
                  className="w-full bg-bg-elevated border border-border rounded-xl pl-9 pr-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-accent-gold/50 transition-colors"
                />
              </div>
            </div>

            <div className="hidden sm:flex items-center justify-center pb-1">
              <GitCompareArrows size={20} className="text-accent-gold/40" />
            </div>

            <div>
              <label className="text-xs font-medium text-text-muted mb-1.5 block">Second movie slug</label>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  type="text"
                  value={slug2}
                  onChange={(e) => setSlug2(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && slug1 && handleCompare()}
                  placeholder="e.g. sivaji-2007"
                  className="w-full bg-bg-elevated border border-border rounded-xl pl-9 pr-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-accent-gold/50 transition-colors"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-4">
            <button
              onClick={handleCompare}
              disabled={loading || !slug1.trim() || !slug2.trim()}
              className="px-6 py-2.5 bg-accent-gold text-text-inverse text-sm font-semibold rounded-xl hover:bg-accent-gold-dim transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <span className="animate-spin w-4 h-4 border-2 border-text-inverse/30 border-t-text-inverse rounded-full" />
              ) : (
                <>
                  Compare <ArrowRight size={14} />
                </>
              )}
            </button>
            {result && (
              <button
                onClick={() => { setResult(null); setSlug1(''); setSlug2('') }}
                className="px-4 py-2.5 text-sm text-text-muted border border-border rounded-xl hover:text-text-primary hover:border-accent-gold/30 transition-colors flex items-center gap-1.5"
              >
                <X size={14} /> Clear
              </button>
            )}
          </div>

          {error && (
            <p className="text-sm text-red-400 mt-3">{error}</p>
          )}
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-6 animate-fade-in">
            {/* Sanity fallback notice */}
            {isSanity && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-accent-gold/5 border border-accent-gold/15 text-xs text-accent-gold/70">
                <AlertCircle size={14} />
                <span>ML engine is warming up — showing comparison from movie database</span>
              </div>
            )}

            {/* ML Similarity Scores */}
            {!isSanity && (
              <div className="grid grid-cols-3 gap-4">
                {Object.entries(result.similarity).map(([key, value]) => (
                  <div key={key} className="p-4 rounded-2xl bg-bg-card border border-border text-center">
                    <p className="text-3xl font-bold text-accent-gold">{value}</p>
                    <p className="text-[11px] uppercase tracking-wider text-text-muted mt-1.5">
                      {key === 'overall' ? 'Overall' : key === 'contentBased' ? 'Content Match' : 'Collaborative'}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Sanity comparison */}
            {isSanity && sanityDetails && (
              <div className="space-y-4">
                {/* Side by side cards */}
                <div className="grid grid-cols-2 gap-4">
                  {[sanityDetails.movie1, sanityDetails.movie2].map((m, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-bg-card border border-border">
                      <Link
                        href={`/movies/${idx === 0 ? slug1.trim() : slug2.trim()}`}
                        className="text-base font-bold text-text-primary hover:text-accent-gold transition-colors"
                      >
                        {m.title}
                      </Link>
                      <p className="text-xs text-text-muted mt-1">{m.year} · {m.director}</p>
                      {m.rating > 0 && (
                        <div className="mt-2">
                          <RatingStars rating={m.rating} />
                        </div>
                      )}
                      {m.genre?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {m.genre.map((g: string) => (
                            <span key={g} className="text-[10px] px-2 py-0.5 rounded-full bg-bg-elevated text-text-muted border border-border">
                              {g}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Similarity card */}
                <div className="p-5 rounded-2xl bg-bg-card border border-border">
                  <div className="text-center mb-4">
                    <p className="text-4xl font-bold text-accent-gold">{result.similarity.overall}</p>
                    <p className="text-[11px] uppercase tracking-wider text-text-muted mt-1">Overall Similarity</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-3 rounded-xl bg-bg-elevated">
                      <p className="text-xl font-bold text-text-primary">{result.similarity.contentBased}</p>
                      <p className="text-[10px] text-text-muted">Genre Match</p>
                    </div>
                    <div className="text-center p-3 rounded-xl bg-bg-elevated">
                      <p className="text-xl font-bold text-text-primary">{result.similarity.collaborative}</p>
                      <p className="text-[10px] text-text-muted">
                        {sanityDetails.sameDirector ? 'Same Director' : 'Cast Overlap'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Shared details */}
                {(sanityDetails.sharedGenres.length > 0 || sanityDetails.sharedCast.length > 0 || sanityDetails.sameDirector) && (
                  <div className="p-4 rounded-2xl bg-bg-card border border-border">
                    <h4 className="text-sm font-semibold text-text-primary mb-3">What they share</h4>
                    <div className="flex flex-wrap gap-2">
                      {sanityDetails.sharedGenres.map((g: string) => (
                        <span key={g} className="text-xs px-2.5 py-1 rounded-full bg-accent-gold/10 text-accent-gold border border-accent-gold/20">
                          {g}
                        </span>
                      ))}
                      {sanityDetails.sameDirector && (
                        <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Same director
                        </span>
                      )}
                      {sanityDetails.sharedCast.map((c: string) => (
                        <span key={c} className="text-xs px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          {c}
                        </span>
                      ))}
                      {sanityDetails.sharedOtt?.map((o: string) => (
                        <span key={o} className="text-xs px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                          {o}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Shared recommendations (ML only) */}
            {!isSanity && result.sharedRecommendations.length > 0 && (
              <div className="p-4 rounded-2xl bg-bg-card border border-border">
                <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
                  <Users size={14} className="text-accent-gold/60" />
                  Movies both recommend ({result.sharedRecommendations.length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {result.sharedRecommendations.map((recSlug) => (
                    <Link
                      key={recSlug}
                      href={`/movies/${recSlug}`}
                      className="text-xs font-medium text-text-secondary bg-bg-elevated border border-border rounded-full px-3 py-1.5 hover:text-accent-gold hover:border-accent-gold/30 transition-all flex items-center gap-1"
                    >
                      <Film size={10} />
                      {recSlug.replace(/-/g, ' ')}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Empty state tip */}
        {!result && !loading && (
          <div className="text-center py-12">
            <GitCompareArrows size={40} className="text-text-muted mx-auto mb-4" />
            <p className="text-sm text-text-muted max-w-md mx-auto">
              Enter two movie slugs above to compare them. You can find slugs in the URL when viewing a movie
              (e.g. <code className="text-accent-gold/60">/movies/anniyan-2005</code> → slug is <code className="text-accent-gold/60">anniyan-2005</code>)
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
