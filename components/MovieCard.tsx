'use client'

import { useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { urlFor } from '../sanity/lib/image'
import { Star, Film } from 'lucide-react'

export interface Movie {
  _id: string
  title: string
  slug: string
  year: number
  director?: string
  rating: number
  poster?: any
  posterUrl?: string
  genre?: string[]
}

interface MovieCardProps {
  movie: Movie
  index?: number
}

export default function MovieCard({ movie, index = 0 }: MovieCardProps) {
  const imageUrl = movie.poster 
    ? urlFor(movie.poster).width(500).height(750).url() 
    : movie.posterUrl || null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: (index % 4) * 0.1 }}
      className="group"
    >
      <Link href={`/movies/${movie.slug}`} className="block">
        
        {/* Poster - High fidelity, flat */}
        <div className="relative aspect-[2/3] rounded-[1.5rem] overflow-hidden bg-coal mb-6 border border-white/5 group-hover:border-crimson/50 transition-all duration-500">
           {imageUrl ? (
             <Image 
               src={imageUrl} 
               alt={movie.title} 
               fill 
               sizes="(max-width: 768px) 50vw, 25vw"
               className="object-cover group-hover:scale-105 transition-transform duration-700" 
             />
           ) : (
             <div className="w-full h-full flex items-center justify-center text-white/5">
                <Film size={48} />
             </div>
           )}
           <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
           
           {/* Minimal Rating */}
           <div className="absolute bottom-6 left-6 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg luxury-glass flex items-center justify-center">
                 <Star size={12} className="text-crimson fill-crimson" />
              </div>
              <span className="text-sm font-black text-white">{movie.rating.toFixed(1)}</span>
           </div>
        </div>

        {/* Info - Clean Typography */}
        <div className="px-2">
           <div className="flex items-center justify-between mb-2">
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/20">{movie.year}</span>
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-crimson">Archive Artifact</span>
           </div>
           <h3 className="text-xl font-display font-black text-white uppercase leading-none truncate transition-colors group-hover:text-crimson">
             {movie.title}
           </h3>
           <p className="mt-3 text-[10px] font-bold text-white/20 uppercase tracking-widest truncate">
             {movie.director || 'Digital Master'}
           </p>
        </div>

      </Link>
    </motion.div>
  )
}
