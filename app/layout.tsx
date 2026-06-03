import type { Metadata } from 'next'
import { Outfit } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Chatbot from '../components/Chatbot'

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  weight: ['400', '500', '600', '700', '800', '900'],
})

export const metadata: Metadata = {
  title: {
    default: 'TamilCinemaHub — Tamil Movies, Reviews & AI Recommendations',
    template: '%s | TamilCinemaHub',
  },
  description: 'Your complete guide to Tamil cinema. Explore 1600+ Tamil movies from 2000 to 2026, read reviews, and get AI-powered recommendations.',
  keywords: ['Tamil movies', 'Kollywood', 'Tamil cinema', 'Tamil movie reviews', 'Tamil film database'],
  openGraph: {
    type: 'website',
    siteName: 'TamilCinemaHub',
    title: 'TamilCinemaHub — Tamil Movies, Reviews & AI Recommendations',
    description: 'Your complete guide to Tamil cinema. Explore 1600+ Tamil movies from 2000 to 2026.',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${outfit.variable} h-full antialiased`}>
      <head>
        <Script
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-YOUR_ADSENSE_ID"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>
      <body
        className="font-sans min-h-full flex flex-col bg-[#080810] text-white"
        style={{ fontFamily: 'var(--font-outfit), sans-serif' }}
      >
        {/* Navigation */}
        <Navbar />

        {/* Page Content */}
        <div className="flex-1">
          {children}
        </div>

        {/* Floating AI Chatbot */}
        <Chatbot />

        {/* Footer */}
        <Footer />

      </body>
    </html>
  )
}