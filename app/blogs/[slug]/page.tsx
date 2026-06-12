import { client } from '../../../sanity/client'
import { urlFor } from '../../../sanity/lib/image'
import { blogBySlugQuery, relatedBlogsQuery } from '../../../lib/queries'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import BlogDetailClient from './BlogDetailClient'

export interface BlogDetail {
  _id: string
  title: string
  slug: string
  author: string
  publishedAt: string
  category: string
  mainImage: any
  excerpt: string
  body: any[]
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

  const ogImage = blog.mainImage ? urlFor(blog.mainImage).width(1200).height(630).url() : undefined

  return {
    title: blog.seoTitle || blog.title,
    description: blog.seoDescription || blog.excerpt,
    keywords: blog.tags,
    authors: blog.author ? [{ name: blog.author }] : undefined,
    openGraph: {
      type: 'article',
      title: blog.title,
      description: blog.excerpt,
      images: ogImage ? [{ url: ogImage, width: 1200, height: 630, alt: blog.title }] : [],
      publishedTime: blog.publishedAt,
      section: blog.category,
      tags: blog.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title: blog.title,
      description: blog.excerpt,
      images: ogImage ? [ogImage] : [],
    },
    alternates: {
      canonical: `/blogs/${slug}`,
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
  let related: any[] = []

  try {
    blog = await client.fetch<BlogDetail>(blogBySlugQuery, { slug })
    if (blog) {
      related = await client.fetch<any[]>(relatedBlogsQuery, {
        category: blog.category,
        slug,
      }).catch(() => [])
    }
  } catch {}

  if (!blog) notFound()

  return <BlogDetailClient blog={blog} related={related} />
}
