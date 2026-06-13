import { type SanityClient } from 'next-sanity'

// No-op Sanity client for build time when env vars are missing.
// Throws on fetch so existing .catch() fallbacks in page components work.
export const noopClient: SanityClient = {
  fetch: async () => {
    throw new Error('Sanity not configured — env vars missing')
  },
  listen: () => ({ subscribe: () => ({ unsubscribe: () => {} }) }),
  withConfig: () => noopClient,
  observable: { subscribe: () => ({ unsubscribe: () => {} }) },
} as unknown as SanityClient
