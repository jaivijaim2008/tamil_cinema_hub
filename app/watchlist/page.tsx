import type { Metadata } from 'next'
import WatchlistPageClient from './WatchlistPageClient'

export const metadata: Metadata = {
  title: 'Watchlist',
  description: 'Your saved Tamil movies — movies you want to watch later.',
}

export default function WatchlistPage() {
  return <WatchlistPageClient />
}
