import { client } from '../sanity/client'
import { latestMoviesQuery, latestBlogsQuery } from '../lib/queries'
import type { Movie } from '../components/MovieCard'
import type { Blog } from '../components/BlogCard'
import HomePageClient from './HomePageClient'

export const revalidate = 60

export const metadata = {
  title: 'TamilCinemaHub — Tamil Movie Reviews, Database & Recommendations',
  description: 'The ultimate Tamil cinema database. Discover 1600+ Tamil movies from 2000 to 2026, read reviews, and get AI-powered personalized recommendations.',
  openGraph: {
    title: 'TamilCinemaHub — Tamil Movie Reviews, Database & Recommendations',
    description: 'The ultimate Tamil cinema database. Discover 1600+ Tamil movies from 2000 to 2026.',
    type: 'website' as const,
    url: 'https://tamilcinemahub.xyz',
    images: [{ url: 'https://tamilcinemahub.xyz/opengraph-image', width: 1200, height: 630, alt: 'TamilCinemaHub' }],
  },
  twitter: {
    card: 'summary_large_image' as const,
    title: 'TamilCinemaHub — Tamil Movie Reviews, Database & Recommendations',
    description: 'The ultimate Tamil cinema database. 1600+ movies, reviews, AI recommendations.',
    images: ['https://tamilcinemahub.xyz/opengraph-image'],
  },
  alternates: { canonical: 'https://tamilcinemahub.xyz' },
}

async function getData() {
  try {
    const movies = await client.fetch<Movie[]>(latestMoviesQuery)
    const blogs = await client.fetch<Blog[]>(latestBlogsQuery)
    return { movies, blogs }
  } catch (error) {
    console.error('Error fetching homepage data:', error)
    return { movies: [], blogs: [] }
  }
}

export default async function HomePage() {
  const { movies, blogs } = await getData()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'TamilCinemaHub',
    url: 'https://tamilcinemahub.xyz',
    description: 'Your complete guide to Tamil cinema. 1600+ movies from 2000 to 2026.',
    potentialAction: { '@type': 'SearchAction', target: 'https://tamilcinemahub.xyz/movies?q={search_term_string}', 'query-input': 'required name=search_term_string' },
    publisher: { '@type': 'Organization', name: 'TamilCinemaHub', url: 'https://tamilcinemahub.xyz' },
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <HomePageClient movies={movies} blogs={blogs} />
    </>
  )
}
