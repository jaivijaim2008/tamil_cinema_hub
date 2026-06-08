'use client'

import Link from 'next/link'
import { urlFor } from '../sanity/lib/image'
import TiltCard from './TiltCard'

export interface Blog {
  _id: string
  title: string
  slug: string
  author: string
  publishedAt: string
  category: 'Review' | 'Top List' | 'News' | 'Actor' | 'Director' | string
  mainImage?: any
  excerpt: string
  tags?: string[]
  commentCount?: number
  likes?: number
}

interface BlogCardProps {
  blog: Blog
  index?: number
}

const CATEGORY_TAG_CLASS: Record<string, string> = {
  Review: 'tag-review-dark',
  'Top List': 'tag-toplist-dark',
  News: 'tag-news-dark',
  Actor: 'tag-actor-dark',
  Director: 'tag-director-dark',
}

const BANNER_CLASSES = ['blog-banner-1', 'blog-banner-2', 'blog-banner-3', 'blog-banner-4', 'blog-banner-5']

export default function BlogCard({ blog, index = 0 }: BlogCardProps) {
  const imageUrl = blog.mainImage
    ? urlFor(blog.mainImage).width(600).height(340).quality(90).fit('max').url()
    : null

  const formattedDate = new Date(blog.publishedAt).toLocaleDateString('en-US', {
    day: 'numeric', month: 'short', year: 'numeric',
  })

  const tagClass = CATEGORY_TAG_CLASS[blog.category] || 'tag-review-dark'
  const bannerClass = BANNER_CLASSES[index % BANNER_CLASSES.length]
  const isFeatured = index === 0
  const watermarkText = blog.category === 'Top List' ? 'TOP 10' : blog.category.toUpperCase()

  return (
    <TiltCard className={`blog-card-dark ${isFeatured ? 'featured' : ''}`} maxTilt={6} perspective={1000} scale={1.02}>
      <Link href={`/blogs/${blog.slug}`} style={{ display: 'block', height: '100%' }}>
        {imageUrl ? (
          <div className="blog-card-image-dark">
            <img src={imageUrl} alt={blog.title} loading="lazy" />
            <span className={`blog-category-tag-dark ${tagClass}`}>{blog.category}</span>
          </div>
        ) : (
          <div className={`blog-banner-dark ${bannerClass}`}>
            <span className={`blog-category-tag-dark ${tagClass}`}>{blog.category}</span>
            <span className="blog-watermark-dark" style={isFeatured ? {} : { fontSize: 32 }}>{watermarkText}</span>
          </div>
        )}
        <div className="blog-body-dark">
          <span className="blog-author-dark">{blog.author} · {formattedDate}</span>
          <h3 className="blog-title-dark">{blog.title}</h3>
          {blog.excerpt && <p className="blog-excerpt-dark">{blog.excerpt}</p>}
          <span className="blog-read-link-dark">
            Read article →
          </span>
        </div>
      </Link>
    </TiltCard>
  )
}
