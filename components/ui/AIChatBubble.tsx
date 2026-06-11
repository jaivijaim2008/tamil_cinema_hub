'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { MessageCircle } from 'lucide-react'
import AIChatModal from './AIChatModal'

export default function AIChatBubble() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <motion.button
        onClick={() => setOpen(true)}
        className="fixed bottom-[88px] lg:bottom-6 right-4 lg:right-6 z-40 w-14 h-14 rounded-full bg-accent-gold text-text-inverse flex items-center justify-center shadow-2xl"
        style={{ boxShadow: '0 8px 40px rgba(232,184,75,0.5)' }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        aria-label="Open AI chat"
      >
        <div className="absolute inset-0 rounded-full border-2 border-accent-gold animate-ping opacity-20" />
        <div
          className="absolute inset-0 rounded-full border-2 border-accent-gold animate-ping opacity-10"
          style={{ animationDelay: '0.5s' }}
        />
        <MessageCircle size={22} />
        <div className="absolute top-0.5 right-0.5 w-3 h-3 rounded-full bg-accent-red border-2 border-bg-primary" />
      </motion.button>

      <AIChatModal open={open} onClose={() => setOpen(false)} />
    </>
  )
}
