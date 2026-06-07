import { NextRequest, NextResponse } from 'next/server'
import { client } from '@/sanity/client'
import { urlFor } from '@/sanity/lib/image'

// ─────────────────────────────────────────────────────────────
// WIKIPEDIA SEARCH
// ─────────────────────────────────────────────────────────────

async function searchWikipedia(query: string) {
  try {
    const searchRes = await fetch(
      `https://en.wikipedia.org/w/api.php?` +
      new URLSearchParams({
        action: 'query', list: 'search', srsearch: query,
        srlimit: '3', format: 'json', origin: '*',
      }),
      { headers: { 'User-Agent': 'TamilCinemaHub/1.0' }, signal: AbortSignal.timeout(5000) }
    )
    const searchData = await searchRes.json()
    const results = searchData?.query?.search
    if (!results?.length) return null

    const best = results.find((r: any) =>
      /tamil|kollywood|india|film|cinema|actor|director|movie/i.test(r.snippet)
    ) ?? results[0]

    const extractRes = await fetch(
      `https://en.wikipedia.org/w/api.php?` +
      new URLSearchParams({
        action: 'query', prop: 'extracts', exintro: 'true',
        explaintext: 'true', exsentences: '5', titles: best.title,
        format: 'json', origin: '*',
      }),
      { headers: { 'User-Agent': 'TamilCinemaHub/1.0' }, signal: AbortSignal.timeout(5000) }
    )
    const extractData = await extractRes.json()
    const page = Object.values(extractData?.query?.pages ?? {})[0] as any
    if (!page || page.missing || !page.extract || page.extract.length < 50) return null

    return {
      title:   page.title,
      extract: page.extract.replace(/\n{2,}/g, '\n').trim().slice(0, 700),
      url:     `https://en.wikipedia.org/wiki/${encodeURIComponent(page.title)}`,
    }
  } catch { return null }
}

// ─────────────────────────────────────────────────────────────
// DUCKDUCKGO SEARCH
// ─────────────────────────────────────────────────────────────

async function searchDuckDuckGo(query: string) {
  try {
    const res = await fetch(
      `https://api.duckduckgo.com/?` +
      new URLSearchParams({ q: query, format: 'json', no_html: '1', skip_disambig: '1', no_redirect: '1' }),
      { headers: { 'User-Agent': 'TamilCinemaHub/1.0' }, signal: AbortSignal.timeout(5000) }
    )
    const data = await res.json()
    const answer = [data.Answer, data.AbstractText, data.Definition, data.RelatedTopics?.[0]?.Text]
      .find((c): c is string => typeof c === 'string' && c.trim().length > 30)
    if (!answer) return null
    return { answer: answer.trim().slice(0, 500), url: data.AbstractURL || '' }
  } catch { return null }
}

// ─────────────────────────────────────────────────────────────
// WEB FALLBACK (Wikipedia + DuckDuckGo)
// ─────────────────────────────────────────────────────────────

async function searchFallback(message: string): Promise<{ reply: string; suggestions: string[] }> {
  let query = message
    .replace(/^(tell me about|what is|who is|explain|describe|info on)\s+/i, '')
    .replace(/\?+$/, '').trim()

  if (!/tamil|kollywood/i.test(query) &&
      /actor|actress|director|movie|film|music|song|award/i.test(query)) {
    query += ' Tamil cinema'
  }

  const [wiki, ddg] = await Promise.all([searchWikipedia(query), searchDuckDuckGo(query)])
  const suggestions = ['Best action movies', 'Top rated films', 'Vijay movies']

  if (wiki && ddg) {
    return {
      reply: `🌐 Here is what I found:\n\n📖 **${wiki.title}**\n${wiki.extract}\n\n🔍 ${ddg.answer}\n\n[Read more on Wikipedia →](${wiki.url})`,
      suggestions,
    }
  }
  if (wiki) {
    return {
      reply: `🌐 Found this on Wikipedia:\n\n📖 **${wiki.title}**\n${wiki.extract}\n\n[Read more →](${wiki.url})`,
      suggestions,
    }
  }
  if (ddg) {
    return {
      reply: `🔍 Here is a quick answer:\n\n${ddg.answer}${ddg.url ? `\n\n[Source →](${ddg.url})` : ''}`,
      suggestions,
    }
  }

  return {
    reply: `I could not find anything about that. Try asking about:\n• A specific actor or director\n• A genre (action, thriller, comedy)\n• A year or streaming platform`,
    suggestions,
  }
}

// ═══════════════════════════════════════════════════════════════
// KNOWLEDGE BASE
// ═══════════════════════════════════════════════════════════════

// FIX: Map of canonical actor names → exact Sanity cast name
// This prevents "vijay" wildcard matching "Vijay Raghavendra", "Arun Vijay", etc.
const ACTOR_CANONICAL: Record<string, string> = {
  'vijay':           'Vijay',
  'thalapathy':      'Vijay',
  'ilayathalapathy': 'Vijay',
  'rajinikanth':     'Rajinikanth',
  'rajini':          'Rajinikanth',
  'superstar':       'Rajinikanth',
  'thalaivar':       'Rajinikanth',
  'kamal haasan':    'Kamal Haasan',
  'kamal':           'Kamal Haasan',
  'ulaganayagan':    'Kamal Haasan',
  'ajith':           'Ajith Kumar',
  'thala':           'Ajith Kumar',
  'ajith kumar':     'Ajith Kumar',
  'dhanush':         'Dhanush',
  'vikram':          'Vikram',
  'suriya':          'Suriya',
  'simbu':           'Simbu',
  'silambarasan':    'Simbu',
  'vijay sethupathi':'Vijay Sethupathi',
  'karthi':          'Karthi',
  'vishal':          'Vishal',
  'arya':            'Arya',
  'jiiva':           'Jiiva',
  'prashanth':       'Prashanth',
  'nayanthara':      'Nayanthara',
  'samantha':        'Samantha',
  'trisha':          'Trisha',
  'anushka shetty':  'Anushka Shetty',
  'keerthy suresh':  'Keerthy Suresh',
  'rashmika':        'Rashmika Mandanna',
  'pooja hegde':     'Pooja Hegde',
  'sai pallavi':     'Sai Pallavi',
  'prakash raj':     'Prakash Raj',
  'vadivelu':        'Vadivelu',
  'vivek':           'Vivek',
  'soori':           'Soori',
  'yogi babu':       'Yogi Babu',
  'arvind swami':    'Arvind Swami',
  'fahadh faasil':   'Fahadh Faasil',
  'madhavan':        'Madhavan',
  'sj suryah':       'SJ Suryah',
  'parthiban':       'Parthiban',
  'kathir':          'Kathir',
  'atharva':         'Atharva',
  'gautham karthik': 'Gautham Karthik',
  'bobby simha':     'Bobby Simha',
  'kishore':         'Kishore',
  'arun vijay':      'Arun Vijay',
  'navin':           'Navin',
  'nakul':           'Nakul',
  'jai':             'Jai',
  'santhanam':       'Santhanam',
}

const ACTORS = Object.keys(ACTOR_CANONICAL)

const DIRECTORS = [
  'mani ratnam', 'shankar', 'lokesh kanagaraj', 'selvaraghavan',
  'pa ranjith', 'vetrimaaran', 'atlee', 'ar murugadoss',
  'lingusamy', 'sundar c', 'venkat prabhu', 'karthik subbaraj',
  'vijay milton', 'bala', 'suseenthiran', 'pandiraj',
  'gautham vasudev menon', 'gautham menon',
  'mysskin', 'thiagarajan kumararaja',
  'nalan kumarasamy', 'prem',
  'vignesh shivan', 'nelson dilipkumar', 'nelson',
  'muthaiya', 'r s durai senthilkumar',
]

const GENRES: Record<string, string[]> = {
  'Action':    ['action', 'fight', 'mass', 'stunt', 'battle', 'combat', 'blast'],
  'Comedy':    ['comedy', 'funny', 'laugh', 'humor', 'comic', 'hilarious', 'fun'],
  'Romance':   ['romance', 'romantic', 'love', 'love story', 'crush', 'couple'],
  'Thriller':  ['thriller', 'suspense', 'twist', 'mind-bending', 'mystery', 'psychological', 'dark', 'tense'],
  'Horror':    ['horror', 'scary', 'ghost', 'haunted', 'fear', 'terror', 'supernatural'],
  'Drama':     ['drama', 'emotional', 'feeling', 'tear', 'cry', 'family', 'social', 'realistic'],
  'Sci-Fi':    ['sci-fi', 'scifi', 'science fiction', 'space', 'future', 'robot', 'time travel'],
  'Fantasy':   ['fantasy', 'myth', 'magic', 'magical', 'epic', 'legend', 'kingdom'],
  'Crime':     ['crime', 'gangster', 'mafia', 'police', 'detective', 'investigation', 'murder', 'heist'],
  'Adventure': ['adventure', 'journey', 'quest', 'explore', 'road trip'],
  'Family':    ['family', 'kids', 'children', 'family friendly', 'father', 'mother'],
  'Period':    ['period', 'historical', 'history', 'ancient', 'kingdom', 'olden'],
  'Musical':   ['musical', 'music', 'song', 'dance', 'melody', 'singer'],
  'Political': ['political', 'politics', 'politician', 'election', 'government'],
}

const OTT_PLATFORMS = [
  'netflix', 'amazon', 'prime', 'prime video', 'hotstar', 'disney',
  'zee5', 'sonyliv', 'aha', 'jio', 'jiocinema', 'apple tv', 'youtube',
]

const MOOD_TO_GENRE: Record<string, string> = {
  'sad': 'Drama', 'cry': 'Drama', 'emotional': 'Drama',
  'happy': 'Comedy', 'laugh': 'Comedy', 'stress': 'Comedy', 'relax': 'Comedy', 'bored': 'Action',
  'scared': 'Horror', 'romantic': 'Romance', 'date': 'Romance',
  'intense': 'Thriller', 'night': 'Thriller', 'alone': 'Thriller',
  'family': 'Family', 'kids': 'Family',
  'epic': 'Action', 'excited': 'Action', 'weekend': 'Action',
  'adventure': 'Adventure',
}

// ═══════════════════════════════════════════════════════════════
// FUZZY MATCH
// ═══════════════════════════════════════════════════════════════

function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length
  const dp = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => i === 0 ? j : j === 0 ? i : 0))
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
  return dp[m][n]
}

function fuzzyMatch(input: string, candidates: string[], threshold = 0.78): string | null {
  const lower = input.toLowerCase().trim()
  let best = { name: '', score: 0 }
  for (const c of candidates) {
    if (c === lower || c.includes(lower) || lower.includes(c)) return c
    const maxLen = Math.max(lower.length, c.length)
    if (maxLen === 0) continue
    const score = 1 - levenshtein(lower, c) / maxLen
    if (score > best.score) best = { name: c, score }
  }
  return best.score >= threshold ? best.name : null
}

// ═══════════════════════════════════════════════════════════════
// ENTITY EXTRACTION
// ═══════════════════════════════════════════════════════════════

interface Entities {
  actors: string[]; directors: string[]; genres: string[]
  years: number[]; yearRange: [number, number] | null
  otts: string[]; ratings: { min: number; max: number } | null
  keywords: string[]
}

const STOPWORDS = new Set([
  'i', 'me', 'my', 'the', 'a', 'an', 'is', 'are', 'was', 'were', 'have', 'has', 'do', 'does',
  'will', 'would', 'could', 'should', 'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by',
  'what', 'which', 'who', 'this', 'that', 'and', 'but', 'or', 'not', 'just', 'about',
  'movies', 'movie', 'film', 'films', 'watch', 'want', 'like', 'show', 'tell',
  'find', 'get', 'some', 'any', 'more', 'please',
])

function extractEntities(message: string): Entities {
  const lower = message.toLowerCase()
  const e: Entities = { actors: [], directors: [], genres: [], years: [], yearRange: null, otts: [], ratings: null, keywords: [] }

  // FIX: Match longer actor names first to avoid "vijay" stealing from "vijay sethupathi" or "arun vijay"
  const sortedActors = [...ACTORS].sort((a, b) => b.length - a.length)
  for (const a of sortedActors) {
    if (lower.includes(a) && !e.actors.includes(a)) e.actors.push(a)
  }
  if (!e.actors.length) {
    const tokens = lower.replace(/[^\w\s]/g, ' ').split(/\s+/).filter(t => t.length > 1)
    for (const t of tokens) { const m = fuzzyMatch(t, ACTORS, 0.82); if (m && !e.actors.includes(m)) e.actors.push(m) }
    for (let i = 0; i < tokens.length - 1; i++) {
      const b = `${tokens[i]} ${tokens[i + 1]}`
      const m = fuzzyMatch(b, ACTORS, 0.80)
      if (m && !e.actors.includes(m)) e.actors.push(m)
    }
  }

  // Directors
  for (const d of DIRECTORS) if (lower.includes(d) && !e.directors.includes(d)) e.directors.push(d)
  if (!e.directors.length) {
    const tokens = lower.replace(/[^\w\s]/g, ' ').split(/\s+/).filter(t => t.length > 1)
    for (let i = 0; i < tokens.length - 1; i++) {
      const b = `${tokens[i]} ${tokens[i + 1]}`
      const m = fuzzyMatch(b, DIRECTORS, 0.80)
      if (m && !e.directors.includes(m)) e.directors.push(m)
    }
  }

  // Genres
  for (const [genre, kws] of Object.entries(GENRES))
    if (kws.some(k => lower.includes(k)) && !e.genres.includes(genre)) e.genres.push(genre)

  // Mood to genre
  for (const [mood, genre] of Object.entries(MOOD_TO_GENRE))
    if (lower.includes(mood) && !e.genres.includes(genre)) e.genres.push(genre)

  // Year range
  const rangeMatch = lower.match(/\b(20\d{2})\s*(?:to|-|–|and|till)\s*(20\d{2})\b/)
  if (rangeMatch) e.yearRange = [parseInt(rangeMatch[1]), parseInt(rangeMatch[2])]
  const lastN = lower.match(/last\s+(\d+)\s+years?/)
  if (lastN) e.yearRange = [new Date().getFullYear() - parseInt(lastN[1]), new Date().getFullYear()]

  // Single years
  if (!e.yearRange) {
    const ym = lower.match(/\b(19[89]\d|20[0-2]\d)\b/g)
    if (ym) e.years = ym.map(Number)
  }

  // OTT platforms
  for (const ott of OTT_PLATFORMS) {
    if (lower.includes(ott)) {
      const c = (ott === 'amazon' || ott === 'prime video') ? 'prime' : ott
      if (!e.otts.includes(c)) e.otts.push(c)
    }
  }

  // Ratings
  const rA = lower.match(/(?:above|over|more than|atleast|minimum)\s*(\d+(?:\.\d+)?)/i)
  const rB = lower.match(/(?:below|under|less than|maximum)\s*(\d+(?:\.\d+)?)/i)
  const rR = lower.match(/(?:between)\s*(\d+(?:\.\d+)?)\s*(?:and|to|-)\s*(\d+(?:\.\d+)?)/i)
  if (rR) e.ratings = { min: parseFloat(rR[1]), max: parseFloat(rR[2]) }
  else if (rA) e.ratings = { min: parseFloat(rA[1]), max: 10 }
  else if (rB) e.ratings = { min: 0, max: parseFloat(rB[1]) }

  // Keywords
  e.keywords = lower.replace(/[^\w\s]/g, ' ').split(/\s+/)
    .filter(t => t.length > 2 && !STOPWORDS.has(t)
      && !ACTORS.some(a => a.includes(t))
      && !DIRECTORS.some(d => d.includes(t))
      && !/^(19|20)\d{2}$/.test(t))

  return e
}

// ═══════════════════════════════════════════════════════════════
// INTENT CLASSIFIER
// ═══════════════════════════════════════════════════════════════

type IntentType =
  | 'greeting' | 'howru' | 'thanks' | 'help' | 'top_rated' | 'recent'
  | 'recommend' | 'actor' | 'director' | 'genre' | 'year' | 'year_range'
  | 'ott' | 'rating_filter' | 'comparison' | 'search' | 'unknown'

function classifyIntent(message: string, e: Entities): IntentType {
  const lower = message.toLowerCase().trim()

  if (/^(hi|hello|hey|yo|sup|good\s*(morning|evening|night))\b/i.test(lower)) return 'greeting'
  if (/how (are you|r u|is it going)|what'?s up/i.test(lower)) return 'howru'
  if (/\b(thanks?|thank you|great|nice one)\b/i.test(lower)) return 'thanks'
  if (/\b(help|what can you|how to use|commands?|guide)\b/i.test(lower)) return 'help'

  if (/\bvs\.?|versus\b/i.test(lower) && (e.actors.length >= 2 || e.directors.length >= 2)) return 'comparison'

  const scores: Record<string, number> = {
    top_rated: 0, recent: 0, recommend: 0, actor: 0, director: 0,
    genre: 0, year: 0, year_range: 0, ott: 0, rating_filter: 0, search: 0, unknown: 0,
  }

  if (/\b(top|best|greatest|highest rated|must.?watch|masterpiece|goat)\b/i.test(lower)) scores.top_rated += 3
  if (/\b(recent|new|latest|upcoming|just released)\b/i.test(lower)) scores.recent += 3
  if (/\b(recommend|suggest|what should i watch|what'?s good)\b/i.test(lower)) scores.recommend += 2
  if (/\b(direct(ed|or)|films? by|movies? by)\b/i.test(lower)) scores.director += 2
  if (/\b(starring|featuring|cast|actor|actress|with)\b/i.test(lower)) scores.actor += 2
  if (/\b(on|available on|streaming on|watch on|platform|ott)\b/i.test(lower) && e.otts.length) scores.ott += 3
  if (/\b(rated|rating|score|above|below|imdb)\b/i.test(lower) && e.ratings) scores.rating_filter += 3
  if (/\b(about|tell me|explain|describe|details|synopsis|story of|plot)\b/i.test(lower)) scores.search += 2

  if (e.actors.length)    scores.actor += 3
  if (e.directors.length) scores.director += 3
  if (e.genres.length)    scores.genre += 3
  if (e.yearRange)        scores.year_range += 4
  if (e.years.length)     scores.year += 3
  if (e.otts.length)      scores.ott += 2
  if (e.ratings)          scores.rating_filter += 2
  if (e.keywords.length)  scores.search += 1

  // FIX: When an actor is detected, "top/best" means top movies BY that actor,
  // not the global top-rated list — so boost actor and suppress top_rated
  if (e.actors.length && scores.top_rated > 0) {
    scores.actor += 3
    scores.top_rated = 0
  }

  // FIX: Same logic for recent — "latest vijay movies" should hit actor, not recent
  if (e.actors.length && scores.recent > 0) {
    scores.actor += 2
    scores.recent = 0
  }

  if (scores.actor > 0 && scores.director > 0) {
    if (e.actors.length >= e.directors.length) scores.director = 0; else scores.actor = 0
  }

  const best = Object.entries(scores).sort((a, b) => b[1] - a[1])[0]
  return best[1] === 0 ? 'unknown' : best[0] as IntentType
}

// ═══════════════════════════════════════════════════════════════
// SANITY DATABASE QUERIES
// ═══════════════════════════════════════════════════════════════

const F = `_id,title,titleTanglish,"slug":slug.current,year,director,cast[]{name},genre,rating,synopsis,ottPlatform,poster,posterUrl`

const db = {
  // FIX: byActor now uses exact canonical name match first, then falls back to wildcard.
  // This stops "vijay" from matching "Vijay Raghavendra", "Arun Vijay", etc.
  byActor: async (actorKey: string, n = 6): Promise<any[]> => {
    const exactName = ACTOR_CANONICAL[actorKey.toLowerCase()] ?? actorKey
    // Try exact match on cast name first
    const exact: any[] = await client.fetch(
      `*[_type=="movie" && count(cast[name == $name]) > 0]|order(rating desc, year desc)[0...${n}]{${F}}`,
      { name: exactName }
    )
    if (exact.length) return exact
    // Fallback: wildcard (catches edge cases / data inconsistencies)
    return client.fetch(
      `*[_type=="movie" && cast[].name match $a]|order(year desc)[0...${n}]{${F}}`,
      { a: `*${exactName}*` }
    )
  },

  byActorGenre: async (actorKey: string, genre: string, n = 6): Promise<any[]> => {
    const exactName = ACTOR_CANONICAL[actorKey.toLowerCase()] ?? actorKey
    const exact: any[] = await client.fetch(
      `*[_type=="movie" && count(cast[name == $name]) > 0 && $genre in genre]|order(rating desc, year desc)[0...${n}]{${F}}`,
      { name: exactName, genre }
    )
    if (exact.length) return exact
    return client.fetch(
      `*[_type=="movie" && cast[].name match $a && $genre in genre]|order(year desc)[0...${n}]{${F}}`,
      { a: `*${exactName}*`, genre }
    )
  },

  search:      (q: string, n = 6) => client.fetch(
    `*[_type=="movie"&&(title match $q||titleTanglish match $q||director match $q||cast[].name match $q)]|order(year desc)[0...${n}]{${F}}`,
    { q: `*${q}*` }
  ),
  byGenre:     (g: string, n = 6) => client.fetch(`*[_type=="movie"&&$g in genre]|order(rating desc)[0...${n}]{${F}}`, { g }),
  byYear:      (y: number, n = 6) => client.fetch(`*[_type=="movie"&&year==$y]|order(rating desc)[0...${n}]{${F}}`, { y }),
  byYearRange: (f: number, t: number, n = 6) => client.fetch(`*[_type=="movie"&&year>=$f&&year<=$t]|order(year desc)[0...${n}]{${F}}`, { f, t }),
  byDirector:  (d: string, n = 6) => client.fetch(`*[_type=="movie"&&director match $d]|order(year desc)[0...${n}]{${F}}`, { d: `*${d}*` }),
  topRated:    (n = 6) => client.fetch(`*[_type=="movie"&&rating!=null]|order(rating desc)[0...${n}]{${F}}`),
  recent:      (n = 6) => client.fetch(`*[_type=="movie"]|order(year desc)[0...${n}]{${F}}`),
  byOTT:       (p: string, n = 6) => client.fetch(`*[_type=="movie"&&ottPlatform match $p]|order(year desc)[0...${n}]{${F}}`, { p: `*${p}*` }),
  byRating:    (min: number, max: number, n = 6) => client.fetch(`*[_type=="movie"&&rating>=$min&&rating<=$max]|order(rating desc)[0...${n}]{${F}}`, { min, max }),
  byGenreYear: (g: string, y: number, n = 6) => client.fetch(`*[_type=="movie"&&$g in genre&&year==$y]|order(rating desc)[0...${n}]{${F}}`, { g, y }),
}

// ═══════════════════════════════════════════════════════════════
// FORMATTERS
// ═══════════════════════════════════════════════════════════════

function getPosterUrl(m: any): string | null {
  if (m.poster) try { return urlFor(m.poster).width(120).height(180).quality(80).fit('max').url() } catch {}
  return m.posterUrl ?? null
}

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)] }

function fmtList(movies: any[], heading: string): string {
  if (!movies?.length) return ''
  let out = `${heading}\n\n`
  movies.forEach((m, i) => {
    const cast   = m.cast?.map((c: any) => c.name).filter(Boolean).join(', ') || 'N/A'
    const genres = m.genre?.join(', ') || 'N/A'
    const rating = m.rating ? ` ⭐ ${m.rating}/10` : ''
    const ott    = m.ottPlatform ? ` | 📺 ${m.ottPlatform}` : ''
    const poster = getPosterUrl(m)
    const img    = poster ? `[poster:${poster}]` : ''
    out += `${img}${i + 1}. [${m.title}](/movies/${m.slug}) (${m.year})${rating}${ott}\n`
    out += `   🎬 ${m.director || 'N/A'} | 👥 ${cast} | 🏷️ ${genres}\n`
    if (m.synopsis) out += `   📝 ${m.synopsis.slice(0, 120)}${m.synopsis.length > 120 ? '…' : ''}\n`
    out += '\n'
  })
  return out.trim()
}

function fmtDetail(m: any): string {
  const cast   = m.cast?.map((c: any) => c.name).filter(Boolean).join(', ') || 'N/A'
  const genres = m.genre?.join(', ') || 'N/A'
  const poster = getPosterUrl(m)
  const img    = poster ? `[poster:${poster}]` : ''
  let out = `${img}🎬 [${m.title}](/movies/${m.slug}) (${m.year})\n\n`
  out += `🎭 Director: ${m.director || 'N/A'}\n👥 Cast: ${cast}\n🏷️ Genre: ${genres}\n`
  if (m.rating)      out += `⭐ Rating: ${m.rating}/10\n`
  if (m.ottPlatform) out += `📺 Streaming: ${m.ottPlatform}\n`
  if (m.synopsis)    out += `\n📝 ${m.synopsis}\n`
  out += `\n[View full details →](/movies/${m.slug})`
  return out
}

function titleCase(s: string): string {
  return s.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

function buildSuggestions(e: Entities, movies: any[]): string[] {
  const sugg: string[] = []
  if (e.actors.length) {
    const t = titleCase(ACTOR_CANONICAL[e.actors[0]] ?? e.actors[0])
    sugg.push(`Best ${t} movies`)
    const peers: Record<string, string> = {
      vijay: 'Ajith Kumar', ajith: 'Vijay', dhanush: 'Vijay Sethupathi',
      suriya: 'Vikram', rajinikanth: 'Kamal Haasan',
    }
    const peer = peers[e.actors[0]]
    if (peer) sugg.push(`${t} vs ${peer}`)
  }
  if (e.directors.length) sugg.push(`${titleCase(e.directors[0])} filmography`)
  if (e.genres.length)    sugg.push(`Top ${e.genres[0].toLowerCase()} movies`)
  if (e.years.length)     sugg.push(`Top rated movies of ${e.years[0]}`)
  const fallbacks = ['Top rated Tamil films', 'Recommend something', 'Latest 2025 movies', 'Best Tamil thrillers']
  for (const f of fallbacks) { if (sugg.length >= 3) break; if (!sugg.includes(f)) sugg.push(f) }
  return sugg.slice(0, 3)
}

// ═══════════════════════════════════════════════════════════════
// BUILT-IN TRIVIA
// ═══════════════════════════════════════════════════════════════

const TRIVIA: Record<string, string> = {
  'rajinikanth':    `Rajinikanth (born 1950) is the undisputed Superstar of Tamil cinema. Known for his iconic style — sunglasses flick, coin toss, and memorable dialogue delivery. Blockbusters include *Baashha*, *Muthu*, *Padayappa*, *Enthiran*, *Kabali*, and *Jailer*. Awarded the Dadasaheb Phalke Award in 2021 and Padma Vibhushan in 2000.`,
  'kamal haasan':   `Kamal Haasan is considered India's most versatile actor — also a writer, director, and musician. Iconic films: *Nayakan*, *Thevar Magan*, *Vishwaroopam*, *Vikram*. Known for transformative performances spanning every genre.`,
  'vijay':          `Thalapathy Vijay is one of Tamil cinema's biggest box-office draws. Known for mass appeal, dance, and action. Blockbusters include *Theri*, *Mersal*, *Bigil*, *Master*, *Beast*, and *Leo*. Has worked with directors like Atlee, AR Murugadoss, and Lokesh Kanagaraj.`,
  'ajith':          `Ajith Kumar is loved for his humble personality and action films. Highlights: *Vaali*, *Mankatha*, *Veeram*, *Vedalam*, *Viswasam*, *Valimai*, *Thunivu*. Also a real racing driver who competed at Le Mans.`,
  'dhanush':        `Dhanush has won 3 National Awards — the most in Tamil cinema. Known for intense performances in *Aadukalam*, *Pudhupettai*, *Vada Chennai*, and *Karnan*. Also appeared in Bollywood (*Raanjhanaa*) and Hollywood (*The Gray Man*). His song "Kolaveri Di" went viral worldwide.`,
  'vijay sethupathi':`Vijay Sethupathi (known as Makkal Selvan) is celebrated for his natural, grounded acting style. From indie hits like *Pizza* and *96* to mainstream blockbusters like *Vikram* and *Maharaja* — consistently outstanding.`,
  'lokesh kanagaraj':`Lokesh Kanagaraj built the "Lokesh Cinematic Universe" — *Maanagaram*, *Kaithi*, *Master*, *Vikram*, and *Leo* are all interconnected. Known for precise action sequences, ensemble casts, and well-crafted screenplays.`,
  'mani ratnam':    `Mani Ratnam is arguably Tamil cinema's greatest director. Known for poetic visuals, nuanced characters, and iconic collaborations with AR Rahman. Masterworks: *Roja*, *Bombay*, *Dil Se*, *Alaipayuthey*, *Ponniyin Selvan*. Multiple National Award winner.`,
  'shankar':        `Shankar makes the biggest-budget Tamil films — social commentary wrapped in spectacle. Notable works: *Indian*, *Anniyan*, *Sivaji*, *Enthiran*, *2.0*, *Indian 2*. Known for his iconic collaborations with Rajinikanth and AR Rahman.`,
  'ar rahman':      `AR Rahman (born 1967 in Chennai) is India's most celebrated music composer. Oscar winner for *Slumdog Millionaire*. Tamil credits include *Roja*, *Bombay*, *Minsara Kanavu*, *Alaipayuthey*, *Rockstar*, and *Ponniyin Selvan*. Often called the Mozart of Madras.`,
  'anirudh':        `Anirudh Ravichander is the most popular music composer in current Tamil cinema. Breakthrough with *3* and the viral song "Why This Kolaveri Di". Hit films: *Vedalam*, *Kabali*, *Mersal*, *Bigil*, *Master*, *Beast*, *Leo*, *Jailer*, *Vettaiyan*.`,
}

// ═══════════════════════════════════════════════════════════════
// MAIN RESPONSE ENGINE
// ═══════════════════════════════════════════════════════════════

async function generateResponse(message: string, history: any[]): Promise<{ reply: string; suggestions: string[] }> {
  const e      = extractEntities(message)
  const intent = classifyIntent(message, e)

  // ── Small talk ──────────────────────────────────────────────
  if (intent === 'greeting') return {
    reply: pick([
      `🎬 Welcome! I am your Tamil cinema guide at TamilCinemaHub.\n\nI know 1,600+ Tamil movies — actors, directors, genres, streaming platforms, ratings, and more.\n\nWhat are you looking for today?`,
      `🌟 Hello! Ready to explore Tamil cinema?\n\nJust ask naturally — "Vijay movies", "best thrillers", "what is on Netflix", "recommend something funny". I have got you covered!\n\nWhat would you like to watch?`,
      `🎭 Welcome to TamilCinemaHub!\n\nAsk me anything about Tamil cinema — or just say "recommend something" and I will help you out!`,
    ]),
    suggestions: ['Best action movies', 'Vijay films', 'Recommend something', 'Top rated films'],
  }

  if (intent === 'howru') return {
    reply: pick([
      `😄 Doing great! Powered by pure Tamil cinema knowledge. What are we watching today?`,
      `🤩 All good! Always excited to talk Tamil films. What are you looking for?`,
      `😎 Fantastic! Ready to explore Tamil cinema. What is on your mind?`,
    ]),
    suggestions: ['Best 2024 movies', 'Recommend something', 'Vijay vs Ajith'],
  }

  if (intent === 'thanks') return {
    reply: pick([
      `🙏 You are welcome! Enjoy the film! 🎬`,
      `😊 Happy to help! Hope you enjoy it!`,
      `🎉 Anytime! Come back for more recommendations!`,
    ]),
    suggestions: [],
  }

  if (intent === 'help') return {
    reply: `📖 **What I can help with:**\n\n🎭 Actor films — "Vijay movies", "Dhanush films"\n🎬 Director works — "Lokesh Kanagaraj movies"\n🏷️ Genre — "action movies", "best thrillers"\n📅 Year — "best 2024 movies", "2020 to 2023 films"\n⭐ Rating — "movies above 8 rating"\n📺 Streaming — "movies on Netflix"\n🔄 Compare — "Vijay vs Ajith"\n🎯 Mood — "something funny", "something emotional"\n🌐 General questions — I will search Wikipedia and the web!\n\nJust ask naturally — I understand plain English!`,
    suggestions: ['Best thriller films', 'Vijay movies', 'Movies by Mani Ratnam'],
  }

  // ── Trivia ──────────────────────────────────────────────────
  const triviaKey = [...e.actors, ...e.directors].find(name => TRIVIA[name])
  if (triviaKey && /\b(who is|tell me about|career|debut|award|born|age|biography|about|info)\b/i.test(message)) {
    return {
      reply: `🎭 ${TRIVIA[triviaKey]}\n\nWould you like to see their movies?`,
      suggestions: [`${titleCase(ACTOR_CANONICAL[triviaKey] ?? triviaKey)} movies`, 'Top rated films', 'Recommend something'],
    }
  }

  // ── Comparison ──────────────────────────────────────────────
  if (intent === 'comparison') {
    const [n1, n2] = e.actors.length >= 2
      ? [e.actors[0], e.actors[1]]
      : e.directors.length >= 2
        ? [e.directors[0], e.directors[1]]
        : [e.actors[0] || '', e.directors[0] || '']
    const [m1, m2] = await Promise.all([
      n1 ? db.byActor(n1, 4) : Promise.resolve([]),
      n2 ? db.byActor(n2, 4) : Promise.resolve([]),
    ])
    const fmt = (key: string, movies: any[]) => {
      const label = titleCase(ACTOR_CANONICAL[key] ?? key)
      if (!movies.length) return `No results found for ${label}.`
      let s = `── ${label} ──\n`
      movies.forEach(m => {
        s += `• [${m.title}](/movies/${m.slug}) (${m.year})  ⭐ ${m.rating ?? 'N/A'}/10\n`
        if (m.director) s += `  Director: ${m.director}\n`
      })
      return s
    }
    const l1 = titleCase(ACTOR_CANONICAL[n1] ?? n1)
    const l2 = titleCase(ACTOR_CANONICAL[n2] ?? n2)
    return {
      reply: `🔄 **${l1} vs ${l2}**\n\n${fmt(n1, m1)}\n\n${fmt(n2, m2)}\n\nWould you like to explore either filmography in more detail?`,
      suggestions: [`${l1} best movies`, `${l2} best movies`, 'Top rated films'],
    }
  }

  // ── Actor ───────────────────────────────────────────────────
  if (intent === 'actor' && e.actors.length) {
    const actor = e.actors[0]
    const at = titleCase(ACTOR_CANONICAL[actor] ?? actor)

    if (e.genres.length) {
      const movies = await db.byActorGenre(actor, e.genres[0], 6)
      if (movies.length) return {
        reply: fmtList(movies, pick([`🎭 ${at} in ${e.genres[0]}:`, `🔥 Best ${e.genres[0].toLowerCase()} films starring ${at}:`])),
        suggestions: buildSuggestions(e, movies),
      }
    }
    if (e.years.length) {
      const all = await db.byActor(actor, 12)
      const filtered = all.filter((m: any) => m.year === e.years[0])
      if (filtered.length) return {
        reply: fmtList(filtered, `🎭 ${at} films from ${e.years[0]}:`),
        suggestions: buildSuggestions(e, filtered),
      }
    }
    const movies = await db.byActor(actor, 8)
    if (movies.length) return {
      reply: fmtList(movies, pick([`🎭 Movies featuring ${at}:`, `🌟 ${at}'s filmography:`, `🎬 Top ${at} movies:`])),
      suggestions: buildSuggestions(e, movies),
    }
    // Fallback to text search
    const s = await db.search(ACTOR_CANONICAL[actor] ?? actor, 5)
    if (s.length) return { reply: fmtList(s, `🔍 Results for "${at}":`), suggestions: buildSuggestions(e, s) }
  }

  // ── Director ────────────────────────────────────────────────
  if (intent === 'director' && e.directors.length) {
    const dir = e.directors[0]
    const dt = titleCase(dir)
    const movies = await db.byDirector(dir, 7)
    if (movies.length) return {
      reply: fmtList(movies, pick([`🎬 Filmography of ${dt}:`, `🎥 ${dt}'s movies:`])),
      suggestions: buildSuggestions(e, movies),
    }
    const s = await db.search(dir, 5)
    if (s.length) return { reply: fmtList(s, `🔍 Results for "${dt}":`), suggestions: buildSuggestions(e, s) }
  }

  // ── Genre ───────────────────────────────────────────────────
  if (intent === 'genre' && e.genres.length) {
    const genre = e.genres[0]
    if (e.years.length) {
      const movies = await db.byGenreYear(genre, e.years[0], 6)
      if (movies.length) return {
        reply: fmtList(movies, `🎭 ${genre} movies from ${e.years[0]}:`),
        suggestions: buildSuggestions(e, movies),
      }
    }
    const movies = await db.byGenre(genre, 7)
    if (movies.length) return {
      reply: fmtList(movies, pick([`🏷️ Best ${genre} movies:`, `💥 Top ${genre} picks:`, `🎬 ${genre} films you should watch:`])),
      suggestions: buildSuggestions(e, movies),
    }
  }

  // ── Year range ──────────────────────────────────────────────
  if (intent === 'year_range' && e.yearRange) {
    const [from, to] = e.yearRange
    const movies = await db.byYearRange(from, to, 7)
    if (movies.length) return {
      reply: fmtList(movies, pick([`📅 Tamil movies from ${from} to ${to}:`, `🏆 Best of ${from}–${to}:`])),
      suggestions: buildSuggestions(e, movies),
    }
  }

  // ── Year ────────────────────────────────────────────────────
  if (intent === 'year' && e.years.length) {
    const movies = await db.byYear(e.years[0], 7)
    if (movies.length) return {
      reply: fmtList(movies, pick([`📅 Tamil movies from ${e.years[0]}:`, `🏆 Best Tamil films of ${e.years[0]}:`])),
      suggestions: buildSuggestions(e, movies),
    }
  }

  // ── OTT ─────────────────────────────────────────────────────
  if (intent === 'ott' && e.otts.length) {
    const movies = await db.byOTT(e.otts[0], 7)
    if (movies.length) return {
      reply: fmtList(movies, `📺 Tamil movies on ${titleCase(e.otts[0])}:`),
      suggestions: buildSuggestions(e, movies),
    }
  }

  // ── Rating filter ───────────────────────────────────────────
  if (intent === 'rating_filter' && e.ratings) {
    const { min, max } = e.ratings
    const movies = await db.byRating(min, max, 7)
    if (movies.length) return {
      reply: fmtList(movies, `⭐ Movies rated ${min}${max < 10 ? `–${max}` : '+'}:`),
      suggestions: buildSuggestions(e, movies),
    }
  }

  // ── Top rated ───────────────────────────────────────────────
  if (intent === 'top_rated') {
    const movies = await db.topRated(8)
    if (movies.length) return {
      reply: fmtList(movies, pick([`🏆 Highest-rated Tamil movies:`, `🌟 The best of Tamil cinema:`, `💎 Tamil cinema masterpieces:`])),
      suggestions: buildSuggestions(e, movies),
    }
  }

  // ── Recent ──────────────────────────────────────────────────
  if (intent === 'recent') {
    const movies = await db.recent(8)
    if (movies.length) return {
      reply: fmtList(movies, pick([`🆕 Latest Tamil releases:`, `🎬 Fresh from Tamil cinema:`, `📽️ What is new in Tamil cinema:`])),
      suggestions: buildSuggestions(e, movies),
    }
  }

  // ── Recommend ───────────────────────────────────────────────
  if (intent === 'recommend') {
    const source = e.genres.length ? db.byGenre(e.genres[0], 6) : db.topRated(7)
    const movies = await source
    if (movies.length) return {
      reply: fmtList(movies, pick([`✨ My top picks for you:`, `🎯 Handpicked for you:`, `🌟 You cannot go wrong with these:`])),
      suggestions: buildSuggestions(e, movies),
    }
  }

  // ── Search ──────────────────────────────────────────────────
  if (intent === 'search' || e.keywords.length) {
    const q = e.keywords.join(' ') || message.trim()
    const movies = await db.search(q, 6)
    if (movies.length === 1) return {
      reply: fmtDetail(movies[0]),
      suggestions: [`More ${movies[0].genre?.[0] || 'similar'} movies`, `Movies by ${movies[0].director || 'this director'}`, 'Top rated films'],
    }
    if (movies.length > 1) return {
      reply: fmtList(movies, pick([`🔍 Results for "${q}":`, `📽️ Found these for "${q}":`, `🎬 Matching movies for "${q}":`])),
      suggestions: buildSuggestions(e, movies),
    }
  }

  // ── Context follow-up ("show more", "another one") ─────────
  if (/\b(more|another|similar|else|other|next)\b/i.test(message) && history.length >= 2) {
    const lastAI = [...history].reverse().find(m => m.role === 'assistant')
    if (lastAI) {
      const ce = extractEntities(lastAI.content.slice(0, 500))
      if (ce.actors[0]) {
        const m = await db.byActor(ce.actors[0], 6)
        const label = titleCase(ACTOR_CANONICAL[ce.actors[0]] ?? ce.actors[0])
        if (m.length) return { reply: fmtList(m, `🎭 More ${label} movies:`), suggestions: buildSuggestions(ce, m) }
      }
      if (ce.genres[0]) {
        const m = await db.byGenre(ce.genres[0], 6)
        if (m.length) return { reply: fmtList(m, `🏷️ More ${ce.genres[0]} movies:`), suggestions: buildSuggestions(ce, m) }
      }
    }
  }

  // ── Web fallback (Wikipedia + DuckDuckGo) ──────────────────
  console.log(`[TamilCinemaHub] No database result — searching the web for: "${message}"`)
  return await searchFallback(message)
}

// ═══════════════════════════════════════════════════════════════
// RATE LIMITER
// ═══════════════════════════════════════════════════════════════

const RL_MAP = new Map<string, { count: number; start: number }>()

function checkRL(ip: string) {
  const WINDOW = 60_000, MAX = 30, now = Date.now()
  const entry = RL_MAP.get(ip)
  if (!entry || now - entry.start > WINDOW) {
    RL_MAP.set(ip, { count: 1, start: now })
    return { ok: true, retryAfter: 0 }
  }
  entry.count++
  if (entry.count > MAX) return { ok: false, retryAfter: Math.ceil((entry.start + WINDOW - now) / 1000) }
  return { ok: true, retryAfter: 0 }
}

// ═══════════════════════════════════════════════════════════════
// API ROUTE HANDLER
// ═══════════════════════════════════════════════════════════════

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim()
    ?? req.headers.get('x-real-ip')
    ?? 'unknown'

  const { ok, retryAfter } = checkRL(ip)
  if (!ok) return NextResponse.json(
    { error: `Rate limit exceeded. Please try again in ${retryAfter} seconds.`, retryAfter },
    { status: 429, headers: { 'Retry-After': String(retryAfter) } }
  )

  let body: any
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 })
  }

  const { messages = [] } = body
  if (!Array.isArray(messages) || !messages.length) {
    return NextResponse.json({ error: 'A non-empty messages array is required.' }, { status: 400 })
  }

  const lastMsg: string = messages.filter((m: any) => m.role === 'user').pop()?.content ?? ''
  const history = messages.slice(-8)

  try {
    const { reply, suggestions } = await generateResponse(lastMsg, history)
    return NextResponse.json({ reply, suggestions, provider: 'TamilCinemaHub AI' })
  } catch (err: any) {
    console.error('[TamilCinemaHub AI]', err?.message)
    return NextResponse.json({
      reply: `Sorry, something went wrong! Please try again.\n\nTry: "Best action movies", "Vijay films", "Movies from 2024"`,
      suggestions: ['Action movies', 'Vijay movies', 'Top rated films'],
      provider: 'TamilCinemaHub AI',
    }, { status: 200 })
  }
}