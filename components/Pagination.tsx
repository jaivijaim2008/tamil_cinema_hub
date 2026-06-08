import Link from 'next/link'

interface PaginationProps {
  currentPage: number
  totalPages: number
  baseUrl: string
  params?: Record<string, string>
}

export default function Pagination({ currentPage, totalPages, baseUrl, params = {} }: PaginationProps) {
  if (totalPages <= 1) return null

  function getPageUrl(page: number) {
    const sp = new URLSearchParams()
    for (const [k, v] of Object.entries(params)) {
      if (v) sp.set(k, v)
    }
    sp.set('page', String(page))
    return `${baseUrl}?${sp.toString()}`
  }

  const pages: (number | 'dots')[] = []
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i)
  } else {
    pages.push(1)
    if (currentPage > 3) pages.push('dots')
    const start = Math.max(2, currentPage - 1)
    const end = Math.min(totalPages - 1, currentPage + 1)
    for (let i = start; i <= end; i++) pages.push(i)
    if (currentPage < totalPages - 2) pages.push('dots')
    pages.push(totalPages)
  }

  const base = 'inline-flex items-center justify-center min-w-[36px] h-9 rounded-[6px] text-[14px] font-medium transition-all duration-200'
  const active = 'bg-[#D4291A] text-white'
  const inactive = 'bg-white border border-[#E8E7E3] text-[#444] hover:border-[#D4291A] hover:text-[#D4291A]'
  const disabled = 'bg-[#F7F7F5] text-[#ccc] border border-[#E8E7E3] cursor-not-allowed'

  return (
    <nav className="flex items-center justify-center gap-1.5 mt-12" aria-label="Pagination">
      {currentPage > 1 ? (
        <Link href={getPageUrl(currentPage - 1)} className={`${base} px-3 ${inactive}`}>
          ← Prev
        </Link>
      ) : (
        <span className={`${base} px-3 ${disabled}`}>← Prev</span>
      )}

      {pages.map((p, i) =>
        p === 'dots' ? (
          <span key={`d${i}`} className={`${base} text-[#888]`}>…</span>
        ) : (
          <Link
            key={p}
            href={getPageUrl(p)}
            className={`${base} ${p === currentPage ? active : inactive}`}
            style={p === currentPage ? { width: '36px', height: '36px' } : undefined}
          >
            {p}
          </Link>
        )
      )}

      {currentPage < totalPages ? (
        <Link href={getPageUrl(currentPage + 1)} className={`${base} px-3 ${inactive}`}>
          Next →
        </Link>
      ) : (
        <span className={`${base} px-3 ${disabled}`}>Next →</span>
      )}
    </nav>
  )
}
