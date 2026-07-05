'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Calendar, User, Tag, Clock, Share2 } from 'lucide-react'
import type { BlogDetail, Blog, PortableTextBlock } from '@/lib/types'
import { urlFor } from '@/sanity/lib/image'
import PortableText from '@/components/ui/PortableText'
import BlogCard from '@/components/ui/BlogCard'
import MonetagAd from '@/components/ui/MonetagAd'

interface Props {
  blog: BlogDetail
  related: Blog[]
}

const categoryColors: Record<string, string> = {
  Review: '#E8B84B',
  'Top List': '#3b82f6',
  News: '#ef4444',
  Actor: '#a855f7',
  Director: '#06b6d4',
  Feature: '#22c55e',
}

export default function BlogDetailClient({ blog, related }: Props) {
  const imageUrl = blog.mainImage ? urlFor(blog.mainImage).width(1200).url() : null
  const date = blog.publishedAt
    ? new Date(blog.publishedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null

  const isoDate = blog.publishedAt ? new Date(blog.publishedAt).toISOString() : null

  // Estimate reading time (200 wpm average)
  const wordCount = blog.body
    ? blog.body
        .filter((b) => b._type === 'block')
        .map((b) => ('children' in b ? (b.children ?? []).map((c: { text?: string }) => c.text).join(' ') : ''))
        .join(' ')
        .split(/\s+/).length
    : 0
  const readingTime = Math.max(1, Math.ceil(wordCount / 200))

  function handleShare() {
    if (navigator.share) {
      navigator.share({
        title: blog.title,
        text: blog.excerpt,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
    }
  }

  return (
    <>
      {/* JSON-LD Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: blog.title,
            description: blog.excerpt,
            image: imageUrl || undefined,
            datePublished: isoDate,
            dateModified: isoDate,
            author: {
              '@type': 'Person',
              name: blog.author ?? '',
            },
            publisher: {
              '@type': 'Organization',
              name: 'TamilCinemaHub',
              url: 'https://tamilcinemahub.xyz',
            },
            mainEntityOfPage: {
              '@type': 'WebPage',
              '@id': `https://tamilcinemahub.xyz/blogs/${blog.slug}`,
            },
            articleSection: blog.category,
            keywords: blog.tags?.join(', '),
          }),
        }}
      />

      <article className="min-h-screen pt-16 md:pt-20 pb-16">
        {/* Hero image — full width, natural aspect ratio, no cutoff */}
        {imageUrl && (
          <div className="relative w-full max-h-[60vh] overflow-hidden">
            <Image
              src={imageUrl}
              alt={blog.title}
              width={1200}
              height={630}
              className="w-full h-auto max-h-[60vh] object-cover"
              priority
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-bg-primary/40 to-transparent" />
          </div>
        )}

        <div className={`max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 ${imageUrl ? '-mt-16 sm:-mt-20 relative z-10' : 'pt-8'}`}>
          {/* Back */}
          <Link
            href="/blogs"
            className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-accent-gold transition-colors mb-6"
          >
            <ArrowLeft size={12} /> Back to Reviews
          </Link>

          {/* Category */}
          <span
            className="inline-block text-[10px] font-bold uppercase tracking-widest rounded-full px-3 py-1 mb-4"
            style={{
              backgroundColor: `${categoryColors[blog.category] || '#666'}20`,
              color: categoryColors[blog.category] || '#999',
            }}
          >
            {blog.category}
          </span>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-text-primary leading-tight mb-4">
            {blog.title}
          </h1>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-sm text-text-muted mb-8">
            {blog.author && (
              <span className="flex items-center gap-1.5">
                <User size={14} /> {blog.author}
              </span>
            )}
            {date && (
              <time dateTime={isoDate || ''} className="flex items-center gap-1.5">
                <Calendar size={14} /> {date}
              </time>
            )}
            <span className="flex items-center gap-1.5">
              <Clock size={14} /> {readingTime} min read
            </span>
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 hover:text-accent-gold transition-colors ml-auto"
              aria-label="Share article"
            >
              <Share2 size={14} /> Share
            </button>
          </div>

          {/* Excerpt */}
          {blog.excerpt && (
            <p className="text-sm sm:text-base text-text-secondary leading-relaxed mb-8 pb-8 border-b border-border">
              {blog.excerpt}
            </p>
          )}

          {/* Body */}
          {blog.body && blog.body.length > 0 && (
            <div className="mb-8">
              <PortableText value={blog.body as PortableTextBlock[]} />
            </div>
          )}

          {/* Ad: After article body */}
          <div className="mb-12">
            <MonetagAd placement="bannerBlog" className="max-w-2xl mx-auto" minHeight="100px" />
          </div>

          {/* Tags */}
          {blog.tags && blog.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mb-12 pb-8 border-b border-border">
              <Tag size={14} className="text-text-muted shrink-0" />
              {blog.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs text-text-secondary bg-bg-card border border-border rounded-full px-3 py-1"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Related */}
          {related.length > 0 && (
            <section aria-label="Related articles">
              <h2 className="text-lg font-bold text-text-primary mb-6">Related Articles</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {related.map((r) => (
                  <BlogCard key={r._id} blog={r} />
                ))}
              </div>
            </section>
          )}
        </div>
      </article>
    </>
  )
}
