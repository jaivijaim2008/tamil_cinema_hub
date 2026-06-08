'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export default function ScrollReveal() {
  const pathname = usePathname()

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('visible')
            observer.unobserve(e.target)
          }
        })
      },
      { threshold: 0.08, rootMargin: '0px 0px -48px 0px' }
    )

    const timer = setTimeout(() => {
      document.querySelectorAll('.reveal-up:not(.visible), .reveal-left:not(.visible), .reveal-scale:not(.visible), .reveal:not(.visible), .reveal-group > *:not(.visible)').forEach((el, i) => {
        (el as HTMLElement).style.transitionDelay = `${(i % 5) * 0.08}s`
        observer.observe(el)
      })
    }, 100)

    return () => {
      clearTimeout(timer)
      observer.disconnect()
    }
  }, [pathname])

  return null
}
