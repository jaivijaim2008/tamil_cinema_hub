import { MetadataRoute } from 'next'
import { client } from '../sanity/client'
import { allMovieSlugsQuery, allBlogSlugsQuery } from '../lib/queries'

export const revalidate = 3600 // Cache sitemap for 1 hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://tamilcinemahub.xyz'

  let movieSlugs: string[] = []
  let blogSlugs: string[] = []

  try {
    movieSlugs = await client.fetch<string[]>(allMovieSlugsQuery)
  } catch (error) {
    console.error('Error fetching movie slugs for sitemap:', error)
  }

  try {
    blogSlugs = await client.fetch<string[]>(allBlogSlugsQuery)
  } catch (error) {
    console.error('Error fetching blog slugs for sitemap:', error)
  }

  // Static Pages
  const staticPages = [
    { url: `${baseUrl}`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 1.0 },
    { url: `${baseUrl}/movies`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.7 },
    { url: `${baseUrl}/blogs`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.7 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.5 },
    { url: `${baseUrl}/privacy-policy`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.3 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.5 },
  ]

  // Dynamic Movie Pages
  const moviePages = movieSlugs.map((slug) => ({
    url: `${baseUrl}/movies/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  // Dynamic Blog Pages
  const blogPages = blogSlugs.map((slug) => ({
    url: `${baseUrl}/blogs/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }))

  return [...staticPages, ...moviePages, ...blogPages]
}
