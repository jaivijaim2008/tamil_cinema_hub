'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Clock, ArrowRight } from 'lucide-react'
import { urlFor } from '../../sanity/lib/image'
import CinemaBackground from '../../components/graphics/CinemaBackground'
import FilmStripDecoration from '../../components/graphics/FilmStripDecoration'


const categories = ['All', 'Review', 'News', 'Top List', 'Actor', 'Director', 'Feature']

const categoryColors: Record<string, { text: string; bg: string; border: string; dot: string }> = {
  Review: { text: 'text-accent-gold', bg: 'bg-accent-gold-muted', border: 'border-accent-gold/30', dot: 'bg-accent-gold' },
  News: { text: 'text-accent-blue', bg: 'bg-accent-blue-muted', border: 'border-accent-blue/30', dot: 'bg-accent-blue' },
  'Top List': { text: 'text-accent-rose', bg: 'bg-accent-rose-muted', border: 'border-accent-rose/30', dot: 'bg-accent-rose' },
  Actor: { text: 'text-accent-purple', bg: 'bg-accent-purple-muted', border: 'border-accent-purple/30', dot: 'bg-accent-purple' },
  Director: { text: 'text-accent-teal', bg: 'bg-accent-teal-muted', border: 'border-accent-teal/30', dot: 'bg-accent-teal' },
  Feature: { text: 'text-accent-emerald', bg: 'bg-accent-emerald-muted', border: 'border-accent-emerald/30', dot: 'bg-accent-emerald' },
}

interface Props {
  initialBlogs: any[]
  totalCount: number
  initialCategory: string
  currentPage: number
  totalPages: number
}

export default function BlogsPageClient({ initialBlogs, totalCount, initialCategory, currentPage, totalPages }: Props) {
  const filterCategory = (cat: string) => {
    const params = new URLSearchParams()
    if (cat !== 'All') params.set('category', cat)
    window.location.href = `/blogs?${params.toString()}`
  }

  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[55svh] flex flex-col justify-end pb-20 pt-32 lg:pt-36 overflow-hidden">
        <CinemaBackground />
        {/* Watermark */}
        <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-playfair text-[18vw] text-text-primary/[0.03] select-none pointer-events-none whitespace-nowrap">
          EDITORIAL
        </span>

        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 w-full">
          <p className="text-accent-gold text-[11px] font-mono tracking-[0.3em] uppercase mb-3">Blog &amp; Reviews</p>
          <h1 className="font-playfair text-[clamp(36px,6vw,72px)] text-text-primary leading-tight mb-5">
            Tamil Cinema<br />
            <span className="text-gradient-gold">In Focus</span>
          </h1>
          <p className="text-text-secondary text-base sm:text-lg max-w-lg leading-relaxed">
            Reviews, analysis, and stories from the world of Kollywood.
          </p>
        </div>
        <FilmStripDecoration className="absolute bottom-0 left-0 right-0 opacity-40" />
      </section>

      {/* Content */}
      <section className="py-16 sm:py-20 lg:py-24 px-6 sm:px-8 lg:px-10 max-w-7xl mx-auto">
        {/* Category filter */}
        <div className="flex gap-2.5 overflow-x-auto scrollbar-hide pb-6 mb-10 border-b border-border-subtle">
          {categories.map((cat) => {
            const isActive = (cat === 'All' && !initialCategory) || initialCategory === cat
            return (
              <button
                key={cat}
                onClick={() => filterCategory(cat)}
                className={`shrink-0 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-accent-gold text-text-inverse shadow-lg shadow-accent-gold/20'
                    : 'border border-border-subtle text-text-secondary hover:border-border-accent hover:text-text-primary hover:bg-accent-gold-subtle'
                }`}
              >
                {cat}
              </button>
            )
          })}
        </div>

        {/* Blog grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {initialBlogs.map((blog: any, i: number) => {
            const imageUrl = blog.mainImage ? urlFor(blog.mainImage).width(800).height(450).url() : null
            const readTime = Math.max(3, Math.ceil((blog.excerpt?.length || 200) / 200))
            const catStyle = categoryColors[blog.category] || categoryColors.Review

            return (
              <motion.div
                key={blog._id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, duration: 0.5 }}
              >
                <Link
                  href={`/blogs/${blog.slug}`}
                  className="group block bg-bg-card rounded-2xl overflow-hidden border border-border-subtle hover:border-border-accent transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-accent-gold/5 card-shine"
                >
                  {/* Image */}
                  <div className="aspect-[16/9] relative overflow-hidden">
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt={blog.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                        sizes="(max-width:768px) 100vw, 50vw"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-bg-elevated to-bg-card" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                    {/* Category badge */}
                    <div className="absolute top-4 left-4">
                      <span className={`text-[11px] px-3 py-1.5 rounded-full border font-medium inline-flex items-center gap-1.5 ${catStyle.text} ${catStyle.bg} ${catStyle.border}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${catStyle.dot}`} />
                        {blog.category || 'Review'}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="flex items-center gap-2.5 text-text-muted text-xs mb-3">
                      <Clock size={12} className="text-accent-gold/60" />
                      <span>{readTime} min read</span>
                      <span className="text-border-mid">·</span>
                      <span>{new Date(blog.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>

                    <h3 className="font-playfair text-xl sm:text-2xl text-text-primary group-hover:text-accent-gold transition-colors duration-300 line-clamp-2 mb-3">
                      {blog.title}
                    </h3>

                    <p className="text-text-secondary text-sm leading-relaxed line-clamp-2 mb-5">{blog.excerpt}</p>

                    <div className="flex items-center justify-between pt-4 border-t border-border-subtle">
                      <span className="text-text-muted text-xs font-medium">{blog.author || 'TamilCinemaHub'}</span>
                      <span className="text-accent-gold text-xs font-semibold flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-0 group-hover:translate-x-1">
                        Read More <ArrowRight size={12} />
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2.5 mt-16">
            {Array.from({ length: Math.min(totalPages, 10) }).map((_, i) => {
              const p = i + 1
              return (
                <button
                  key={p}
                  onClick={() => {
                    const params = new URLSearchParams()
                    if (initialCategory) params.set('category', initialCategory)
                    params.set('page', String(p))
                    window.location.href = `/blogs?${params.toString()}`
                  }}
                  className={`w-11 h-11 rounded-xl text-sm font-medium transition-all duration-200 ${
                    p === currentPage
                      ? 'bg-accent-gold text-text-inverse shadow-lg shadow-accent-gold/20'
                      : 'border border-border-subtle text-text-secondary hover:border-border-accent hover:text-text-primary'
                  }`}
                >
                  {p}
                </button>
              )
            })}
          </div>
        )}
      </section>
    </>
  )
}
