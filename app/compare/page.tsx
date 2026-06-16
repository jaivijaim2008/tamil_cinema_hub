import type { Metadata } from 'next'
import ComparePageClient from './ComparePageClient'

export const metadata: Metadata = {
  title: 'Compare Movies',
  description: 'Compare two Tamil movies side by side — similarity scores, shared genres, cast overlap & more.',
}

export default function ComparePage() {
  return <ComparePageClient />
}
