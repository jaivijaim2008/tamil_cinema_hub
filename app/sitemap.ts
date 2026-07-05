import { MetadataRoute } from 'next'
import { client } from '../sanity/client'
import { allMovieSlugsQuery, allBlogSlugsQuery } from '../lib/queries'

export const revalidate = 3600 // Cache sitemap for 1 hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://tamilcinemahub.xyz'

  let movieSlugs: string[] = []
  let blogSlugs: string[] = []
  let genres: string[] = []
  let years: number[] = []

  // Gracefully handle missing Sanity config (e.g. during local builds)
  try {
    movieSlugs = await client.fetch<string[]>(allMovieSlugsQuery)
  } catch {
    // sitemap will just include static pages
  }

  try {
    blogSlugs = await client.fetch<string[]>(allBlogSlugsQuery)
  } catch {
    // sitemap will just include static pages
  }

  try {
    const rawGenres = await client.fetch<string[]>('*[_type == "movie"].genre[]')
    genres = [...new Set(rawGenres)].sort()
  } catch {
    // skip
  }

  try {
    const rawYears = await client.fetch<{ year: number }[]>('*[_type == "movie"]{year}')
    years = [...new Set(rawYears.map((y) => y.year))].sort((a, b) => b - a)
  } catch {
    // skip
  }

  // ── Static Pages ──────────────────────────────────────────────────────────
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${baseUrl}/movies`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/movies/latest`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/movies/top-rated`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/blogs`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/recommendations`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/privacy-policy`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  ]

  // ── Genre Pages ───────────────────────────────────────────────────────────
  const genrePages: MetadataRoute.Sitemap = genres.map((genre) => ({
    url: `${baseUrl}/movies/genres/${encodeURIComponent(genre)}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  // ── Year Pages ────────────────────────────────────────────────────────────
  const yearPages: MetadataRoute.Sitemap = years.map((year) => ({
    url: `${baseUrl}/movies/years/${year}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  // ── Dynamic Movie Pages ───────────────────────────────────────────────────
  const moviePages: MetadataRoute.Sitemap = movieSlugs.map((slug) => ({
    url: `${baseUrl}/movies/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }))

  // ── Dynamic Blog Pages ────────────────────────────────────────────────────
  const blogPages: MetadataRoute.Sitemap = blogSlugs.map((slug) => ({
    url: `${baseUrl}/blogs/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  return [
    ...staticPages,
    ...genrePages,
    ...yearPages,
    ...moviePages,
    ...blogPages,
  ]
}
