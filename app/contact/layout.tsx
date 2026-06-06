import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact Us — TamilCinemaHub',
  description: 'Get in touch with TamilCinemaHub. Have questions, movie suggestions, or feedback about Tamil cinema? We read every message.',
  openGraph: {
    title: 'Contact Us — TamilCinemaHub',
    description: 'Get in touch with TamilCinemaHub. Have questions, movie suggestions, or feedback about Tamil cinema?',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Contact Us — TamilCinemaHub',
    description: 'Get in touch with TamilCinemaHub. Have questions, movie suggestions, or feedback about Tamil cinema?',
  },
  alternates: {
    canonical: 'https://tamilcinemahub.xyz/contact',
  },
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
