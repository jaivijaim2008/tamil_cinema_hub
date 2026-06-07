import { NextRequest, NextResponse } from 'next/server'
import { client } from '@/sanity/client'
import { writeClient } from '@/sanity/writeClient'

export async function POST(req: NextRequest) {
  let body: any
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { slug, type } = body
  if (!slug || !['like', 'dislike'].includes(type)) {
    return NextResponse.json({ error: 'slug and type (like|dislike) required' }, { status: 400 })
  }

  // Rate limit: 1 reaction per IP per 10 seconds (simple in-memory)
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'
  const key = `${ip}:${slug}:${type}`
  const now = Date.now()
  if (!(globalThis as any).__reactionRL) (globalThis as any).__reactionRL = new Map<string, number>()
  const rl: Map<string, number> = (globalThis as any).__reactionRL
  const last = rl.get(key)
  if (last && now - last < 10_000) {
    return NextResponse.json({ error: 'Too fast. Wait a moment.' }, { status: 429 })
  }
  rl.set(key, now)

  try {
    const field = type === 'like' ? 'likes' : 'dislikes'
    // Fetch the document ID — GROQ returns the ID as a plain string
    const docId = await client.fetch<string | null>(
      `*[_type == "blog" && slug.current == $slug][0]._id`,
      { slug }
    )
    if (!docId) return NextResponse.json({ error: 'Blog not found' }, { status: 404 })

    // Fetch current value (handle null from undeclared schema fields)
    const current = await writeClient.fetch<number | null>(
      `*[_type == "blog" && _id == $id][0}.${field}`,
      { id: docId }
    )

    // Set to (current || 0) + 1 — handles null, undefined, and missing fields
    const result = await writeClient
      .patch(docId)
      .set({ [field]: (current || 0) + 1 })
      .commit({ returnDocuments: true })

    return NextResponse.json({
      ok: true,
      likes: result.likes ?? 0,
      dislikes: result.dislikes ?? 0,
    })
  } catch (err: any) {
    console.error('[Reaction API]', err?.message)
    return NextResponse.json({ error: 'Failed to update reaction' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get('slug')
  if (!slug) return NextResponse.json({ error: 'slug required' }, { status: 400 })

  try {
    // Use writeClient (useCdn: false) to avoid stale CDN cache reads
    const doc = await writeClient.fetch<{ likes: number; dislikes: number }>(
      `*[_type == "blog" && slug.current == $slug][0]{ likes, dislikes }`,
      { slug }
    )
    return NextResponse.json({ likes: doc?.likes ?? 0, dislikes: doc?.dislikes ?? 0 })
  } catch {
    return NextResponse.json({ likes: 0, dislikes: 0 })
  }
}
