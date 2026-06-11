'use client'

import { useRef, useState, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  className?: string
}

export default function SpotlightCard({ children, className = '' }: Props) {
  const divRef = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [opacity, setOpacity] = useState(0)

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!divRef.current) return
    const rect = divRef.current.getBoundingClientRect()
    setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top })
  }

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setOpacity(1)}
      onMouseLeave={() => setOpacity(0)}
      className={`relative overflow-hidden rounded-2xl ${className}`}
    >
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-300 rounded-2xl"
        style={{
          opacity,
          background: `radial-gradient(350px circle at ${pos.x}px ${pos.y}px, rgba(232,184,75,0.08), transparent 70%)`,
        }}
      />
      {children}
    </div>
  )
}
