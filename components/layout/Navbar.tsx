'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Film, Search, Menu, X, ArrowRight, Bookmark } from 'lucide-react'
import ThemeToggle from '@/components/ui/ThemeToggle'

const NAV_LINKS = [
  { label: 'Movies', href: '/movies' },
  { label: 'Reviews', href: '/blogs' },
  { label: 'Analytics', href: '/analytics' },
  { label: 'Recommendations', href: '/recommendations' },
  { label: 'Compare', href: '/compare' },
  { label: 'About', href: '/about' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-bg-primary/80 backdrop-blur-2xl border-b border-white/[0.06] shadow-[0_4px_30px_rgba(0,0,0,0.3)]'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-[72px]">
            {/* Brand */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-accent-gold flex items-center justify-center group-hover:bg-accent-gold-dim transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(232,184,75,0.3)]">
                <Film size={16} className="text-text-inverse" strokeWidth={2.5} />
              </div>
              <span className="text-base font-bold text-text-primary tracking-tight">
                Tamil<span className="text-accent-gold">Cinema</span>Hub
              </span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map((link) => {
                const active = pathname === link.href || pathname.startsWith(link.href + '/')
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`relative px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      active
                        ? 'text-accent-gold'
                        : 'text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    {link.label}
                    {/* Active indicator dot */}
                    {active && (
                      <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-accent-gold" />
                    )}
                  </Link>
                )
              })}
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-2">
              <Link
                href="/movies"
                className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-bg-card/80 border border-border text-text-muted text-sm hover:text-text-primary hover:border-accent-gold/20 transition-all duration-300 backdrop-blur-sm"
              >
                <Search size={14} />
                <span className="text-xs">Search films…</span>
                <kbd className="hidden lg:inline text-[10px] text-text-muted bg-bg-elevated px-1.5 py-0.5 rounded-md border border-border ml-2">⌘K</kbd>
              </Link>

              <Link
                href="/watchlist"
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-bg-card border border-border text-text-secondary hover:text-accent-gold hover:border-accent-gold/30 transition-all duration-300"
                aria-label="Watchlist"
              >
                <Bookmark size={15} />
              </Link>
              <ThemeToggle />
              <button
                onClick={() => setMobileOpen(true)}
                className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl text-text-secondary hover:text-text-primary hover:bg-bg-elevated/50 transition-all duration-200"
                aria-label="Open menu"
              >
                <Menu size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Scrolled accent line */}
        {scrolled && (
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent-gold/20 to-transparent" />
        )}
      </header>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute top-0 right-0 bottom-0 w-80 bg-bg-primary border-l border-border/50 flex flex-col animate-slide-in-right">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-border/50">
              <span className="text-sm font-bold text-text-primary tracking-tight">Navigation</span>
              <button
                onClick={() => setMobileOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-all"
                aria-label="Close menu"
              >
                <X size={18} />
              </button>
            </div>

            {/* Links */}
            <nav className="flex-1 flex flex-col gap-0.5 p-4">
              {NAV_LINKS.map((link) => {
                const active = pathname === link.href || pathname.startsWith(link.href + '/')
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                      active
                        ? 'text-accent-gold bg-accent-gold/[0.08]'
                        : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated/50'
                    }`}
                  >
                    {link.label}
                    {active && <div className="w-1.5 h-1.5 rounded-full bg-accent-gold" />}
                  </Link>
                )
              })}
            </nav>

            {/* Mobile CTA */}
            <div className="p-4 border-t border-border/50">
              <Link
                href="/movies"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-accent-gold text-text-inverse text-sm font-semibold hover:bg-accent-gold-dim transition-colors"
              >
                Browse Movies <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
