import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import { Playfair_Display, Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import Providers from './providers'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import BottomNav from '../components/layout/BottomNav'
import AIChatBubble from '../components/ui/AIChatBubble'
import CookieConsent from '../components/ui/CookieConsent'
import AdSenseScript from '../components/ui/AdSenseScript'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '500', '700'],
  display: 'swap',
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover' as const,
  themeColor: '#E8B84B',
}

export const metadata: Metadata = {
  metadataBase: new URL('https://www.tamilcinemahub.xyz'),
  title: {
    default: 'TamilCinemaHub — Tamil Cinema Archive',
    template: '%s | TamilCinemaHub',
  },
  description: 'A high-fidelity archive of 1,600+ Tamil films. Discover, explore, and rediscover Kollywood.',
  keywords: ['Tamil cinema', 'Kollywood movies', 'Tamil movies', 'Tamil movie reviews', 'Tamil film archive', 'Kollywood', 'Tamil film industry'],
  authors: [{ name: 'TamilCinemaHub Team' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.tamilcinemahub.xyz',
    title: 'TamilCinemaHub — Tamil Cinema Archive',
    description: 'A high-fidelity archive of 1,600+ Tamil films. Discover, explore, and rediscover Kollywood.',
    siteName: 'TamilCinemaHub',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TamilCinemaHub — Tamil Cinema Archive',
    description: 'A high-fidelity archive of 1,600+ Tamil films. Discover, explore, and rediscover Kollywood.',
  },
  other: {},
  alternates: {
    canonical: '/',
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'TamilCinemaHub',
  },
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <meta name="google-adsense-account" content="ca-pub-9250311764302161" />
        {/* Google AdSense — loaded conditionally via AdSenseScript after consent */}
        <AdSenseScript />
        {/* Plausible Analytics — privacy-friendly, no cookies */}
        <Script
          id="plausible-init"
          dangerouslySetInnerHTML={{
            __html: `window.plausible=window.plausible||function(){(plausible.q=plausible.q||[]).push(arguments)},plausible.init=plausible.init||function(i){plausible.o=i||{}};plausible.init()`,
          }}
          strategy="afterInteractive"
        />
        <Script
          id="plausible-script"
          async
          src="https://plausible.io/js/pa-XAOaek-Iwb_EI-8oRm3Cg.js"
          strategy="afterInteractive"
        />
      </head>
      <body className="bg-bg-primary text-text-primary font-inter antialiased overflow-x-hidden">
        <Providers>
          <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:bg-accent-gold focus:text-text-inverse focus:px-4 focus:py-2 focus:rounded-lg">
            Skip to content
          </a>
          <div id="top" />
          <Navbar />
          <main id="main" className="pb-[76px] lg:pb-0">
            {children}
          </main>
          <Footer />
          <BottomNav />
          <AIChatBubble />
          <CookieConsent />
        </Providers>
      </body>
    </html>
  )
}
