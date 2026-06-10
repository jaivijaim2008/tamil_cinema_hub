'use client'

import Link from 'next/link'

export default function AnalyticsLink() {
  return (
    <Link
      href="/analytics"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        background: 'linear-gradient(135deg, rgba(212,41,26,0.1) 0%, rgba(124,58,237,0.1) 100%)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 12,
        padding: '10px 18px',
        fontSize: 13,
        fontWeight: 600,
        color: 'rgba(255,255,255,0.85)',
        textDecoration: 'none',
        fontFamily: "'Syne', sans-serif",
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={e => {
        const target = e.currentTarget
        target.style.background = 'linear-gradient(135deg, rgba(212,41,26,0.2) 0%, rgba(124,58,237,0.2) 100%)'
        target.style.borderColor = 'rgba(255,255,255,0.16)'
        target.style.color = '#fff'
        target.style.boxShadow = '0 8px 24px rgba(212,41,26,0.15)'
      }}
      onMouseLeave={e => {
        const target = e.currentTarget
        target.style.background = 'linear-gradient(135deg, rgba(212,41,26,0.1) 0%, rgba(124,58,237,0.1) 100%)'
        target.style.borderColor = 'rgba(255,255,255,0.08)'
        target.style.color = 'rgba(255,255,255,0.85)'
        target.style.boxShadow = 'none'
      }}
    >
      📊 View Database Analytics &amp; Insights
    </Link>
  )
}