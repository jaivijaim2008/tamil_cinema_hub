'use client'

import { useEffect, useRef } from 'react'
import { motion, useScroll, useTransform, useSpring } from 'framer-motion'

export default function SpatialEnvironment() {
  const cursorRef = useRef<HTMLDivElement>(null)
  const followerRef = useRef<HTMLDivElement>(null)
  
  const { scrollYProgress } = useScroll()
  
  // Parallax transform for depth layers
  const farY = useTransform(scrollYProgress, [0, 1], [0, -100])
  const midY = useTransform(scrollYProgress, [0, 1], [0, -200])
  
  const smoothFarY = useSpring(farY, { stiffness: 100, damping: 30 })
  const smoothMidY = useSpring(midY, { stiffness: 100, damping: 30 })

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`
      }
      if (followerRef.current) {
        followerRef.current.style.transform = `translate3d(${e.clientX - 20}px, ${e.clientY - 20}px, 0)`
      }
    }
    
    window.addEventListener('mousemove', moveCursor)
    return () => window.removeEventListener('mousemove', moveCursor)
  }, [])

  return (
    <>
      <div id="custom-cursor" ref={cursorRef} />
      <div className="cursor-follower" ref={followerRef} />
      
      <div id="spatial-stage">
        <motion.div 
          style={{ y: smoothFarY }}
          className="depth-layer layer-far" 
        />
        <motion.div 
          style={{ y: smoothMidY }}
          className="depth-layer layer-mid" 
        />
      </div>
    </>
  )
}
