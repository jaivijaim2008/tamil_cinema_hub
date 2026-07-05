/**
 * Monetag Ad Configuration
 *
 * Get your zone IDs and script URL from https://monetag.com dashboard:
 * 1. Sign up / Login
 * 2. Add your site (tamilcinemahub.xyz)
 * 3. Verify ownership (upload file or meta tag)
 * 4. Create Ad Zones for each format
 * 5. Paste your zone IDs and script URL below
 *
 * The script URL is provided by Monetag in your dashboard when you create
 * an ad zone. It typically looks like:
 *   https://g.msn/c/c.js?u=ZONE_ID
 *   or
 *   //some-monetag-domain.com/tag.js
 */

export const monetagConfig = {
  // Set to true to enable Monetag ads site-wide
  enabled: true,

  // Your Monetag script URL (get this from your dashboard)
  // Example: "https://g.msn/c/c.js"
  scriptUrl: '',

  // Your Monetag zone IDs (get these from your dashboard)
  zones: {
    // Homepage banner ad
    banner: '',

    // Movie detail page banner
    bannerMovie: '',

    // Blog pages banner
    bannerBlog: '',
  },

  // Ad placement settings
  settings: {
    // Maximum number of ads per page
    maxAdsPerPage: 3,
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
