/**
 * Monetag Ad Configuration
 *
 * Multitag (all-in-one) — auto-optimizes across formats:
 * popunder, push notifications, in-page push, vignette banners.
 * Loaded globally in layout.tsx.
 */

export const monetagConfig = {
  // Set to true to enable Monetag ads site-wide
  enabled: true,

  // Multitag script URL (from your Monetag dashboard)
  scriptUrl: 'https://quge5.com/88/tag.min.js',

  // Multitag zone ID (from your Monetag dashboard)
  zoneId: '256478',

  // Additional per-placement zone IDs (for MonetagAd component)
  zones: {
    banner: '',
    bannerMovie: '',
    bannerBlog: '',
  },
}

/**
 * Get zone ID for a specific placement
 */
export function getMonetagZone(
  placement: keyof typeof monetagConfig.zones
): string {
  return monetagConfig.zones[placement] || ''
}
