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
    <div className="flex items-center justify-center gap-4 py-20">
      <button
        onClick={() => goToPage(currentPage - 1)}
        disabled={currentPage <= 1}
        className="w-14 h-14 rounded-2xl border border-white/5 bg-coal flex items-center justify-center text-white/40 hover:text-white disabled:opacity-5 transition-all"
      >
        <ChevronLeft size={20} />
      </button>

      <div className="px-10 py-4 rounded-2xl luxury-glass border-white/10">
         <span className="text-[10px] font-black text-white uppercase tracking-[0.4em]">
            Log <span className="text-crimson mx-2">{currentPage}</span> of {totalPages}
         </span>
      </div>

      <button
        onClick={() => goToPage(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="w-14 h-14 rounded-2xl border border-white/5 bg-coal flex items-center justify-center text-white/40 hover:text-white disabled:opacity-5 transition-all"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  )
}
