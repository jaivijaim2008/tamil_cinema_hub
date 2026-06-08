'use client'

import dynamic from 'next/dynamic'

const Chatbot = dynamic(() => import('./Chatbot'), { ssr: false })
const ScrollReveal = dynamic(() => import('./ScrollReveal'), { ssr: false })

export default function ClientShell() {
  return (
    <>
      <ScrollReveal />
      <Chatbot />
    </>
  )
}
