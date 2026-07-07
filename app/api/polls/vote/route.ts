import { NextRequest, NextResponse } from 'next/server'

// In-memory vote storage (resets on cold start)
// For production, use a database like Vercel KV or Redis
const votes = new Map<string, Map<string, number>>()

// Rate limiting: 1 vote per IP per 30 seconds per poll
const rateLimit = new Map<string, number>()

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { pollId, optionIndex, sessionId } = body

    if (!pollId || optionIndex === undefined) {
      return NextResponse.json({ error: 'pollId and optionIndex required' }, { status: 400 })
    }

    if (typeof optionIndex !== 'number' || optionIndex < 0) {
      return NextResponse.json({ error: 'Invalid optionIndex' }, { status: 400 })
    }

    // Rate limit check
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'
    const rateKey = `${ip}:${pollId}`
    const now = Date.now()
    const lastVote = rateLimit.get(rateKey)
    
    if (lastVote && now - lastVote < 30_000) {
      return NextResponse.json({ error: 'Please wait before voting again' }, { status: 429 })
    }
    
    rateLimit.set(rateKey, now)

    // Store vote
    if (!votes.has(pollId)) {
      votes.set(pollId, new Map())
    }
    
    const pollVotes = votes.get(pollId)!
    const currentCount = pollVotes.get(String(optionIndex)) || 0
    pollVotes.set(String(optionIndex), currentCount + 1)

    // Get total votes for this poll
    let totalVotes = 0
    const optionVotes: Record<number, number> = {}
    
    for (const [key, count] of pollVotes) {
      const idx = parseInt(key)
      optionVotes[idx] = count
      totalVotes += count
    }

    return NextResponse.json({
      ok: true,
      pollId,
      optionIndex,
      optionVotes,
      totalVotes,
    })
  } catch (error) {
    console.error('Poll vote error:', error)
    return NextResponse.json({ error: 'Failed to record vote' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const pollId = searchParams.get('pollId')

  if (!pollId) {
    return NextResponse.json({ error: 'pollId required' }, { status: 400 })
  }

  const pollVotes = votes.get(pollId)
  if (!pollVotes) {
    return NextResponse.json({ pollId, optionVotes: {}, totalVotes: 0 })
  }

  let totalVotes = 0
  const optionVotes: Record<number, number> = {}
  
  for (const [key, count] of pollVotes) {
    const idx = parseInt(key)
    optionVotes[idx] = count
    totalVotes += count
  }

  return NextResponse.json({ pollId, optionVotes, totalVotes })
}
