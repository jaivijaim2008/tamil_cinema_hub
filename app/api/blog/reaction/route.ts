import { NextRequest, NextResponse } from 'next/server'
import { client } from '@/sanity/client'
import { writeClient } from '@/sanity/writeClient'

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>
  try { body = await req.json() as Record<string, unknown> } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { slug, type, prev, action } = body as { slug?: string; type?: string; prev?: string; action?: string }
  if (!slug || !type || !['like', 'dislike'].includes(type)) {
    return NextResponse.json({ error: 'slug and type (like|dislike) required' }, { status: 400 })
  }

  // Rate limit: 1 reaction per IP per 10 seconds (simple in-memory)
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'
  const key = `${ip}:${slug}:${type}`
  const now = Date.now()
  if (!(globalThis as Record<string, unknown>).__reactionRL) (globalThis as Record<string, unknown>).__reactionRL = new Map<string, number>()
  const rl: Map<string, number> = (globalThis as Record<string, unknown>).__reactionRL as Map<string, number>
  const last = rl.get(key)
  if (last && now - last < 10_000) {
    return NextResponse.json({ error: 'Too fast. Wait a moment.' }, { status: 429 })
  }
  rl.set(key, now)

  try {
    // Fetch document ID and current counts in one query
    const doc = await client.fetch<{ _id: string; likes: number | null; dislikes: number | null } | null>(
      `*[_type == "blog" && slug.current == $slug][0]{ _id, likes, dislikes }`,
      { slug }
    )
    if (!doc?._id) return NextResponse.json({ error: 'Blog not found' }, { status: 404 })

    const currentLikes = doc.likes ?? 0
    const currentDislikes = doc.dislikes ?? 0

    let newLikes = currentLikes
    let newDislikes = currentDislikes

    if (action === 'remove') {
      // Toggle off: decrement the current vote type
      if (type === 'like') newLikes = Math.max(0, currentLikes - 1)
      if (type === 'dislike') newDislikes = Math.max(0, currentDislikes - 1)
    } else {
      // If switching from one vote to another, decrement the old one
      if (prev && prev !== type) {
        if (prev === 'like') newLikes = Math.max(0, currentLikes - 1)
        if (prev === 'dislike') newDislikes = Math.max(0, currentDislikes - 1)
      }

      // Increment the new vote
      if (type === 'like') newLikes += 1
      if (type === 'dislike') newDislikes += 1
    }

    const result = await writeClient
      .patch(doc._id)
      .set({ likes: newLikes, dislikes: newDislikes })
      .commit({ returnDocuments: true })

    return NextResponse.json({
      ok: true,
      likes: result.likes ?? 0,
      dislikes: result.dislikes ?? 0,
    })
  } catch (err: unknown) {
    console.error('[Reaction API]', err instanceof Error ? err.message : err)
    return NextResponse.json({ error: 'Failed to update reaction' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get('slug')
  if (!slug) return NextResponse.json({ error: 'slug required' }, { status: 400 })

  try {
    const doc = await writeClient.fetch<{ likes: number; dislikes: number }>(
      `*[_type == "blog" && slug.current == $slug][0]{ likes, dislikes }`,
      { slug }
    )
    return NextResponse.json({ likes: doc?.likes ?? 0, dislikes: doc?.dislikes ?? 0 })
  } catch {
    return NextResponse.json({ likes: 0, dislikes: 0 })
  }
}
