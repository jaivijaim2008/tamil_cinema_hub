'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Props {
  currentPage: number
  totalPages: number
  basePath: string
  params?: Record<string, string>
}

export default function Pagination({ currentPage, totalPages, basePath, params = {} }: Props) {
  if (totalPages <= 1) return null

  function buildUrl(page: number) {
    const sp = new URLSearchParams()
    sp.set('page', String(page))
    for (const [k, v] of Object.entries(params)) {
      if (v) sp.set(k, v)
    }
    return `${basePath}?${sp.toString()}`
  }

  const pages: (number | '...')[] = []
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i)
  } else {
    pages.push(1)
    if (currentPage > 3) pages.push('...')
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pages.push(i)
    }
    if (currentPage < totalPages - 2) pages.push('...')
    pages.push(totalPages)
  }

  return (
    <nav className="flex items-center justify-center gap-1 mt-10" aria-label="Pagination">
      {currentPage > 1 && (
        <a
          href={buildUrl(currentPage - 1)}
          className="w-9 h-9 flex items-center justify-center rounded-lg bg-bg-card border border-border text-text-secondary hover:text-text-primary hover:border-accent-gold/30 transition-all"
          aria-label="Previous page"
        >
          <ChevronLeft size={16} />
        </a>
      )}

      {pages.map((p, i) =>
        p === '...' ? (
          <span key={`dots-${i}`} className="w-9 h-9 flex items-center justify-center text-text-muted text-sm">
            …
          </span>
        ) : (
          <a
            key={p}
            href={buildUrl(p)}
            className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium transition-all ${
              p === currentPage
                ? 'bg-accent-gold text-text-inverse font-bold'
                : 'bg-bg-card border border-border text-text-secondary hover:text-text-primary hover:border-accent-gold/30'
            }`}
            aria-current={p === currentPage ? 'page' : undefined}
          >
            {p}
          </a>
        )
      )}

      {currentPage < totalPages && (
        <a
          href={buildUrl(currentPage + 1)}
          className="w-9 h-9 flex items-center justify-center rounded-lg bg-bg-card border border-border text-text-secondary hover:text-text-primary hover:border-accent-gold/30 transition-all"
          aria-label="Next page"
        >
          <ChevronRight size={16} />
        </a>
      )}
    </nav>
  )
}
