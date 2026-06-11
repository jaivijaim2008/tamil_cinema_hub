'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { Search } from 'lucide-react'
import SearchOverlay from '../ui/SearchOverlay'

const navLinks = [
  { href: '/movies', label: 'Movies' },
  { href: '/blogs', label: 'Reviews' },
  { href: '/analytics', label: 'Analytics' },
  { href: '/recommendations', label: 'Recommendations' },
]

export default function Navbar() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  return (
    <>
      {/* Desktop Navbar (≥1024px) */}
      <header
        className={`hidden lg:block sticky top-0 z-50 transition-all duration-300 ${
          scrolled ? 'glass border-b border-border-subtle' : 'bg-transparent'
        }`}
        style={{ height: 64 }}
      >
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-accent-gold animate-glowPulse">
              <rect x="1" y="1" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.5" />
              <rect x="11" y="1" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.5" />
              <rect x="1" y="11" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.5" />
              <rect x="11" y="11" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            <span className="text-xl font-bold">
              <span className="text-gradient-gold">Tamil</span>
              <span className="text-text-primary">CinemaHub</span>
            </span>
          </Link>

          {/* Nav Links */}
          <nav className="flex items-center gap-1" aria-label="Main navigation">
            {navLinks.map((link) => {
              const active = pathname === link.href || pathname.startsWith(link.href + '/')
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-4 py-2 text-sm font-medium transition-colors ${
                    active ? 'text-accent-gold' : 'text-text-secondary hover:text-text-primary'
                  }`}
                  aria-current={active ? 'page' : undefined}
                >
                  {link.label}
                  {active && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute bottom-0 left-2 right-2 h-0.5 bg-accent-gold rounded-full"
                      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    />
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Search */}
          <button
            onClick={() => setSearchOpen(true)}
            className="rounded-full p-2 hover:bg-accent-gold-muted transition-colors"
            aria-label="Search movies"
          >
            <Search size={18} className="text-text-secondary" />
          </button>
        </div>
      </header>

      {/* Mobile/Tablet Navbar (<1024px) */}
      <header
        className={`lg:hidden fixed top-0 left-0 right-0 z-50 safe-top transition-all duration-300 ${
          scrolled ? 'glass border-b border-border-subtle' : 'bg-transparent'
        }`}
        style={{ height: 56 }}
      >
        <div className="px-4 h-full flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" className="text-accent-gold">
              <rect x="1" y="1" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.5" />
              <rect x="11" y="1" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.5" />
              <rect x="1" y="11" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.5" />
              <rect x="11" y="11" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            <span className="text-lg font-bold">
              <span className="text-gradient-gold">Tamil</span>
              <span className="text-text-primary">CinemaHub</span>
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2 rounded-full hover:bg-accent-gold-muted transition-colors min-w-[48px] min-h-[48px] flex items-center justify-center"
              aria-label="Search movies"
            >
              <Search size={18} className="text-text-secondary" />
            </button>
          </div>
        </div>
      </header>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}
