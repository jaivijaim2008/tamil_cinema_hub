import { NextResponse } from 'next/server'
import { RECOMMENDER_API_URL } from '@/lib/constants'

const ML_TIMEOUT = 10000 // 10s timeout for ML API calls

/**
 * GET /api/recommend/compare?slug1=movie-a&slug2=movie-b
 *
 * Compares two movies side-by-side using the ML engine's individual algorithm scores.
 * Returns individual scores from content, collaborative, and hybrid algorithms,
 * plus shared cast/director analysis.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const slug1 = searchParams.get('slug1')
  const slug2 = searchParams.get('slug2')

  if (!slug1 || !slug2) {
    return NextResponse.json(
      { error: 'Missing slug1 or slug2 parameters' },
      { status: 400 }
    )
  }

  try {
    const signal = AbortSignal.timeout(ML_TIMEOUT)

    // Fetch all three algorithm scores for both movies in parallel
    const [rec1, rec2, content1, content2, collab1, collab2] = await Promise.all([
      fetch(`${RECOMMENDER_API_URL}/recommend/${encodeURIComponent(slug1)}?n=10`, { signal }),
      fetch(`${RECOMMENDER_API_URL}/recommend/${encodeURIComponent(slug2)}?n=10`, { signal }),
      fetch(`${RECOMMENDER_API_URL}/recommend/${encodeURIComponent(slug1)}/content?n=10`, { signal }),
      fetch(`${RECOMMENDER_API_URL}/recommend/${encodeURIComponent(slug2)}/content?n=10`, { signal }),
      fetch(`${RECOMMENDER_API_URL}/recommend/${encodeURIComponent(slug1)}/collaborative?n=10`, { signal }),
      fetch(`${RECOMMENDER_API_URL}/recommend/${encodeURIComponent(slug2)}/collaborative?n=10`, { signal }),
    ])

    const [
      hybridData1,
      hybridData2,
      contentData1,
      contentData2,
      collabData1,
      collabData2,
    ] = await Promise.all([
      rec1.ok ? rec1.json() : null,
      rec2.ok ? rec2.json() : null,
      content1.ok ? content1.json() : null,
      content2.ok ? content2.json() : null,
      collab1.ok ? collab1.json() : null,
      collab2.ok ? collab2.json() : null,
    ])

    // Find how similar these two movies are to each other
    const findScore = (data: Record<string, unknown> | null, targetSlug: string): number => {
      const recs = data?.recommendations as Array<{ slug: string; score: number }> | undefined
      if (!recs) return 0
      const found = recs.find((r) => r.slug === targetSlug)
      return found?.score || 0
    }

    // Cross-similarity: how much movie1 recommends movie2 and vice versa
    const crossSimilarity = {
      hybrid: (findScore(hybridData1, slug2) + findScore(hybridData2, slug1)) / 2,
      content: (findScore(contentData1, slug2) + findScore(contentData2, slug1)) / 2,
      collaborative: (findScore(collabData1, slug2) + findScore(collabData2, slug1)) / 2,
    }

    // Shared connections: movies that both recommend
    type RecEntry = { slug: string }
    const shared1 = new Set<string>(
      ((hybridData1?.recommendations as RecEntry[] | undefined) || []).map((r) => r.slug)
    )
    const shared2 = new Set<string>(
      ((hybridData2?.recommendations as RecEntry[] | undefined) || []).map((r) => r.slug)
    )
    const sharedRecommendations = [...shared1].filter((slug) => shared2.has(slug))

    return NextResponse.json({
      movies: {
        [slug1]: (hybridData1?.recommendations as RecEntry[] | undefined)?.[0] || { slug: slug1 },
        [slug2]: (hybridData2?.recommendations as RecEntry[] | undefined)?.[0] || { slug: slug2 },
      },
      similarity: {
        overall: (crossSimilarity.hybrid * 100).toFixed(1) + '%',
        contentBased: (crossSimilarity.content * 100).toFixed(1) + '%',
        collaborative: (crossSimilarity.collaborative * 100).toFixed(1) + '%',
      },
      sharedRecommendations: sharedRecommendations.slice(0, 6),
      individualRecs: {
        [slug1]: ((hybridData1?.recommendations as RecEntry[]) || []).slice(0, 6),
        [slug2]: ((hybridData2?.recommendations as RecEntry[]) || []).slice(0, 6),
      },
    })
  } catch (error) {
    console.error('Movie comparison error:', error)
    return NextResponse.json(
      { error: 'Failed to compare movies. ML engine may be unavailable.' },
      { status: 500 }
    )
  }
}
