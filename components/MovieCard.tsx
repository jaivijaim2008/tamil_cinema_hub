'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { urlFor } from '../sanity/lib/image'
import { Star, Film, Database } from 'lucide-react'

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

export default function MovieCard({ movie, index = 0 }: MovieCardProps) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const mouseXSpring = useSpring(x)
  const mouseYSpring = useSpring(y)

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"])
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const width = rect.width
    const height = rect.height
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top
    const xPct = mouseX / width - 0.5
    const yPct = mouseY / height - 0.5
    x.set(xPct)
    y.set(yPct)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  const imageUrl = movie.poster 
    ? urlFor(movie.poster).width(400).height(600).url() 
    : movie.posterUrl || null

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateY,
        rotateX,
        transformStyle: "preserve-3d",
      }}
      className="relative w-full aspect-[2/3] rounded-[2rem] glass-panel group transition-all duration-500"
    >
      <Link href={`/movies/${movie.slug}`} className="block w-full h-full relative preserve-3d">
         
         <div 
           style={{ transform: "translateZ(50px)" }}
           className="absolute inset-4 rounded-[1.5rem] overflow-hidden shadow-2xl shadow-black/80"
         >
            {imageUrl ? (
              <Image src={imageUrl} alt={movie.title} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
            ) : (
              <div className="w-full h-full bg-white/[0.03] flex items-center justify-center text-4xl font-display font-black text-white/5">{movie.title.charAt(0)}</div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
         </div>

         {/* Floating Elements (Layered) */}
         <div 
           style={{ transform: "translateZ(80px)" }}
           className="absolute top-8 left-8 flex flex-col gap-2 pointer-events-none"
         >
            <span className="px-3 py-1 rounded-full glass-panel text-[7px] font-black uppercase tracking-[0.2em] text-white/60 border-white/10">
               {movie.genre?.[0] || 'Tamil'}
            </span>
         </div>

         <div 
           style={{ transform: "translateZ(100px)" }}
           className="absolute bottom-8 left-8 right-8 pointer-events-none"
         >
            <div className="flex items-center gap-1.5 mb-2 text-gold">
               <Star size={10} fill="currentColor" />
               <span className="text-[10px] font-black">{movie.rating.toFixed(1)}</span>
            </div>
            <h3 className="text-xl font-display font-black text-white leading-none uppercase truncate">{movie.title}</h3>
            <p className="mt-3 text-[8px] font-bold text-white/20 uppercase tracking-[0.2em]">{movie.year} • {movie.director}</p>
         </div>

      </Link>
    </motion.div>
  )
}
