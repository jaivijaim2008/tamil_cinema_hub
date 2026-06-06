import { NextRequest, NextResponse } from 'next/server'
import { client } from '@/sanity/client'
import { urlFor } from '@/sanity/lib/image'

// Sanity GROQ queries
const MOVIE_FIELDS = `_id, title, titleTanglish, "slug": slug.current, year, director, cast[]{name}, genre, rating, synopsis, ottPlatform, poster, posterUrl`

async function searchMovies(query: string) {
  return client.fetch(`*[_type == "movie" && (title match $q || titleTanglish match $q || director match $q || cast[].name match $q)] | order(year desc)[0...5] { ${MOVIE_FIELDS} }`, { q: `*${query}*` })
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

  // ── Greetings ──
  if (/^(hi|hello|hey|namaste|vanakkam|sup|yo|howdy|good\s*(morning|evening|afternoon))\b/.test(lower)) {
    return { type: 'greeting', query: '' }
  }
  if (/(how are you|how('s| is) it going|what('s| is) up|enna status)/i.test(lower)) {
    return { type: 'howru', query: '' }
  }
  if (/\b(thanks?|thank you|nandri|thx)\b/i.test(lower)) {
    return { type: 'thanks', query: '' }
  }

  // ── Help / What can you do ──
  if (/\b(help|what can you|how to use|commands?|guide|options?)\b/i.test(lower)) {
    return { type: 'help', query: '' }
  }

  // ── Mood-based recommendations ──
  const moodPatterns = [
    { mood: 'feel like watching something intense', genre: 'Thriller' },
    { mood: 'something funny', genre: 'Comedy' },
    { mood: 'romantic', genre: 'Romance' },
    { mood: 'scary', genre: 'Horror' },
    { mood: 'something emotional', genre: 'Drama' },
    { mood: 'action packed', genre: 'Action' },
    { mood: 'mind-bending', genre: 'Thriller' },
    { mood: 'family friendly', genre: 'Family' },
    { mood: 'something with good music', genre: 'Musical' },
  ]
  for (const { mood, genre } of moodPatterns) {
    if (lower.includes(mood)) return { type: 'mood', query: genre }
  }
  if (/\b(bored|boredom|recommend|suggestion|suggest|what should i watch|enna pakalam|enna patha)/i.test(lower)) {
    return { type: 'recommend', query: '' }
  }

  // ── Top / Best movies ──
  if (/\b(top|best|highest rated|greatest|masterpiece|classic|must.?watch|favourite|favorite)\b.*\b(movie|film|movies|films|kollywood|tamil)\b/i.test(lower) ||
      /\b(movie|film|kollywood|tamil)\b.*\b(top|best|highest rated|greatest)\b/i.test(lower)) {
    return { type: 'top_rated', query: '' }
  }

  // ── Upcoming / Recent ──
  if (/\b(recent|new|latest|upcoming|2024|2025|2026)\b.*\b(movie|film|movies|films)?\b/i.test(lower) ||
      /\b(movie|film|kollywood)\b.*\b(recent|new|latest|2024|2025|2026)\b/i.test(lower)) {
    return { type: 'recent', query: '' }
  }

  // ── Comparison queries ("Vijay vs Ajith") ──
  const vsMatch = lower.match(/(.+?)\s+(?:vs\.?|versus|or)\s+(.+?)(?:\?|$)/i)
  if (vsMatch) {
    return { type: 'comparison', query: `${vsMatch[1].trim()}|${vsMatch[2].trim()}` }
  }

  // ── Genre ──
  const genreMatch = lower.match(/\b(action|romance|comedy|thriller|horror|drama|scifi|sci-fi|fantasy|family|crime|mystery|adventure|animation|musical|war|political|period)\b/)
  if (genreMatch) {
    const genreMap: Record<string, string> = { scifi: 'Sci-Fi', 'sci-fi': 'Sci-Fi', action: 'Action', romance: 'Romance', comedy: 'Comedy', thriller: 'Thriller', horror: 'Horror', drama: 'Drama', fantasy: 'Fantasy', family: 'Family', crime: 'Crime', mystery: 'Mystery', adventure: 'Adventure', animation: 'Animation', musical: 'Musical', war: 'War', political: 'Political', period: 'Period' }
    return { type: 'genre', query: genreMap[genreMatch[1]] || genreMatch[1] }
  }

  // ── Year ──
  const yearMatch = lower.match(/\b(19|20)\d{2}\b/)
  if (yearMatch) {
    return { type: 'year', query: yearMatch[0] }
  }

  // ── Director ──
  const directorPatterns = [/(?:movies?|films?)\s+(?:by|from|of|directed by)\s+(.+)/i, /(?:directed by|director)\s+(.+)/i, /(.+?)\s+(?:directed|dir\.?)\s+(?:movies?|films?)/i]
  for (const pattern of directorPatterns) {
    const match = lower.match(pattern)
    if (match) return { type: 'director', query: match[1].trim() }
  }

  // ── Movie-specific patterns ("Tell me about Vikram") ──
  const moviePatterns = [/(?:about|tell me about|info on|details of|what is|what's|explain|describe)\s+(.+?)(?:\?|$)/i, /(?:movie|film|padam)\s+(.+?)(?:\?|$)/i]
  for (const pattern of moviePatterns) {
    const match = lower.match(pattern)
    if (match && match[1].trim().length > 1) return { type: 'search', query: match[1].trim() }
  }

  // ── Known actors (fuzzy — check if name appears anywhere in message) ──
  const knownActors = ['rajinikanth', 'rajini', 'kamal haasan', 'kamal', 'vijay', 'ajith', 'dhanush', 'suriya', 'vikram', 'simbu', 'karthi', 'nayanthara', 'samantha', 'trisha', 'anushka', 'keerthy suresh', 'prabhas', 'allu arjun', 'lokesh kanagaraj', 'mani ratnam', 'shankar', 's j suryah', 'sjsuriyah', 'mysskin', 'venkat prabhu', 'sundar c', 'arjun sarja', 'prakash raj', 'sj suryah', 'arvind swami', 'fahadh faasil', 'navin', 'parthiban', 'kathir', 'soori', 'yogi babu']
  for (const actor of knownActors) {
    if (lower.includes(actor)) return { type: 'actor', query: actor }
  }
  const actorPatterns = [/(?:movies?|films?)\s+(?:of|starring|with|featuring)\s+(.+)/i, /(.+?)\s+(?:movies?|films?|padangal|padam)/i]
  for (const pattern of actorPatterns) {
    const match = lower.match(pattern)
    if (match) return { type: 'actor', query: match[1].trim() }
  }

  // ── OTT / Streaming platform ──
  const ottMatch = lower.match(/\b(netflix|amazon|prime|hotstar|disney|zee5|sonyliv|aha|jio|apple tv|youtube)\b/)
  if (ottMatch) {
    return { type: 'ott', query: ottMatch[1] }
  }

  // ── Fallback: search the database ──
  if (lower.length > 2) return { type: 'search', query: lower }
  return { type: 'unknown', query: '' }
}

// Response formatters
function getPosterUrl(movie: any): string | null {
  if (movie.poster) {
    try { return urlFor(movie.poster).width(100).height(150).quality(75).fit('max').url() } catch { /* fallthrough */ }
  }
  if (movie.posterUrl && typeof movie.posterUrl === 'string') return movie.posterUrl
  return null
}

function formatMovieList(movies: any[], title: string): string {
  if (!movies || movies.length === 0) return "I couldn't find any movies for that. Try asking about a specific genre, actor, director, or year!"
  let response = `🎬 ${title}\n\n`
  movies.forEach((m, i) => {
    const cast = m.cast?.map((c: any) => c.name).filter(Boolean).join(', ') || 'N/A'
    const genres = m.genre?.join(', ') || 'N/A'
    const rating = m.rating ? ` ⭐ ${m.rating}/10` : ''
    const ott = m.ottPlatform ? ` | 📺 ${m.ottPlatform}` : ''
    const posterUrl = getPosterUrl(m)
    const posterTag = posterUrl ? `[poster:${posterUrl}]` : ''
    response += `${posterTag}${i + 1}. [${m.title}](/movies/${m.slug}) (${m.year})\n   Director: ${m.director || 'N/A'} | Cast: ${cast}\n   Genre: ${genres}${rating}${ott}\n`
    if (m.synopsis) response += `   ${m.synopsis.slice(0, 120)}${m.synopsis.length > 120 ? '...' : ''}\n`
    response += '\n'
  })
  return response.trim()
}

function formatMovieDetail(movie: any): string {
  const cast = movie.cast?.map((c: any) => c.name).filter(Boolean).join(', ') || 'N/A'
  const genres = movie.genre?.join(', ') || 'N/A'
  const posterUrl = getPosterUrl(movie)
  const posterTag = posterUrl ? `[poster:${posterUrl}]` : ''
  let r = `${posterTag}🎬 [${movie.title}](/movies/${movie.slug}) (${movie.year})\n\nDirector: ${movie.director || 'N/A'}\nCast: ${cast}\nGenre: ${genres}\n`
  if (movie.rating) r += `Rating: ⭐ ${movie.rating}/10\n`
  if (movie.ottPlatform) r += `OTT: 📺 ${movie.ottPlatform}\n`
  if (movie.synopsis) r += `\nSynopsis: ${movie.synopsis}\n`
  r += `\n[View full details →](/movies/${movie.slug})`
  return r
}

async function generateResponse(intent: Intent): Promise<string> {
  switch (intent.type) {
    case 'greeting':
      return `🎬 Vanakkam! Welcome to TamilCinemaHub AI!\n\nI'm your Tamil cinema expert with access to 1,600+ movies from 2000–2026. I can help you with:\n\n• 🎭 Movie recommendations by genre, mood, or actor\n• 🎬 Filmographies of any Tamil actor or director\n• 🏆 Best-rated movies and hidden gems\n• 📅 Movies from a specific year\n• 🔄 Compare actors (e.g. \"Vijay vs Ajith\")\n• 📺 OTT platform availability\n\nWhat would you like to explore?`
    case 'howru':
      return `😊 I'm doing great — powered by caffeine and Kollywood! Ready to talk about Tamil cinema. What movies are you interested in?`
    case 'thanks':
      return `🙏 You're welcome! I'm always here when you need Tamil movie recommendations or info. Just ask away!`
    case 'help':
      return `📖 How to use TamilCinemaHub AI:\n\nHere are some things you can try:\n\n🔹 \"Best action movies\" — find top-rated films by genre\n🔹 \"Vijay movies\" — full filmography of any actor\n🔹 \"Movies by Lokesh Kanagaraj\" — director filmographies\n🔹 \"Best movies of 2024\" — year-specific picks\n🔹 \"Recommend something funny\" — mood-based picks\n🔹 \"Tell me about Ponniyin Selvan\" — detailed movie info\n🔹 \"Vijay vs Ajith\" — compare two actors\n🔹 \"Netflix movies\" — OTT-specific listings\n\nI search our database of 1,600+ Tamil movies in real-time. What sounds good?`
    case 'top_rated': {
      const m = await getTopRated()
      return formatMovieList(m, '🏆 Top Rated Tamil Movies\n\nThese are the highest-rated films in our database — the cream of Kollywood!')
    }
    case 'recent': {
      const m = await getRecentMovies()
      return formatMovieList(m, '🆕 Latest Tamil Movies\n\nFresh from the Kollywood pipeline:')
    }
    case 'genre': {
      const m = await getMoviesByGenre(intent.query)
      if (m.length === 0) return `I couldn't find any ${intent.query} movies in our database. Try a different genre like Action, Comedy, Thriller, Drama, or Romance!`
      return formatMovieList(m, `🎭 Best ${intent.query} Movies\n\nHere are some great ${intent.query.toLowerCase()} films from Tamil cinema:`)
    }
    case 'year': {
      const m = await getMoviesByYear(parseInt(intent.query))
      if (m.length === 0) return `I couldn't find movies from ${intent.query} in our database. Our collection covers 2000–2026 — try a different year!`
      return formatMovieList(m, `📅 Movies from ${intent.query}\n\nFilms released in ${intent.query}:`)
    }
    case 'mood': {
      const m = await getMoviesByGenre(intent.query)
      if (m.length > 0) return formatMovieList(m, `✨ Perfect for your mood — ${intent.query} Movies\n\nHere are some ${intent.query.toLowerCase()} Tamil films I think you'll enjoy:`)
      const fallback = await getTopRated()
      return formatMovieList(fallback, `✨ Here are some top-rated picks to match your mood:`)
    }
    case 'recommend': {
      const m = await getTopRated()
      return formatMovieList(m, `✨ My Top Picks for You\n\nHere are some highly-rated Tamil films — perfect if you're looking for something great to watch:`)
    }
    case 'comparison': {
      const [name1, name2] = intent.query.split('|')
      const m1 = await searchMovies(name1)
      const m2 = await searchMovies(name2)
      if (m1.length === 0 && m2.length === 0) return `I couldn't find movies for either \"${name1}\" or \"${name2}\". Try checking the names!`
      let response = `🔄 ${name1} vs ${name2}\n\n`
      if (m1.length > 0) {
        response += `── ${name1.charAt(0).toUpperCase() + name1.slice(1)} ──\n`
        m1.slice(0, 3).forEach((m: any) => {
          const cast = m.cast?.map((c: any) => c.name).filter(Boolean).join(', ') || 'N/A'
          response += `• ${m.title} (${m.year}) — ⭐ ${m.rating || 'N/A'}/10\n  ${m.director ? `Dir: ${m.director}` : ''} ${m.genre?.length ? `| ${m.genre.join(', ')}` : ''}\n`
        })
        response += '\n'
      }
      if (m2.length > 0) {
        response += `── ${name2.charAt(0).toUpperCase() + name2.slice(1)} ──\n`
        m2.slice(0, 3).forEach((m: any) => {
          response += `• ${m.title} (${m.year}) — ⭐ ${m.rating || 'N/A'}/10\n  ${m.director ? `Dir: ${m.director}` : ''} ${m.genre?.length ? `| ${m.genre.join(', ')}` : ''}\n`
        })
      }
      response += `\nWant me to dive deeper into either one's filmography?`
      return response.trim()
    }
    case 'director': {
      const m = await getMoviesByDirector(intent.query)
      if (m.length > 0) return formatMovieList(m, `🎬 Movies by ${intent.query}\n\nHere's the filmography I found:`)
      const s = await searchMovies(intent.query)
      if (s.length > 0) return formatMovieList(s, `🔍 Results for \"${intent.query}\"`)
      return `I couldn't find any movies by \"${intent.query}\". Try checking the spelling, or ask about a specific movie name!`
    }
    case 'actor': {
      const m = await getMoviesByActor(intent.query)
      if (m.length > 0) return formatMovieList(m, `🎭 Movies featuring ${intent.query}\n\nHere's what I found in our database:`)
      const s = await searchMovies(intent.query)
      if (s.length > 0) return formatMovieList(s, `🔍 Results for \"${intent.query}\"`)
      return `I couldn't find movies featuring \"${intent.query}\". Try checking the spelling — you can search for actors like Vijay, Ajith, Dhanush, Suriya, or Vikram!`
    }
    case 'ott': {
      const platform = intent.query.charAt(0).toUpperCase() + intent.query.slice(1)
      const m = await client.fetch(`*[_type == "movie" && ottPlatform match $p] | order(year desc)[0...5] { ${MOVIE_FIELDS} }`, { p: `*${intent.query}*` })
      if (m.length > 0) return formatMovieList(m, `📺 Tamil Movies on ${platform}\n\nHere's what's streaming:`)
      return `I couldn't find specific ${platform} listings in our database. Try asking about a genre or actor instead!`
    }
    case 'search': {
      const m = await searchMovies(intent.query)
      if (m.length === 1) return formatMovieDetail(m[0])
      if (m.length > 0) return formatMovieList(m, `🔍 Results for \"${intent.query}\"`)
      return `I couldn't find any movies matching \"${intent.query}\". Try a movie name, actor, director, or genre!\n\nSome popular searches:\n• \"Vijay movies\"\n• \"Best 2024 movies\"\n• \"Action films\"\n• \"Movies by Mani Ratnam\"`
    }
    default:
      return `I'm not quite sure what you're asking about. Here are some things I can help with:\n\n• \"best action movies\" — genre picks\n• \"Vijay movies\" — actor filmographies\n• \"movies by Mani Ratnam\" — director picks\n• \"movies from 2024\" — year-specific\n• \"Tell me about Vikram\" — movie details\n• \"Vijay vs Ajith\" — compare actors\n• \"recommend something funny\" — mood picks\n\nWhat interests you?`
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
