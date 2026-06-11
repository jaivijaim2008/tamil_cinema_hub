import { client } from '../../../../sanity/client'
import YearPageClient from './YearPageClient'

export async function generateMetadata({ params }: { params: Promise<{ year: string }> }) {
  const { year } = await params
  return {
    title: `Tamil Movies from ${year}`,
    description: `Browse all Tamil films released in ${year}`,
  }
}

export default async function YearPage({ params }: { params: Promise<{ year: string }> }) {
  const { year } = await params
  const yearNum = parseInt(year)

  let movies: any[] = []
  try {
    movies = await client.fetch<any[]>(
      `*[_type == "movie" && year == $yearNum] | order(title asc) {
        _id, title, titleTanglish, "slug": slug.current, year, director, cast, genre, rating, poster, posterUrl, synopsis
      }`,
      { yearNum }
    ).catch(() => [])
  } catch {}

  return <YearPageClient year={yearNum} movies={movies} />
}
