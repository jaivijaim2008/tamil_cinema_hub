import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import './globals.css'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Chatbot from '../components/Chatbot'
import ScrollReveal from '../components/ScrollReveal'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover' as const,
}

export const metadata: Metadata = {
  metadataBase: new URL('https://tamilcinemahub.xyz'),
  title: {
    default: 'TamilCinemaHub — Tamil Movies, Reviews & AI Recommendations',
    template: '%s | TamilCinemaHub',
  },
  description: 'Your complete guide to Tamil cinema. Explore 1600+ Tamil movies from 2000 to 2026, read reviews, and get AI-powered recommendations.',
  keywords: ['Tamil movies', 'Kollywood', 'Tamil cinema', 'Tamil movie reviews', 'Tamil film database'],
  authors: [{ name: 'TamilCinemaHub' }],
  creator: 'TamilCinemaHub',
  publisher: 'TamilCinemaHub',
  openGraph: {
    type: 'website',
    siteName: 'TamilCinemaHub',
    locale: 'en_US',
    title: 'TamilCinemaHub — Tamil Movies, Reviews & AI Recommendations',
    description: 'Your complete guide to Tamil cinema. Explore 1600+ Tamil movies from 2000 to 2026.',
    url: 'https://tamilcinemahub.xyz',
    images: [{ url: 'https://tamilcinemahub.xyz/opengraph-image', width: 1200, height: 630, alt: 'TamilCinemaHub' }],
  },
  twitter: { card: 'summary_large_image', title: 'TamilCinemaHub', description: '1600+ Tamil movies, reviews, AI recommendations.', images: ['https://tamilcinemahub.xyz/opengraph-image'] },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-video-preview': -1, 'max-image-preview': 'large', 'max-snippet': -1 } },
  alternates: { canonical: 'https://tamilcinemahub.xyz' },
  icons: { icon: '/favicon.ico', shortcut: '/favicon.ico', apple: '/favicon.ico' },
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800;900&family=DM+Sans:wght@400;500;600;700&family=Noto+Serif+Tamil:wght@400;600&display=swap"
          rel="stylesheet"
        />
        <Script
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-YOUR_ADSENSE_ID"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>
      <body className="antialiased" style={{ fontFamily: "'DM Sans', sans-serif" }}>
        <ScrollReveal />
        <Navbar />
        <main className="flex-1">{children}</main>
        <Chatbot />
        <Footer />
      </body>
    </html>
  )
}
