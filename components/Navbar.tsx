'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useRouter } from 'next/navigation'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Handle search
  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)

    if (query.length < 2) {
      setSearchResults([])
      setShowResults(false)
      return
    }

    setIsSearching(true)
    setShowResults(true)

    try {
      // Option 1: If using Sanity CMS
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(query)}`
      )
      const data = await response.json()
      setSearchResults(data.results || [])
    } catch (error) {
      console.error('Search error:', error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/movies?search=${encodeURIComponent(searchQuery)}`)
      setSearchQuery('')
      setShowResults(false)
    }
  }

  const handleMovieClick = (movieSlug: string) => {
    router.push(`/movies/${movieSlug}`)
    setSearchQuery('')
    setShowResults(false)
  }

  const links = [
    { name: 'Home', href: '/', icon: '🏠' },
    { name: 'Movies', href: '/movies', icon: '🎬' },
    { name: 'Blogs', href: '/blogs', icon: '✍️' },
    { name: 'About', href: '/about', icon: '💡' },
  ]

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <nav
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? 'bg-[#080810]/95 backdrop-blur-xl border-b border-white/8 shadow-[0_4px_30px_rgba(0,0,0,0.5)]'
          : 'bg-[#080810]/80 backdrop-blur-md border-b border-white/5'
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">

          {/* ── LOGO ── */}
          <Link href="/" className="flex items-center gap-2.5 group flex-shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-violet-900/50 group-hover:shadow-violet-600/50 transition-all duration-300 group-hover:scale-105">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="7" width="20" height="15" rx="2" />
                <path d="M2 11h20M2 7l4-4M8 7l4-4M14 7l4-4M20 7l2-2M2 3h20" />
              </svg>
            </div>

            <div className="flex items-baseline gap-0">
              <span className="text-white font-black text-lg tracking-tight leading-none">
                Tamil
              </span>
              <span className="text-violet-400 font-black text-lg tracking-tight leading-none">
                Cinema
              </span>
              <span className="ml-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-black px-2 py-0.5 rounded-md tracking-wider">
                HUB
              </span>
            </div>
          </Link>

          {/* ── DESKTOP NAV ── */}
          <div className="hidden md:flex items-center gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`relative text-sm font-semibold px-4 py-2 rounded-lg transition-all duration-200 ${
                  isActive(link.href)
                    ? 'text-white bg-violet-600/20 border border-violet-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {isActive(link.href) && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-violet-400 rounded-full" />
                )}
                {link.name}
              </Link>
            ))}
          </div>

          {/* ── RIGHT SIDE: SEARCH ── */}
          <div className="hidden md:flex items-center gap-3 relative">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Search movies..."
                value={searchQuery}
                onChange={handleSearch}
                onFocus={() => searchQuery && setShowResults(true)}
                className="bg-white/5 border border-white/8 rounded-lg px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500/50 focus:bg-white/10 transition-all w-48"
              />
              <svg className="absolute right-3 top-2.5 w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>

              {/* Search Dropdown Results */}
              {showResults && (
                <div className="absolute top-full mt-2 w-80 bg-[#0f0f1a] border border-white/10 rounded-lg shadow-xl max-h-96 overflow-y-auto z-50">
                  {isSearching ? (
                    <div className="p-4 text-center text-gray-400">
                      <div className="inline-block animate-spin h-4 w-4 border-2 border-violet-600 border-t-transparent rounded-full"></div>
                      <p className="mt-2 text-sm">Searching...</p>
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div className="py-2">
                      {searchResults.map((movie: any) => (
                        <button
                          key={movie._id}
                          onClick={() => handleMovieClick(movie.slug?.current || movie._id)}
                          className="w-full text-left px-4 py-3 hover:bg-violet-600/20 transition-colors border-b border-white/5 last:border-b-0"
                        >
                          <div className="font-semibold text-white text-sm">{movie.title}</div>
                          <div className="text-xs text-gray-400 mt-0.5">
                            {movie.year} • {movie.genre?.join(', ')}
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : searchQuery && !isSearching ? (
                    <div className="p-4 text-center text-gray-400 text-sm">
                      No movies found for "{searchQuery}"
                    </div>
                  ) : null}
                </div>
              )}
            </form>
          </div>

          {/* ── MOBILE BUTTON ── */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden inline-flex items-center justify-center w-9 h-9 rounded-lg bg-white/5 border border-white/8 text-gray-400 hover:text-white hover:bg-white/10 transition-all"
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

      {/* ── MOBILE MENU ── */}
      <div
        className={`md:hidden transition-all duration-300 overflow-hidden ${
          isOpen ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="border-t border-white/5 bg-[#0a0a15] px-4 py-3 space-y-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                isActive(link.href)
                  ? 'bg-violet-600/20 border border-violet-500/30 text-white'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <span className="text-base">{link.icon}</span>
              {link.name}
              {isActive(link.href) && (
                <span className="ml-auto w-1.5 h-1.5 bg-violet-400 rounded-full" />
              )}
            </Link>
          ))}

          {/* Mobile Search */}
          <div className="pt-2 mt-2 border-t border-white/5">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Search Tamil movies..."
                value={searchQuery}
                onChange={handleSearch}
                className="w-full bg-white/5 border border-white/8 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500/50"
              />
            </form>
          </div>
        </div>
      </div>
    </nav>
  )
}