'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Calendar, User, Tag, Clock, Share2, ChevronUp } from 'lucide-react'
import type { BlogDetail, Blog, PortableTextBlock } from '@/lib/types'
import { urlFor } from '@/sanity/lib/image'
import PortableText from '@/components/ui/PortableText'
import BlogCard from '@/components/ui/BlogCard'
import CommentBox from '@/components/ui/CommentBox'

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
  const [posterError, setPosterError] = useState(false)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [progress, setProgress] = useState(0)
  const articleRef = useRef<HTMLElement>(null)

  const imageUrl = blog.mainImage && !posterError
    ? urlFor(blog.mainImage).width(1200).url()
    : null
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

  // Reading progress + scroll-to-top visibility
  useEffect(() => {
    function onScroll() {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      setProgress(docHeight > 0 ? Math.min((scrollTop / docHeight) * 100, 100) : 0)
      setShowScrollTop(scrollTop > 400)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

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
      {/* Reading progress bar */}
      <div className="fixed top-0 left-0 right-0 z-[55] h-[3px] bg-transparent">
        <div
          className="h-full bg-gradient-to-r from-accent-gold to-amber-400 transition-[width] duration-150 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

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

      <article ref={articleRef} className="min-h-screen pt-14 md:pt-20 pb-20 md:pb-16">
        {/* Hero image — responsive with proper mobile handling */}
        {imageUrl && (
          <div className="relative w-full max-h-[40vh] sm:max-h-[50vh] md:max-h-[60vh] overflow-hidden">
            <Image
              src={imageUrl}
              alt={blog.title}
              width={1200}
              height={630}
              className="w-full h-auto max-h-[40vh] sm:max-h-[50vh] md:max-h-[60vh] object-cover"
              priority
              sizes="100vw"
              onError={() => setPosterError(true)}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-bg-primary/30 to-transparent" />
          </div>
        )}

        <div className={`max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 ${imageUrl ? '-mt-12 sm:-mt-16 md:-mt-20 relative z-10' : 'pt-6 sm:pt-8'}`}>
          {/* Back */}
          <Link
            href="/blogs"
            className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-accent-gold transition-colors mb-4 sm:mb-6 min-h-[44px] touch-manipulation"
          >
            <ArrowLeft size={12} /> Back to Reviews
          </Link>

          {/* Category */}
          <span
            className="inline-block text-[10px] font-bold uppercase tracking-widest rounded-full px-3 py-1 mb-3 sm:mb-4"
            style={{
              backgroundColor: `${categoryColors[blog.category] || '#666'}20`,
              color: categoryColors[blog.category] || '#999',
            }}
          >
            {blog.category}
          </span>

          {/* Title — responsive font sizes */}
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-text-primary leading-tight mb-3 sm:mb-4">
            {blog.title}
          </h1>

          {/* Meta row — wraps nicely on mobile */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs sm:text-sm text-text-muted mb-6 sm:mb-8">
            {blog.author && (
              <span className="flex items-center gap-1.5">
                <User size={13} /> {blog.author}
              </span>
            )}
            {date && (
              <time dateTime={isoDate || ''} className="flex items-center gap-1.5">
                <Calendar size={13} /> {date}
              </time>
            )}
            <span className="flex items-center gap-1.5">
              <Clock size={13} /> {readingTime} min read
            </span>
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 hover:text-accent-gold transition-colors ml-auto min-h-[44px] min-w-[44px] justify-center touch-manipulation"
              aria-label="Share article"
            >
              <Share2 size={14} /> <span className="hidden sm:inline">Share</span>
            </button>
          </div>

          {/* Excerpt */}
          {blog.excerpt && (
            <p className="text-sm sm:text-base text-text-secondary leading-relaxed mb-6 sm:mb-8 pb-6 sm:pb-8 border-b border-border">
              {blog.excerpt}
            </p>
          )}

          {/* Body */}
          {blog.body && blog.body.length > 0 && (
            <div className="mb-8 sm:mb-10">
              <PortableText value={blog.body as PortableTextBlock[]} />
            </div>
          )}

          {/* Comments */}
          <CommentBox blogSlug={blog.slug} />

          {/* Tags — better mobile spacing */}
          {blog.tags && blog.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mb-10 sm:mb-12 pb-6 sm:pb-8 border-b border-border">
              <Tag size={14} className="text-text-muted shrink-0" />
              {blog.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs text-text-secondary bg-bg-card border border-border rounded-full px-3 py-1.5 min-h-[32px] flex items-center"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Related */}
          {related.length > 0 && (
            <section aria-label="Related articles">
              <h2 className="text-lg font-bold text-text-primary mb-4 sm:mb-6">Related Articles</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {related.map((r) => (
                  <BlogCard key={r._id} blog={r} />
                ))}
              </div>
            </section>
          )}
        </div>
      </article>

      {/* Scroll to top button — mobile-friendly FAB */}
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-accent-gold text-text-inverse shadow-lg shadow-accent-gold/20 flex items-center justify-center hover:bg-accent-gold-dim transition-all duration-300 animate-in fade-in"
          aria-label="Scroll to top"
        >
          <ChevronUp size={20} />
        </button>
      )}
    </>
  )
}
