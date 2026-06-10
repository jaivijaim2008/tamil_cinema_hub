'use client'

import { useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, useScroll, useTransform, useSpring } from 'framer-motion'
import { urlFor } from '../sanity/lib/image'
import { Star, Film, Monitor } from 'lucide-react'

export interface Movie {
  _id: string
  title: string
  titleTanglish?: string
  slug: string
  year: number
  director?: string
  cast?: string[]
  genre?: string[]
  rating: number
  poster?: any
  posterUrl?: string
  backdropUrl?: string
  synopsis?: string
  ottPlatform?: string
}

interface MovieCardProps {
  movie: Movie
  index?: number
}

const OTT_CONFIG: Record<string, { color: string; bg: string }> = {
  'Netflix': { color: 'text-white', bg: 'bg-[#E50914]' },
  'Amazon Prime': { color: 'text-white', bg: 'bg-[#00A8E1]' },
  'Disney+ Hotstar': { color: 'text-white', bg: 'bg-[#112350]' },
  'ZEE5': { color: 'text-white', bg: 'bg-[#1E3C72]' },
}

export default function MovieCard({ movie, index = 0 }: MovieCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  
  // ── 3D Scroll-Linked Rotation ──
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start end", "end start"]
  })

  const rotateX = useTransform(scrollYProgress, [0, 0.5, 1], [10, 0, -10])
  const rotateY = useTransform(scrollYProgress, [0, 0.5, 1], [-5, 0, 5])
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.95, 1, 0.95])
  
  const springRotateX = useSpring(rotateX, { stiffness: 100, damping: 30 })
  const springRotateY = useSpring(rotateY, { stiffness: 100, damping: 30 })
  const springScale = useSpring(scale, { stiffness: 100, damping: 30 })

  const imageUrl = movie.poster
    ? urlFor(movie.poster).width(500).height(750).quality(90).fit('max').url()
    : movie.posterUrl || null

  const ott = movie.ottPlatform ? (OTT_CONFIG[movie.ottPlatform] || { color: 'text-white', bg: 'bg-crimson' }) : null

  return (
    <motion.div
      ref={cardRef}
      style={{ 
        rotateX: springRotateX, 
        rotateY: springRotateY, 
        scale: springScale,
        perspective: 1000 
      }}
      className="group h-full"
    >
      <Link href={`/movies/${movie.slug}`} className="block h-full bento-card overflow-hidden group">
        <div className="relative aspect-[2/3] overflow-hidden">
          {imageUrl ? (
            <Image 
              src={imageUrl} 
              alt={movie.title} 
              fill 
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-700 group-hover:scale-110" 
            />
          ) : (
            <div className="w-full h-full bg-white/[0.03] flex flex-col items-center justify-center p-8 text-center">
               <Film size={40} className="text-white/10 mb-4" />
               <span className="text-xs font-black uppercase tracking-widest text-white/20">{movie.title}</span>
            </div>
          )}

          {/* Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />
          
          {/* Badges */}
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            {movie.genre?.[0] && (
              <span className="px-3 py-1 rounded-lg glass text-[8px] font-black uppercase tracking-widest text-white/80">
                {movie.genre[0]}
              </span>
            )}
          </div>

          {ott && (
            <div className={`absolute bottom-4 right-4 px-2 py-1 rounded-md ${ott.bg} ${ott.color} text-[7px] font-black uppercase tracking-widest shadow-xl`}>
              {movie.ottPlatform}
            </div>
          )}

          {/* Rating Floating */}
          <div className="absolute bottom-4 left-4 flex items-center gap-1.5">
             <div className="w-8 h-8 rounded-full glass flex items-center justify-center">
                <Star size={12} className="text-gold fill-gold" />
             </div>
             <span className="text-sm font-black text-white">{movie.rating.toFixed(1)}</span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 bg-white/[0.02]">
           <div className="flex items-center justify-between mb-2">
              <span className="text-[9px] font-black uppercase tracking-widest text-white/20">{movie.year}</span>
              <span className="text-[9px] font-black uppercase tracking-widest text-crimson">Kollywood</span>
           </div>
           <h3 className="text-lg md:text-xl font-display font-black text-white leading-[1.1] uppercase group-hover:text-gradient transition-all duration-300">
             {movie.title}
           </h3>
           <p className="mt-3 text-[10px] font-bold text-white/30 truncate uppercase tracking-wider">
             Dir. {movie.director || 'Unknown'}
           </p>
        </div>
      </Link>
    </motion.div>
  )
}
