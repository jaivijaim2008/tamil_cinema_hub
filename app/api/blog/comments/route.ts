import { NextRequest, NextResponse } from 'next/server'
import { client } from '@/sanity/client'

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get('slug')
  if (!slug) return NextResponse.json({ error: 'slug required' }, { status: 400 })

  try {
    const comments = await client.fetch(
      `*[_type == "comment" && blogSlug == $slug] | order(createdAt desc) [0...50] {
        _id, author, content, createdAt
      }`,
      { slug }
    )
    return NextResponse.json({ comments })
  } catch {
    return NextResponse.json({ comments: [] })
  }
}

export async function POST(req: NextRequest) {
  let body: any
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { slug, author, content } = body
  if (!slug || !author?.trim() || !content?.trim()) {
    return NextResponse.json({ error: 'slug, author, and content required' }, { status: 400 })
  }

  // Basic sanitization
  const cleanAuthor = author.trim().slice(0, 50)
  const cleanContent = content.trim().slice(0, 1000)

  // Rate limit: 1 comment per IP per 30 seconds
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'
  const now = Date.now()
  if (!(globalThis as any).__commentRL) (globalThis as any).__commentRL = new Map<string, number>()
  const rl: Map<string, number> = (globalThis as any).__commentRL
  const last = rl.get(ip)
  if (last && now - last < 30_000) {
    return NextResponse.json({ error: 'Please wait before posting another comment.' }, { status: 429 })
  }
  rl.set(ip, now)

  try {
    const doc = await client.create({
      _type: 'comment',
      blogSlug: slug,
      author: cleanAuthor,
      content: cleanContent,
      createdAt: new Date().toISOString(),
    })

    return NextResponse.json({
      ok: true,
      comment: { _id: doc._id, author: cleanAuthor, content: cleanContent, createdAt: doc.createdAt },
    })
  } catch (err: any) {
    console.error('[Comments API]', err?.message)
    return NextResponse.json({ error: 'Failed to post comment' }, { status: 500 })
  }
}
