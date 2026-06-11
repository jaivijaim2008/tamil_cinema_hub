'use client'

import { motion } from 'framer-motion'
import { Star } from 'lucide-react'

export default function RatingStars({
  rating,
  max = 10,
}: {
  rating: number
  max?: number
}) {
  const filled = Math.round((rating / max) * 5)
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <motion.div
          key={i}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: i * 0.08, type: 'spring', stiffness: 300 }}
        >
          <Star
            size={20}
            className={
              i <= filled
                ? 'text-accent-gold animate-glowPulse'
                : 'text-text-muted'
            }
            fill={i <= filled ? 'currentColor' : 'none'}
          />
        </motion.div>
      ))}
    </div>
  )
}
