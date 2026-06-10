'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Search, MessageSquare, Menu, X, ChevronRight, Film, Sparkles } from 'lucide-react'
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
        "fixed top-0 left-0 right-0 z-[100] transition-all duration-700 ease-in-out px-4 md:px-8",
        scrolled ? "py-4" : "py-8"
      )}
    >
      <div className={cn(
        "max-w-7xl mx-auto flex items-center justify-between gap-4 md:gap-8 px-5 py-3 md:py-4 rounded-[2rem] transition-all duration-500",
        scrolled 
          ? "bg-ink/60 backdrop-blur-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]" 
          : "bg-white/[0.02] backdrop-blur-md border border-white/5"
      )}>
        
        {/* Brand - Restored TamilCinemaHub */}
        <Link href="/" className="flex items-center gap-3 group flex-shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-crimson to-violet flex items-center justify-center shadow-lg shadow-crimson/20 group-hover:rotate-[10deg] transition-transform">
            <Film size={22} className="text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg md:text-xl font-display font-black tracking-tighter leading-none text-white">
              TamilCinema<span className="text-transparent bg-clip-text bg-gradient-to-r from-crimson to-gold">Hub</span>
            </span>
            <span className="text-[9px] font-bold tracking-[0.4em] uppercase text-white/20 leading-none mt-1">Premium Archive</span>
          </div>
        </Link>

        {/* Desktop Links - Modern Minimal */}
        <div className="hidden lg:flex items-center gap-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "relative px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300",
                isActive(link.href) 
                  ? "text-white" 
                  : "text-white/30 hover:text-white/60"
              )}
            >
              {isActive(link.href) && (
                <motion.div 
                  layoutId="nav-active"
                  className="absolute inset-0 bg-white/[0.05] rounded-full border border-white/10 -z-10"
                />
              )}
              {link.name}
            </Link>
          ))}
        </div>

        {/* Search & AI Actions */}
        <div className="hidden md:flex items-center gap-4 flex-1 max-w-sm ml-auto" ref={searchRef}>
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <div className="relative group">
              <Search 
                size={14} 
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-crimson transition-colors" 
              />
              <input
                type="text"
                placeholder="Find movies..."
                value={searchQuery}
                onChange={handleSearch}
                onFocus={() => searchQuery && setShowResults(true)}
                className="w-full bg-white/[0.03] border border-white/5 rounded-full py-2.5 pl-11 pr-4 text-[11px] font-bold text-white outline-none focus:bg-white/[0.06] focus:border-crimson/20 transition-all placeholder:text-white/10"
              />
            </div>

            <AnimatePresence>
              {showResults && (
                <motion.div 
                  initial={{ opacity: 0, y: 15, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 15, scale: 0.95 }}
                  className="absolute top-full mt-4 w-[380px] right-0 bg-ink/95 backdrop-blur-3xl border border-white/10 rounded-3xl p-3 shadow-[0_30px_100px_rgba(0,0,0,0.8)] max-h-[480px] overflow-y-auto"
                >
                  {isSearching ? (
                    <div className="p-10 text-center flex flex-col items-center gap-3">
                      <div className="w-6 h-6 border-2 border-crimson/30 border-t-crimson rounded-full animate-spin" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-white/20">Scanning Archive...</span>
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div className="grid gap-2">
                      {searchResults.map((movie) => (
                        <button
                          key={movie._id}
                          onClick={() => { router.push(`/movies/${movie.slug?.current || movie._id}`); setSearchQuery(''); setShowResults(false) }}
                          className="w-full flex items-center gap-4 p-3 rounded-2xl hover:bg-white/5 transition-all text-left group"
                        >
                          <div className="w-10 h-14 bg-white/5 rounded-xl overflow-hidden flex-shrink-0 border border-white/5 flex items-center justify-center">
                            <Film size={14} className="text-white/10" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-white group-hover:text-crimson transition-colors truncate">{movie.title}</div>
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
                    <div className="p-10 text-center">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-white/20">No titles found</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </form>

          <button 
            onClick={() => window.dispatchEvent(new Event('open-chatbot'))}
            aria-label="Ask AI Assistant"
            className="w-10 h-10 rounded-xl bg-crimson flex items-center justify-center shadow-lg shadow-crimson/20 hover:scale-110 active:scale-95 transition-all group overflow-hidden relative"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            <Sparkles size={18} className="text-white" />
          </button>
        </div>

        {/* Mobile Actions */}
        <div className="flex lg:hidden items-center gap-3">
           <button 
            onClick={() => window.dispatchEvent(new Event('open-chatbot'))}
            className="w-9 h-9 rounded-lg bg-crimson flex items-center justify-center shadow-lg text-white"
          >
            <Sparkles size={16} />
          </button>
          <button 
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? "Close Menu" : "Open Menu"}
            className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white"
          >
            {isOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu - Full Screen Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99] bg-ink/95 backdrop-blur-3xl lg:hidden flex flex-col items-center justify-center px-8"
          >
            <div className="w-full max-w-sm space-y-6">
              {links.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link 
                    href={link.href} 
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "block text-center py-6 text-3xl font-display font-black tracking-tight transition-all",
                      isActive(link.href)
                        ? "text-white"
                        : "text-white/20"
                    )}
                  >
                    {link.name}
                  </Link>
                </motion.div>
              ))}
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: links.length * 0.05 }}
                className="pt-10"
              >
                <form onSubmit={handleSearchSubmit} className="relative">
                  <Search size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20" />
                  <input
                    type="text"
                    placeholder="Search movies..."
                    value={searchQuery}
                    onChange={handleSearch}
                    className="w-full bg-white/5 border border-white/10 rounded-[2rem] py-5 pl-16 pr-8 text-lg font-bold text-white outline-none focus:border-crimson/30 transition-all"
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
