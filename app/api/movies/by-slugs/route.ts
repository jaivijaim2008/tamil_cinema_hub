import { client } from '@/sanity/client'

/**
 * POST /api/movies/by-slugs
 * Body: { slugs: string[] }
 * Returns Sanity movie data (with poster URLs) for the given slugs.
 * Used to fetch Sanity movie data by slug for various client components.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const slugs: string[] = body.slugs

    if (!Array.isArray(slugs) || slugs.length === 0) {
      return Response.json({ movies: [] })
    }

    // Limit to 20 slugs per request
    const limitedSlugs = slugs.slice(0, 20)

    const movies = await client.fetch(
      `*[_type == "movie" && slug.current in $slugs] {
        _id,
        title,
        "slug": slug.current,
        year,
        director,
        genre,
        rating,
        poster,
        posterUrl,
        backdropUrl
      }`,
      { slugs: limitedSlugs }
    )

    return Response.json({ movies })
  } catch (error) {
    console.error('Movies by slugs error:', error)
    return Response.json({ movies: [], error: 'Failed to fetch movies' }, { status: 500 })
  }
}
