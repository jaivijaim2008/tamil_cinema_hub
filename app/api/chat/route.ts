import { NextRequest, NextResponse } from 'next/server'
import { client } from '@/sanity/client'

// Sanity GROQ queries
const MOVIE_FIELDS = `_id, title, titleTanglish, "slug": slug.current, year, director, cast[]->{name}, genre, rating, synopsis, ottPlatform`

async function searchMovies(query: string) {
  return client.fetch(`*[_type == "movie" && (title match $q || titleTanglish match $q || director match $q || $q in cast[].name)] | order(year desc)[0...5] { ${MOVIE_FIELDS} }`, { q: `*${query}*` })
}

async function getMoviesByGenre(genre: string) {
  return client.fetch(`*[_type == "movie" && $genre in genre] | order(year desc)[0...5] { ${MOVIE_FIELDS} }`, { genre })
}

async function getMoviesByYear(year: number) {
  return client.fetch(`*[_type == "movie" && year == $year] | order(rating desc)[0...5] { ${MOVIE_FIELDS} }`, { year })
}

async function getTopRated() {
  return client.fetch(`*[_type == "movie" && rating != null] | order(rating desc)[0...5] { ${MOVIE_FIELDS} }`)
}

async function getRecentMovies() {
  return client.fetch(`*[_type == "movie"] | order(year desc)[0...5] { ${MOVIE_FIELDS} }`)
}

async function getMoviesByDirector(director: string) {
  return client.fetch(`*[_type == "movie" && director match $d] | order(year desc)[0...5] { ${MOVIE_FIELDS} }`, { d: `*${director}*` })
}

async function getMoviesByActor(actor: string) {
  return client.fetch(`*[_type == "movie" && cast[].name match $a] | order(year desc)[0...5] { ${MOVIE_FIELDS} }`, { a: `*${actor}*` })
}

// Intent detection
type Intent = { type: string; query: string }

function detectIntent(message: string): Intent {
  const lower = message.toLowerCase().trim()

  if (/^(hi|hello|hey|namaste|vanakkam|sup|yo|howdy|good\s*(morning|evening|afternoon))\b/.test(lower)) {
    return { type: 'greeting', query: '' }
  }
  if (/(how are you|how('s| is) it going|what('s| is) up|enna status)/i.test(lower)) {
    return { type: 'howru', query: '' }
  }
  if (/\b(thanks?|thank you|nandri|thx)\b/i.test(lower)) {
    return { type: 'thanks', query: '' }
  }
  if (/\b(top|best|highest rated|greatest|masterpiece|classic)\b.*\b(movie|film|movies|films|kollywood|tamil)\b/i.test(lower) ||
      /\b(movie|film|kollywood)\b.*\b(top|best|highest rated|greatest)\b/i.test(lower)) {
    return { type: 'top_rated', query: '' }
  }
  if (/\b(recent|new|latest|upcoming|2024|2025|2026)\b.*\b(movie|film|movies|films)?\b/i.test(lower) ||
      /\b(movie|film|kollywood)\b.*\b(recent|new|latest|2024|2025|2026)\b/i.test(lower)) {
    return { type: 'recent', query: '' }
  }

  const genreMatch = lower.match(/\b(action|romance|comedy|thriller|horror|drama|scifi|sci-fi|fantasy|family|crime|mystery|adventure|animation|musical|war|political|period)\b/)
  if (genreMatch) {
    const genreMap: Record<string, string> = { scifi: 'Sci-Fi', 'sci-fi': 'Sci-Fi', action: 'Action', romance: 'Romance', comedy: 'Comedy', thriller: 'Thriller', horror: 'Horror', drama: 'Drama', fantasy: 'Fantasy', family: 'Family', crime: 'Crime', mystery: 'Mystery', adventure: 'Adventure', animation: 'Animation', musical: 'Musical', war: 'War', political: 'Political', period: 'Period' }
    return { type: 'genre', query: genreMap[genreMatch[1]] || genreMatch[1] }
  }

  const yearMatch = lower.match(/\b(19|20)\d{2}\b/)
  if (yearMatch) {
    return { type: 'year', query: yearMatch[0] }
  }

  const directorPatterns = [/(?:movies?|films?)\s+(?:by|from|of|directed by)\s+(.+)/i, /(?:directed by|director)\s+(.+)/i, /(.+?)\s+(?:directed|dir\.?)\s+(?:movies?|films?)/i]
  for (const pattern of directorPatterns) {
    const match = lower.match(pattern)
    if (match) return { type: 'director', query: match[1].trim() }
  }

  const knownActors = ['rajinikanth', 'rajini', 'kamal haasan', 'kamal', 'vijay', 'ajith', 'dhanush', 'suriya', 'vikram', 'simbu', 'karthi', 'nayanthara', 'samantha', 'trisha', 'anushka', 'keerthy suresh', 'prabhas', 'allu arjun', 'lokesh kanagaraj', 'mani ratnam', 'shankar']
  for (const actor of knownActors) {
    if (lower.includes(actor)) return { type: 'actor', query: actor }
  }
  const actorPatterns = [/(?:movies?|films?)\s+(?:of|starring|with|featuring)\s+(.+)/i, /(.+?)\s+(?:movies?|films?|padangal|padam)/i]
  for (const pattern of actorPatterns) {
    const match = lower.match(pattern)
    if (match) return { type: 'actor', query: match[1].trim() }
  }

  const moviePatterns = [/(?:about|tell me about|info on|details of|what is|what's)\s+(.+?)(?:\?|$)/i, /(?:movie|film|padam)\s+(.+?)(?:\?|$)/i]
  for (const pattern of moviePatterns) {
    const match = lower.match(pattern)
    if (match && match[1].trim().length > 1) return { type: 'search', query: match[1].trim() }
  }

  if (lower.length > 2) return { type: 'search', query: lower }
  return { type: 'unknown', query: '' }
}

// Response formatters
function formatMovieList(movies: any[], title: string): string {
  if (!movies || movies.length === 0) return "I couldn't find any movies for that. Try asking about a specific genre, actor, director, or year!"
  let response = `🎬 ${title}\n\n`
  movies.forEach((m, i) => {
    const cast = m.cast?.map((c: any) => c.name).filter(Boolean).join(', ') || 'N/A'
    const genres = m.genre?.join(', ') || 'N/A'
    const rating = m.rating ? ` ⭐ ${m.rating}/5` : ''
    const ott = m.ottPlatform ? ` | 📺 ${m.ottPlatform}` : ''
    response += `${i + 1}. ${m.title} (${m.year})\n   Director: ${m.director || 'N/A'} | Cast: ${cast}\n   Genre: ${genres}${rating}${ott}\n`
    if (m.synopsis) response += `   ${m.synopsis.slice(0, 120)}${m.synopsis.length > 120 ? '...' : ''}\n`
    response += '\n'
  })
  return response.trim()
}

function formatMovieDetail(movie: any): string {
  const cast = movie.cast?.map((c: any) => c.name).filter(Boolean).join(', ') || 'N/A'
  const genres = movie.genre?.join(', ') || 'N/A'
  let r = `🎬 ${movie.title} (${movie.year})\n\nDirector: ${movie.director || 'N/A'}\nCast: ${cast}\nGenre: ${genres}\n`
  if (movie.rating) r += `Rating: ⭐ ${movie.rating}/5\n`
  if (movie.ottPlatform) r += `OTT: 📺 ${movie.ottPlatform}\n`
  if (movie.synopsis) r += `\nSynopsis: ${movie.synopsis}\n`
  r += `\nView full details: /movies/${movie.slug}`
  return r
}

async function generateResponse(intent: Intent): Promise<string> {
  switch (intent.type) {
    case 'greeting':
      return `🎬 Vanakkam! Welcome to TamilCinemaHub AI!\n\nI'm your Tamil cinema expert powered by our database of 1,600+ movies. Try asking:\n\n• "Recommend action movies"\n• "Movies by Lokesh Kanagaraj"\n• "Vijay movies"\n• "Best movies of 2024"\n• "Tell me about Ponniyin Selvan"\n\nWhat would you like to know?`
    case 'howru':
      return `😊 I'm doing great! Ready to talk about Tamil cinema with you. What movies are you interested in?`
    case 'thanks':
      return `🙏 You're welcome! Feel free to ask me anything about Tamil movies, actors, or directors.`
    case 'top_rated': {
      const m = await getTopRated()
      return formatMovieList(m, '🏆 Top Rated Tamil Movies')
    }
    case 'recent': {
      const m = await getRecentMovies()
      return formatMovieList(m, '🆕 Latest Tamil Movies')
    }
    case 'genre': {
      const m = await getMoviesByGenre(intent.query)
      return formatMovieList(m, `🎭 ${intent.query} Movies`)
    }
    case 'year': {
      const m = await getMoviesByYear(parseInt(intent.query))
      return formatMovieList(m, `📅 Movies from ${intent.query}`)
    }
    case 'director': {
      const m = await getMoviesByDirector(intent.query)
      if (m.length > 0) return formatMovieList(m, `🎬 Movies by ${intent.query}`)
      const s = await searchMovies(intent.query)
      if (s.length > 0) return formatMovieList(s, `🔍 Results for "${intent.query}"`)
      return `I couldn't find any movies by "${intent.query}". Try checking the spelling.`
    }
    case 'actor': {
      const m = await getMoviesByActor(intent.query)
      if (m.length > 0) return formatMovieList(m, `🎭 Movies featuring ${intent.query}`)
      const s = await searchMovies(intent.query)
      if (s.length > 0) return formatMovieList(s, `🔍 Results for "${intent.query}"`)
      return `I couldn't find movies featuring "${intent.query}". Try checking the spelling.`
    }
    case 'search': {
      const m = await searchMovies(intent.query)
      if (m.length === 1) return formatMovieDetail(m[0])
      if (m.length > 0) return formatMovieList(m, `🔍 Results for "${intent.query}"`)
      return `I couldn't find any movies matching "${intent.query}". Try a movie name, actor, director, or genre!`
    }
    default:
      return `I'm not sure what you're asking about. Try:\n\n• "best action movies"\n• "Vijay movies"\n• "movies by Mani Ratnam"\n• "movies from 2024"\n• "Tell me about Vikram"`
  }
}

// Rate limiter
const RATE_LIMIT_WINDOW_MS = 60_000
const RATE_LIMIT_MAX = 30
const rateLimitMap = new Map<string, { count: number; windowStart: number }>()

function getRateLimitKey(req: NextRequest): string {
  const xff = req.headers.get('x-forwarded-for')
  if (xff) return xff.split(',')[0].trim()
  return req.headers.get('x-real-ip') ?? 'unknown'
}

function checkRateLimit(key: string): { ok: boolean; retryAfter: number } {
  const now = Date.now()
  const entry = rateLimitMap.get(key)
  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.set(key, { count: 1, windowStart: now })
    return { ok: true, retryAfter: 0 }
  }
  entry.count++
  if (entry.count > RATE_LIMIT_MAX) {
    const retryAfter = Math.ceil((entry.windowStart + RATE_LIMIT_WINDOW_MS - now) / 1000)
    return { ok: false, retryAfter }
  }
  return { ok: true, retryAfter: 0 }
}

function log(level: 'info' | 'warn' | 'error', msg: string, data?: Record<string, any>) {
  const entry = { time: new Date().toISOString(), level, msg, ...data }
  if (level === 'error') console.error(JSON.stringify(entry))
  else if (level === 'warn') console.warn(JSON.stringify(entry))
  else console.log(JSON.stringify(entry))
}

export async function POST(req: NextRequest) {
  try {
    const ip = getRateLimitKey(req)
    const { ok, retryAfter } = checkRateLimit(ip)
    if (!ok) {
      return NextResponse.json(
        { error: `Rate limit exceeded. Try again in ${retryAfter} seconds.`, retryAfter },
        { status: 429, headers: { 'Retry-After': String(retryAfter) } }
      )
    }
    const { messages } = await req.json()
    const lastUserMsg = messages?.filter((m: any) => m.role === 'user').pop()?.content ?? ''
    log('info', 'Chat request', { ip, msg: lastUserMsg.slice(0, 80) })
    const intent = detectIntent(lastUserMsg)
    log('info', 'Intent detected', { type: intent.type, query: intent.query })
    const reply = await generateResponse(intent)
    return NextResponse.json({ reply, provider: 'TamilCinemaHub Local' })
  } catch (err: any) {
    log('error', 'Chat error', { error: err?.message, stack: err?.stack?.slice(0, 300) })
    return NextResponse.json(
      { reply: 'Sorry, something went wrong. Please try again!', provider: 'TamilCinemaHub Local' },
      { status: 200 }
    )
  }
}
