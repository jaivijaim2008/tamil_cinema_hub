'use client'

import { useRef, useState, useCallback, useEffect, type HTMLAttributes } from 'react'

interface TiltCardProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
  maxTilt?: number
  perspective?: number
  scale?: number
  glareEnabled?: boolean
}

export default function TiltCard({
  children,
  className = '',
  maxTilt = 12,
  perspective = 1000,
  scale = 1.03,
  glareEnabled = true,
  ...rest
}: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [style, setStyle] = useState<React.CSSProperties>({})
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 })
  const prefersReduced = useRef(false)

  useEffect(() => {
    prefersReduced.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }, [])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (prefersReduced.current) return
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    const tiltX = (0.5 - y) * maxTilt
    const tiltY = (x - 0.5) * maxTilt
    setStyle({
      transform: `perspective(${perspective}px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(${scale},${scale},${scale}) translateZ(10px)`,
      boxShadow: '0 30px 60px rgba(0,0,0,0.15), 0 10px 20px rgba(0,0,0,0.08)',
    })
    if (glareEnabled) {
      setGlare({ x: x * 100, y: y * 100, opacity: 0.15 })
    }
  }, [maxTilt, perspective, scale, glareEnabled])

  const handleMouseLeave = useCallback(() => {
    setStyle({
      transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)',
      boxShadow: '',
    })
    setGlare({ x: 50, y: 50, opacity: 0 })
  }, [])

  return (
    <div
      ref={ref}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      {...rest}
      style={{
        ...style,
        transformStyle: 'preserve-3d',
        transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.4s ease',
        position: 'relative',
      }}
    >
      {children}
      {glareEnabled && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 'inherit',
            background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255,255,255,${glare.opacity}) 0%, transparent 60%)`,
            pointerEvents: 'none',
            zIndex: 30,
            transition: 'opacity 0.4s ease',
          }}
        />
      )}
    </div>
  )
}
