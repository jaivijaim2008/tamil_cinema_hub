// Utility to normalize a 0‑10 rating to a 0‑5 star scale
export function normalizeRating(value: number | null | undefined): number {
  if (value == null) return 0;
  const normalized = value / 2;
  return Math.min(5, Math.max(0, normalized));
}
