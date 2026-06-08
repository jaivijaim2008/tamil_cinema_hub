'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useTransition } from 'react'

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

  function updateParam(key: string, value: string) {
    const sp = new URLSearchParams(searchParams.toString())
    if (value) { sp.set(key, value) } else { sp.delete(key) }
    if (key !== 'page') sp.set('page', '1')
    startTransition(() => {
      router.replace(`/movies?${sp.toString()}`, { scroll: false })
    })
  }

  return (
    <>
      {/* Search bar */}
      <div className="max-w-lg mx-auto mb-8">
        <div className="relative">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#888] pointer-events-none" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
          </svg>
          <input
            type="text"
            value={localQ}
            onChange={(e) => setLocalQ(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') updateParam('q', localQ.trim()) }}
            placeholder="Search by title or director..."
            className="w-full rounded-full pl-11 pr-5 py-3.5 text-sm text-[#111] placeholder:text-[#888] outline-none transition-all duration-200 bg-white border border-[#E8E7E3] focus:border-[#D4291A] focus:ring-2 focus:ring-[#D4291A20]"
          />
          {localQ && (
            <button
              onClick={() => { setLocalQ(''); updateParam('q', '') }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#888] hover:text-[#444] transition-colors"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Genre pills */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
        {genres.map((genre) => {
          const isActive = genre === activeGenre
          return (
            <button
              key={genre}
              onClick={() => updateParam('genre', genre === 'All' ? '' : genre)}
              disabled={isPending && isActive}
              className="rounded-full px-[18px] py-2 text-[13px] font-medium transition-all duration-200 active:scale-95 disabled:cursor-wait"
              style={isActive
                ? { background: '#D4291A', color: '#fff', border: '1px solid #D4291A' }
                : { background: '#F2F1EE', color: '#444', border: '1px solid #E8E7E3' }
              }
            >
              {genre.charAt(0).toUpperCase() + genre.slice(1)}
            </button>
          )
        })}
      </div>
    </>
  )
}
