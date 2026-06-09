'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

interface Movie {
  _id: string
  slug?: { current: string }
  title: string
  year: number
  genre?: string[]
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Movie[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const searchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => { setIsOpen(false) }, [pathname])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setShowResults(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)
    if (query.length < 2) { setSearchResults([]); setShowResults(false); return }
    if (debounceRef.current) clearTimeout(debounceRef.current)
    setShowResults(true)
    debounceRef.current = setTimeout(async () => {
      setIsSearching(true)
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
        const data = await res.json()
        setSearchResults(data.results || [])
      } catch { setSearchResults([]) }
      finally { setIsSearching(false) }
    }, 300)
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/movies?search=${encodeURIComponent(searchQuery)}`)
      setSearchQuery(''); setShowResults(false)
    }
  }

  const links = [
    { name: 'Home', href: '/' },
    { name: 'Movies', href: '/movies' },
    { name: 'Blogs', href: '/blogs' },
    { name: 'Dashboard', href: '/analytics' },
    { name: 'About', href: '/about' },
  ]

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <>
      {/* Pill Navbar — Desktop */}
      <nav className={`nav-pill ${scrolled ? 'scrolled' : ''}`}>
        <Link href="/" className="nav-brand-pill">
          <span className="tamil">Tamil</span>
          <span className="hub">CinemaHub</span>
        </Link>

        <div className="nav-links-pill">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={isActive(link.href) ? 'active' : ''}
            >
              {link.name}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3" ref={searchRef}>
          <form onSubmit={handleSearchSubmit} className="relative">
            <div className="nav-search-pill">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" style={{ color: 'rgba(255,255,255,0.35)', flexShrink: 0 }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search movies..."
                value={searchQuery}
                onChange={handleSearch}
                onFocus={() => searchQuery && setShowResults(true)}
              />
            </div>
            {showResults && (
              <div style={{ position: 'absolute', top: '100%', marginTop: 8, width: 320, background: 'rgba(10,0,8,0.92)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 8, boxShadow: '0 20px 60px rgba(0,0,0,0.6)', maxHeight: 320, overflowY: 'auto', zIndex: 50 }}>
                {isSearching ? (
                  <div style={{ padding: 16, textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>Searching...</div>
                ) : searchResults.length > 0 ? (
                  searchResults.map((movie) => (
                    <button
                      key={movie._id}
                      onClick={() => { router.push(`/movies/${movie.slug?.current || movie._id}`); setSearchQuery(''); setShowResults(false) }}
                      style={{ width: '100%', textAlign: 'left', padding: '10px 14px', borderRadius: 10, border: 'none', background: 'transparent', color: '#fff', cursor: 'pointer', transition: 'background 0.2s' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 14, fontWeight: 700 }}>{movie.title}</div>
                      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{movie.year} · {movie.genre?.join(', ')}</div>
                    </button>
                  ))
                ) : (
                  <div style={{ padding: 16, textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>No movies found</div>
                )}
              </div>
            )}
          </form>
          <button onClick={() => window.dispatchEvent(new Event('open-chatbot'))} className="nav-ai-btn">
            AI Chat
          </button>
        </div>

        <div className="hamburger-pill" id="hamburger" onClick={() => setIsOpen(!isOpen)}>
          <span /><span /><span />
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={`mobile-menu-pill ${isOpen ? 'open' : ''}`}>
        {links.map((link) => (
          <Link key={link.href} href={link.href} onClick={() => setIsOpen(false)}>
            {link.name}
          </Link>
        ))}
        <form onSubmit={handleSearchSubmit} style={{ marginTop: 8 }}>
          <input
            type="text"
            placeholder="Search Tamil movies..."
            value={searchQuery}
            onChange={handleSearch}
            style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.06)', color: '#fff', fontSize: 14, outline: 'none', fontFamily: "'DM Sans', sans-serif" }}
          />
        </form>
        <button onClick={() => { setIsOpen(false); window.dispatchEvent(new Event('open-chatbot')) }} className="nav-ai-btn" style={{ justifyContent: 'center', marginTop: 4 }}>
          AI Chat
        </button>
      </div>
    </>
  )
}
