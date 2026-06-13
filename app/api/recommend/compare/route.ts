import { NextResponse } from 'next/server'
import { client } from '@/sanity/client'
import { RECOMMENDER_API_URL } from '@/lib/constants'

const ML_TIMEOUT = 8000 // 8s timeout for ML API calls

interface SanityCastMember {
  name: string
}

interface SanityMovie {
  _id: string
  title: string
  slug: string
  year: number
  director: string
  genre: string[]
  rating: number
  cast?: SanityCastMember[]
  synopsis?: string
  ottPlatform?: string
}

/**
 * GET /api/recommend/compare?slug1=movie-a&slug2=movie-b
 *
 * Compares two movies side-by-side.
 * Primary: ML engine scores (hybrid, content, collaborative).
 * Fallback: Sanity data comparison (shared genre, director, cast analysis).
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

  // Try ML engine first, fall back to Sanity-based comparison
  try {
    const signal = AbortSignal.timeout(ML_TIMEOUT)

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

    // Check if we got any ML data at all
    const hasMlData = hybridData1 || hybridData2 || contentData1 || contentData2

    if (!hasMlData) {
      throw new Error('ML engine returned no data')
    }

    const findScore = (data: Record<string, unknown> | null, targetSlug: string): number => {
      const recs = data?.recommendations as Array<{ slug: string; score: number }> | undefined
      if (!recs) return 0
      const found = recs.find((r) => r.slug === targetSlug)
      return found?.score || 0
    }

    const crossSimilarity = {
      hybrid: (findScore(hybridData1, slug2) + findScore(hybridData2, slug1)) / 2,
      content: (findScore(contentData1, slug2) + findScore(contentData2, slug1)) / 2,
      collaborative: (findScore(collabData1, slug2) + findScore(collabData2, slug1)) / 2,
    }

    type RecEntry = { slug: string }
    const shared1 = new Set<string>(
      ((hybridData1?.recommendations as RecEntry[] | undefined) || []).map((r) => r.slug)
    )
    const shared2 = new Set<string>(
      ((hybridData2?.recommendations as RecEntry[] | undefined) || []).map((r) => r.slug)
    )
    const sharedRecommendations = [...shared1].filter((slug) => shared2.has(slug))

    return NextResponse.json({
      source: 'ml',
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
  } catch (mlError) {
    // ML engine unavailable — fall back to Sanity-based comparison
    console.warn('ML engine unavailable, using Sanity fallback:', (mlError as Error).message)
    return sanityFallback(slug1, slug2)
  }
}

async function sanityFallback(slug1: string, slug2: string) {
  try {
    const movies = await client.fetch<SanityMovie[]>(
      `*[_type == "movie" && slug.current in [$slug1, $slug2]] {
        _id, title, "slug": slug.current, year, director, genre, rating, cast[]{ name }, synopsis, ottPlatform
      }`,
      { slug1, slug2 }
    )

    const m1 = movies.find((m) => m.slug === slug1)
    const m2 = movies.find((m) => m.slug === slug2)

    if (!m1 || !m2) {
      return NextResponse.json(
        { error: 'One or both movies not found' },
        { status: 404 }
      )
    }

    // Genre overlap analysis
    const genres1 = new Set(m1.genre || [])
    const genres2 = new Set(m2.genre || [])
    const sharedGenres = [...genres1].filter((g) => genres2.has(g))
    const totalGenres = new Set([...genres1, ...genres2])
    const genreSimilarity = totalGenres.size > 0
      ? (sharedGenres.length / totalGenres.size) * 100
      : 0

    // Director match
    const sameDirector = m1.director && m2.director
      ? m1.director.toLowerCase() === m2.director.toLowerCase()
      : false

    // Cast overlap — Sanity returns { name: string }[]
    const cast1 = new Set((m1.cast || []).map((c: SanityCastMember) => c.name?.toLowerCase()).filter(Boolean))
    const cast2 = new Set((m2.cast || []).map((c: SanityCastMember) => c.name?.toLowerCase()).filter(Boolean))
    const sharedCast = [...cast1].filter((c) => cast2.has(c))

    // Year proximity (closer = more similar era)
    const yearDiff = Math.abs((m1.year || 0) - (m2.year || 0))
    const eraSimilarity = Math.max(0, 100 - yearDiff * 2) // lose 2% per year apart

    // OTT platform overlap — ottPlatform is a single string, not an array
    const ottPlatform1 = m1.ottPlatform?.toLowerCase() || ''
    const ottPlatform2 = m2.ottPlatform?.toLowerCase() || ''
    const sharedOtt = ottPlatform1 && ottPlatform2 && ottPlatform1 === ottPlatform2 ? [ottPlatform1] : []

    // Rating proximity
    const ratingDiff = Math.abs((m1.rating || 0) - (m2.rating || 0))
    const ratingSimilarity = Math.max(0, 100 - ratingDiff * 20)

    // Overall similarity (weighted average)
    const overall = (
      genreSimilarity * 0.35 +
      (sameDirector ? 100 : 0) * 0.15 +
      (sharedCast.length > 0 ? Math.min(sharedCast.length * 25, 100) : 0) * 0.15 +
      eraSimilarity * 0.15 +
      ratingSimilarity * 0.2
    ).toFixed(1)

    return NextResponse.json({
      source: 'sanity',
      movies: {
        [slug1]: { title: m1.title, slug: m1.slug, year: m1.year, rating: m1.rating },
        [slug2]: { title: m2.title, slug: m2.slug, year: m2.year, rating: m2.rating },
      },
      similarity: {
        overall: overall + '%',
        contentBased: genreSimilarity.toFixed(1) + '%',
        collaborative: sameDirector ? '100.0%' : sharedCast.length > 0 ? Math.min(sharedCast.length * 25, 100).toFixed(1) + '%' : '0.0%',
      },
      sanityDetails: {
        sharedGenres,
        sameDirector,
        sharedCast: sharedCast.slice(0, 5),
        sharedOtt,
        yearGap: yearDiff,
        movie1: {
          title: m1.title,
          year: m1.year,
          director: m1.director,
          genre: m1.genre,
          rating: m1.rating,
          ott: m1.ottPlatform ? [m1.ottPlatform] : [],
        },
        movie2: {
          title: m2.title,
          year: m2.year,
          director: m2.director,
          genre: m2.genre,
          rating: m2.rating,
          ott: m2.ottPlatform ? [m2.ottPlatform] : [],
        },
      },
      sharedRecommendations: [],
      individualRecs: {},
    })
  } catch (error) {
    console.error('Sanity fallback comparison error:', error)
    return NextResponse.json(
      { error: 'Failed to compare movies. Please try again.' },
      { status: 500 }
    )
  }
}
