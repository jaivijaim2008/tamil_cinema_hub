/** Normalize a Sanity field that may be a string or array into an array. */
export function toArray(val: unknown): string[] {
  if (Array.isArray(val)) return val
  if (typeof val === 'string' && val) return [val]
  return []
}
