'use client'

import { useState, useEffect, useCallback } from 'react'
import { List, ChevronDown, ChevronRight } from 'lucide-react'

export interface TocEntry {
  id: string
  text: string
  level: 2 | 3
}

interface Props {
  headings: TocEntry[]
  /** When true, renders as collapsible mobile accordion */
  mobile?: boolean
}

export default function TableOfContents({ headings, mobile = false }: Props) {
  const [activeId, setActiveId] = useState<string>('')
  const [isOpen, setIsOpen] = useState(false)

  // Scroll spy: observe which heading is currently in view
  useEffect(() => {
    if (headings.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)

        if (visible.length > 0) {
          setActiveId(visible[0].target.id)
        }
      },
      {
        rootMargin: '-80px 0px -60% 0px',
        threshold: 0,
      }
    )

    headings.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [headings])

  const scrollTo = useCallback((id: string) => {
    const el = document.getElementById(id)
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 80
      window.scrollTo({ top, behavior: 'smooth' })
      setIsOpen(false)
    }
  }, [])

  if (headings.length < 2) return null

  const headingList = (
    <nav aria-label="Table of contents">
      <ul className="space-y-0.5">
        {headings.map((h) => (
          <li key={h.id}>
            <button
              onClick={() => scrollTo(h.id)}
              className={`w-full text-left text-[12px] xl:text-[13px] px-2.5 py-1.5 rounded-lg transition-all leading-snug ${
                h.level === 3 ? 'pl-7' : ''
              } ${
                activeId === h.id
                  ? 'bg-accent-gold/10 text-accent-gold font-medium border-l-2 border-accent-gold -ml-[2px]'
                  : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated border-l-2 border-transparent -ml-[2px]'
              }`}
            >
              {h.text}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )

  // Mobile: collapsible accordion
  if (mobile) {
    return (
      <div className="lg:hidden mb-6 sm:mb-8">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-bg-card border border-border hover:border-accent-gold/30 transition-colors touch-manipulation min-h-[48px]"
          aria-expanded={isOpen}
          aria-label="Table of contents"
        >
          <span className="flex items-center gap-2.5 text-sm font-semibold text-text-primary">
            <List size={16} className="text-accent-gold" />
            Table of Contents
          </span>
          {isOpen ? (
            <ChevronDown size={16} className="text-text-muted transition-transform" />
          ) : (
            <ChevronRight size={16} className="text-text-muted transition-transform" />
          )}
        </button>

        {isOpen && (
          <div className="mt-2 p-3 rounded-xl bg-bg-card border border-border animate-in fade-in slide-in-from-top-1">
            {headingList}
          </div>
        )}
      </div>
    )
  }

  // Desktop: sticky sidebar
  return (
    <div className="hidden lg:block sticky top-24 self-start w-56 xl:w-64 shrink-0">
      <div className="p-4 rounded-2xl bg-bg-card border border-border">
        <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-text-muted mb-3">
          <List size={14} className="text-accent-gold" />
          On This Page
        </h3>
        {headingList}
      </div>
    </div>
  )
}
