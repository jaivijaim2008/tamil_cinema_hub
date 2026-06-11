'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

/* ═══════════════════════════════════════════════════════════════════════════════
   SectionReveal — Wraps content with scroll-triggered fade-in animation
   ═══════════════════════════════════════════════════════════════════════════════ */

interface SectionRevealProps {
  children: React.ReactNode
  className?: string
  delay?: number
  direction?: 'up' | 'down' | 'left' | 'right'
}

export function SectionReveal({
  children,
  className = '',
  delay = 0,
  direction = 'up',
}: SectionRevealProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  const directionMap = {
    up: { y: 40 },
    down: { y: -40 },
    left: { x: 40 },
    right: { x: -40 },
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, ...directionMap[direction] }}
      animate={isInView ? { opacity: 1, x: 0, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════════
   AnimatedUnderline — Horizontal gold line that animates from center
   ═══════════════════════════════════════════════════════════════════════════════ */

interface AnimatedUnderlineProps {
  className?: string
  width?: string
}

export function AnimatedUnderline({ className = '', width = 'max-w-xs' }: AnimatedUnderlineProps) {
  return (
    <motion.div
      className={`h-px bg-gradient-to-r from-transparent via-accent-gold to-transparent ${width} mx-auto ${className}`}
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: [0.65, 0, 0.35, 1] }}
    />
  )
}

/* ═══════════════════════════════════════════════════════════════════════════════
   Overline — Small uppercase label with gold dot
   ═══════════════════════════════════════════════════════════════════════════════ */

interface OverlineProps {
  text: string
  color?: string
  className?: string
}

export function Overline({ text, color = 'accent-gold', className = '' }: OverlineProps) {
  return (
    <div className={`inline-flex items-center gap-2 bg-${color}-muted/60 backdrop-blur-sm border border-${color}/20 rounded-full px-4 py-2 mb-6 ${className}`}>
      <div className={`w-1.5 h-1.5 rounded-full bg-${color}`} />
      <span className={`text-${color} text-[11px] font-mono tracking-[0.2em] uppercase`}>{text}</span>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════════
   SectionTitle — Common section heading pattern
   ═══════════════════════════════════════════════════════════════════════════════ */

interface SectionTitleProps {
  overline?: string
  title: string
  titleAccent?: string
  description?: string
  className?: string
  align?: 'left' | 'center'
}

export function SectionTitle({
  overline,
  title,
  titleAccent,
  description,
  className = '',
  align = 'center',
}: SectionTitleProps) {
  return (
    <SectionReveal className={`${align === 'center' ? 'text-center' : ''} ${className}`}>
      {overline && <Overline text={overline} />}
      <h2 className={`font-playfair text-3xl md:text-4xl text-text-primary mb-4 ${align === 'center' ? '' : ''}`}>
        {title} {titleAccent && <span className="text-gradient-gold">{titleAccent}</span>}
      </h2>
      {description && (
        <p className={`text-text-secondary text-sm max-w-lg leading-relaxed ${align === 'center' ? 'mx-auto' : ''}`}>
          {description}
        </p>
      )}
    </SectionReveal>
  )
}
