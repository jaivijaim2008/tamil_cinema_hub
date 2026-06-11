'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Film, Search, Menu, X } from 'lucide-react'

const NAV_LINKS = [
  { label: 'Movies', href: '/movies' },
  { label: 'Reviews', href: '/blogs' },
  { label: 'Analytics', href: '/analytics' },
  { label: 'Recommendations', href: '/recommendations' },
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
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-bg-primary/90 backdrop-blur-xl border-b border-border' : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 md:h-16">
            {/* Brand */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-accent-gold flex items-center justify-center group-hover:bg-accent-gold-dim transition-colors">
                <Film size={16} className="text-text-inverse" strokeWidth={2.5} />
              </div>
              <span className="text-base font-bold text-text-primary tracking-tight">
                Tamil<span className="text-accent-gold">Cinema</span>Hub
              </span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    pathname === link.href || pathname.startsWith(link.href + '/')
                      ? 'text-accent-gold bg-accent-gold-muted'
                      : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-2">
              <Link
                href="/movies"
                className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-bg-card border border-border text-text-muted text-sm hover:text-text-primary hover:border-border-light transition-all"
              >
                <Search size={14} />
                <span className="text-xs">Search</span>
              </Link>

              <button
                onClick={() => setMobileOpen(true)}
                className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors"
                aria-label="Open menu"
              >
                <Menu size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="absolute top-0 right-0 bottom-0 w-72 bg-bg-primary border-l border-border p-6 flex flex-col animate-slide-in-right">
            <div className="flex items-center justify-between mb-8">
              <span className="text-sm font-bold text-text-primary">Menu</span>
              <button onClick={() => setMobileOpen(false)} className="text-text-muted hover:text-text-primary" aria-label="Close menu">
                <X size={20} />
              </button>
            </div>
            <nav className="flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    pathname === link.href || pathname.startsWith(link.href + '/')
                      ? 'text-accent-gold bg-accent-gold-muted'
                      : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </>
  )
}
