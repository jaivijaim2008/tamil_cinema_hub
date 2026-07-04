export interface CastMember {
  _key?: string
  name?: string
  character?: string
  photo?: SanityImage
  posterUrl?: string
  tmdbPersonId?: number
}

export interface Movie {
  _id: string
  title: string
  titleTanglish?: string
  slug: string
  year: number
  director: string
  cast?: (string | CastMember)[]
  genre?: string[]
  rating?: number
  poster?: SanityImage
  posterUrl?: string | null
  backdropUrl?: string | null
  synopsis?: string
  ottPlatform?: string
  tmdbId?: number
  review?: PortableTextBlock[]
}

/* ── Blog ───────────────────────────────────────────────────────────────────── */
export interface Blog {
  _id: string
  title: string
  slug: string
  author: string
  publishedAt: string
  category: BlogCategory
  mainImage?: SanityImage
  excerpt?: string
  tags?: string[]
}

export interface BlogDetail extends Omit<Blog, 'category'> {
  category: string
  body?: (PortableTextBlock | SanityImageBlock)[]
  seoTitle?: string
  seoDescription?: string
  likes?: number
  dislikes?: number
}

export type BlogCategory = 'Review' | 'Top List' | 'News' | 'Actor' | 'Director' | 'Feature'

/* ── Comment ────────────────────────────────────────────────────────────────── */
export interface Comment {
  _id: string
  blogSlug: string
  author: string
  content: string
  createdAt: string
}

/* ── Sanity helpers ─────────────────────────────────────────────────────────── */
export type SanityImage = {
  asset?: { _ref?: string; _type?: string }
  hotspot?: { x: number; y: number; height: number; width: number }
  crop?: { top: number; bottom: number; left: number; right: number }
}

export interface SanityImageBlock {
  _type: 'image'
  asset?: SanityImage['asset']
  alt?: string
  caption?: string
}

/* ── Portable Text ──────────────────────────────────────────────────────────── */
export interface PortableTextBlock {
  _type: 'block'
  _key: string
  style?: string
  children?: { _key: string; _type: 'span'; text: string; marks?: string[] }[]
  markDefs?: { _key: string; _type: string; [k: string]: unknown }[]
}

/* ── Page props ─────────────────────────────────────────────────────────────── */
export interface GenreCount {
  genre: string
  count: number
}

export interface MovieAnalytics {
  _id: string
  title: string
  year: number
  director: string
  genre?: string[]
  rating?: number
}
