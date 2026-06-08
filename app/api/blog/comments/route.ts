import { NextRequest, NextResponse } from 'next/server'
import { client } from '@/sanity/client'
import { writeClient } from '@/sanity/writeClient'
import { escapeHtml, isValidSlug, getIP } from '@/lib/sanitize'

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get('slug')
  const limit = Math.min(parseInt(req.nextUrl.searchParams.get('limit') ?? '20'), 50)
  const before = req.nextUrl.searchParams.get('before') // cursor: createdAt of last item
  if (!slug) return NextResponse.json({ error: 'slug required' }, { status: 400 })

  // Validate slug format
  if (typeof slug !== 'string' || !isValidSlug(slug)) {
    return NextResponse.json({ error: 'Invalid slug format.' }, { status: 400 })
  }

  // Validate limit
  if (isNaN(limit) || limit < 1) {
    return NextResponse.json({ error: 'Invalid limit.' }, { status: 400 })
  }

  try {
    const doc = await client.fetch<{ comments?: any[] }>(
      `*[_type == "blog" && slug.current == $slug][0]{ comments }`,
      { slug }
    )
    let all = (doc?.comments ?? []).reverse() // newest-first

    // Cursor-based pagination: filter comments older than the cursor
    if (before && typeof before === 'string') {
      all = all.filter(c => c.createdAt < before)
    }

    const page = all.slice(0, limit)
    const hasMore = all.length > limit
    const nextCursor = hasMore ? page[page.length - 1]?.createdAt ?? null : null

    return NextResponse.json({
      comments: page,
      total: doc?.comments?.length ?? 0,
      hasMore,
      nextCursor,
    })
  } catch {
    return NextResponse.json({ comments: [], total: 0, hasMore: false, nextCursor: null })
  }
}

export async function POST(req: NextRequest) {
  // Check content-length
  const contentLength = parseInt(req.headers.get('content-length') || '0', 10)
  if (contentLength > 8 * 1024) {
    return NextResponse.json({ error: 'Request too large.' }, { status: 413 })
  }

  let body: any
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // Validate body structure
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const { slug, author, email, content, parentId } = body
  if (!slug || !author?.trim() || !content?.trim()) {
    return NextResponse.json({ error: 'slug, author, and content required' }, { status: 400 })
  }

  // Type checks
  if (typeof slug !== 'string' || typeof author !== 'string' || typeof content !== 'string') {
    return NextResponse.json({ error: 'Invalid field types.' }, { status: 400 })
  }

  if (email && typeof email !== 'string') {
    return NextResponse.json({ error: 'Invalid email.' }, { status: 400 })
  }

  if (parentId && typeof parentId !== 'string') {
    return NextResponse.json({ error: 'Invalid parentId.' }, { status: 400 })
  }

  // Validate slug format
  if (!isValidSlug(slug)) {
    return NextResponse.json({ error: 'Invalid slug format.' }, { status: 400 })
  }

  // Basic sanitization + HTML escaping
  const cleanAuthor = escapeHtml(author.trim().slice(0, 50))
  const cleanContent = escapeHtml(content.trim().slice(0, 1000))

  // Rate limit: 1 comment per IP per 30 seconds
  const ip = getIP(req)
  const now = Date.now()
  if (!(globalThis as any).__commentRL) (globalThis as any).__commentRL = new Map<string, number>()
  const rl: Map<string, number> = (globalThis as any).__commentRL
  const last = rl.get(ip)
  if (last && now - last < 30_000) {
    return NextResponse.json({ error: 'Please wait before posting another comment.' }, { status: 429 })
  }
  rl.set(ip, now)

  try {
    // Find the blog document
    const docId = await client.fetch<string | null>(
      `*[_type == "blog" && slug.current == $slug][0]._id`,
      { slug }
    )
    if (!docId) return NextResponse.json({ error: 'Blog not found' }, { status: 404 })

    // Store comment inline on the blog doc as an array field
    const comment: Record<string, any> = {
      _type: 'comment',
      _key: Math.random().toString(36).slice(2, 10),
      author: cleanAuthor,
      content: cleanContent,
      createdAt: new Date().toISOString(),
      authorIp: ip, // Store IP for ownership verification on edit/delete
    }
    if (email?.trim()) comment.email = escapeHtml(email.trim().slice(0, 200))
    if (parentId) comment.parentId = parentId

    const result = await writeClient
      .patch(docId)
      .setIfMissing({ comments: [] })
      .append('comments', [comment])
      .commit({ returnDocuments: true })

    return NextResponse.json({
      ok: true,
      comment: { _id: comment._key, author: cleanAuthor, email: comment.email, content: cleanContent, createdAt: comment.createdAt, parentId: comment.parentId },
    })
  } catch (err: any) {
    console.error('[Comments API]', err?.message)
    return NextResponse.json({ error: 'Failed to post comment' }, { status: 500 })
  }
}
