'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useTransition, useEffect } from 'react'
import { Search, X, Tag } from 'lucide-react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const CATEGORIES = ['All', 'Review', 'Top List', 'News', 'Actor', 'Director', 'Feature']

export default function BlogFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const activeCategory = searchParams.get('category') || 'All'
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
      router.replace(`/blogs?${sp.toString()}`, { scroll: false })
    })
  }

  return (
    <div className="space-y-8 mb-12">
      {/* Search Bar */}
      <div className="max-w-xl mx-auto px-4">
        <div className="relative group">
          <Search 
            size={18} 
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-crimson transition-colors" 
          />
          <input
            type="text"
            value={localQ}
            onChange={(e) => setLocalQ(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') updateParam('q', localQ.trim()) }}
            placeholder="Search reviews, news, or authors..."
            className="w-full bg-white/[0.04] border border-white/5 rounded-2xl py-4 pl-12 pr-12 text-sm font-medium text-white outline-none focus:bg-white/[0.08] focus:border-white/10 transition-all placeholder:text-white/10 shadow-xl"
          />
          {localQ && (
            <button
              onClick={() => { setLocalQ(''); updateParam('q', '') }}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-white/5 text-white/20 hover:text-white transition-all"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-col items-center space-y-4">
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white/20">
          <Tag size={12} />
          Editorial Categories
        </div>
        
        <div className="flex flex-wrap items-center justify-center gap-2 px-4">
          {CATEGORIES.map((cat) => {
            const isActive = cat === activeCategory
            return (
              <button
                key={cat}
                onClick={() => updateParam('category', cat === 'All' ? '' : cat)}
                disabled={isPending && isActive}
                className={cn(
                  "px-5 py-2 rounded-xl text-xs font-bold transition-all border",
                  isActive
                    ? "bg-white text-ink border-white shadow-lg"
                    : "bg-white/[0.03] border-white/5 text-white/40 hover:text-white/70 hover:border-white/10 hover:bg-white/[0.05]"
                )}
              >
                {cat}
              </button>
            )
          })}
        </div>
      </div>

      {isPending && (
        <div className="flex justify-center">
          <div className="h-1 w-24 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-crimson animate-shimmer" style={{ width: '50%' }} />
          </div>
        </div>
      )}
    </div>
  )
}
