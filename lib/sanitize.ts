// ═══════════════════════════════════════════════════════════════
// SHARED SECURITY UTILITIES
// Used across all API routes for consistent security practices
// ═══════════════════════════════════════════════════════════════

/**
 * Escape HTML special characters to prevent XSS injection.
 * Use this when inserting user input into HTML templates (e.g. emails).
 */
export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/**
 * Validate a Sanity slug format: alphanumeric + hyphens, max length.
 */
export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/i.test(slug) && slug.length <= 200
}

/**
 * Extract the real client IP from request headers.
 */
export function getIP(req: Request): string {
  const headers = req.headers
  return headers.get('x-forwarded-for')?.split(',')[0].trim() || headers.get('x-real-ip') || 'unknown'
}
