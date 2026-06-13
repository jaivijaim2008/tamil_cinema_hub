import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB limit

/**
 * POST /api/interactions
 * Body: { type: 'view' | 'click' | 'rating', movieSlug: string, rating?: number }
 *
 * Tracks user interactions for collaborative filtering.
 * Uses anonymous session IDs stored in localStorage on the client.
 * Stores interactions in a JSON file on disk for ML training.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { type, movieSlug, rating, sessionId } = body

    if (!type || !movieSlug) {
      return NextResponse.json(
        { error: 'Missing required fields: type, movieSlug' },
        { status: 400 }
      )
    }

    if (!['view', 'click', 'rating'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid interaction type' },
        { status: 400 }
      )
    }

    const interaction = {
      type,
      movieSlug,
      rating: type === 'rating' ? (typeof rating === 'number' ? rating : null) : null,
      sessionId: sessionId || 'anonymous',
      timestamp: new Date().toISOString(),
    }

    const dataDir = path.join(process.cwd(), 'data')
    await fs.mkdir(dataDir, { recursive: true })
    const interactionsFile = path.join(dataDir, 'interactions.jsonl')

    // Check file size before appending (prevent unbounded growth)
    try {
      const stats = await fs.stat(interactionsFile)
      if (stats.size > MAX_FILE_SIZE) {
        // Keep only the last 50% of lines
        const content = await fs.readFile(interactionsFile, 'utf-8')
        const lines = content.trim().split('\n').filter(Boolean)
        const half = Math.floor(lines.length / 2)
        await fs.writeFile(interactionsFile, lines.slice(half).join('\n') + '\n')
      }
    } catch {
      // File doesn't exist yet, that's fine
    }

    await fs.appendFile(interactionsFile, JSON.stringify(interaction) + '\n')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Interaction tracking error:', error)
    return NextResponse.json(
      { error: 'Failed to record interaction' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/interactions
 * Returns interaction stats for a movie (view count, rating avg, etc.)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const movieSlug = searchParams.get('slug')

    if (!movieSlug) {
      return NextResponse.json({ error: 'Missing slug parameter' }, { status: 400 })
    }

    const interactionsFile = path.join(process.cwd(), 'data', 'interactions.jsonl')

    let content: string
    try {
      content = await fs.readFile(interactionsFile, 'utf-8')
    } catch {
      return NextResponse.json({ views: 0, clicks: 0, avgRating: 0, ratings: 0 })
    }

    const lines = content.trim().split('\n').filter(Boolean)

    let views = 0
    let clicks = 0
    let totalRating = 0
    let ratingCount = 0

    for (const line of lines) {
      try {
        const interaction = JSON.parse(line)
        if (interaction.movieSlug === movieSlug) {
          if (interaction.type === 'view') views++
          else if (interaction.type === 'click') clicks++
          else if (interaction.type === 'rating' && interaction.rating != null) {
            totalRating += interaction.rating
            ratingCount++
          }
        }
      } catch {
        // Skip malformed lines
      }
    }

    return NextResponse.json({
      views,
      clicks,
      ratings: ratingCount,
      avgRating: ratingCount > 0 ? Math.round((totalRating / ratingCount) * 10) / 10 : 0,
    })
  } catch (error) {
    console.error('Interaction stats error:', error)
    return NextResponse.json(
      { error: 'Failed to get interaction stats' },
      { status: 500 }
    )
  }
}
