'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Search, MessageSquare, Menu, X, ChevronRight, Film, Calendar } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

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
    { name: 'Insights', href: '/analytics' },
    { name: 'Discover', href: '/recommendations' },
  ]

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <nav 
      className={cn(
        "fixed top-0 left-0 right-0 z-[100] transition-all duration-500",
        scrolled ? "py-3 bg-ink/80 backdrop-blur-xl border-b border-white/5 shadow-2xl" : "py-6 bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between gap-8">
        
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-crimson to-violet flex items-center justify-center shadow-lg shadow-crimson/20 group-hover:scale-110 transition-transform">
            <Film size={18} className="text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-display font-black tracking-tighter leading-none text-white">
              TAMIL<span className="text-crimson">HUB</span>
            </span>
            <span className="text-[8px] font-bold tracking-[0.3em] uppercase text-white/30 leading-none mt-0.5">Cinema Archive</span>
          </div>
        </Link>

        {/* Desktop Links */}
        <div className="hidden lg:flex items-center gap-1 bg-white/[0.03] border border-white/5 p-1 rounded-full backdrop-blur-md">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "px-5 py-2 rounded-full text-[11px] font-bold uppercase tracking-widest transition-all",
                isActive(link.href) 
                  ? "bg-white text-ink shadow-lg" 
                  : "text-white/40 hover:text-white/70 hover:bg-white/[0.05]"
              )}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Search & Actions */}
        <div className="hidden md:flex items-center gap-4 flex-1 max-w-md" ref={searchRef}>
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <div className="relative group">
              <Search 
                size={16} 
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-crimson transition-colors" 
              />
              <input
                type="text"
                placeholder="Search catalog..."
                value={searchQuery}
                onChange={handleSearch}
                onFocus={() => searchQuery && setShowResults(true)}
                className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-2.5 pl-11 pr-4 text-xs font-bold text-white outline-none focus:bg-white/[0.06] focus:border-white/10 transition-all placeholder:text-white/10 placeholder:font-medium"
              />
            </div>

            <AnimatePresence>
              {showResults && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full mt-3 w-[400px] right-0 bg-ink/95 backdrop-blur-2xl border border-white/10 rounded-2xl p-2 shadow-2xl shadow-black max-h-[480px] overflow-y-auto"
                >
                  {isSearching ? (
                    <div className="p-8 text-center text-white/20 text-[10px] font-bold uppercase tracking-widest animate-pulse">
                      Searching archive...
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div className="space-y-1">
                      {searchResults.map((movie) => (
                        <button
                          key={movie._id}
                          onClick={() => { router.push(`/movies/${movie.slug?.current || movie._id}`); setSearchQuery(''); setShowResults(false) }}
                          className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-all text-left group"
                        >
                          <div className="w-10 h-14 bg-white/5 rounded-lg overflow-hidden flex-shrink-0 border border-white/5">
                            <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-white/10 uppercase italic">
                              {movie.title.charAt(0)}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs font-bold text-white group-hover:text-crimson transition-colors">{movie.title}</div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] font-medium text-white/20">{movie.year}</span>
                              <span className="w-1 h-1 rounded-full bg-white/10" />
                              <span className="text-[10px] font-medium text-white/20 truncate">{movie.genre?.join(', ')}</span>
                            </div>
                          </div>
                          <ChevronRight size={14} className="ml-auto text-white/10 group-hover:text-white/40 group-hover:translate-x-1 transition-all" />
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-white/20">No titles found</p>
                      <button 
                        onClick={() => router.push('/movies')}
                        className="mt-2 text-[9px] font-bold text-crimson uppercase tracking-widest hover:underline"
                      >
                        Browse all movies
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </form>

          <button 
            onClick={() => window.dispatchEvent(new Event('open-chatbot'))}
            aria-label="Ask AI Assistant"
            className="w-11 h-11 rounded-2xl bg-crimson flex items-center justify-center shadow-lg shadow-crimson/20 hover:scale-105 active:scale-95 transition-all group"
          >
            <MessageSquare size={18} className="text-white group-hover:rotate-12 transition-transform" />
          </button>
        </div>

        {/* Mobile Hamburger */}
        <button 
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "Close Menu" : "Open Menu"}
          className="lg:hidden w-11 h-11 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-white"
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="fixed inset-0 z-[99] bg-ink pt-28 px-6 lg:hidden"
          >
            <div className="space-y-4">
              {links.map((link) => (
                <Link 
                  key={link.href} 
                  href={link.href} 
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "block p-6 rounded-3xl border text-xl font-display font-black tracking-tight transition-all",
                    isActive(link.href)
                      ? "bg-white text-ink border-white"
                      : "bg-white/[0.02] text-white/40 border-white/5 hover:border-white/10"
                  )}
                >
                  {link.name}
                </Link>
              ))}
              
              <div className="pt-8 space-y-4">
                <form onSubmit={handleSearchSubmit} className="relative">
                  <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20" />
                  <input
                    type="text"
                    placeholder="Search movies..."
                    value={searchQuery}
                    onChange={handleSearch}
                    className="w-full bg-white/[0.02] border border-white/5 rounded-3xl py-5 pl-14 pr-6 text-base font-bold text-white outline-none focus:border-crimson/30 transition-all"
                  />
                </form>
                
                <button 
                  onClick={() => { setIsOpen(false); window.dispatchEvent(new Event('open-chatbot')) }}
                  className="w-full bg-crimson p-6 rounded-3xl flex items-center justify-center gap-3 shadow-xl shadow-crimson/20"
                >
                  <MessageSquare size={20} className="text-white" />
                  <span className="text-lg font-display font-black text-white uppercase tracking-tight">Ask Kollywood AI</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
