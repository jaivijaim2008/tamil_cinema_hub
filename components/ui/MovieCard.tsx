'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Film, Star } from 'lucide-react'
import type { Movie } from '@/lib/types'
import { motion } from 'framer-motion'
import { getRatingColor } from '@/lib/constants'
import { urlFor } from '@/sanity/lib/image'

export interface MovieCardMovie {
  _id: string
  title: string
  titleTanglish?: string
  slug: string
  year: number
  director?: string
  rating?: number
  poster?: any
  posterUrl?: string | null
  genre?: string[]
  cast?: string[]
}

// Re-export the core type that server pages import from here
export type { Movie } from '@/lib/types'

interface Props {
  movie: MovieCardMovie
  index?: number
}

export default function MovieCard({ movie, index = 0 }: Props) {
  const imageUrl = movie.poster?.asset
    ? urlFor(movie.poster).width(500).height(750).url()
    : movie.posterUrl || null

  const ratingColor = movie.rating ? getRatingColor(movie.rating) : '#666'

  return (
    <Link
      href={`/movies/${movie.slug}`}
      className="group block outline-none"
    >
      {/* Poster with 3D Hover & Glassmorphism */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.6, delay: Math.min(index * 0.05, 0.5), ease: "easeOut" }}
        whileHover={{ y: -8, scale: 1.03 }}
        className="relative aspect-[2/3] rounded-xl overflow-hidden glass-card border border-white/5 group-hover:border-accent-gold/40 group-focus-visible:border-accent-gold/40 transition-colors duration-300 shadow-xl"
      >
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={movie.title}
            fill
            sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 20vw"
            className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-text-muted bg-bg-surface">
            <Film size={32} />
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Rating badge */}
        {movie.rating != null && movie.rating > 0 && (
          <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/70 backdrop-blur-sm rounded-lg px-2 py-1">
            <Star size={10} className="fill-current" style={{ color: ratingColor }} />
            <span className="text-xs font-bold text-white">{Number(movie.rating).toFixed(1)}</span>
          </div>
        )}

        {/* Year tag */}
        <div className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span className="text-[10px] font-bold text-white/90 glassmorphism rounded-md px-2 py-1">
            {movie.year}
          </span>
        </div>
      </motion.div>

      {/* Info */}
      <div className="mt-3 px-0.5">
        <h3 className="text-sm font-semibold text-text-primary truncate group-hover:text-accent-gold transition-colors duration-200">
          {movie.title}
        </h3>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-text-muted truncate">{movie.year}</span>
          {movie.director && (
            <>
              <span className="text-text-muted text-[8px]">•</span>
              <span className="text-xs text-text-muted truncate">{movie.director}</span>
            </>
          )}
        </div>
        {movie.genre && movie.genre.length > 0 && (
          <div className="flex gap-1 mt-2 overflow-hidden">
            {movie.genre.slice(0, 2).map((g) => (
              <span
                key={g}
                className="text-[10px] font-medium text-text-secondary bg-bg-elevated rounded-full px-2 py-0.5 shrink-0"
              >
                {g}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  )
}
