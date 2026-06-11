import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'TamilCinemaHub',
    short_name: 'TamilCinema',
    description: 'The ultimate Tamil cinema database',
    start_url: '/',
    display: 'standalone',
    background_color: '#080808',
    theme_color: '#E8B84B',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
