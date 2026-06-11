'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Film, BookOpen, BarChart3 } from 'lucide-react'

const TABS = [
  { label: 'Home', href: '/', icon: Home },
  { label: 'Movies', href: '/movies', icon: Film },
  { label: 'Reviews', href: '/blogs', icon: BookOpen },
  { label: 'Stats', href: '/analytics', icon: BarChart3 },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-bg-primary/95 backdrop-blur-xl border-t border-border " aria-label="Mobile navigation">
      <div className="flex items-center justify-around h-16 px-2">
        {TABS.map((tab) => {
          const active = tab.href === '/' ? pathname === '/' : pathname.startsWith(tab.href)
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors ${
                active ? 'text-accent-gold' : 'text-text-muted'
              }`}
            >
              <tab.icon size={20} strokeWidth={active ? 2.5 : 1.5} />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
