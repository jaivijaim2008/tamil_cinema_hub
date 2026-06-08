import { NextRequest, NextResponse } from 'next/server'

// ═══════════════════════════════════════════════════════════════
// SECURITY PROXY
// Adds security headers to all responses and protects API routes
// ═══════════════════════════════════════════════════════════════

const ALLOWED_ORIGINS = [
  'https://tamilcinemahub.xyz',
  'https://www.tamilcinemahub.xyz',
  'http://localhost:3000',
]

function getSecurityHeaders(request: NextRequest): Record<string, string> {
  const isSecure = request.nextUrl.protocol === 'https:'

  const headers: Record<string, string> = {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=(), browsing-topics=()',
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://pagead2.googlesyndication.com https://adservice.google.com https://www.googletagservices.com https://googleads.g.doubleclick.net",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https: http:",
      "media-src 'self'",
      "connect-src 'self' https://*.sanity.io https://api.groq.com https://generativelanguage.googleapis.com https://api.cerebras.ai https://openrouter.ai https://huggingface.co https://api.replicate.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "upgrade-insecure-requests",
    ].join('; '),
  }

  if (isSecure) {
    headers['Strict-Transport-Security'] = 'max-age=63072000; includeSubDomains; preload'
  }

  return headers
}

const rateLimitMap = new Map<string, { count: number; start: number }>()

function checkGlobalRateLimit(
  ip: string,
  path: string,
  maxRequests: number,
  windowMs: number
): { ok: boolean; retryAfter: number } {
  const key = `${ip}:${path}`
  const now = Date.now()
  const entry = rateLimitMap.get(key)

  if (!entry || now - entry.start > windowMs) {
    rateLimitMap.set(key, { count: 1, start: now })
    return { ok: true, retryAfter: 0 }
  }

  entry.count++
  if (entry.count > maxRequests) {
    return {
      ok: false,
      retryAfter: Math.ceil((entry.start + windowMs - now) / 1000),
    }
  }
  return { ok: true, retryAfter: 0 }
}

const CLEANUP_INTERVAL = 5 * 60 * 1000
let lastCleanup = Date.now()

function cleanupRateLimitMap() {
  const now = Date.now()
  if (now - lastCleanup < CLEANUP_INTERVAL) return
  lastCleanup = now
  for (const [key, entry] of rateLimitMap) {
    if (now - entry.start > 10 * 60 * 1000) {
      rateLimitMap.delete(key)
    }
  }
}

const BLOCKED_PATHS = [
  '/wp-admin',
  '/wp-login',
  '/wp-content',
  '/xmlrpc.php',
  '/.env',
  '/.git',
  '/config',
  '/admin',
  '/phpmyadmin',
  '/debug',
  '/server-status',
]

// ↓ Only change: function renamed from `middleware` to `proxy`
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const response = NextResponse.next()

  const securityHeaders = getSecurityHeaders(request)
  for (const [key, value] of Object.entries(securityHeaders)) {
    response.headers.set(key, value)
  }

  const lowerPath = pathname.toLowerCase()
  for (const blocked of BLOCKED_PATHS) {
    if (lowerPath.startsWith(blocked)) {
      return NextResponse.json({ error: 'Not Found' }, { status: 404 })
    }
  }

  if (pathname.startsWith('/api/')) {
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      request.headers.get('x-real-ip') ||
      'unknown'

    cleanupRateLimitMap()
    const { ok, retryAfter } = checkGlobalRateLimit(ip, 'api', 60, 60_000)
    if (!ok) {
      return NextResponse.json(
        { error: `Rate limit exceeded. Retry after ${retryAfter}s.` },
        {
          status: 429,
          headers: {
            'Retry-After': String(retryAfter),
            ...securityHeaders,
          },
        }
      )
    }

    if (pathname.startsWith('/api/chat')) {
      const chatRL = checkGlobalRateLimit(ip, 'chat', 20, 60_000)
      if (!chatRL.ok) {
        return NextResponse.json(
          { error: `Chat rate limit exceeded. Retry after ${chatRL.retryAfter}s.` },
          {
            status: 429,
            headers: {
              'Retry-After': String(chatRL.retryAfter),
              ...securityHeaders,
            },
          }
        )
      }
    }

    if (pathname === '/api/contact' && request.method === 'POST') {
      const contactRL = checkGlobalRateLimit(ip, 'contact', 3, 300_000)
      if (!contactRL.ok) {
        return NextResponse.json(
          { error: 'Too many messages. Please try again later.' },
          {
            status: 429,
            headers: {
              'Retry-After': String(contactRL.retryAfter),
              ...securityHeaders,
            },
          }
        )
      }
    }

    const origin = request.headers.get('origin')
    const allowedOrigin = ALLOWED_ORIGINS.includes(origin || '') ? origin : ALLOWED_ORIGINS[0]
    response.headers.set('Access-Control-Allow-Origin', allowedOrigin!)
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    response.headers.set('Access-Control-Max-Age', '86400')

    if (request.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': allowedOrigin!,
          'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Max-Age': '86400',
          ...securityHeaders,
        },
      })
    }

    if (request.nextUrl.searchParams.get('debug') === '1' && process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Debug mode not available in production' }, { status: 403 })
    }

    if (pathname === '/api/health' && process.env.NODE_ENV === 'production') {
      const userAgent = request.headers.get('user-agent') || ''
      if (!userAgent.includes('UptimeRobot') && !userAgent.includes('healthcheck')) {
        return NextResponse.json({ status: 'ok' }, { status: 200 })
      }
    }
  }

  if (pathname.startsWith('/studio') && process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not Found' }, { status: 404 })
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|opengraph-image).*)',
  ],
}