'use client'

import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  currentPage: number
  totalPages: number
  baseUrl: string
  params?: Record<string, string>
}

export default function Pagination({ currentPage, totalPages, baseUrl, params = {} }: PaginationProps) {
  const router = useRouter()

  if (totalPages <= 1) return null

  function goToPage(page: number) {
    const sp = new URLSearchParams()
    Object.entries(params).forEach(([k, v]) => { if (v) sp.set(k, v) })
    sp.set('page', page.toString())
    router.push(`${baseUrl}?${sp.toString()}`)
  }

  return (
    <div className="flex items-center justify-center gap-6 py-12">
      <button
        onClick={() => goToPage(currentPage - 1)}
        disabled={currentPage <= 1}
        className="w-14 h-14 rounded-2xl glass-panel flex items-center justify-center text-white/40 hover:text-white disabled:opacity-10 transition-all"
      >
        <ChevronLeft size={24} />
      </button>

      <div className="glass-panel px-8 py-4 rounded-2xl">
         <span className="text-sm font-black text-white uppercase tracking-widest">
            Page <span className="text-crimson">{currentPage}</span> / {totalPages}
         </span>
      </div>

      <button
        onClick={() => goToPage(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="w-14 h-14 rounded-2xl glass-panel flex items-center justify-center text-white/40 hover:text-white disabled:opacity-10 transition-all"
      >
        <ChevronRight size={24} />
      </button>
    </div>
  )
}
