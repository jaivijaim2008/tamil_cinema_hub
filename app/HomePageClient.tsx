'use client'

import { useRef, lazy, Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, useScroll, useTransform, useSpring } from 'framer-motion'
import { ChevronRight, Sparkles, Database, TrendingUp, Zap, Film } from 'lucide-react'
import type { Movie } from '../components/MovieCard'
import type { Blog } from '../components/BlogCard'
import { urlFor } from '../sanity/lib/image'

const ChatWithAIButton = lazy(() => import('../components/ChatWithAIButton'))

export default function HomePageClient({ movies, blogs }: { movies: Movie[]; blogs: Blog[] }) {
  const containerRef = useRef<HTMLDivElement>(null)
  
  // ── THE DIVING ENGINE ──
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  })

  // We'll create a 4-movie "Dive" sequence
  const diveMovies = movies.slice(0, 4)

  return (
    <div ref={containerRef} className="relative bg-black min-h-[500vh]">
      
      {/* ── 1. THE CINEMATIC TUNNEL ── */}
      <section className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden perspective-container preserve-3d">
         
         {/* Background Atmospheric Depth */}
         <div className="absolute inset-0 z-0">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-b from-crimson/5 via-transparent to-violet/5 opacity-50" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vh] border border-white/5 rounded-full blur-3xl" />
         </div>

         {/* Diving Sequence */}
         {diveMovies.map((movie, i) => (
           <DivingPoster key={movie._id} movie={movie} index={i} progress={scrollYProgress} />
         ))}

         {/* Center Brand Anchor */}
         <motion.div 
           style={{
             scale: useTransform(scrollYProgress, [0, 0.1], [1, 0.5]),
             opacity: useTransform(scrollYProgress, [0, 0.05], [1, 0]),
           }}
           className="relative z-50 text-center"
         >
            <h1 className="text-spatial text-7xl md:text-9xl mb-4 leading-none">
              TamilCinema<br /><span className="gradient-shimmer">Hub.</span>
            </h1>
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20">The Spatial Archive Experience</p>
         </motion.div>

         {/* Scroll Hint */}
         <motion.div 
           style={{ opacity: useTransform(scrollYProgress, [0, 0.05], [1, 0]) }}
           className="absolute bottom-12 flex flex-col items-center gap-4"
         >
            <div className="w-px h-16 bg-gradient-to-b from-white/20 to-transparent" />
            <span className="text-[8px] font-black uppercase tracking-[0.4em] text-white/20">Scroll to Dive</span>
         </motion.div>
      </section>

      {/* ── 2. THE SPATIAL BENTO GRID ── */}
      <section className="relative z-50 pt-24 pb-48 bg-black">
         <div className="spatial-container">
            
            <div className="flex flex-col md:flex-row items-end justify-between mb-24 gap-8">
               <div className="max-w-2xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg glass-panel mb-6">
                     <TrendingUp size={12} className="text-crimson" />
                     <span className="text-[8px] font-black uppercase tracking-[0.3em] text-white/40">Market Trends</span>
                  </div>
                  <h2 className="text-spatial text-5xl md:text-7xl leading-none">
                     Recent <span className="gradient-shimmer">Artifacts</span>
                  </h2>
               </div>
               <Link href="/movies" className="group flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.3em] text-white/30 hover:text-white transition-all">
                  Archive Index <ChevronRight size={14} className="group-hover:translate-x-2 transition-transform" />
               </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
               {movies.slice(4, 12).map((movie, i) => (
                 <motion.div 
                   key={movie._id}
                   initial={{ opacity: 0, y: 50 }}
                   whileInView={{ opacity: 1, y: 0 }}
                   viewport={{ once: true }}
                   transition={{ delay: i * 0.05 }}
                 >
                    <MovieCardPlaceholder movie={movie} />
                 </motion.div>
               ))}
            </div>

         </div>
      </section>

      {/* ── 3. AI SPATIAL CTA ── */}
      <section className="relative z-50 pb-48">
         <div className="spatial-container">
            <div className="glass-panel rounded-[3rem] p-12 md:p-24 overflow-hidden relative">
               <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-crimson/10 rounded-full blur-[120px] -mr-64 -mt-64" />
               
               <div className="relative z-10 max-w-3xl">
                  <div className="w-16 h-16 rounded-2xl bg-white text-black flex items-center justify-center mb-12 shadow-2xl">
                     <Zap size={32} />
                  </div>
                  <h2 className="text-spatial text-5xl md:text-7xl mb-8 leading-none">
                     Neural <span className="gradient-shimmer">Search.</span>
                  </h2>
                  <p className="text-lg md:text-xl text-white/40 mb-12 leading-relaxed font-medium">
                     The database is too vast for simple filtering. Communicate with our neural engine to find the exact cinematic signature you crave.
                  </p>
                  <Suspense fallback={null}><ChatWithAIButton /></Suspense>
               </div>
            </div>
         </div>
      </section>

    </div>
  )
}

function DivingPoster({ movie, index, progress }: { movie: Movie, index: number, progress: any }) {
  // Each movie takes a window of 0.2 units of scroll
  const start = 0.05 + index * 0.2
  const mid = start + 0.1
  const end = start + 0.2

  // Transform scroll progress to 3D space
  const translateZ = useTransform(progress, [start, mid, end], [-2000, 0, 1000])
  const opacity = useTransform(progress, [start, mid, mid + 0.05, end], [0, 1, 1, 0])
  const rotateY = useTransform(progress, [start, mid, end], [index % 2 === 0 ? 20 : -20, 0, index % 2 === 0 ? -10 : 10])

  const smoothZ = useSpring(translateZ, { stiffness: 100, damping: 30 })
  const smoothOpacity = useSpring(opacity, { stiffness: 100, damping: 30 })

  const imageUrl = movie.poster 
    ? urlFor(movie.poster).width(800).url() 
    : movie.posterUrl || null

  return (
    <motion.div
      style={{ 
        translateZ: smoothZ, 
        opacity: smoothOpacity,
        rotateY: rotateY,
        zIndex: 40 - index
      }}
      className="absolute w-[350px] md:w-[450px] aspect-[2/3] rounded-[2rem] overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.9)] border border-white/10"
    >
      {imageUrl ? (
        <Image src={imageUrl} alt={movie.title} fill className="object-cover" />
      ) : (
        <div className="w-full h-full bg-white/5 flex items-center justify-center text-4xl font-display font-black text-white/10">{movie.title.charAt(0)}</div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
      <div className="absolute bottom-8 left-8 right-8">
         <div className="flex items-center gap-2 mb-2 text-[8px] font-black text-crimson uppercase tracking-[0.3em]">
            <Database size={10} /> Indexed Artifact {movie._id.slice(-4)}
         </div>
         <h3 className="text-3xl font-display font-black text-white uppercase leading-none">{movie.title}</h3>
         <p className="mt-4 text-[9px] font-bold text-white/30 uppercase tracking-widest">{movie.year} • Dir. {movie.director}</p>
      </div>
    </motion.div>
  )
}

function MovieCardPlaceholder({ movie }: { movie: Movie }) {
  const imageUrl = movie.poster ? urlFor(movie.poster).width(400).url() : movie.posterUrl || null
  return (
    <Link href={`/movies/${movie.slug}`} className="block group">
       <div className="aspect-[2/3] rounded-[1.5rem] overflow-hidden glass-panel mb-6 relative">
          {imageUrl ? (
            <Image src={imageUrl} alt={movie.title} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
          ) : (
            <div className="w-full h-full flex items-center justify-center"><Film size={32} className="text-white/5" /></div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
             <span className="text-[10px] font-black text-white">{movie.rating.toFixed(1)}</span>
             <span className="text-[8px] font-black text-white/40 uppercase tracking-widest">{movie.year}</span>
          </div>
       </div>
       <h4 className="text-sm font-black uppercase tracking-widest text-white/80 group-hover:text-crimson transition-colors">{movie.title}</h4>
       <p className="text-[8px] font-bold text-white/20 uppercase tracking-[0.2em] mt-2">{movie.director}</p>
    </Link>
  )
}
