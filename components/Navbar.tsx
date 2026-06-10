'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Film, Search, Sparkles, Menu, X } from 'lucide-react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { name: 'Movies', href: '/movies' },
    { name: 'Editorial', href: '/blogs' },
    { name: 'Insights', href: '/analytics' },
    { name: 'Discover', href: '/recommendations' },
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-[1000] px-6 py-8 pointer-events-none">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand - Floating Glass */}
        <Link href="/" className="pointer-events-auto group">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="glass-panel px-6 py-3 rounded-full flex items-center gap-3"
          >
            <div className="w-8 h-8 rounded-lg bg-crimson flex items-center justify-center shadow-lg shadow-crimson/40 group-hover:rotate-12 transition-transform">
              <Film size={18} className="text-white" />
            </div>
            <span className="text-sm font-black uppercase tracking-[0.2em] text-white">
              TamilCinema<span className="text-crimson">Hub</span>
            </span>
          </motion.div>
        </Link>

        {/* Desktop Navigation - Center Pill */}
        <div className="hidden lg:flex items-center gap-2 glass-panel p-1.5 rounded-full pointer-events-auto">
          {navLinks.map((link) => (
            <Link 
              key={link.href} 
              href={link.href}
              className={cn(
                "px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all",
                pathname === link.href ? "bg-white text-black" : "text-white/40 hover:text-white/70"
              )}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Actions - Right Side */}
        <div className="flex items-center gap-3 pointer-events-auto">
           <button className="glass-panel w-12 h-12 rounded-full flex items-center justify-center text-white/40 hover:text-crimson transition-colors">
              <Search size={18} />
           </button>
           <button 
            onClick={() => window.dispatchEvent(new Event('open-chatbot'))}
            className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all"
           >
              <Sparkles size={18} />
           </button>
           
           {/* Mobile Menu Trigger */}
           <button 
             onClick={() => setMobileMenuOpen(true)}
             className="lg:hidden glass-panel w-12 h-12 rounded-full flex items-center justify-center text-white"
           >
              <Menu size={20} />
           </button>
        </div>

      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            animate={{ opacity: 1, backdropFilter: 'blur(40px)' }}
            exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            className="fixed inset-0 bg-black/80 pointer-events-auto flex flex-col items-center justify-center p-12"
          >
             <button 
               onClick={() => setMobileMenuOpen(false)}
               className="absolute top-10 right-10 w-12 h-12 rounded-full glass-panel flex items-center justify-center text-white"
             >
                <X size={24} />
             </button>

             <div className="flex flex-col items-center gap-8">
                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Link 
                      href={link.href} 
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-4xl font-display font-black uppercase tracking-tighter text-white/20 hover:text-white transition-colors"
                    >
                      {link.name}
                    </Link>
                  </motion.div>
                ))}
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
