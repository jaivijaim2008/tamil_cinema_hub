import { NextResponse } from 'next/server'

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

    // Store interaction using append to a local file
    // In production, you'd use a database (Redis, Postgres, etc.)
    const fs = require('fs')
    const path = require('path')

    const dataDir = path.join(process.cwd(), 'data')
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true })
    }

    const interactionsFile = path.join(dataDir, 'interactions.jsonl')

    // Append the interaction as a JSONL line
    fs.appendFileSync(interactionsFile, JSON.stringify(interaction) + '\n')

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

    const fs = require('fs')
    const path = require('path')

    const interactionsFile = path.join(process.cwd(), 'data', 'interactions.jsonl')

    if (!fs.existsSync(interactionsFile)) {
      return NextResponse.json({ views: 0, clicks: 0, avgRating: 0, ratings: 0 })
    }

    const content = fs.readFileSync(interactionsFile, 'utf-8')
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
