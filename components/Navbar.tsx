'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'

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

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

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
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
      const data = await response.json()
      setSearchResults(data.results || [])
    } catch {
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
      className={`sticky top-0 z-50 w-full transition-all duration-500 ${
        scrolled
          ? 'bg-[#080810]/90 backdrop-blur-2xl border-b border-white/[0.06] shadow-[0_8px_40px_rgba(0,0,0,0.6)]'
          : 'bg-[#080810]/60 backdrop-blur-xl border-b border-white/[0.04]'
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">

          {/* Logo - UPDATED */}
          <Link href="/" className="flex items-center gap-3 group flex-shrink-0">
            <Image 
              src="/images/logo.svg" 
              alt="TamilCinemaHub" 
              width={48}
              height={48}
              className="w-12 h-12 group-hover:scale-110 transition-all duration-500"
              priority
            />
            <div className="flex items-baseline gap-0">
              <span className="text-white font-black text-lg tracking-tight leading-none">Tamil</span>
              <span className="text-violet-400 font-black text-lg tracking-tight leading-none">Cinema</span>
              <span className="ml-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-black px-2 py-0.5 rounded-md tracking-wider">HUB</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-0.5">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`relative text-sm font-semibold px-4 py-2 rounded-lg transition-all duration-300 ${
                  isActive(link.href)
                    ? 'text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {link.name}
                {isActive(link.href) && (
                  <span className="absolute inset-0 bg-violet-600/15 border border-violet-500/25 rounded-lg" />
                )}
              </Link>
            ))}
          </div>

          {/* Desktop Search */}
          <div className="hidden md:flex items-center gap-3 relative">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Search movies..."
                value={searchQuery}
                onChange={handleSearch}
                onFocus={() => searchQuery && setShowResults(true)}
                className="bg-white/5 border border-white/[0.08] rounded-xl px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500/50 focus:bg-white/[0.08] focus:shadow-[0_0_20px_rgba(124,58,237,0.15)] transition-all duration-300" 
                style={{ width: searchQuery ? '16rem' : '12rem' }}
              />
              <svg className="absolute right-3 top-2.5 w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>

              <AnimatePresence>
                {showResults && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full mt-2 w-80 bg-[#0f0f1a]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl max-h-96 overflow-y-auto z-50"
                  >
                    {isSearching ? (
                      <div className="p-4 text-center text-gray-400">
                        <div className="inline-block animate-spin h-4 w-4 border-2 border-violet-600 border-t-transparent rounded-full" />
                        <p className="mt-2 text-sm">Searching...</p>
                      </div>
                    ) : searchResults.length > 0 ? (
                      <div className="py-2">
                        {searchResults.map((movie: Movie) => (
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
                        No movies found for &quot;{searchQuery}&quot;
                      </div>
                    ) : null}
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </div>

          {/* Mobile Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 border border-white/[0.08] text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-300 active:scale-95"
            aria-label="Toggle menu"
          >
            <motion.svg
              animate={isOpen ? { rotate: 90 } : { rotate: 0 }}
              transition={{ duration: 0.2 }}
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </motion.svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="md:hidden overflow-hidden"
          >
            <div className="border-t border-white/5 bg-[#0a0a15]/95 backdrop-blur-2xl px-4 py-4 space-y-1.5">
              {links.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                      isActive(link.href)
                        ? 'bg-violet-600/20 border border-violet-500/25 text-white'
                        : 'text-gray-400 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    {link.name}
                    {isActive(link.href) && (
                      <span className="ml-auto w-1.5 h-1.5 bg-violet-400 rounded-full" />
                    )}
                  </Link>
                </motion.div>
              ))}

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: links.length * 0.05 }}
                className="pt-3 mt-2 border-t border-white/5"
              >
                <form onSubmit={handleSearchSubmit} className="relative">
                  <input
                    type="text"
                    placeholder="Search Tamil movies..."
                    value={searchQuery}
                    onChange={handleSearch}
                    className="w-full bg-white/5 border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500/50 transition-all"
                  />
                </form>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}