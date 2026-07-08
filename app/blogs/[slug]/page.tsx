import { client } from '../../../sanity/client'
import { urlFor } from '../../../sanity/lib/image'
import { blogBySlugQuery, relatedBlogsQuery } from '../../../lib/queries'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import BlogDetailClient from './BlogDetailClient'
import type { SanityImage, SanityImageBlock, PortableTextBlock, Blog } from '@/lib/types'

export interface BlogDetail {
  _id: string
  title: string
  slug: string
  author: string
  publishedAt: string
  category: string
  mainImage?: SanityImage
  excerpt: string
  body?: (PortableTextBlock | SanityImageBlock)[]
  seoTitle?: string
  seoDescription?: string
  tags?: string[]
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const blog = await client.fetch<BlogDetail>(blogBySlugQuery, { slug })
  if (!blog) return { title: 'Post Not Found' }

  const ogImage = blog.mainImage
    ? urlFor(blog.mainImage).width(1200).height(630).url()
    : undefined

  const title = blog.seoTitle || blog.title
  const description = blog.seoDescription || blog.excerpt || blog.title
  const url = `https://tamilcinemahub.xyz/blogs/${slug}`
  const siteName = 'TamilCinemaHub'

  return {
    title,
    description,
    keywords: blog.tags,
    authors: blog.author ? [{ name: blog.author }] : undefined,
    openGraph: {
      type: 'article',
      title,
      description,
      url,
      siteName,
      locale: 'en_US',
      images: ogImage
        ? [{
            url: ogImage,
            width: 1200,
            height: 630,
            alt: blog.title,
            type: 'image/jpeg',
          }]
        : [],
      publishedTime: blog.publishedAt,
      modifiedTime: blog.publishedAt,
      section: blog.category,
      tags: blog.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ogImage ? [{ url: ogImage, alt: blog.title, width: 1200, height: 630 }] : [],
      creator: '@TamilCinemaHub',
      site: '@TamilCinemaHub',
    },
    alternates: {
      canonical: url,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  }
}

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  let blog: BlogDetail | null = null
  let related: Blog[] = []

  try {
    blog = await client.fetch<BlogDetail>(blogBySlugQuery, { slug })
    if (blog) {
      related = await client.fetch<Blog[]>(relatedBlogsQuery, {
        category: blog.category,
        slug,
      }).catch(() => [])
    }
  } catch {}

  if (!blog) notFound()

  return <BlogDetailClient blog={blog} related={related} />
}
