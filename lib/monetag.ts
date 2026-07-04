/**
 * Monetag Ad Configuration
 *
 * Get your zone IDs from https://monetag.com dashboard:
 * 1. Sign up / Login
 * 2. Add your site (tamilcinemahub.xyz)
 * 3. Verify ownership (upload file or meta tag)
 * 4. Create Ad Zones for each format
 * 5. Paste your zone IDs below
 *
 * Available formats:
 * - banner: Standard banner ads (300x250, 728x90, etc.)
 * - interstitial: Full-screen ads between page loads
 * - push: In-page push notification ads
 * - vignette: Center-screen overlay ads
 */

export const monetagConfig = {
  // Set to true to enable Monetag ads site-wide
  enabled: false, // Change to true after setting up your zone IDs

  // Your Monetag zone IDs (get these from your dashboard)
  zones: {
    // Homepage banner ad
    banner: '',

    // Movie detail page banner
    bannerMovie: '',

    // Blog pages banner
    bannerBlog: '',

    // Interstitial ad (shows between page navigations)
    interstitial: '',

    // In-page push notifications
    push: '',

    // Vignette overlay ads
    vignette: '',
  },

  // Ad placement settings
  settings: {
    // Maximum number of ads per page
    maxAdsPerPage: 3,

    // Delay before showing interstitial (ms)
    interstitialDelay: 0,

    // Enable/disable specific formats
    formats: {
      banner: true,
      interstitial: true,
      push: true,
      vignette: false, // Disabled by default - can be annoying
    },
  },
}

/**
 * Helper to check if Monetag is properly configured
 */
export function isMonetagConfigured(): boolean {
  return (
    monetagConfig.enabled &&
    Object.values(monetagConfig.zones).some(zone => zone.length > 0)
  )
}

/**
 * Get zone ID for a specific placement
 */
export function getMonetagZone(
  placement: keyof typeof monetagConfig.zones
): string {
  return monetagConfig.zones[placement] || ''
}
