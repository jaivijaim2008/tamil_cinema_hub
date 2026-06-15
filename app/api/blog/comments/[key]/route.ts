import { NextRequest, NextResponse } from 'next/server'
import { client } from '@/sanity/client'
import { writeClient } from '@/sanity/writeClient'
import { escapeHtml, isValidSlug, getIP } from '@/lib/sanitize'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  const { key } = await params

  // Validate comment key format (alphanumeric, reasonable length)
  if (!key || typeof key !== 'string' || key.length > 50 || /[^a-zA-Z0-9]/.test(key)) {
    return NextResponse.json({ error: 'Invalid comment key.' }, { status: 400 })
  }

  let body: Record<string, unknown>
  try { body = await req.json() as Record<string, unknown> } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // Validate body structure
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const { slug, content } = body as { slug?: string; content?: string }
  if (!slug || !content?.trim()) {
    return NextResponse.json({ error: 'slug and content required' }, { status: 400 })
  }

  if (typeof slug !== 'string' || typeof content !== 'string') {
    return NextResponse.json({ error: 'Invalid field types.' }, { status: 400 })
  }

  if (!isValidSlug(slug)) {
    return NextResponse.json({ error: 'Invalid slug format.' }, { status: 400 })
  }

  const cleanContent = escapeHtml(content.trim().slice(0, 1000))

  // Rate limit: 1 edit per IP per 10 seconds
  const ip = getIP(req)
  const now = Date.now()
  if (!(globalThis as Record<string, unknown>).__commentEditRL) (globalThis as Record<string, unknown>).__commentEditRL = new Map<string, number>()
  const rl: Map<string, number> = (globalThis as Record<string, unknown>).__commentEditRL as Map<string, number>
  const last = rl.get(ip)
  if (last && now - last < 10_000) {
    return NextResponse.json({ error: 'Please wait before editing again.' }, { status: 429 })
  }
  rl.set(ip, now)

  try {
    const docId = await client.fetch<string | null>(
      `*[_type == "blog" && slug.current == $slug][0]._id`,
      { slug }
    )
    if (!docId) return NextResponse.json({ error: 'Blog not found' }, { status: 404 })

    // Find the comment by _key and verify IP ownership
    type CommentEntry = { _key: string; authorIp?: string; content?: string; edited?: boolean; [k: string]: unknown }
    const doc = await client.fetch<{ comments?: CommentEntry[] }>(
      `*[_type == "blog" && _id == $id][0]{ comments }`,
      { id: docId }
    )
    const comment = doc?.comments?.find((c) => c._key === key)
    if (!comment) return NextResponse.json({ error: 'Comment not found' }, { status: 404 })

    // Ownership check: only allow editing if the comment was made from the same IP
    if (comment.authorIp && comment.authorIp !== ip) {
      return NextResponse.json({ error: 'You can only edit your own comments.' }, { status: 403 })
    }

    await writeClient
      .patch(docId)
      .set({
        [`comments[_key == "${key}"].content`]: cleanContent,
        [`comments[_key == "${key}"].edited`]: true,
      })
      .commit()

    return NextResponse.json({
      ok: true,
      comment: { ...comment, content: cleanContent, edited: true },
    })
  } catch (err: unknown) {
    console.error('[Comments PATCH]', err instanceof Error ? err.message : err)
    return NextResponse.json({ error: 'Failed to edit comment' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  const { key } = await params

  // Validate comment key format
  if (!key || typeof key !== 'string' || key.length > 50 || /[^a-zA-Z0-9]/.test(key)) {
    return NextResponse.json({ error: 'Invalid comment key.' }, { status: 400 })
  }

  const url = new URL(req.url)
  const slug = url.searchParams.get('slug')
  if (!slug || typeof slug !== 'string') {
    return NextResponse.json({ error: 'slug required' }, { status: 400 })
  }

  if (!isValidSlug(slug)) {
    return NextResponse.json({ error: 'Invalid slug format.' }, { status: 400 })
  }

  // Rate limit: 1 delete per IP per 10 seconds
  const ip = getIP(req)
  const now = Date.now()
  if (!(globalThis as Record<string, unknown>).__commentDelRL) (globalThis as Record<string, unknown>).__commentDelRL = new Map<string, number>()
  const rl: Map<string, number> = (globalThis as Record<string, unknown>).__commentDelRL as Map<string, number>
  const last = rl.get(ip)
  if (last && now - last < 10_000) {
    return NextResponse.json({ error: 'Please wait before deleting again.' }, { status: 429 })
  }
  rl.set(ip, now)

  try {
    const docId = await client.fetch<string | null>(
      `*[_type == "blog" && slug.current == $slug][0]._id`,
      { slug }
    )
    if (!docId) return NextResponse.json({ error: 'Blog not found' }, { status: 404 })

    // Also delete any replies to this comment (children with parentId matching this key)
    type CommentEntry2 = { _key: string; authorIp?: string; parentId?: string; [k: string]: unknown }
    const doc = await client.fetch<{ comments?: CommentEntry2[] }>(
      `*[_type == "blog" && _id == $id][0]{ comments }`,
      { id: docId }
    )
    const targetComment = doc?.comments?.find((c) => c._key === key)

    // Ownership check: only allow deleting if the comment was made from the same IP
    if (targetComment?.authorIp && targetComment.authorIp !== ip) {
      return NextResponse.json({ error: 'You can only delete your own comments.' }, { status: 403 })
    }

    const replyKeys = (doc?.comments ?? [])
      .filter((c) => c.parentId === key)
      .map((c) => c._key)

    // Remove the comment and its replies
    const keysToRemove = [key, ...replyKeys]
    await writeClient
      .patch(docId)
      .unset(keysToRemove.map(k => `comments[_key == "${k}"]`))
      .commit()

    return NextResponse.json({ ok: true, deletedKeys: keysToRemove })
  } catch (err: unknown) {
    console.error('[Comments DELETE]', err instanceof Error ? err.message : err)
    return NextResponse.json({ error: 'Failed to delete comment' }, { status: 500 })
  }
}
