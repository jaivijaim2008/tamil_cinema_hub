import type { Metadata, Viewport } from 'next'
import { Syne, DM_Sans, Playfair_Display, Noto_Serif_Tamil } from 'next/font/google'
import './globals.css'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import ClientShell from '../components/ClientShell'

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['700', '800'],
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
  weight: ['700', '900'],
  style: ['normal', 'italic'],
  display: 'swap',
})

const notoTamil = Noto_Serif_Tamil({
  subsets: ['tamil'],
  variable: '--font-tamil',
  weight: ['600'],
  display: 'swap',
})

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
    type: 'website', siteName: 'TamilCinemaHub', locale: 'en_US',
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
    <html lang="en" className={`${syne.variable} ${dmSans.variable} ${playfair.variable} ${notoTamil.variable}`}>
      <body className="antialiased" style={{ fontFamily: "var(--font-sans)" }}>
        <ClientShell />
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
