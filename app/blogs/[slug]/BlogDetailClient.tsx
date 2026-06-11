'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ArrowLeft, Clock, Share2, Copy, Check } from 'lucide-react'
import { urlFor } from '../../../sanity/lib/image'
import CinematicDivider from '../../../components/ui/CinematicDivider'
import type { BlogDetail } from './page'

interface Props {
  blog: BlogDetail
  related: any[]
}

export default function BlogDetailClient({ blog, related }: Props) {
  const [scrollProgress, setScrollProgress] = useState(0)
  const [copied, setCopied] = useState(false)

  const shareUrl = typeof window !== 'undefined' ? window.location.href : ''

  useEffect(() => {
    const handler = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight
      setScrollProgress(total > 0 ? (window.scrollY / total) * 100 : 0)
    }
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const coverUrl = blog.mainImage ? urlFor(blog.mainImage).width(1600).url() : null
  const readTime = Math.max(3, Math.ceil((blog.excerpt?.length || 200) / 200))

  // Extract headings for TOC
  const headings = blog.body
    ?.filter((block: any) => block._type === 'block' && block.style === 'h2')
    .map((block: any) => ({
      text: block.children?.map((c: any) => c.text).join('') || '',
      id: block.children?.map((c: any) => c.text).join('').toLowerCase().replace(/\s+/g, '-'),
    })) || []

  return (
    <>
      {/* Reading progress bar */}
      <div className="fixed top-0 left-0 right-0 z-[70] h-[3px]">
        <div
          className="h-full bg-accent-gold transition-[width] duration-100"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Hero */}
      <section className="relative pt-20 lg:pt-24">
        {coverUrl && (
          <div className="relative w-full h-[40vh] lg:h-[50vh] overflow-hidden">
            <Image src={coverUrl} alt={blog.title} fill className="object-cover" priority />
            <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-bg-primary/60 to-transparent" />
          </div>
        )}

        <div className="max-w-4xl mx-auto px-6 -mt-20 relative z-10">
          <Link href="/blogs" className="inline-flex items-center gap-2 text-text-secondary text-sm hover:text-accent-gold mb-6 transition-colors">
            <ArrowLeft size={16} /> Back to Reviews
          </Link>

          <span className="text-[10px] font-mono text-accent-gold tracking-widest uppercase bg-accent-gold-muted px-2 py-1 rounded inline-block mb-4">
            {blog.category || 'Review'}
          </span>

          <h1 className="font-playfair text-3xl lg:text-5xl text-text-primary leading-tight mb-4">
            {blog.title}
          </h1>

          <div className="flex items-center gap-3 text-text-muted text-sm mb-8">
            <span>{blog.author || 'TamilCinemaHub'}</span>
            <span>·</span>
            <span>{new Date(blog.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            <span>·</span>
            <span className="flex items-center gap-1"><Clock size={12} /> {readTime} min read</span>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-4xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_220px] gap-12">
          {/* Article body */}
          <article className="prose prose-invert prose-lg max-w-none article-body">
            {blog.body?.map((block: any, i: number) => {
              if (block._type === 'block') {
                const text = block.children?.map((c: any) => c.text).join('') || ''
                if (block.style === 'h2') {
                  return (
                    <h2 key={i} id={text.toLowerCase().replace(/\s+/g, '-')}>
                      {text}
                    </h2>
                  )
                }
                if (block.style === 'blockquote') {
                  return <blockquote key={i}>{text}</blockquote>
                }
                return <p key={i}>{text}</p>
              }
              if (block._type === 'image' && block.asset) {
                const imgUrl = urlFor(block).width(1200).url()
                return (
                  <div key={i} className="my-8 relative aspect-video rounded-xl overflow-hidden">
                    <Image src={imgUrl} alt="" fill className="object-cover" />
                  </div>
                )
              }
              return null
            })}
          </article>

          {/* Table of contents (desktop) */}
          {headings.length > 0 && (
            <aside className="hidden lg:block">
              <div className="sticky top-24">
                <p className="text-text-muted text-xs uppercase tracking-wider mb-3">On This Page</p>
                <nav className="space-y-2">
                  {headings.map((h) => (
                    <a
                      key={h.id}
                      href={`#${h.id}`}
                      className="flex items-center gap-2 text-text-secondary text-xs hover:text-accent-gold transition-colors"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-border-accent shrink-0" />
                      <span className="line-clamp-1">{h.text}</span>
                    </a>
                  ))}
                </nav>
              </div>
            </aside>
          )}
        </div>

        {/* Share bar */}
        <div className="flex gap-3 mt-12 pt-8 border-t border-border-subtle">
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border-subtle text-text-secondary text-sm hover:border-border-accent transition-colors"
          >
            {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
            {copied ? 'Copied!' : 'Copy Link'}
          </button>
          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(blog.title)}&url=${encodeURIComponent(shareUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border-subtle text-text-secondary text-sm hover:border-border-accent transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            Twitter
          </a>
          <a
            href={`https://wa.me/?text=${encodeURIComponent(blog.title + ' ' + shareUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border-subtle text-text-secondary text-sm hover:border-border-accent transition-colors"
          >
            WhatsApp
          </a>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div className="mt-16">
            <CinematicDivider className="mb-8" />
            <h3 className="font-playfair text-2xl text-text-primary mb-6">Related Articles</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {related.map((rel: any) => {
                const relImg = rel.mainImage ? urlFor(rel.mainImage).width(400).height(225).url() : null
                return (
                  <Link
                    key={rel._id}
                    href={`/blogs/${rel.slug}`}
                    className="group bg-bg-card rounded-xl overflow-hidden border border-border-subtle hover:border-border-accent transition-all"
                  >
                    <div className="aspect-video relative overflow-hidden">
                      {relImg ? (
                        <Image src={relImg} alt={rel.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full bg-bg-elevated" />
                      )}
                    </div>
                    <div className="p-4">
                      <p className="text-text-muted text-xs mb-1">{rel.category}</p>
                      <h4 className="font-playfair text-sm text-text-primary group-hover:text-accent-gold transition-colors line-clamp-2">
                        {rel.title}
                      </h4>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </section>

      {/* Mobile share bar */}
      <div className="lg:hidden fixed bottom-[76px] left-2 right-2 z-40 glass rounded-2xl px-4 py-3 flex justify-around safe-bottom">
        <button onClick={handleCopy} className="flex items-center gap-1.5 text-text-secondary text-xs">
          {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
          {copied ? 'Copied!' : 'Copy Link'}
        </button>
        <a
          href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(blog.title)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-text-secondary text-xs"
        >            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> Twitter
        </a>
        <a
          href={`https://wa.me/?text=${encodeURIComponent(blog.title + ' ' + shareUrl)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-text-secondary text-xs"
        >
          WhatsApp
        </a>
      </div>
    </>
  )
}
