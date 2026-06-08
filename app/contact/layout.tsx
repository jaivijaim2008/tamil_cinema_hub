import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact Us — TamilCinemaHub',
  description: 'Get in touch with TamilCinemaHub. Have questions, movie suggestions, or feedback about Tamil cinema? We read every message.',
  openGraph: {
    title: 'Contact Us — TamilCinemaHub',
    description: 'Get in touch with TamilCinemaHub. Have questions, movie suggestions, or feedback about Tamil cinema?',
    type: 'website',
    url: 'https://tamilcinemahub.xyz/contact',
    images: [
      {
        url: 'https://tamilcinemahub.xyz/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'Contact TamilCinemaHub',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact Us — TamilCinemaHub',
    description: 'Get in touch with TamilCinemaHub. Have questions, movie suggestions, or feedback about Tamil cinema?',
    images: ['https://tamilcinemahub.xyz/opengraph-image'],
  },
  alternates: {
    canonical: 'https://tamilcinemahub.xyz/contact',
  },
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
