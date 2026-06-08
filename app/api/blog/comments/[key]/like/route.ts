import { NextRequest, NextResponse } from 'next/server'
import { client } from '@/sanity/client'
import { writeClient } from '@/sanity/writeClient'
import { isValidSlug, getIP } from '@/lib/sanitize'

// POST: Like/unlike a comment (toggle)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  const { key } = await params

  // Validate comment key format
  if (!key || typeof key !== 'string' || key.length > 50 || /[^a-zA-Z0-9]/.test(key)) {
    return NextResponse.json({ error: 'Invalid comment key.' }, { status: 400 })
  }

  let body: any
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // Validate body structure
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const { slug } = body
  if (!slug) return NextResponse.json({ error: 'slug required' }, { status: 400 })

  if (typeof slug !== 'string' || !isValidSlug(slug)) {
    return NextResponse.json({ error: 'Invalid slug format.' }, { status: 400 })
  }

  // Rate limit: 1 like per IP per 5 seconds
  const ip = getIP(req)
  const now = Date.now()
  if (!(globalThis as any).__commentLikeRL) (globalThis as any).__commentLikeRL = new Map<string, number>()
  const rl: Map<string, number> = (globalThis as any).__commentLikeRL
  const last = rl.get(ip)
  if (last && now - last < 5_000) {
    return NextResponse.json({ error: 'Please wait before liking again.' }, { status: 429 })
  }
  rl.set(ip, now)

  try {
    const docId = await client.fetch<string | null>(
      `*[_type == "blog" && slug.current == $slug][0]._id`,
      { slug }
    )
    if (!docId) return NextResponse.json({ error: 'Blog not found' }, { status: 404 })

    // Fetch current likes array for this comment
    const doc = await client.fetch<{ comments?: any[] }>(
      `*[_type == "blog" && _id == $id][0]{ comments[_key == $key]{ likes } }`,
      { id: docId, key }
    )
    const comment = doc?.comments?.[0]
    if (!comment) return NextResponse.json({ error: 'Comment not found' }, { status: 404 })

    const likes: string[] = comment.likes ?? []
    const alreadyLiked = likes.includes(ip)
    const newLikes = alreadyLiked ? likes.filter(l => l !== ip) : [...likes, ip]

    await writeClient
      .patch(docId)
      .set({ [`comments[_key == "${key}"].likes`]: newLikes })
      .commit()

    return NextResponse.json({ ok: true, likes: newLikes.length, liked: !alreadyLiked })
  } catch (err: any) {
    console.error('[Comment Like]', err?.message)
    return NextResponse.json({ error: 'Failed to toggle like' }, { status: 500 })
  }
}
