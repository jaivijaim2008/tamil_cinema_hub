'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Calendar, User, Tag, Clock, Share2, ChevronUp, Copy, Check, X, Bookmark, ExternalLink } from 'lucide-react'
import type { BlogDetail, Blog, PortableTextBlock, SanityImageBlock } from '@/lib/types'
import { urlFor } from '@/sanity/lib/image'
import PortableText, { extractHeadings } from '@/components/ui/PortableText'
import TableOfContents from '@/components/ui/TableOfContents'
import BlogCard from '@/components/ui/BlogCard'
import CommentBox from '@/components/ui/CommentBox'
import AdSenseBanner from '@/components/ui/AdSenseBanner'

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
  const [showShareMenu, setShowShareMenu] = useState(false)
  const [copied, setCopied] = useState(false)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const articleRef = useRef<HTMLElement>(null)
  const shareMenuRef = useRef<HTMLDivElement>(null)

  const imageUrl = blog.mainImage && !posterError
    ? urlFor(blog.mainImage).width(1200).url()
    : null
  const thumbnailUrl = blog.mainImage
    ? urlFor(blog.mainImage).width(400).height(300).url()
    : null
  const date = blog.publishedAt
    ? new Date(blog.publishedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null

  const isoDate = blog.publishedAt ? new Date(blog.publishedAt).toISOString() : null

  // Extract headings for Table of Contents
  const headings = blog.body ? extractHeadings(blog.body) : []

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

  // Close share menu on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (shareMenuRef.current && !shareMenuRef.current.contains(e.target as Node)) {
        setShowShareMenu(false)
      }
    }
    if (showShareMenu) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [showShareMenu])

  const currentUrl = typeof window !== 'undefined' ? window.location.href : `https://tamilcinemahub.xyz/blogs/${blog.slug}`

  const shareLinks = {
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`${blog.title}\n\n${currentUrl}`)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(blog.title)}&url=${encodeURIComponent(currentUrl)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`,
  }

  const handleCopyUrl = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(currentUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch { /* noop */ }
  }, [currentUrl])

  const handleNativeShare = useCallback(() => {
    if (navigator.share) {
      navigator.share({
        title: blog.title,
        text: blog.excerpt || blog.title,
        url: currentUrl,
      }).catch(() => {})
    } else {
      setShowShareMenu(prev => !prev)
    }
  }, [blog.title, blog.excerpt, currentUrl])

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
            description: blog.excerpt || blog.title,
            image: imageUrl || thumbnailUrl || undefined,
            datePublished: isoDate,
            dateModified: isoDate,
            author: {
              '@type': 'Person',
              name: blog.author ?? 'TamilCinemaHub Team',
              url: 'https://tamilcinemahub.xyz',
            },
            publisher: {
              '@type': 'Organization',
              name: 'TamilCinemaHub',
              url: 'https://tamilcinemahub.xyz',
              logo: {
                '@type': 'ImageObject',
                url: 'https://tamilcinemahub.xyz/og-image.png',
              },
            },
            mainEntityOfPage: {
              '@type': 'WebPage',
              '@id': `https://tamilcinemahub.xyz/blogs/${blog.slug}`,
            },
            articleSection: blog.category,
            keywords: blog.tags?.join(', '),
            wordCount,
            timeRequired: `PT${readingTime}M`,
            inLanguage: 'en-US',
          }),
        }}
      />

      {/* BreadcrumbList JSON-LD for rich snippets */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: 'https://tamilcinemahub.xyz',
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: 'Blog',
                item: 'https://tamilcinemahub.xyz/blogs',
              },
              {
                '@type': 'ListItem',
                position: 3,
                name: blog.title,
                item: `https://tamilcinemahub.xyz/blogs/${blog.slug}`,
              },
            ],
          }),
        }}
      />

      {/* Image Lightbox */}
      {lightboxOpen && imageUrl && (
        <div
          className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4 sm:p-8 animate-in fade-in"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors z-10"
            aria-label="Close lightbox"
          >
            <X size={20} />
          </button>
          <Image
            src={imageUrl}
            alt={blog.title}
            width={1200}
            height={800}
            className="max-w-full max-h-[85vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
            unoptimized
          />
        </div>
      )}

      <article ref={articleRef} className="min-h-screen pt-14 md:pt-20 pb-20 md:pb-16">
        {/* Hero image — responsive with proper mobile handling */}
        {imageUrl && (
          <div
            className="relative w-full max-h-[40vh] sm:max-h-[50vh] md:max-h-[60vh] overflow-hidden cursor-pointer group"
            onClick={() => setLightboxOpen(true)}
          >
            <Image
              src={imageUrl}
              alt={blog.title}
              width={1200}
              height={630}
              className="w-full h-auto max-h-[40vh] sm:max-h-[50vh] md:max-h-[60vh] object-cover transition-transform duration-500 group-hover:scale-105"
              priority
              sizes="100vw"
              onError={() => setPosterError(true)}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-bg-primary/30 to-transparent" />
            {/* Tap to expand hint */}
            <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="bg-black/60 text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 backdrop-blur-sm">
                <ExternalLink size={12} /> View full image
              </span>
            </div>
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

            {/* Share button with dropdown */}
            <div className="relative ml-auto" ref={shareMenuRef}>
              <button
                onClick={handleNativeShare}
                className="flex items-center gap-1.5 hover:text-accent-gold transition-colors min-h-[44px] min-w-[44px] justify-center touch-manipulation"
                aria-label="Share article"
              >
                <Share2 size={14} /> <span className="hidden sm:inline">Share</span>
              </button>

              {/* Share dropdown for non-mobile */}
              {showShareMenu && (
                <div className="absolute right-0 top-full mt-1 w-52 bg-bg-card border border-border rounded-xl shadow-xl shadow-black/20 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <a
                    href={shareLinks.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary hover:bg-bg-elevated hover:text-green-400 transition-colors"
                  >
                    <span className="text-base">💬</span> WhatsApp
                  </a>
                  <a
                    href={shareLinks.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary hover:bg-bg-elevated hover:text-sky-400 transition-colors"
                  >
                    <span className="text-base">🐦</span> Twitter / X
                  </a>
                  <a
                    href={shareLinks.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary hover:bg-bg-elevated hover:text-blue-400 transition-colors"
                  >
                    <span className="text-base">📘</span> Facebook
                  </a>
                  <a
                    href={shareLinks.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary hover:bg-bg-elevated hover:text-blue-300 transition-colors"
                  >
                    <span className="text-base">💼</span> LinkedIn
                  </a>
                  <div className="border-t border-border my-1" />
                  <button
                    onClick={handleCopyUrl}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary hover:bg-bg-elevated hover:text-accent-gold transition-colors w-full text-left"
                  >
                    {copied ? (
                      <>
                        <Check size={16} className="text-green-400" /> <span className="text-green-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={16} /> Copy Link
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Excerpt */}
          {blog.excerpt && (
            <p className="text-sm sm:text-base text-text-secondary leading-relaxed mb-6 sm:mb-8 pb-6 sm:pb-8 border-b border-border italic">
              {blog.excerpt}
            </p>
          )}

          {/* Mobile Table of Contents (collapsible, above body) */}
          <TableOfContents headings={headings} mobile />

          {/* Body + Desktop TOC sidebar layout */}
          {blog.body && blog.body.length > 0 && (
            <div className="mb-8 sm:mb-10 flex gap-8">
              <div className="flex-1 min-w-0">
                <PortableText value={blog.body as (PortableTextBlock | SanityImageBlock)[]} />
              </div>
              {/* Desktop sticky TOC sidebar */}
              <TableOfContents headings={headings} />
            </div>
          )}

          {/* Share CTA at bottom of article */}
          <div className="flex items-center justify-center gap-3 mb-8 sm:mb-10 py-6 border-y border-border">
            <span className="text-xs text-text-muted mr-1">Share this article:</span>
            <a
              href={shareLinks.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-[#25D366]/10 flex items-center justify-center text-[#25D366] hover:bg-[#25D366]/20 transition-colors"
              aria-label="Share on WhatsApp"
            >
              💬
            </a>
            <a
              href={shareLinks.twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-[#1DA1F2]/10 flex items-center justify-center text-[#1DA1F2] hover:bg-[#1DA1F2]/20 transition-colors"
              aria-label="Share on Twitter"
            >
              🐦
            </a>
            <a
              href={shareLinks.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-[#4267B2]/10 flex items-center justify-center text-[#4267B2] hover:bg-[#4267B2]/20 transition-colors"
              aria-label="Share on Facebook"
            >
              📘
            </a>
            <a
              href={shareLinks.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-[#0077B5]/10 flex items-center justify-center text-[#0077B5] hover:bg-[#0077B5]/20 transition-colors"
              aria-label="Share on LinkedIn"
            >
              💼
            </a>
            <button
              onClick={handleCopyUrl}
              className="w-10 h-10 rounded-full bg-accent-gold/10 flex items-center justify-center text-accent-gold hover:bg-accent-gold/20 transition-colors"
              aria-label="Copy link"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </button>
          </div>

          {/* AdSense */}
          <div className="my-8">
            <AdSenseBanner slot="0" format="horizontal" minHeight={100} />
          </div>

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

      {/* Floating reading progress circle — bottom-left on mobile, bottom-right on desktop */}
      {progress > 1 && (
        <div className="fixed bottom-20 left-4 sm:bottom-6 sm:left-6 lg:left-auto lg:right-6 z-50 animate-in fade-in">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="relative w-12 h-12 flex items-center justify-center group"
            aria-label={`Reading progress: ${Math.round(progress)}%. Click to scroll to top.`}
          >
            {/* Background circle */}
            <svg className="w-12 h-12 -rotate-90" viewBox="0 0 48 48">
              <circle
                cx="24"
                cy="24"
                r="20"
                fill="none"
                stroke="rgba(232,184,75,0.15)"
                strokeWidth="3"
              />
              <circle
                cx="24"
                cy="24"
                r="20"
                fill="none"
                stroke="url(#progressGradient)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 20}`}
                strokeDashoffset={`${2 * Math.PI * 20 * (1 - progress / 100)}`}
                className="transition-[stroke-dashoffset] duration-200 ease-out"
              />
              <defs>
                <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#E8B84B" />
                  <stop offset="100%" stopColor="#F59E0B" />
                </linearGradient>
              </defs>
            </svg>
            {/* Percentage text */}
            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-accent-gold group-hover:text-white transition-colors">
              {Math.round(progress)}%
            </span>
          </button>
        </div>
      )}

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
