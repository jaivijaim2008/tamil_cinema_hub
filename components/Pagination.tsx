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

  const base = { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: 36, height: 36, borderRadius: 6, fontSize: 14, fontWeight: 500, transition: 'all 0.2s', textDecoration: 'none' }
  const active = { ...base, background: 'var(--crimson)', color: '#fff' }
  const inactive = { ...base, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' }
  const disabled = { ...base, background: 'rgba(255,255,255,0.02)', color: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.04)', cursor: 'not-allowed' }

  return (
    <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 48 }} aria-label="Pagination">
      {currentPage > 1 ? (
        <Link href={getPageUrl(currentPage - 1)} style={{ ...inactive, paddingLeft: 12, paddingRight: 12 }}>← Prev</Link>
      ) : (
        <span style={{ ...disabled, paddingLeft: 12, paddingRight: 12 }}>← Prev</span>
      )}

      {pages.map((p, i) =>
        p === 'dots' ? (
          <span key={`d${i}`} style={{ ...base, color: 'rgba(255,255,255,0.3)' }}>…</span>
        ) : (
          <Link key={p} href={getPageUrl(p)} style={p === currentPage ? active : inactive}>
            {p}
          </Link>
        )
      )}

      {currentPage < totalPages ? (
        <Link href={getPageUrl(currentPage + 1)} style={{ ...inactive, paddingLeft: 12, paddingRight: 12 }}>Next →</Link>
      ) : (
        <span style={{ ...disabled, paddingLeft: 12, paddingRight: 12 }}>Next →</span>
      )}
    </nav>
  )
}
