'use client'

import { useRef, useState, useEffect } from 'react'
import { useInView, useMotionValue, useSpring } from 'framer-motion'

interface Props {
  from?: number
  to: number
  duration?: number
  suffix?: string
}

export default function AnimatedCounter({ from = 0, to, duration = 2, suffix = '' }: Props) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })
  const motionVal = useMotionValue(from)
  const spring = useSpring(motionVal, { duration: duration * 1000, bounce: 0 })
  const [display, setDisplay] = useState(from)

  useEffect(() => {
    if (isInView) motionVal.set(to)
  }, [isInView, motionVal, to])

  useEffect(() => {
    const unsubscribe = spring.on('change', (v) => setDisplay(Math.round(v * 10) / 10))
    return unsubscribe
  }, [spring])

  return (
    <span ref={ref} className="tabular-nums">
      {display.toLocaleString()}{suffix}
    </span>
  )
}
