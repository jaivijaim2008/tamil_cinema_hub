import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // @ts-ignore - turbopack root config for Next.js 16
  turbopack: {
    root: process.cwd(),
  },
  // ── Security Headers ──────────────────────────────────────
  // Middleware also sets these; this is defense-in-depth
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-XSS-Protection', value: '1; mode=block' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        {
          key: 'Permissions-Policy',
          value: 'camera=(), microphone=(), geolocation=(), interest-cohort=(), browsing-topics=()',
        },
      ],
    },
    {
      source: '/api/(.*)',
      headers: [
        { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate' },
        { key: 'Pragma', value: 'no-cache' },
      ],
    },
    {
      // Cache static assets aggressively
      source: '/(.*)\.(ico|svg|png|jpg|jpeg|gif|webp|woff|woff2|ttf|eot)',
      headers: [
        { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
      ],
    },
  ],

  // ── Image Optimization Security ────────────────────────────
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.sanity.io',
      },
      {
        protocol: 'https',
        hostname: 'image.tmdb.org',
      },
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
      },
      {
        protocol: 'https',
        hostname: 'www.gravatar.com',
      },
    ],
    // Limit image optimization to prevent abuse
    minimumCacheTTL: 60 * 60, // 1 hour
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // ── Output file tracing for serverless (uncomment for Render/Fly.io) ──
  // output: 'standalone',

  // ── Disable x-powered-by header ────────────────────────────
  poweredByHeader: false,

  // ── Compression ────────────────────────────────────────────
  compress: true,

  // ── Strict mode ────────────────────────────────────────────
  reactStrictMode: true,
}

export default nextConfig;
