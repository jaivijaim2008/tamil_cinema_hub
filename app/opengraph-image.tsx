import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'TamilCinemaHub — Tamil Movies, Reviews & AI Recommendations'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0d0d2b 0%, #1a0533 40%, #0d0d2b 100%)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Gradient orbs */}
        <div
          style={{
            position: 'absolute',
            top: '-100px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '800px',
            height: '400px',
            borderRadius: '50%',
            background: 'radial-gradient(ellipse, rgba(124,58,237,0.4) 0%, transparent 70%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-50px',
            right: '-100px',
            width: '500px',
            height: '300px',
            borderRadius: '50%',
            background: 'radial-gradient(ellipse, rgba(249,115,22,0.2) 0%, transparent 70%)',
          }}
        />

        {/* Film reel icon */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px',
          }}
        >
          <span style={{ fontSize: '48px' }}>🎬</span>
        </div>

        {/* Site name */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <h1
            style={{
              fontSize: '72px',
              fontWeight: 900,
              fontFamily: 'sans-serif',
              color: 'white',
              margin: 0,
              lineHeight: 1.1,
              textAlign: 'center',
              letterSpacing: '-2px',
            }}
          >
            Tamil
            <span style={{ color: '#f97316' }}>
              Cinema Hub
            </span>
          </h1>
          <p
            style={{
              fontSize: '24px',
              color: 'rgba(255,255,255,0.5)',
              marginTop: '16px',
              fontFamily: 'sans-serif',
              letterSpacing: '4px',
              textTransform: 'uppercase',
            }}
          >
            Movies · Reviews · AI
          </p>
        </div>

        {/* Bottom accent line */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(to right, #7c3aed, #f97316, #fbbf24)',
          }}
        />
      </div>
    ),
    { ...size }
  )
}
