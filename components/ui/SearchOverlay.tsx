'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, Film, Star } from 'lucide-react'
import { client } from '../../sanity/client'
import { urlFor } from '../../sanity/lib/image'
import type { Movie } from './MovieCard'


interface Props {
  open: boolean
  onClose: () => void
}

export default function SearchOverlay({ open, onClose }: Props) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Movie[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      setQuery('')
      setResults([])
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open])

  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }
    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const data = await client.fetch<Movie[]>(
          `*[_type == "movie" && (title match $q || titleTanglish match $q || director match $q)] | order(year desc)[0...8] {
            _id, title, "slug": slug.current, year, director, genre, rating, poster, posterUrl
          }`,
          { q: query }
        )
        setResults(data)
      } catch {
        setResults([])
      }
      setLoading(false)
    }, 300)
    return () => clearTimeout(timer)
  }, [query])

  const handleSelect = useCallback((slug: string) => {
    onClose()
    router.push(`/movies/${slug}`)
  }, [onClose, router])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (open) {
      window.addEventListener('keydown', handler)
      return () => window.removeEventListener('keydown', handler)
    }
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[60] bg-bg-primary/96 backdrop-blur-2xl"
          onClick={onClose}
        >
          {/* Scanline effect */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.15]">
            <div className="absolute left-0 right-0 h-px bg-accent-gold animate-scanline" />
          </div>

          <div className="max-w-2xl mx-auto px-6 pt-24" onClick={(e) => e.stopPropagation()}>
            {/* Search input */}
            <motion.div
              initial={{ y: -30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="relative"
            >
              <Search size={20} className="absolute left-0 top-1/2 -translate-y-1/2 text-accent-gold" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search Tamil films..."
                className="w-full bg-transparent border-b-2 border-accent-gold text-text-primary text-2xl lg:text-3xl pl-8 pr-10 py-4 outline-none placeholder:text-text-muted font-inter"
              />
              <button
                onClick={onClose}
                className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-text-muted hover:text-text-primary transition-colors"
                aria-label="Close search"
              >
                <X size={20} />
              </button>
            </motion.div>

            {/* Results */}
            <div className="mt-8 space-y-1">
              {loading && (
                <p className="text-text-muted text-sm py-4">Searching...</p>
              )}
              {results.map((movie, i) => {
                const imageUrl = movie.poster
                  ? urlFor(movie.poster).width(100).height(150).url()
                  : movie.posterUrl
                return (
                  <motion.button
                    key={movie._id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={() => handleSelect(movie.slug)}
                    className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-bg-elevated transition-colors text-left group"
                  >
                    {/* Gold accent bar on hover */}
                    <div className="w-0.5 h-12 bg-accent-gold rounded-full opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />

                    {/* Poster thumbnail */}
                    <div className="w-10 h-14 rounded-md overflow-hidden bg-bg-elevated shrink-0">
                      {imageUrl ? (
                        <img src={imageUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Film size={16} className="text-text-muted" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-text-primary font-medium truncate">{movie.title}</p>
                      <p className="text-text-muted text-sm">{movie.year} · {movie.director}</p>
                    </div>

                    {/* Badges */}
                    <div className="flex items-center gap-2 shrink-0">
                      {movie.genre?.[0] && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent-gold-muted text-accent-gold border border-border-accent">
                          {movie.genre[0]}
                        </span>
                      )}
                      {movie.rating && (
                        <span className="flex items-center gap-0.5 text-xs text-accent-gold font-mono">
                          <Star size={10} fill="currentColor" />
                          {movie.rating}
                        </span>
                      )}
                    </div>
                  </motion.button>
                )
              })}
              {!loading && query && results.length === 0 && (
                <p className="text-text-muted text-sm py-8 text-center">No films found for &ldquo;{query}&rdquo;</p>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
