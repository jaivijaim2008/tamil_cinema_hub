'use client'

import { useRef, lazy, Suspense } from 'react'
import Link from 'next/link'
import { motion, useScroll, useTransform, useSpring, useInView } from 'framer-motion'
import MovieCard, { Movie } from '../components/MovieCard'
import MovieCardErrorBoundary from '../components/MovieCardErrorBoundary'
import BlogCard, { Blog } from '../components/BlogCard'
import { ChevronRight, Sparkles, TrendingUp, Zap, Globe, Award } from 'lucide-react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const ChatWithAIButton = lazy(() => import('../components/ChatWithAIButton'))

export default function HomePageClient({ movies, blogs }: { movies: Movie[]; blogs: Blog[] }) {
  const containerRef = useRef<HTMLDivElement>(null)
  
  // ── 3D Scroll Logic ──
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  })

  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 })
  
  // Transform values for hero 3D posters
  const heroRotateX = useTransform(smoothProgress, [0, 0.2], [0, 20])
  const heroTranslateZ = useTransform(smoothProgress, [0, 0.2], [0, -100])
  const heroOpacity = useTransform(smoothProgress, [0, 0.15], [1, 0])

  const stats = [
    { label: 'Movies Catalogued', value: '1,600+', icon: TrendingUp, color: 'text-crimson' },
    { label: 'Years of History', value: '26+', icon: Globe, color: 'text-gold' },
    { label: 'AI Powered', value: 'LIVE', icon: Zap, color: 'text-violet' },
    { label: 'Top Reviews', value: '800+', icon: Award, color: 'text-teal' },
  ]

  return (
    <div ref={containerRef} className="bg-ink min-h-screen">
      
      {/* ── 3D HERO SECTION ── */}
      <section className="relative h-screen flex items-center overflow-hidden perspective-container">
        {/* Background Depth Elements */}
        <div className="absolute inset-0 z-0">
          <motion.div 
            style={{ opacity: heroOpacity }}
            className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-crimson/10 rounded-full blur-[120px]" 
          />
          <motion.div 
            style={{ opacity: heroOpacity }}
            className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-violet/10 rounded-full blur-[100px]" 
          />
        </div>

        <div className="section-container relative z-10 w-full grid lg:grid-cols-2 gap-16 items-center">
          
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border-white/10 mb-8">
              <Sparkles size={14} className="text-gold animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Kollywood&apos;s #1 Archive</span>
            </div>

            <h1 className="title-3d text-6xl md:text-8xl lg:text-9xl mb-8 leading-[0.85]">
              Tamil<br />
              Cinema<br />
              <span className="text-gradient">Hub.</span>
            </h1>

            <p className="text-lg md:text-xl text-white/40 max-w-lg mb-10 leading-relaxed font-medium">
              A high-end cinematic database tracking 1,600+ films. Experience the future of movie discovery with 3D interactions and AI-powered insights.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link href="/movies" className="px-8 py-5 rounded-2xl bg-white text-ink font-black uppercase tracking-widest text-xs hover:scale-105 active:scale-95 transition-all shadow-xl shadow-white/10">
                Explore Database
              </Link>
              <Link href="/blogs" className="px-8 py-5 rounded-2xl glass text-white font-black uppercase tracking-widest text-xs hover:bg-white/5 transition-all">
                Read Reviews
              </Link>
            </div>
          </motion.div>

          {/* 3D Poster Stack Visual */}
          <motion.div 
            style={{ rotateX: heroRotateX, translateZ: heroTranslateZ, opacity: heroOpacity }}
            className="relative hidden lg:block h-[600px] preserve-3d"
          >
            <Hero3DPoster index={0} className="bg-gradient-to-br from-crimson/20 to-ink border-crimson/30 z-30" />
            <Hero3DPoster index={1} className="bg-gradient-to-br from-violet/20 to-ink border-violet/30 translate-x-12 translate-y-12 rotate-[5deg] z-20" />
            <Hero3DPoster index={2} className="bg-gradient-to-br from-teal/20 to-ink border-teal/30 -translate-x-12 translate-y-24 -rotate-[5deg] z-10" />
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          style={{ opacity: heroOpacity }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4"
        >
          <span className="text-[9px] font-black uppercase tracking-[0.4em] text-white/20">Scroll to Dive</span>
          <div className="w-px h-20 bg-gradient-to-b from-white/20 to-transparent" />
        </motion.div>
      </section>

      {/* ── BENTO STATS SECTION ── */}
      <section className="section-container pt-0">
        <div className="bento-grid grid-fix">
          {stats.map((stat, i) => (
            <motion.div 
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="col-span-12 md:col-span-6 lg:col-span-3 bento-card p-10 flex flex-col items-center text-center gap-4"
            >
              <div className={`p-4 rounded-2xl bg-white/[0.03] border border-white/5 ${stat.color}`}>
                <stat.icon size={32} />
              </div>
              <div>
                <div className="text-4xl font-display font-black text-white mb-1">{stat.value}</div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-white/20">{stat.label}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── BENTO MOVIES SECTION ── */}
      <section className="section-container">
        <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-8">
          <div className="max-w-xl">
            <div className="text-[10px] font-black uppercase tracking-[0.4em] text-crimson mb-4">The Collection</div>
            <h2 className="text-4xl md:text-6xl font-display font-black text-white leading-[0.9] uppercase">
              Latest <span className="text-gradient">Additions</span>
            </h2>
          </div>
          <Link href="/movies" className="group flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-white transition-colors">
            View All Titles <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="bento-grid grid-fix">
          {movies.slice(0, 6).map((movie, i) => (
            <motion.div 
              key={movie._id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className={cn(
                "col-span-12 md:col-span-6",
                i === 0 || i === 5 ? "lg:col-span-6" : "lg:col-span-3"
              )}
            >
              <MovieCardErrorBoundary title={movie.title}>
                <MovieCard movie={movie} index={i} />
              </MovieCardErrorBoundary>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── BENTO BLOGS SECTION ── */}
      <section className="section-container">
        <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-8 text-right md:text-left">
          <div className="max-w-xl ml-auto md:ml-0">
            <div className="text-[10px] font-black uppercase tracking-[0.4em] text-violet mb-4">Editorial Insight</div>
            <h2 className="text-4xl md:text-6xl font-display font-black text-white leading-[0.9] uppercase">
              Critics & <span className="text-gradient">Columns</span>
            </h2>
          </div>
        </div>

        <div className="bento-grid grid-fix">
          {blogs.slice(0, 3).map((blog, i) => (
            <motion.div 
              key={blog._id}
              initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className={cn(
                "col-span-12",
                i === 0 ? "lg:col-span-8" : "lg:col-span-4"
              )}
            >
              <BlogCard blog={blog} index={i} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── AI CTA ── */}
      <section className="section-container">
        <div className="bento-card bg-gradient-to-br from-crimson/10 via-ink to-violet/10 p-12 md:p-24 text-center overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
             <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-white rounded-full blur-[100px]" />
             <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-crimson rounded-full blur-[100px]" />
          </div>
          
          <div className="relative z-10 max-w-3xl mx-auto">
            <div className="w-20 h-20 bg-crimson rounded-[2rem] flex items-center justify-center mx-auto mb-10 shadow-2xl shadow-crimson/40">
              <Sparkles size={40} className="text-white" />
            </div>
            <h2 className="text-5xl md:text-7xl font-display font-black text-white uppercase leading-[0.9] mb-8">
              Confused? Let <span className="text-gradient">AI</span> Decide.
            </h2>
            <p className="text-lg text-white/40 mb-12 font-medium">
              Our neural network knows 1,600+ Tamil films intimately. Just describe your mood, and let the AI architect your next cinematic experience.
            </p>
            <Suspense fallback={null}><ChatWithAIButton /></Suspense>
          </div>
        </div>
      </section>

    </div>
  )
}

function Hero3DPoster({ index, className }: { index: number, className?: string }) {
  return (
    <div className={cn(
      "absolute inset-0 w-[400px] h-[550px] rounded-[3rem] border border-white/5 backdrop-blur-2xl shadow-[0_50px_100px_rgba(0,0,0,0.6)] flex flex-col items-center justify-center p-12 text-center transition-all duration-700",
      className
    )}>
      <div className="w-16 h-1 bg-white/10 rounded-full mb-12" />
      <div className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20 mb-4">Sample Title</div>
      <div className="text-4xl font-display font-black text-white uppercase leading-[0.85]">
        The<br />Future<br />Of<br /><span className="text-gradient">Tamil</span><br />Cinema
      </div>
      <div className="mt-auto flex items-center gap-6">
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Year</span>
          <span className="text-sm font-bold text-white">2026</span>
        </div>
        <div className="w-px h-8 bg-white/5" />
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Rating</span>
          <span className="text-sm font-bold text-gold">★ 5.0</span>
        </div>
      </div>
    </div>
  )
}
