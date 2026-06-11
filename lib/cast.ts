// lib/cast.ts
/**
 * Normalizes a cast array that may contain plain string names or full CastMember objects.
 * Returns an array of CastMember objects where each entry has at least a `name`.
 */
import type { CastMember } from '@/lib/types'

export const normalizeCast = (cast?: (string | CastMember)[]): CastMember[] => {
  if (!cast) return []
  return cast.map((c) => {
    if (typeof c === 'string') {
      return { name: c }
    }
    return c
  })
}
