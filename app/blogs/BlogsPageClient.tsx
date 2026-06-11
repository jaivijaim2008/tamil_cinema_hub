'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence, useInView, useScroll, useTransform } from 'framer-motion'
import {
  Clock,
  ArrowRight,
  Search,
  Filter,
  Calendar,
  BookOpen,
  TrendingUp,
  Star,
  Quote,
  ArrowUpRight,
  ChevronRight,
  Tag,
  User,
  Eye,
  Heart,
  MessageCircle,
  Sparkles,
  Newspaper,
  Film,
  Award,
  Users,
  X,
} from 'lucide-react'
import { urlFor } from '../../sanity/lib/image'
import CinemaBackground from '../../components/graphics/CinemaBackground'
import FilmStripDecoration from '../../components/graphics/FilmStripDecoration'
import SpotlightCard from '../../components/ui/SpotlightCard'
import CinematicDivider from '../../components/ui/CinematicDivider'

/* ═══════════════════════════════════════════════════════════════════════════════
   TYPES & INTERFACES
   ═══════════════════════════════════════════════════════════════════════════════ */

interface Props {
  initialBlogs: any[]
  totalCount: number
  initialCategory: string
  currentPage: number
  totalPages: number
}

/* ═══════════════════════════════════════════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════════════════════════════════════════ */

const categories = ['All', 'Review', 'News', 'Top List', 'Actor', 'Director', 'Feature']

const categoryConfig: Record<
  string,
  { text: string; bg: string; border: string; dot: string; icon: any; description: string }
> = {
  Review: {
    text: 'text-accent-gold',
    bg: 'bg-accent-gold-muted',
    border: 'border-accent-gold/30',
    dot: 'bg-accent-gold',
    icon: Star,
    description: 'In-depth film reviews and critical analysis',
  },
  News: {
    text: 'text-accent-blue',
    bg: 'bg-accent-blue-muted',
    border: 'border-accent-blue/30',
    dot: 'bg-accent-blue',
    icon: Newspaper,
    description: 'Latest updates from the Tamil film industry',
  },
  'Top List': {
    text: 'text-accent-rose',
    bg: 'bg-accent-rose-muted',
    border: 'border-accent-rose/30',
    dot: 'bg-accent-rose',
    icon: Award,
    description: 'Curated rankings and must-watch lists',
  },
  Actor: {
    text: 'text-accent-purple',
    bg: 'bg-accent-purple-muted',
    border: 'border-accent-purple/30',
    dot: 'bg-accent-purple',
    icon: Users,
    description: 'Profiles and career retrospectives',
  },
  Director: {
    text: 'text-accent-teal',
    bg: 'bg-accent-teal-muted',
    border: 'border-accent-teal/30',
    dot: 'bg-accent-teal',
    icon: Film,
    description: 'Director spotlights and filmmaking craft',
  },
  Feature: {
    text: 'text-accent-emerald',
    bg: 'bg-accent-emerald-muted',
    border: 'border-accent-emerald/30',
    dot: 'bg-accent-emerald',
    icon: BookOpen,
    description: 'Long-form features and essays',
  },
}

const featuredQuotes = [
  { text: 'Cinema is a mirror by which we often see ourselves.', author: 'Alejandro G. Iñárritu' },
  { text: 'A film is — or should be — more like music than like fiction.', author: 'Stanley Kubrick' },
  { text: 'The best films are the ones that make you feel something.', author: 'TamilCinemaHub' },
]

/* ═══════════════════════════════════════════════════════════════════════════════
   SUB-COMPONENTS
   ═══════════════════════════════════════════════════════════════════════════════ */

/* ── Category Card ─────────────────────────────────────────────────────────── */
function CategoryCard({
  cat,
  count,
  isActive,
  onClick,
  index,
}: {
  cat: string
  count: number
  isActive: boolean
  onClick: () => void
  index: number
}) {
  const config = categoryConfig[cat]
  if (!config) return null
  const Icon = config.icon

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl p-6 text-left transition-all duration-300 group ${
        isActive
          ? `${config.bg} border-2 ${config.border} shadow-lg`
          : 'bg-bg-card border border-border-subtle hover:border-border-accent'
      }`}
    >
      <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: `radial-gradient(circle, currentColor 0%, transparent 70%)` }}
      />

      <div className={`w-10 h-10 rounded-xl ${config.bg} flex items-center justify-center mb-4`}>
        <Icon size={18} className={config.text} />
      </div>
      <h3 className={`font-medium text-sm mb-1 ${isActive ? config.text : 'text-text-primary group-hover:text-accent-gold'} transition-colors`}>
        {cat}
      </h3>
      <p className="text-text-muted text-xs">{count} articles</p>
    </motion.button>
  )
}

/* ── Featured Blog Card (Hero Style) ──────────────────────────────────────── */
function FeaturedBlogCard({ blog, index }: { blog: any; index: number }) {
  const imageUrl = blog.mainImage ? urlFor(blog.mainImage).width(800).height(450).url() : null
  const readTime = Math.max(3, Math.ceil((blog.excerpt?.length || 200) / 200))
  const catConfig = categoryConfig[blog.category] || categoryConfig.Review

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.15 }}
    >
      <Link
        href={`/blogs/${blog.slug}`}
        className="group block bg-bg-card rounded-3xl overflow-hidden border border-border-subtle hover:border-border-accent transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-accent-gold/5 card-shine"
      >
        {/* Image */}
        <div className="aspect-[16/9] relative overflow-hidden">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={blog.title}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-700"
              sizes="(max-width:768px) 100vw, 50vw"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-bg-elevated to-bg-card" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

          {/* Category badge */}
          <div className="absolute top-4 left-4">
            <span
              className={`text-[11px] px-3 py-1.5 rounded-full border font-medium inline-flex items-center gap-1.5 backdrop-blur-sm ${catConfig.text} ${catConfig.bg} ${catConfig.border}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${catConfig.dot}`} />
              {blog.category || 'Review'}
            </span>
          </div>

          {/* Read time */}
          <div className="absolute top-4 right-4">
            <span className="text-[11px] px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-sm text-white/80 font-medium inline-flex items-center gap-1.5">
              <Clock size={10} />
              {readTime} min
            </span>
          </div>

          {/* Content overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
            <h2 className="font-playfair text-xl sm:text-2xl lg:text-3xl text-white leading-snug mb-3 group-hover:text-accent-gold-bright transition-colors duration-300">
              {blog.title}
            </h2>
            <p className="text-white/70 text-sm leading-relaxed line-clamp-2 max-w-[55ch]">
              {blog.excerpt}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-accent-gold-muted flex items-center justify-center text-accent-gold text-xs font-bold">
              {blog.author?.charAt(0) || 'A'}
            </div>
            <div>
              <p className="text-text-primary text-sm font-medium">{blog.author || 'TamilCinemaHub'}</p>
              <p className="text-text-muted text-xs">
                {new Date(blog.publishedAt).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>
          <span className="text-accent-gold text-sm font-semibold flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300">
            Read <ArrowRight size={12} />
          </span>
        </div>
      </Link>
    </motion.div>
  )
}

/* ── Blog Grid Card ────────────────────────────────────────────────────────── */
function BlogGridCard({ blog, index }: { blog: any; index: number }) {
  const imageUrl = blog.mainImage ? urlFor(blog.mainImage).width(600).height(340).url() : null
  const readTime = Math.max(3, Math.ceil((blog.excerpt?.length || 200) / 200))
  const catConfig = categoryConfig[blog.category] || categoryConfig.Review

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.5 }}
    >
      <Link
        href={`/blogs/${blog.slug}`}
        className="group block bg-bg-card rounded-2xl overflow-hidden border border-border-subtle hover:border-border-accent transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-accent-gold/5 card-shine h-full flex flex-col"
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
          <div className="absolute top-3 left-3">
            <span
              className={`text-[10px] px-2.5 py-1 rounded-full border font-medium inline-flex items-center gap-1 ${catConfig.text} ${catConfig.bg} ${catConfig.border}`}
            >
              <span className={`w-1 h-1 rounded-full ${catConfig.dot}`} />
              {blog.category || 'Review'}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col flex-1">
          <div className="flex items-center gap-2.5 text-text-muted text-xs mb-3">
            <Clock size={11} className="text-accent-gold/60" />
            <span>{readTime} min read</span>
            <span className="text-border-mid">·</span>
            <span>
              {new Date(blog.publishedAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </div>

          <h3 className="font-playfair text-lg text-text-primary group-hover:text-accent-gold transition-colors duration-300 line-clamp-2 mb-3 leading-snug">
            {blog.title}
          </h3>

          <p className="text-text-secondary text-sm leading-relaxed line-clamp-2 mb-4 flex-1">
            {blog.excerpt}
          </p>

          <div className="flex items-center justify-between pt-3 border-t border-border-subtle">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-accent-gold-muted flex items-center justify-center text-accent-gold text-[10px] font-bold">
                {blog.author?.charAt(0) || 'A'}
              </div>
              <span className="text-text-muted text-xs font-medium">{blog.author || 'TamilCinemaHub'}</span>
            </div>
            <span className="text-accent-gold text-xs font-semibold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300">
              Read <ArrowRight size={10} />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

/* ── Rotating Quote ────────────────────────────────────────────────────────── */
function RotatingQuote() {
  const [activeQuote, setActiveQuote] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveQuote((prev) => (prev + 1) % featuredQuotes.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="text-center py-12">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeQuote}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.4 }}
          className="max-w-2xl mx-auto"
        >
          <Quote size={32} className="text-accent-gold/20 mx-auto mb-4" />
          <p className="font-playfair text-xl md:text-2xl text-text-primary italic leading-relaxed mb-4">
            &ldquo;{featuredQuotes[activeQuote].text}&rdquo;
          </p>
          <p className="text-text-muted text-sm">— {featuredQuotes[activeQuote].author}</p>
        </motion.div>
      </AnimatePresence>

      <div className="flex items-center justify-center gap-2 mt-6">
        {featuredQuotes.map((_, i) => (
          <button
            key={i}
            onClick={() => setActiveQuote(i)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              i === activeQuote ? 'bg-accent-gold w-6' : 'bg-text-muted/30 hover:bg-text-muted/50'
            }`}
            aria-label={`Quote ${i + 1}`}
          />
        ))}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════════════════ */

export default function BlogsPageClient({
  initialBlogs,
  totalCount,
  initialCategory,
  currentPage,
  totalPages,
}: Props) {
  const heroRef = useRef(null)
  const heroInView = useInView(heroRef, { once: true })
  const contentRef = useRef(null)
  const contentInView = useInView(contentRef, { once: true, margin: '-50px' })

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  })
  const heroParallax = useTransform(scrollYProgress, [0, 1], [0, 80])

  const [searchQuery, setSearchQuery] = useState('')
  const [showCategoryExplorer, setShowCategoryExplorer] = useState(false)

  /* ── Category filter ──────────────────────────────────────────────────────── */
  const filterCategory = (cat: string) => {
    const params = new URLSearchParams()
    if (cat !== 'All') params.set('category', cat)
    window.location.href = `/blogs?${params.toString()}`
  }

  /* ── Category counts ──────────────────────────────────────────────────────── */
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: totalCount }
    initialBlogs.forEach((blog: any) => {
      const cat = blog.category || 'Review'
      counts[cat] = (counts[cat] || 0) + 1
    })
    return counts
  }, [initialBlogs, totalCount])

  /* ── Filtered blogs ───────────────────────────────────────────────────────── */
  const filteredBlogs = useMemo(() => {
    if (!searchQuery) return initialBlogs
    const q = searchQuery.toLowerCase()
    return initialBlogs.filter(
      (blog: any) =>
        blog.title?.toLowerCase().includes(q) ||
        blog.excerpt?.toLowerCase().includes(q) ||
        blog.author?.toLowerCase().includes(q)
    )
  }, [initialBlogs, searchQuery])

  /* ── Featured blog (first one) ────────────────────────────────────────────── */
  const featuredBlog = initialBlogs[0]
  const remainingBlogs = initialBlogs.slice(1)

  return (
    <>
      {/* ═══ HERO SECTION ═══ */}
      <section ref={heroRef} className="relative min-h-[65svh] flex flex-col justify-end pb-20 pt-32 lg:pt-36 overflow-hidden">
        <CinemaBackground />

        {/* Watermark */}
        <motion.span
          style={{ y: heroParallax }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-playfair text-[18vw] text-text-primary/[0.03] select-none pointer-events-none whitespace-nowrap"
        >
          EDITORIAL
        </motion.span>

        {/* Decorative elements */}
        <div className="absolute top-20 right-10 opacity-[0.03] pointer-events-none">
          <BookOpen size={200} className="text-accent-gold" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-accent-gold-muted/60 backdrop-blur-sm border border-accent-gold/20 rounded-full px-4 py-2 mb-6">
              <BookOpen size={14} className="text-accent-gold" />
              <span className="text-accent-gold text-[11px] font-mono tracking-[0.2em] uppercase">Blog &amp; Reviews</span>
            </div>

            <h1 className="font-playfair text-[clamp(36px,7vw,80px)] text-text-primary leading-[1.05] mb-6">
              Tamil Cinema<br />
              <span className="text-gradient-gold">In Focus</span>
            </h1>

            <p className="text-text-secondary text-base sm:text-lg max-w-xl leading-relaxed mb-8">
              Reviews, analysis, retrospectives, and stories from the vibrant world of Kollywood.
            </p>

            {/* Quick stats */}
            <div className="flex flex-wrap gap-6">
              {[
                { icon: BookOpen, label: 'Articles', value: totalCount.toLocaleString() },
                { icon: Tag, label: 'Categories', value: String(categories.length - 1) },
                { icon: TrendingUp, label: 'Updated', value: 'Weekly' },
              ].map((stat) => (
                <div key={stat.label} className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-bg-card border border-border-subtle flex items-center justify-center">
                    <stat.icon size={14} className="text-accent-gold" />
                  </div>
                  <div>
                    <p className="text-text-primary text-sm font-semibold leading-none">{stat.value}</p>
                    <p className="text-text-muted text-[10px] font-mono uppercase tracking-wider">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <FilmStripDecoration className="absolute bottom-0 left-0 right-0 opacity-40" />
      </section>

      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
        {/* ═══ CATEGORY FILTER BAR ═══ */}
        <div className="sticky top-16 lg:top-16 z-40 py-4 -mx-6 sm:-mx-8 lg:-mx-10 px-6 sm:px-8 lg:px-10 bg-bg-primary/80 backdrop-blur-xl border-b border-border-subtle">
          <div className="flex gap-2.5 overflow-x-auto scrollbar-hide pb-2">
            {categories.map((cat) => {
              const isActive = (cat === 'All' && !initialCategory) || initialCategory === cat
              const config = categoryConfig[cat]
              return (
                <button
                  key={cat}
                  onClick={() => filterCategory(cat)}
                  className={`shrink-0 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                    isActive
                      ? 'bg-accent-gold text-text-inverse shadow-lg shadow-accent-gold/20'
                      : 'border border-border-subtle text-text-secondary hover:border-border-accent hover:text-text-primary hover:bg-accent-gold-subtle'
                  }`}
                >
                  {config && <config.icon size={13} />}
                  {cat}
                </button>
              )
            })}
          </div>
        </div>

        {/* ═══ SEARCH BAR ═══ */}
        <div className="mt-8 mb-6">
          <div className="relative max-w-md">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search articles..."
              className="w-full bg-bg-card border border-border-subtle rounded-xl pl-11 pr-5 py-3 text-text-primary text-sm placeholder:text-text-dim focus:border-accent-gold focus:shadow-[0_0_0_3px_rgba(232,184,75,0.12)] outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-bg-elevated flex items-center justify-center text-text-muted hover:text-text-primary transition-colors"
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>

        {/* ═══ CATEGORY EXPLORER TOGGLE ═══ */}
        <div className="mb-8">
          <button
            onClick={() => setShowCategoryExplorer(!showCategoryExplorer)}
            className="flex items-center gap-2 text-sm text-accent-gold hover:text-accent-gold-bright transition-colors"
          >
            <Sparkles size={14} />
            {showCategoryExplorer ? 'Hide' : 'Explore'} Categories
            <ChevronRight size={12} className={`transition-transform ${showCategoryExplorer ? 'rotate-90' : ''}`} />
          </button>

          <AnimatePresence>
            {showCategoryExplorer && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mt-4">
                  {categories.filter((c) => c !== 'All').map((cat, i) => (
                    <CategoryCard
                      key={cat}
                      cat={cat}
                      count={categoryCounts[cat] || 0}
                      isActive={initialCategory === cat}
                      onClick={() => filterCategory(cat)}
                      index={i}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ═══ FEATURED BLOG ═══ */}
        {featuredBlog && !searchQuery && (
          <section ref={contentRef} className="mb-12">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={contentInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center gap-2 mb-6">
                <div className="w-1.5 h-1.5 rounded-full bg-accent-gold" />
                <span className="text-accent-gold text-[11px] font-mono tracking-[0.2em] uppercase">Featured</span>
              </div>
              <FeaturedBlogCard blog={featuredBlog} index={0} />
            </motion.div>
          </section>
        )}

        <CinematicDivider className="mb-12" />

        {/* ═══ ROTATING QUOTE ═══ */}
        <RotatingQuote />

        <CinematicDivider className="mb-12" />

        {/* ═══ BLOG GRID ═══ */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-accent-gold" />
              <span className="text-accent-gold text-[11px] font-mono tracking-[0.2em] uppercase">
                {searchQuery ? 'Search Results' : 'Latest Articles'}
              </span>
            </div>
            <span className="text-text-muted text-xs font-mono">
              {filteredBlogs.length} article{filteredBlogs.length !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {(searchQuery ? filteredBlogs : remainingBlogs).map((blog: any, i: number) => (
              <BlogGridCard key={blog._id} blog={blog} index={i} />
            ))}
          </div>

          {/* No results */}
          {filteredBlogs.length === 0 && searchQuery && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <Search size={48} className="text-text-muted mx-auto mb-4" />
              <p className="font-playfair text-xl text-text-secondary mb-2">No articles found</p>
              <p className="text-text-muted text-sm">Try a different search term</p>
              <button
                onClick={() => setSearchQuery('')}
                className="mt-6 text-accent-gold border border-accent-gold/30 rounded-xl px-6 py-2.5 hover:bg-accent-gold-muted transition-colors text-sm font-medium"
              >
                Clear Search
              </button>
            </motion.div>
          )}
        </section>

        {/* ═══ PAGINATION ═══ */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2.5 mb-16">
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

        {/* ═══ NEWSLETTER CTA ═══ */}
        <section className="mb-16">
          <div className="bg-bg-card border border-border-subtle rounded-2xl p-8 md:p-10 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-accent-gold/5 via-transparent to-accent-purple/5 pointer-events-none" />
            <div className="relative z-10 text-center max-w-lg mx-auto">
              <h3 className="font-playfair text-2xl text-text-primary mb-3">
                Never Miss a <span className="text-gradient-gold">Review</span>
              </h3>
              <p className="text-text-secondary text-sm mb-6">
                Get the latest Tamil cinema analysis and recommendations delivered to your inbox.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="flex-1 bg-bg-primary border border-border-mid rounded-xl px-5 py-3.5 text-text-primary text-sm placeholder:text-text-dim focus:border-accent-gold focus:ring-1 focus:ring-accent-gold/20 outline-none transition-all"
                />
                <button className="bg-accent-gold text-text-inverse font-semibold px-7 py-3.5 rounded-xl hover:bg-accent-gold-dim transition-colors shadow-lg shadow-accent-gold/20 whitespace-nowrap">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
