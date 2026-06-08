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

  // Close search dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setShowResults(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)
    if (query.length < 2) { setSearchResults([]); setShowResults(false); return }
    setIsSearching(true); setShowResults(true)
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
      const data = await res.json()
      setSearchResults(data.results || [])
    } catch { setSearchResults([]) }
    finally { setIsSearching(false) }
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
    { name: 'About', href: '/about' },
  ]

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <nav
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? 'bg-white/92 backdrop-blur-md shadow-[0_2px_12px_rgba(0,0,0,0.08)] border-b border-[#E8E7E3]'
          : 'bg-white border-b border-[#E8E7E3]'
      }`}
      style={{ height: '64px' }}
    >
      <div className="mx-auto max-w-[1280px] px-6">
        <div className="flex h-16 items-center justify-between">

          {/* Logo */}
          <Link href="/" className="flex items-baseline gap-0.5 flex-shrink-0">
            <span className="text-[#D4291A] text-lg font-bold" style={{ fontFamily: "'Fraunces', serif" }}>Tamil</span>
            <span className="text-[#111111] text-lg font-bold" style={{ fontFamily: "'Fraunces', serif" }}>CinemaHub</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`relative px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                  isActive(link.href)
                    ? 'text-[#D4291A]'
                    : 'text-[#444444] hover:text-[#111111]'
                }`}
              >
                {link.name}
                {isActive(link.href) && (
                  <span className="absolute bottom-0 left-4 right-4 h-[2px] bg-[#D4291A] rounded-full" />
                )}
              </Link>
            ))}
          </div>

          {/* Desktop Search + AI Chat */}
          <div className="hidden md:flex items-center gap-3" ref={searchRef}>
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Search movies..."
                value={searchQuery}
                onChange={handleSearch}
                onFocus={() => searchQuery && setShowResults(true)}
                className="bg-[#F7F7F5] border border-[#E8E7E3] rounded-full px-4 py-2 text-sm text-[#111] placeholder-[#888] focus:outline-none focus:border-[#D4291A] focus:bg-white transition-all duration-200"
                style={{ width: searchQuery ? '16rem' : '12rem' }}
              />
              <button type="submit" className="absolute right-3 top-2.5" aria-label="Search">
                <svg className="w-4 h-4 text-[#888]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>

              {showResults && (
                <div className="absolute top-full mt-2 w-80 bg-white border border-[#E8E7E3] rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] max-h-96 overflow-y-auto z-50">
                  {isSearching ? (
                    <div className="p-4 text-center text-[#888] text-sm">Searching...</div>
                  ) : searchResults.length > 0 ? (
                    <div className="py-1">
                      {searchResults.map((movie) => (
                        <button
                          key={movie._id}
                          onClick={() => { router.push(`/movies/${movie.slug?.current || movie._id}`); setSearchQuery(''); setShowResults(false) }}
                          className="w-full text-left px-4 py-3 hover:bg-[#F7F7F5] transition-colors border-b border-[#E8E7E3] last:border-b-0"
                        >
                          <div className="font-semibold text-[#111] text-sm">{movie.title}</div>
                          <div className="text-xs text-[#888] mt-0.5">{movie.year} · {movie.genre?.join(', ')}</div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-[#888] text-sm">No movies found</div>
                  )}
                </div>
              )}
            </form>

            <button
              onClick={() => window.dispatchEvent(new Event('open-chatbot'))}
              className="rounded-full px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:bg-[#B01F12] hover:shadow-md active:scale-95"
              style={{ background: '#D4291A', borderRadius: '20px', padding: '8px 16px' }}
            >
              AI Chat
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg text-[#444] hover:bg-[#F2F1EE] transition-colors"
            aria-label="Toggle menu"
          >
            {isOpen ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-[#E8E7E3] px-6 py-4 space-y-1 shadow-lg">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className={`flex items-center justify-between rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                isActive(link.href)
                  ? 'bg-[#FFF5F5] text-[#D4291A] border border-[#D4291A20]'
                  : 'text-[#444] hover:bg-[#F7F7F5]'
              }`}
            >
              {link.name}
              {isActive(link.href) && <span className="w-1.5 h-1.5 bg-[#D4291A] rounded-full" />}
            </Link>
          ))}
          <div className="pt-3 mt-2 border-t border-[#E8E7E3]">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Search Tamil movies..."
                value={searchQuery}
                onChange={handleSearch}
                className="w-full bg-[#F7F7F5] border border-[#E8E7E3] rounded-lg px-4 py-3 text-sm text-[#111] placeholder-[#888] focus:outline-none focus:border-[#D4291A] transition-all"
              />
            </form>
          </div>
          <button
            onClick={() => { setIsOpen(false); window.dispatchEvent(new Event('open-chatbot')) }}
            className="w-full mt-2 rounded-lg px-4 py-3 text-sm font-semibold text-white text-center"
            style={{ background: '#D4291A' }}
          >
            AI Chat
          </button>
        </div>
      )}
    </nav>
  )
}
