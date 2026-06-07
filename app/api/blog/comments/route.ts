import { NextRequest, NextResponse } from 'next/server'
import { client } from '@/sanity/client'
import { writeClient } from '@/sanity/writeClient'

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get('slug')
  if (!slug) return NextResponse.json({ error: 'slug required' }, { status: 400 })

  try {
    const doc = await writeClient.fetch<{ comments?: any[] }>(
      `*[_type == "blog" && slug.current == $slug][0]{ comments }`,
      { slug }
    )
    return NextResponse.json({ comments: (doc?.comments ?? []).slice(-50).reverse() })
  } catch {
    return NextResponse.json({ comments: [] })
  }
}

export async function POST(req: NextRequest) {
  let body: any
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { slug, author, email, content, parentId } = body
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
    }
    if (email?.trim()) comment.email = email.trim().slice(0, 200)
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
