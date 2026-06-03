import { client } from '@/sanity/client' // Your Sanity client

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')

  if (!query || query.length < 2) {
    return Response.json({ results: [] })
  }

  try {
    // Search in Sanity CMS
    const results = await client.fetch(`
      *[_type == "movie" && (
        title match "*${query}*" || 
        cast[].actor.name match "*${query}*" ||
        director.name match "*${query}*"
      )] | order(year desc) [0...10] {
        _id,
        title,
        year,
        genre,
        slug,
        "genre": genre[]->name
      }
    `)

    return Response.json({ results })
  } catch (error) {
    console.error('Search error:', error)
    return Response.json({ results: [], error: 'Search failed' }, { status: 500 })
  }
}