'use client'

import { useRef, lazy, Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ChevronRight, Sparkles, TrendingUp, Zap, Globe, Award, Film, Play } from 'lucide-react'
import type { Movie } from '../components/MovieCard'
import type { Blog } from '../components/BlogCard'
import MovieCard from '../components/MovieCard'
import MovieCardErrorBoundary from '../components/MovieCardErrorBoundary'
import BlogCard from '../components/BlogCard'

const ChatWithAIButton = lazy(() => import('../components/ChatWithAIButton'))

export default function HomePageClient({ movies, blogs }: { movies: Movie[]; blogs: Blog[] }) {
  
  const stats = [
    { label: 'Movies Catalogued', value: '1,600+', icon: Film, color: 'text-crimson' },
    { label: 'Years of History', value: '26+', icon: Globe, color: 'text-white' },
    { label: 'AI Decisions', value: 'LIVE', icon: Sparkles, color: 'text-white' },
    { label: 'Critical Reviews', value: '800+', icon: Award, color: 'text-white' },
  ]

  return (
    <div className="bg-ink min-h-screen">
      
      {/* ── LUXURY HERO ── */}
      <section className="relative min-h-screen flex flex-col justify-center pt-32 pb-20">
        <div className="main-container relative z-10">
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full border border-white/5 bg-white/[0.02] mb-12">
               <span className="w-1.5 h-1.5 rounded-full bg-crimson animate-pulse" />
               <span className="text-[9px] font-black uppercase tracking-[0.4em] text-white/40">Kollywood&apos;s Premium Archive</span>
            </div>

            <h1 className="text-hero mb-12">
              TamilCinema<br />
              <span className="text-white/20">Archive</span><br />
              <span className="text-crimson">Hub.</span>
            </h1>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 mt-12">
               <p className="text-lg md:text-xl text-white/30 max-w-xl leading-relaxed font-medium">
                  A high-fidelity digital archive documenting the evolution of Tamil cinema. Explore 1,600+ cinematic artifacts with precision analytics and neural-powered discovery.
               </p>

               <div className="flex items-center gap-4">
                  <Link href="/movies" className="px-10 py-5 rounded-2xl bg-white text-black font-black uppercase tracking-widest text-xs hover:bg-silver transition-all shadow-2xl">
                     Browse Archive
                  </Link>
                  <Link href="/recommendations" className="group flex items-center gap-4 px-10 py-5 rounded-2xl border border-white/10 text-white font-black uppercase tracking-widest text-xs hover:bg-white/5 transition-all">
                     <Play size={14} className="fill-white" /> Smart Discover
                  </Link>
               </div>
            </div>
          </motion.div>

        </div>

        {/* Hero Background Decor */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
           <div className="absolute top-1/4 right-0 w-[800px] h-[800px] bg-crimson rounded-full blur-[200px] -mr-96" />
        </div>
      </section>

      {/* ── BENTO STATS ── */}
      <section className="pb-40">
        <div className="main-container">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, i) => (
                <motion.div 
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="luxury-card p-10 flex flex-col gap-6"
                >
                   <stat.icon size={24} className={stat.color} />
                   <div>
                      <div className="text-5xl font-display font-black text-white mb-1">{stat.value}</div>
                      <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">{stat.label}</div>
                   </div>
                </motion.div>
              ))}
           </div>
        </div>
      </section>

      {/* ── FEATURED MOVIES (BENTO) ── */}
      <section className="pb-40">
        <div className="main-container">
           
           <div className="flex flex-col md:flex-row items-end justify-between mb-24 gap-8">
              <div>
                 <div className="text-[10px] font-black uppercase tracking-[0.4em] text-crimson mb-6">Database Log</div>
                 <h2 className="text-title">Recent <span className="text-white/20">Additions</span></h2>
              </div>
              <Link href="/movies" className="group flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.4em] text-white/20 hover:text-white transition-all">
                 View Index <ChevronRight size={14} className="group-hover:translate-x-2 transition-transform" />
              </Link>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8">
              {movies.slice(0, 6).map((movie, i) => (
                <div 
                  key={movie._id}
                  className={i === 0 || i === 5 ? "lg:col-span-6" : "lg:col-span-3"}
                >
                   <MovieCardErrorBoundary title={movie.title}>
                      <MovieCard movie={movie} index={i} />
                   </MovieCardErrorBoundary>
                </div>
              ))}
           </div>

        </div>
      </section>

      {/* ── EDITORIAL PREVIEW ── */}
      <section className="pb-40">
         <div className="main-container">
            
            <div className="flex items-center justify-between mb-24">
               <div>
                  <div className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 mb-6">Critics Choice</div>
                  <h2 className="text-title">Latest <span className="text-crimson">Reviews</span></h2>
               </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
               {blogs.slice(0, 3).map((blog, i) => (
                 <div key={blog._id} className={i === 0 ? "lg:col-span-12" : "lg:col-span-6"}>
                    <BlogCard blog={blog} index={i} />
                 </div>
               ))}
            </div>

         </div>
      </section>

      {/* ── AI PERSPECTIVE ── */}
      <section className="pb-40">
         <div className="main-container">
            <div className="luxury-glass rounded-[3rem] p-12 md:p-24 overflow-hidden relative">
               <div className="relative z-10 max-w-3xl">
                  <div className="w-16 h-16 rounded-[1.5rem] bg-white text-black flex items-center justify-center mb-12 shadow-2xl">
                     <Zap size={32} fill="black" />
                  </div>
                  <h2 className="text-hero text-6xl md:text-8xl mb-10 leading-none">
                     Neural<br />
                     <span className="text-white/20">Match</span>
                  </h2>
                  <p className="text-xl text-white/40 mb-16 max-w-xl leading-relaxed font-medium">
                     Uncertain where to dive next? Our neural engine cross-references 1,600+ cinematic vectors to find your perfect match.
                  </p>
                  <Suspense fallback={null}><ChatWithAIButton /></Suspense>
               </div>

               {/* Decor */}
               <div className="absolute top-0 right-0 w-full h-full opacity-5 pointer-events-none">
                  <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-crimson rounded-full blur-[150px]" />
               </div>
            </div>
         </div>
      </section>

    </div>
  )
}
