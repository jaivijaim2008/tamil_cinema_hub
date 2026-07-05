// Utility to normalize/clamp a rating to the 0-5 star scale.
// Ratings are stored as 0-5 in Sanity. This clamps any out-of-range values.
export function normalizeRating(value: number | null | undefined): number {
  if (value == null) return 0;
  return Math.min(5, Math.max(0, value));
}
