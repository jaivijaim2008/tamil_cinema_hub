import type { Metadata, Viewport } from 'next'
import { Syne, DM_Sans, Playfair_Display, Noto_Serif_Tamil } from 'next/font/google'
import './globals.css'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import SpatialEnvironment from '../components/SpatialEnvironment'

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['700', '800'],
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['400', '500', '700', '900'],
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
  weight: ['600', '700'],
  display: 'swap',
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover' as const,
  themeColor: '#000000',
}

export const metadata: Metadata = {
  metadataBase: new URL('https://tamilcinemahub.xyz'),
  title: {
    default: 'TamilCinemaHub — Spatial Cinematic Database',
    template: '%s | TamilCinemaHub',
  },
  description: 'The definitive 3D archive of Tamil cinema. Experience films through spatial storytelling.',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${syne.variable} ${dmSans.variable} ${playfair.variable} ${notoTamil.variable}`}>
      <body className="antialiased">
        <SpatialEnvironment />
        <Navbar />
        <main id="spatial-root">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
