'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { Home, Film, PenLine, BarChart3, Bot } from 'lucide-react'

const tabs = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/movies', label: 'Movies', icon: Film },
  { href: '/blogs', label: 'Reviews', icon: PenLine },
  { href: '/analytics', label: 'Stats', icon: BarChart3 },
  { href: '/recommendations', label: 'AI', icon: Bot },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50 glass border-t border-border-subtle safe-bottom"
      aria-label="Mobile navigation"
    >
      <div className="flex items-center justify-around" style={{ height: 60 }}>
        {tabs.map((tab) => {
          const active = pathname === tab.href || (tab.href !== '/' && pathname.startsWith(tab.href))
          const Icon = tab.icon
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="relative flex flex-col items-center justify-center gap-0.5 min-w-[48px] min-h-[48px] py-1"
              aria-current={active ? 'page' : undefined}
            >
              <motion.div whileTap={{ scale: 0.92 }} transition={{ type: 'spring', stiffness: 400, damping: 17 }}>
                <Icon
                  size={20}
                  className={`transition-colors ${active ? 'text-accent-gold' : 'text-text-muted'}`}
                  strokeWidth={active ? 2.5 : 1.5}
                />
              </motion.div>
              <span className={`text-[10px] font-medium transition-colors ${active ? 'text-accent-gold' : 'text-text-muted'}`}>
                {tab.label}
              </span>
              {active && (
                <motion.div
                  layoutId="bottomnav-indicator"
                  className="absolute bottom-1 w-1 h-1 rounded-full bg-accent-gold"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
