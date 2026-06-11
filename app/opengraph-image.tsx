import { ImageResponse } from 'next/og'

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
          background: 'linear-gradient(135deg, #080808 0%, #141414 40%, #1A1A1A 60%, #080808 100%)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Gold radial glow top */}
        <div
          style={{
            position: 'absolute',
            top: '-100px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '800px',
            height: '400px',
            borderRadius: '50%',
            background: 'radial-gradient(ellipse, rgba(232,184,75,0.35) 0%, transparent 70%)',
          }}
        />
        {/* Red radial glow bottom-right */}
        <div
          style={{
            position: 'absolute',
            bottom: '-50px',
            right: '-100px',
            width: '500px',
            height: '300px',
            borderRadius: '50%',
            background: 'radial-gradient(ellipse, rgba(192,57,43,0.15) 0%, transparent 70%)',
          }}
        />
        {/* Purple radial glow bottom-left */}
        <div
          style={{
            position: 'absolute',
            bottom: '0px',
            left: '-50px',
            width: '400px',
            height: '300px',
            borderRadius: '50%',
            background: 'radial-gradient(ellipse, rgba(168,85,247,0.1) 0%, transparent 70%)',
          }}
        />

        {/* Film reel icon */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '20px',
          }}
        >
          <span style={{ fontSize: '56px' }}>🎬</span>
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
              fontSize: '78px',
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
            <span style={{ color: '#E8B84B' }}>
              {' '}CinemaHub
            </span>
          </h1>
          <p
            style={{
              fontSize: '24px',
              color: 'rgba(255,255,255,0.5)',
              marginTop: '20px',
              fontFamily: 'sans-serif',
              letterSpacing: '6px',
              textTransform: 'uppercase',
            }}
          >
            Movies · Reviews · AI
          </p>
        </div>

        {/* Bottom accent line — gold/red/purple */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '5px',
            background: 'linear-gradient(to right, #E8B84B, #C0392B, #A855F7, #E8B84B)',
          }}
        />
      </div>
    ),
    { ...size }
  )
}
