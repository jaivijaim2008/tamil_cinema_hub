'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Clock, ArrowRight } from 'lucide-react'
import { urlFor } from '../../sanity/lib/image'
import CinemaBackground from '../../components/graphics/CinemaBackground'
import FilmStripDecoration from '../../components/graphics/FilmStripDecoration'


const categories = ['All', 'Review', 'News', 'Top List', 'Actor', 'Director', 'Feature']

const categoryColors: Record<string, string> = {
  Review: 'text-accent-gold bg-accent-gold-muted border-border-accent',
  News: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
  'Top List': 'text-red-400 bg-red-500/10 border-red-500/30',
  Actor: 'text-pink-400 bg-pink-500/10 border-pink-500/30',
  Director: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
  Feature: 'text-teal-400 bg-teal-500/10 border-teal-500/30',
}

interface Props {
  initialBlogs: any[]
  totalCount: number
  initialCategory: string
  currentPage: number
  totalPages: number
}

export default function BlogsPageClient({ initialBlogs, totalCount, initialCategory, currentPage, totalPages }: Props) {
  const router = useRouter()

  const filterCategory = (cat: string) => {
    const params = new URLSearchParams()
    if (cat !== 'All') params.set('category', cat)
    router.push(`/blogs?${params.toString()}`, { scroll: false })
    window.location.href = `/blogs?${params.toString()}`
  }

  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[60svh] flex flex-col justify-end pb-16 overflow-hidden">
        <CinemaBackground />
        {/* Watermark */}
        <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-playfair text-[20vw] text-text-primary/[0.03] select-none pointer-events-none whitespace-nowrap">
          EDITORIAL
        </span>

        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
          <p className="text-accent-gold text-[11px] font-mono tracking-[0.3em] uppercase mb-2">Blog &amp; Reviews</p>
          <h1 className="font-playfair text-[clamp(32px,6vw,72px)] text-text-primary leading-tight mb-4">
            Tamil Cinema<br />
            <span className="text-gradient-gold">In Focus</span>
          </h1>
          <p className="text-text-secondary text-base max-w-lg">
            Reviews, analysis, and stories from the world of Kollywood.
          </p>
        </div>
        <FilmStripDecoration className="absolute bottom-0 left-0 right-0 opacity-40" />
      </section>

      {/* Content */}
      <section className="py-12 px-6 max-w-7xl mx-auto">
        {/* Category filter */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-6 mb-8 border-b border-border-subtle">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => filterCategory(cat)}
              className={`shrink-0 px-4 py-2 rounded-xl text-sm transition-colors ${
                (cat === 'All' && !initialCategory) || initialCategory === cat
                  ? 'bg-accent-gold text-text-inverse'
                  : 'border border-border-subtle text-text-secondary hover:border-border-accent'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Blog grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {initialBlogs.map((blog: any, i: number) => {
            const imageUrl = blog.mainImage ? urlFor(blog.mainImage).width(800).height(450).url() : null
            const readTime = Math.max(3, Math.ceil((blog.excerpt?.length || 200) / 200))

            return (
              <motion.div
                key={blog._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  href={`/blogs/${blog.slug}`}
                  className="group block bg-bg-card rounded-2xl overflow-hidden border border-border-subtle hover:border-border-accent transition-all hover:-translate-y-1"
                  style={{ boxShadow: '0 4px 30px rgba(0,0,0,0.2)' }}
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
                      <div className="w-full h-full bg-bg-elevated" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                    {/* Category badge */}
                    <div className="absolute top-4 left-4">
                      <span className={`text-[10px] px-2.5 py-1 rounded-full border font-medium ${categoryColors[blog.category] || 'text-text-secondary bg-bg-elevated border-border-subtle'}`}>
                        {blog.category || 'Review'}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <div className="flex items-center gap-2 text-text-muted text-xs mb-2">
                      <Clock size={12} />
                      <span>{readTime} min read</span>
                      <span>·</span>
                      <span>{new Date(blog.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>

                    <h3 className="font-playfair text-xl text-text-primary group-hover:text-accent-gold transition-colors line-clamp-2 mb-2">
                      {blog.title}
                    </h3>

                    <p className="text-text-secondary text-sm line-clamp-2 mb-4">{blog.excerpt}</p>

                    <div className="flex items-center justify-between">
                      <span className="text-text-muted text-xs">{blog.author || 'TamilCinemaHub'}</span>
                      <span className="text-accent-gold text-xs font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        Read <ArrowRight size={10} />
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
          <div className="flex justify-center gap-2 mt-12">
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
                  className={`w-10 h-10 rounded-xl text-sm transition-colors ${
                    p === currentPage
                      ? 'bg-accent-gold text-text-inverse'
                      : 'border border-border-subtle text-text-secondary hover:border-border-accent'
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
