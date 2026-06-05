import { client } from '@/sanity/lib/client'

/**
 * Sanitize user input for safe use in GROQ match expressions.
 * Strips characters that could alter query semantics.
 * GROQ match uses * as a wildcard, so we escape it for literal matching.
 */
function sanitizeQuery(raw: string): string {
  // Remove everything except alphanumeric, spaces, hyphens, and apostrophes
  return raw.replace(/[^a-zA-Z0-9\s'\-]/g, '').trim()
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const rawQuery = searchParams.get('q')

  if (!rawQuery || rawQuery.length < 2) {
    return Response.json({ results: [] })
  }

  const query = sanitizeQuery(rawQuery)
  if (query.length < 2) {
    return Response.json({ results: [] })
  }

  try {
    // Use parameterized query to prevent injection
    // GROQ match with * wildcard for prefix matching
    const results = await client.fetch(
      `*[_type == "movie" && (
        title match $q ||
        director match $q
      )] | order(year desc) [0...10] {
        _id,
        title,
        year,
        genre,
        slug
      }`,
      { q: `*${query}*` }
    )

    return Response.json({ results })
  } catch (error) {
    console.error('Search error:', error)
    return Response.json({ results: [], error: 'Search failed' }, { status: 500 })
  }
}