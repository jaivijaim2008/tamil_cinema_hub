'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useTransition, useEffect } from 'react'
import { Search, X, SlidersHorizontal } from 'lucide-react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface MovieFiltersProps {
  genres: string[]
}

export default function MovieFilters({ genres }: MovieFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const activeGenre = searchParams.get('genre') || 'All'
  const initialQ = searchParams.get('q')?.replace(/\*$/, '') || ''
  const [localQ, setLocalQ] = useState(initialQ)

  useEffect(() => {
    setLocalQ(initialQ)
  }, [initialQ])

  function updateParam(key: string, value: string) {
    const sp = new URLSearchParams(searchParams.toString())
    if (value) { sp.set(key, value) } else { sp.delete(key) }
    if (key !== 'page') sp.set('page', '1')
    startTransition(() => {
      router.replace(`/movies?${sp.toString()}`, { scroll: false })
    })
  }

  const allGenres = ['All', ...genres.filter(g => g !== 'All')]

  return (
    <div className="flex flex-col gap-12">
      
      {/* Search Bar - Luxury Focal */}
      <div className="max-w-3xl mx-auto w-full px-4">
        <div className="relative group">
          <Search 
            size={20} 
            className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-crimson transition-colors" 
          />
          <input
            type="text"
            value={localQ}
            onChange={(e) => setLocalQ(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') updateParam('q', localQ.trim()) }}
            placeholder="Search by title, actor, or master controller..."
            className="w-full bg-coal border border-white/5 rounded-[2rem] py-6 pl-16 pr-16 text-lg font-medium text-white outline-none focus:border-white/10 transition-all placeholder:text-white/10 shadow-2xl"
          />
          {localQ && (
            <button
              onClick={() => { setLocalQ(''); updateParam('q', '') }}
              className="absolute right-6 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-white/5 text-white/20 hover:text-white transition-all"
            >
              <X size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Genre Pills - Minimal Scroller */}
      <div className="flex flex-col items-center gap-6">
        <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.4em] text-white/20">
           <SlidersHorizontal size={12} /> Filter Parameters
        </div>
        
        <div className="flex flex-wrap items-center justify-center gap-3 px-6">
          {allGenres.map((genre) => {
            const isActive = genre === activeGenre
            return (
              <button
                key={genre}
                onClick={() => updateParam('genre', genre === 'All' ? '' : genre)}
                disabled={isPending && isActive}
                className={cn(
                  "px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border",
                  isActive
                    ? "bg-white border-white text-black shadow-2xl"
                    : "bg-transparent border-white/5 text-white/30 hover:text-white hover:border-white/20"
                )}
              >
                {genre}
              </button>
            )
          })}
        </div>
      </div>

      {isPending && (
        <div className="flex justify-center">
           <div className="w-12 h-0.5 bg-crimson animate-pulse rounded-full" />
        </div>
      )}
    </div>
  )
}
