import { ImageResponse } from 'next/og'
import { client } from '../../../sanity/client'
import { urlFor } from '../../../sanity/lib/image'
import type { SanityImage } from '@/lib/types'

export const runtime = 'edge'

export const alt = 'TamilCinemaHub Blog Post'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/jpeg'

// Dedicated lightweight query for OG image (avoids fetching full body/seo fields)
const ogBlogQuery = `*[_type == "blog" && slug.current == $slug][0] {
  title,
  category,
  author,
  mainImage,
  excerpt
}`

interface OgBlog {
  title: string
  category: string
  author: string
  mainImage?: SanityImage
  excerpt?: string
}

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  let blog: OgBlog | null = null

  try {
    blog = await client.fetch<OgBlog>(ogBlogQuery, { slug })
  } catch {
    // fallback
  }

  const title = blog?.title || 'TamilCinemaHub Blog'
  const category = blog?.category || 'Tamil Cinema'
  const author = blog?.author || ''
  const excerpt = blog?.excerpt || ''

  // Truncate title and excerpt to fit the image
  const maxTitle = title.length > 60 ? title.slice(0, 57) + '…' : title
  const maxExcerpt = excerpt.length > 120 ? excerpt.slice(0, 117) + '…' : excerpt

  // Category colors
  const catColors: Record<string, string> = {
    Review: '#E8B84B',
    'Top List': '#3b82f6',
    News: '#ef4444',
    Actor: '#a855f7',
    Director: '#06b6d4',
    Feature: '#22c55e',
  }
  const catColor = catColors[category] || '#E8B84B'

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: 'linear-gradient(135deg, #080808 0%, #141414 40%, #1A1A1A 60%, #080808 100%)',
          position: 'relative',
          overflow: 'hidden',
          padding: '48px',
        }}
      >
        {/* Gold radial glow top-left */}
        <div
          style={{
            position: 'absolute',
            top: '-100px',
            left: '-50px',
            width: '600px',
            height: '400px',
            borderRadius: '50%',
            background: 'radial-gradient(ellipse, rgba(232,184,75,0.25) 0%, transparent 70%)',
          }}
        />
        {/* Purple accent glow bottom-right */}
        <div
          style={{
            position: 'absolute',
            bottom: '-80px',
            right: '-80px',
            width: '400px',
            height: '300px',
            borderRadius: '50%',
            background: 'radial-gradient(ellipse, rgba(168,85,247,0.12) 0%, transparent 70%)',
          }}
        />

        {/* Category badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '20px',
          }}
        >
          <div
            style={{
              padding: '6px 16px',
              borderRadius: '20px',
              background: `${catColor}25`,
              border: `1px solid ${catColor}50`,
              color: catColor,
              fontSize: '14px',
              fontWeight: 700,
              fontFamily: 'sans-serif',
              letterSpacing: '2px',
              textTransform: 'uppercase' as const,
            }}
          >
            {category}
          </div>
        </div>

        {/* Title */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            justifyContent: 'center',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <h1
            style={{
              fontSize: title.length > 50 ? '40px' : '52px',
              fontWeight: 900,
              fontFamily: 'sans-serif',
              color: 'white',
              margin: 0,
              lineHeight: 1.15,
              letterSpacing: '-1px',
              maxWidth: '900px',
            }}
          >
            {maxTitle}
          </h1>

          {maxExcerpt && (
            <p
              style={{
                fontSize: '18px',
                color: 'rgba(255,255,255,0.5)',
                marginTop: '16px',
                fontFamily: 'sans-serif',
                lineHeight: 1.4,
                maxWidth: '800px',
              }}
            >
              {maxExcerpt}
            </p>
          )}
        </div>

        {/* Bottom bar: site name, author */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'relative',
            zIndex: 1,
          }}
        >
          {/* Site name */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <span style={{ fontSize: '28px' }}>🎬</span>
            <span
              style={{
                fontSize: '22px',
                fontWeight: 800,
                fontFamily: 'sans-serif',
                color: 'white',
                letterSpacing: '-0.5px',
              }}
            >
              Tamil<span style={{ color: '#E8B84B' }}>CinemaHub</span>
            </span>
          </div>

          {/* Author */}
          {author && (
            <span
              style={{
                fontSize: '14px',
                color: 'rgba(255,255,255,0.4)',
                fontFamily: 'sans-serif',
              }}
            >
              by {author}
            </span>
          )}
        </div>

        {/* Bottom accent line */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(to right, #E8B84B, #C0392B, #A855F7, #E8B84B)',
          }}
        />
      </div>
    ),
    { ...size }
  )
}
