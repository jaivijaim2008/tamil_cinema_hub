'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Film, Search, Sparkles, Menu, X, Command } from 'lucide-react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const links = [
    { name: 'Movies', href: '/movies' },
    { name: 'Reviews', href: '/blogs' },
    { name: 'Analytics', href: '/analytics' },
    { name: 'Recommendations', href: '/recommendations' },
  ]

  return (
    <header 
      className={cn(
        "fixed top-0 left-0 right-0 z-[1000] transition-all duration-500 px-6 py-8 md:px-12 md:py-10",
        isScrolled ? "py-4 md:py-5" : ""
      )}
    >
      <div 
        className={cn(
          "max-w-[1440px] mx-auto flex items-center justify-between transition-all duration-500 px-8 py-4 rounded-[2rem]",
          isScrolled ? "luxury-glass shadow-2xl" : "bg-transparent border-transparent"
        )}
      >
        
        {/* Brand - Pure Typography */}
        <Link href="/" className="group flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white text-black flex items-center justify-center group-hover:bg-crimson group-hover:text-white transition-all duration-500">
             <Film size={18} strokeWidth={2.5} />
          </div>
          <span className="text-lg font-display font-black uppercase tracking-tighter leading-none text-white">
            TamilCinema<span className="text-white/40 group-hover:text-crimson transition-colors duration-500">Hub</span>
          </span>
        </Link>

        {/* Desktop Links - Sharp & Minimal */}
        <nav className="hidden lg:flex items-center gap-10">
          {links.map((link) => (
            <Link 
              key={link.href} 
              href={link.href}
              className={cn(
                "text-[10px] font-black uppercase tracking-[0.25em] transition-all duration-300",
                pathname === link.href ? "text-white" : "text-white/30 hover:text-white"
              )}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Actions - Tools */}
        <div className="flex items-center gap-4">
           <button className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full border border-white/5 bg-white/[0.02] text-white/20 hover:text-white hover:bg-white/5 transition-all">
              <Search size={14} />
              <span className="text-[10px] font-black uppercase tracking-widest">Search</span>
              <div className="ml-2 flex items-center gap-0.5 text-[8px] font-bold px-1.5 py-0.5 rounded-md bg-white/5">
                 <Command size={8} /> K
              </div>
           </button>
           
           <button 
             onClick={() => window.dispatchEvent(new Event('open-chatbot'))}
             className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
           >
              <Sparkles size={16} fill="black" />
           </button>

           <button 
             onClick={() => setIsMenuOpen(true)}
             className="lg:hidden w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white"
           >
              <Menu size={20} />
           </button>
        </div>

      </div>

      {/* Mobile Sidebar - Ultra Minimal */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/90 backdrop-blur-3xl z-[1001]"
            />
            <motion.div 
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 150 }}
              className="fixed top-0 right-0 bottom-0 w-[85%] max-w-sm bg-black border-l border-white/5 z-[1002] p-12 flex flex-col"
            >
               <button onClick={() => setIsMenuOpen(false)} className="self-end text-white/20 hover:text-white transition-colors mb-20">
                  <X size={32} />
               </button>

               <div className="flex flex-col gap-8">
                  {links.map((link, i) => (
                    <motion.div
                      key={link.href}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <Link 
                        href={link.href} 
                        onClick={() => setIsMenuOpen(false)}
                        className="text-4xl font-display font-black uppercase tracking-tighter text-white/20 hover:text-white transition-all"
                      >
                        {link.name}
                      </Link>
                    </motion.div>
                  ))}
               </div>

               <div className="mt-auto">
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/10 mb-6">Archive Access</p>
                  <Link href="/movies" className="block w-full py-5 rounded-2xl bg-white text-black text-center text-xs font-black uppercase tracking-widest">
                     Launch Database
                  </Link>
               </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  )
}
