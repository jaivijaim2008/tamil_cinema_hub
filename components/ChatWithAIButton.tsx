'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

export default function ChatWithAIButton() {
  return (
    <motion.button
      onClick={() => window.dispatchEvent(new Event('open-chatbot'))}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="relative inline-flex items-center gap-2.5 overflow-hidden rounded-full px-8 py-4 text-sm font-bold text-white shadow-lg shadow-violet-900/50"
      style={{ background: 'linear-gradient(135deg, #7c3aed, #5b21b6)' }}
    >
      {/* Animated shimmer */}
      <span className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <svg className="relative w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="15" rx="2" />
        <path d="M2 11h20M2 7l4-4M8 7l4-4M14 7l4-4M20 7l2-2M2 3h20" />
      </svg>
      <span className="relative">Chat with AI</span>
    </motion.button>
  )
}
