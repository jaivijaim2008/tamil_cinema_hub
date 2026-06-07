import { NextRequest, NextResponse } from 'next/server'
import { client } from '@/sanity/client'
import { urlFor } from '@/sanity/lib/image'

// ═══════════════════════════════════════════════════════════════
// KNOWLEDGE BASE
// ═══════════════════════════════════════════════════════════════

const ACTOR_CANONICAL: Record<string, string> = {
  'vijay': 'Vijay',
  'thalapathy': 'Vijay',
  'ilayathalapathy': 'Vijay',
  'rajinikanth': 'Rajinikanth',
  'rajini': 'Rajinikanth',
  'superstar': 'Rajinikanth',
  'thalaivar': 'Rajinikanth',
  'kamal haasan': 'Kamal Haasan',
  'kamal': 'Kamal Haasan',
  'ulaganayagan': 'Kamal Haasan',
  'ajith': 'Ajith Kumar',
  'thala': 'Ajith Kumar',
  'ajith kumar': 'Ajith Kumar',
  'dhanush': 'Dhanush',
  'vikram': 'Vikram',
  'suriya': 'Suriya',
  'simbu': 'Simbu',
  'silambarasan': 'Simbu',
  'vijay sethupathi': 'Vijay Sethupathi',
  'makkal selvan': 'Vijay Sethupathi',
  'karthi': 'Karthi',
  'vishal': 'Vishal',
  'arya': 'Arya',
  'jiiva': 'Jiiva',
  'prashanth': 'Prashanth',
  'nayanthara': 'Nayanthara',
  'samantha': 'Samantha',
  'trisha': 'Trisha',
  'anushka shetty': 'Anushka Shetty',
  'keerthy suresh': 'Keerthy Suresh',
  'rashmika': 'Rashmika Mandanna',
  'pooja hegde': 'Pooja Hegde',
  'sai pallavi': 'Sai Pallavi',
  'prakash raj': 'Prakash Raj',
  'vadivelu': 'Vadivelu',
  'vivek': 'Vivek',
  'soori': 'Soori',
  'yogi babu': 'Yogi Babu',
  'arvind swami': 'Arvind Swami',
  'fahadh faasil': 'Fahadh Faasil',
  'madhavan': 'Madhavan',
  'sj suryah': 'SJ Suryah',
  'parthiban': 'Parthiban',
  'kathir': 'Kathir',
  'atharva': 'Atharva',
  'gautham karthik': 'Gautham Karthik',
  'bobby simha': 'Bobby Simha',
  'kishore': 'Kishore',
  'arun vijay': 'Arun Vijay',
  'navin': 'Navin',
  'nakul': 'Nakul',
  'jai': 'Jai',
  'santhanam': 'Santhanam',
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

const GENRES: Record<string, { primary: string[]; secondary: string[] }> = {
  'Action':    { primary: ['action', 'fight scene', 'mass movie', 'stunt'],         secondary: ['battle', 'combat', 'blast', 'mass', 'fight'] },
  'Comedy':    { primary: ['comedy', 'funny movie', 'comedy film'],                  secondary: ['laugh', 'humor', 'comic', 'hilarious', 'fun'] },
  'Romance':   { primary: ['romance', 'romantic', 'love story', 'romantic film'],   secondary: ['love', 'crush', 'couple'] },
  'Thriller':  { primary: ['thriller', 'suspense', 'psychological thriller'],        secondary: ['twist', 'mind-bending', 'mystery', 'dark', 'tense'] },
  'Horror':    { primary: ['horror', 'horror movie', 'scary movie', 'ghost movie'], secondary: ['haunted', 'fear', 'terror', 'supernatural', 'scary'] },
  'Drama':     { primary: ['drama', 'emotional movie', 'drama film'],               secondary: ['emotional', 'tear', 'cry', 'family drama', 'social', 'realistic'] },
  'Sci-Fi':    { primary: ['sci-fi', 'science fiction', 'scifi'],                   secondary: ['space', 'future', 'robot', 'time travel'] },
  'Fantasy':   { primary: ['fantasy', 'fantasy film', 'mythology'],                 secondary: ['myth', 'magic', 'magical', 'epic', 'legend', 'kingdom'] },
  'Crime':     { primary: ['crime', 'crime movie', 'gangster film'],                secondary: ['gangster', 'mafia', 'police', 'detective', 'investigation', 'murder', 'heist'] },
  'Adventure': { primary: ['adventure', 'adventure movie'],                         secondary: ['journey', 'quest', 'explore', 'road trip'] },
  'Family':    { primary: ['family movie', 'kids movie', 'family film'],            secondary: ['kids', 'children', 'family friendly', 'father', 'mother'] },
  'Period':    { primary: ['period film', 'historical movie', 'period drama'],      secondary: ['historical', 'history', 'ancient', 'kingdom', 'olden'] },
  'Musical':   { primary: ['musical', 'music movie', 'musical film'],               secondary: ['song', 'dance', 'melody', 'singer'] },
  'Political': { primary: ['political film', 'political movie', 'political drama'], secondary: ['politics', 'politician', 'election', 'government'] },
}

const ALL_GENRE_WORDS = new Set(
  Object.values(GENRES).flatMap(g => [...g.primary, ...g.secondary])
)

const OTT_PLATFORMS: Record<string, string> = {
  'netflix': 'netflix',
  'amazon': 'amazon prime',
  'prime video': 'amazon prime',
  'prime': 'amazon prime',
  'hotstar': 'hotstar',
  'disney': 'hotstar',
  'disney hotstar': 'hotstar',
  'zee5': 'zee5',
  'sonyliv': 'sonyliv',
  'sony liv': 'sonyliv',
  'aha': 'aha',
  'jio': 'jiocinema',
  'jiocinema': 'jiocinema',
  'apple tv': 'apple tv',
  'youtube': 'youtube',
}

const MOOD_TO_GENRE: Record<string, string> = {
  'sad': 'Drama',
  'cry': 'Drama',
  'emotional': 'Drama',
  'happy': 'Comedy',
  'laugh': 'Comedy',
  'stress': 'Comedy',
  'relax': 'Comedy',
  'bored': 'Action',
  'scared': 'Horror',
  'romantic': 'Romance',
  'date': 'Romance',
  'intense': 'Thriller',
  'night': 'Thriller',
  'alone': 'Thriller',
  'family time': 'Family',
  'with kids': 'Family',
  'epic': 'Action',
  'excited': 'Action',
  'weekend': 'Action',
  'adventure': 'Adventure',
}

// ═══════════════════════════════════════════════════════════════
// TRIVIA
// ═══════════════════════════════════════════════════════════════

const TRIVIA: Record<string, string> = {
  'rajinikanth': `Rajinikanth (born 1950) is the undisputed Superstar of Tamil cinema. Known for his iconic style — sunglasses flick, coin toss, and memorable dialogue delivery. Blockbusters include *Baashha*, *Muthu*, *Padayappa*, *Enthiran*, *Kabali*, and *Jailer*. Awarded the Dadasaheb Phalke Award in 2021 and Padma Vibhushan in 2000.`,
  'kamal haasan': `Kamal Haasan is considered India's most versatile actor — also a writer, director, and musician. Iconic films: *Nayakan*, *Thevar Magan*, *Vishwaroopam*, *Vikram*. Known for transformative performances spanning every genre.`,
  'vijay': `Thalapathy Vijay is one of Tamil cinema's biggest box-office draws. Known for mass appeal, dance, and action. Blockbusters include *Theri*, *Mersal*, *Bigil*, *Master*, *Beast*, and *Leo*. Has worked with directors like Atlee, AR Murugadoss, and Lokesh Kanagaraj.`,
  'ajith': `Ajith Kumar is loved for his humble personality and action films. Highlights: *Vaali*, *Mankatha*, *Veeram*, *Vedalam*, *Viswasam*, *Valimai*, *Thunivu*. Also a real racing driver who competed at Le Mans.`,
  'dhanush': `Dhanush has won 3 National Awards — the most in Tamil cinema. Known for intense performances in *Aadukalam*, *Pudhupettai*, *Vada Chennai*, and *Karnan*. Also appeared in Bollywood (*Raanjhanaa*) and Hollywood (*The Gray Man*). His song "Kolaveri Di" went viral worldwide.`,
  'vijay sethupathi': `Vijay Sethupathi (Makkal Selvan) is celebrated for his natural, grounded acting style. From indie hits like *Pizza* and *96* to mainstream blockbusters like *Vikram* and *Maharaja* — consistently outstanding.`,
  'lokesh kanagaraj': `Lokesh Kanagaraj built the "Lokesh Cinematic Universe" — *Maanagaram*, *Kaithi*, *Master*, *Vikram*, and *Leo* are all interconnected. Known for precise action sequences, ensemble casts, and well-crafted screenplays.`,
  'mani ratnam': `Mani Ratnam is arguably Tamil cinema's greatest director. Known for poetic visuals, nuanced characters, and iconic collaborations with AR Rahman. Masterworks: *Roja*, *Bombay*, *Dil Se*, *Alaipayuthey*, *Ponniyin Selvan*. Multiple National Award winner.`,
  'shankar': `Shankar makes the biggest-budget Tamil films — social commentary wrapped in spectacle. Notable works: *Indian*, *Anniyan*, *Sivaji*, *Enthiran*, *2.0*, *Indian 2*. Known for iconic collaborations with Rajinikanth and AR Rahman.`,
  'ar rahman': `AR Rahman (born 1967 in Chennai) is India's most celebrated music composer. Oscar winner for *Slumdog Millionaire*. Tamil credits include *Roja*, *Bombay*, *Minsara Kanavu*, *Alaipayuthey*, and *Ponniyin Selvan*. Called the Mozart of Madras.`,
  'anirudh': `Anirudh Ravichander is the most popular music composer in current Tamil cinema. Breakthrough with *3* and "Why This Kolaveri Di". Hits: *Vedalam*, *Kabali*, *Mersal*, *Bigil*, *Master*, *Beast*, *Leo*, *Jailer*, *Vettaiyan*.`,
}

// ═══════════════════════════════════════════════════════════════
// STOPWORDS
// ═══════════════════════════════════════════════════════════════

const STOPWORDS = new Set([
  'i', 'me', 'my', 'the', 'a', 'an', 'is', 'are', 'was', 'were', 'have', 'has',
  'do', 'does', 'will', 'would', 'could', 'should', 'to', 'of', 'in', 'for',
  'on', 'with', 'at', 'by', 'what', 'which', 'who', 'this', 'that', 'and',
  'but', 'or', 'not', 'just', 'about', 'than', 'then', 'can', 'you', 'ur', 'u',
  'da', 'ok', 'yes', 'no', 'maybe', 'also',
  'movie', 'movies', 'film', 'films', 'cinema', 'watch', 'watching', 'want',
  'like', 'show', 'tell', 'find', 'get', 'some', 'any', 'more', 'please',
  'list', 'give', 'suggest', 'suggests', 'suggested', 'recommend', 'recommendation',
  'best', 'good', 'great', 'top', 'something', 'anything', 'everything',
  'need', 'looking', 'search', 'searching', 'tamil', 'kollywood',
  'latest', 'recent', 'new', 'old', 'classic', 'popular', 'hit',
  'highest', 'rated', 'rating', 'release', 'released',
  'action', 'comedy', 'romance', 'romantic', 'thriller', 'horror',
  'drama', 'fantasy', 'adventure', 'family', 'crime', 'mystery',
  'musical', 'political', 'scifi', 'historical', 'period',
  'sad', 'happy', 'funny', 'scary', 'emotional', 'exciting', 'boring',
])

// ═══════════════════════════════════════════════════════════════
// FUZZY MATCH
// ═══════════════════════════════════════════════════════════════

function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  )
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
  return dp[m][n]
}

function normalize(s: string): string {
  return s
    .toLowerCase().trim()
    .replace(/th/g, 't').replace(/ph/g, 'f')
    .replace(/ee/g, 'i').replace(/oo/g, 'u')
    .replace(/ai/g, 'a').replace(/sh/g, 's')
}

function fuzzyMatch(input: string, candidates: string[], threshold = 0.78): string | null {
  const norm = normalize(input)
  let best = { name: '', score: 0 }
  for (const c of candidates) {
    const cn = normalize(c)
    if (cn === norm || cn.includes(norm) || norm.includes(cn)) return c
    const maxLen = Math.max(norm.length, cn.length)
    if (maxLen === 0) continue
    const score = 1 - levenshtein(norm, cn) / maxLen
    if (score > best.score) best = { name: c, score }
  }
  return best.score >= threshold ? best.name : null
}

// ═══════════════════════════════════════════════════════════════
// ENTITY EXTRACTION
// ═══════════════════════════════════════════════════════════════

interface Entities {
  actors: string[]
  directors: string[]
  genres: string[]
  years: number[]
  yearRange: [number, number] | null
  otts: string[]
  ratings: { min: number; max: number } | null
  keywords: string[]
}

function extractEntities(message: string): Entities {
  const lower = message.toLowerCase()
  const e: Entities = {
    actors: [], directors: [], genres: [], years: [],
    yearRange: null, otts: [], ratings: null, keywords: [],
  }

  const sortedActors = [...ACTORS].sort((a, b) => b.length - a.length)
  for (const a of sortedActors) {
    if (lower.includes(a) && !e.actors.includes(a)) e.actors.push(a)
  }
  if (!e.actors.length) {
    const tokens = lower.replace(/[^\w\s]/g, ' ').split(/\s+/).filter(t => t.length > 1)
    for (const t of tokens) {
      const m = fuzzyMatch(t, ACTORS, 0.75)
      if (m && !e.actors.includes(m)) e.actors.push(m)
    }
    for (let i = 0; i < tokens.length - 1; i++) {
      const bigram = `${tokens[i]} ${tokens[i + 1]}`
      const m = fuzzyMatch(bigram, ACTORS, 0.72)
      if (m && !e.actors.includes(m)) e.actors.push(m)
    }
  }

  for (const d of DIRECTORS) {
    if (lower.includes(d) && !e.directors.includes(d)) e.directors.push(d)
  }
  if (!e.directors.length) {
    const tokens = lower.replace(/[^\w\s]/g, ' ').split(/\s+/).filter(t => t.length > 1)
    for (const t of tokens) {
      const m = fuzzyMatch(t, DIRECTORS, 0.75)
      if (m && !e.directors.includes(m)) e.directors.push(m)
    }
    for (let i = 0; i < tokens.length - 1; i++) {
      const bigram = `${tokens[i]} ${tokens[i + 1]}`
      const m = fuzzyMatch(bigram, DIRECTORS, 0.72)
      if (m && !e.directors.includes(m)) e.directors.push(m)
    }
  }

  for (const [genre, { primary, secondary }] of Object.entries(GENRES)) {
    if (primary.some(k => lower.includes(k))) {
      if (!e.genres.includes(genre)) e.genres.push(genre)
      continue
    }
    if (secondary.some(k => lower.includes(k))) {
      if (!e.genres.includes(genre)) e.genres.push(genre)
    }
  }

  for (const [mood, genre] of Object.entries(MOOD_TO_GENRE)) {
    if (lower.includes(mood) && !e.genres.includes(genre)) e.genres.push(genre)
  }

  const rangeMatch = lower.match(/\b(19\d{2}|20\d{2})\s*(?:to|[-–]|and|till|until)\s*(19\d{2}|20\d{2})\b/)
  if (rangeMatch) {
    e.yearRange = [parseInt(rangeMatch[1]), parseInt(rangeMatch[2])]
  }
  const lastNMatch = lower.match(/last\s+(\d+)\s+years?/)
  if (lastNMatch) {
    const now = new Date().getFullYear()
    e.yearRange = [now - parseInt(lastNMatch[1]), now]
  }

  if (!e.yearRange) {
    const yearMatches = lower.match(/\b(19[5-9]\d|20[0-2]\d)\b/g)
    if (yearMatches) e.years = [...new Set(yearMatches.map(Number))]
  }

  for (const [keyword, canonical] of Object.entries(OTT_PLATFORMS)) {
    if (lower.includes(keyword) && !e.otts.includes(canonical)) {
      e.otts.push(canonical)
    }
  }

  const rRange = lower.match(/between\s+(\d+(?:\.\d+)?)\s*(?:and|to|-)\s*(\d+(?:\.\d+)?)/i)
  const rAbove = lower.match(/(?:above|over|more than|atleast|minimum|above|min)\s*(\d+(?:\.\d+)?)/i)
  const rBelow = lower.match(/(?:below|under|less than|maximum|max|upto)\s*(\d+(?:\.\d+)?)/i)
  if (rRange) {
    e.ratings = { min: Math.min(parseFloat(rRange[1]), 5), max: Math.min(parseFloat(rRange[2]), 5) }
  } else if (rAbove) {
    e.ratings = { min: Math.min(parseFloat(rAbove[1]), 5), max: 5 }
  } else if (rBelow) {
    e.ratings = { min: 0, max: Math.min(parseFloat(rBelow[1]), 5) }
  }

  const usedNames = new Set([
    ...e.actors.flatMap(a => a.split(' ')),
    ...e.directors.flatMap(d => d.split(' ')),
  ])
  e.keywords = lower
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(t =>
      t.length > 2 &&
      !STOPWORDS.has(t) &&
      !ALL_GENRE_WORDS.has(t) &&
      !usedNames.has(t) &&
      !/^(19|20)\d{2}$/.test(t)
    )

  return e
}

// ═══════════════════════════════════════════════════════════════
// INTENT CLASSIFIER
// ═══════════════════════════════════════════════════════════════

type IntentType =
  | 'greeting' | 'howru' | 'thanks' | 'help'
  | 'trivia'
  | 'comparison'
  | 'actor_genre'
  | 'actor'
  | 'director'
  | 'genre'
  | 'year_range'
  | 'year'
  | 'ott'
  | 'rating_filter'
  | 'top_rated'
  | 'recent'
  | 'recommend'
  | 'movie_detail'
  | 'search'
  | 'unknown'

function classifyIntent(message: string, e: Entities): IntentType {
  const lower = message.toLowerCase().trim()

  if (/^(hi|hello|hey|yo|sup|hii+|helo+|hai|vanakkam|namaste|good\s*(morning|evening|night|day)|welcome|start)\b/i.test(lower))
    return 'greeting'
  if (/how\s*(are you|r u|is it going|u doing)|what'?s up/i.test(lower))
    return 'howru'
  if (/^(thanks?|thank you|thx|ty|tq|nandri|romba thanks)\b/i.test(lower))
    return 'thanks'
  if (/\b(help|what can you|how to use|commands?|guide|features)\b/i.test(lower))
    return 'help'

  if (/\bvs\.?|versus\b/i.test(lower) && e.actors.length >= 2)
    return 'comparison'

  if (
    (e.actors.length > 0 || e.directors.length > 0) &&
    /\b(who is|tell me about|career|debut|award|born|age|biography|about|info|history|background)\b/i.test(lower)
  ) return 'trivia'

  if (e.otts.length > 0) return 'ott'
  if (e.ratings !== null) return 'rating_filter'
  if (e.actors.length > 0 && e.genres.length > 0) return 'actor_genre'
  if (e.actors.length > 0) return 'actor'
  if (e.directors.length > 0) return 'director'
  if (e.yearRange !== null) return 'year_range'

  if (e.years.length > 0) {
    if (e.genres.length > 0) return 'genre'
    return 'year'
  }

  if (e.genres.length > 0) return 'genre'

  if (/\b(top|best|greatest|highest rated|must.?watch|masterpiece|goat|all time)\b/i.test(lower))
    return 'top_rated'

  if (/\b(recent|new|latest|upcoming|just released|newly released|fresh|2026)\b/i.test(lower))
    return 'recent'

  if (/\b(about|tell me|explain|describe|synopsis|plot|story of|overview|what is|details of)\b/i.test(lower))
    return 'movie_detail'

  if (/\b(recommend|suggest|what should i watch|what'?s good|give me|find me|any good|something to watch)\b/i.test(lower))
    return 'recommend'

  if (e.keywords.length > 0) return 'search'

  return 'unknown'
}

// ═══════════════════════════════════════════════════════════════
// DATABASE QUERIES (Sanity)
// ═══════════════════════════════════════════════════════════════

const F = `_id, title, titleTanglish, "slug": slug.current, year, director,
  cast[]{ name }, genre, rating, synopsis, ottPlatform, poster, posterUrl`

const db = {
  byActor: (actorKey: string, n = 7): Promise<any[]> => {
    const name = ACTOR_CANONICAL[actorKey.toLowerCase()] ?? actorKey
    return client.fetch(
      `*[_type == "movie" && count(cast[name == $name]) > 0]
       | order(rating desc, year desc)[0...${n}]{${F}}`,
      { name }
    ).then((res: any[]) => res.length ? res :
      client.fetch(
        `*[_type == "movie" && cast[].name match $pattern]
         | order(year desc)[0...${n}]{${F}}`,
        { pattern: `*${name}*` }
      )
    )
  },

  byActorAndGenre: (actorKey: string, genre: string, n = 7): Promise<any[]> => {
    const name = ACTOR_CANONICAL[actorKey.toLowerCase()] ?? actorKey
    return client.fetch(
      `*[_type == "movie" && count(cast[name == $name]) > 0 && $genre in genre]
       | order(rating desc, year desc)[0...${n}]{${F}}`,
      { name, genre }
    ).then((res: any[]) => res.length ? res :
      client.fetch(
        `*[_type == "movie" && cast[].name match $pattern && $genre in genre]
         | order(rating desc)[0...${n}]{${F}}`,
        { pattern: `*${name}*`, genre }
      )
    )
  },

  byDirector: (dir: string, n = 7): Promise<any[]> =>
    client.fetch(
      `*[_type == "movie" && director match $pattern]
       | order(year desc)[0...${n}]{${F}}`,
      { pattern: `*${dir}*` }
    ),

  byGenre: (genre: string, n = 7): Promise<any[]> =>
    client.fetch(
      `*[_type == "movie" && $genre in genre]
       | order(rating desc)[0...${n}]{${F}}`,
      { genre }
    ),

  byGenreAndYear: (genre: string, year: number, n = 7): Promise<any[]> =>
    client.fetch(
      `*[_type == "movie" && $genre in genre && year == $year]
       | order(rating desc)[0...${n}]{${F}}`,
      { genre, year }
    ),

  byYear: (year: number, n = 7): Promise<any[]> =>
    client.fetch(
      `*[_type == "movie" && year == $year]
       | order(rating desc)[0...${n}]{${F}}`,
      { year }
    ),

  byYearRange: (from: number, to: number, n = 8): Promise<any[]> =>
    client.fetch(
      `*[_type == "movie" && year >= $from && year <= $to]
       | order(year desc)[0...${n}]{${F}}`,
      { from, to }
    ),

  byOTT: (platform: string, n = 7): Promise<any[]> =>
    client.fetch(
      `*[_type == "movie" && ottPlatform match $pattern]
       | order(year desc)[0...${n}]{${F}}`,
      { pattern: `*${platform}*` }
    ),

  byRating: (min: number, max: number, n = 7): Promise<any[]> =>
    client.fetch(
      `*[_type == "movie" && rating >= $min && rating <= $max]
       | order(rating desc)[0...${n}]{${F}}`,
      { min, max }
    ),

  topRated: (n = 8): Promise<any[]> =>
    client.fetch(
      `*[_type == "movie" && rating != null]
       | order(rating desc)[0...${n}]{${F}}`
    ),

  recent: (n = 8): Promise<any[]> =>
    client.fetch(
      `*[_type == "movie"] | order(year desc)[0...${n}]{${F}}`
    ),

  search: (q: string, n = 6): Promise<any[]> =>
    client.fetch(
      `*[_type == "movie" && (
        title match $q || titleTanglish match $q ||
        director match $q || cast[].name match $q
      )] | order(year desc)[0...${n}]{${F}}`,
      { q: `*${q}*` }
    ),

  // ── Health check: returns total movie count ──────────────────
  count: (): Promise<number> =>
    client.fetch(`count(*[_type == "movie"])`),
}

// ═══════════════════════════════════════════════════════════════
// FORMATTERS
// ═══════════════════════════════════════════════════════════════

function getPosterUrl(m: any): string | null {
  if (m.poster) {
    try { return urlFor(m.poster).width(120).height(180).quality(80).fit('max').url() } catch {}
  }
  return m.posterUrl ?? null
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function titleCase(s: string): string {
  return s.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

function fmtList(movies: any[], heading: string): string {
  if (!movies?.length) return ''
  let out = `${heading}\n\n`
  movies.forEach((m, i) => {
    const cast = m.cast?.map((c: any) => c.name).filter(Boolean).join(', ') || 'N/A'
    const genres = m.genre?.join(', ') || 'N/A'
    const rating = m.rating != null ? ` ⭐ ${m.rating.toFixed(1)}/5` : ''
    const ott = m.ottPlatform ? ` | 📺 ${m.ottPlatform}` : ''
    const poster = getPosterUrl(m)
    const img = poster ? `[poster:${poster}]` : ''
    out += `${img}${i + 1}. [${m.title}](/movies/${m.slug}) (${m.year})${rating}${ott}\n`
    out += `   🎬 ${m.director || 'N/A'} | 👥 ${cast} | 🏷️ ${genres}\n`
    if (m.synopsis) out += `   📝 ${m.synopsis.slice(0, 120)}${m.synopsis.length > 120 ? '…' : ''}\n`
    out += '\n'
  })
  return out.trim()
}

function fmtDetail(m: any): string {
  const cast = m.cast?.map((c: any) => c.name).filter(Boolean).join(', ') || 'N/A'
  const genres = m.genre?.join(', ') || 'N/A'
  const poster = getPosterUrl(m)
  const img = poster ? `[poster:${poster}]` : ''
  let out = `${img}🎬 **[${m.title}](/movies/${m.slug})** (${m.year})\n\n`
  out += `🎭 Director: ${m.director || 'N/A'}\n`
  out += `👥 Cast: ${cast}\n`
  out += `🏷️ Genre: ${genres}\n`
  if (m.rating != null) out += `⭐ Rating: ${m.rating.toFixed(1)}/5\n`
  if (m.ottPlatform) out += `📺 Streaming: ${m.ottPlatform}\n`
  if (m.synopsis) out += `\n📝 ${m.synopsis}\n`
  out += `\n[View full details →](/movies/${m.slug})`
  return out
}

function buildSuggestions(e: Entities, movies: any[]): string[] {
  const sugg: string[] = []
  if (e.actors.length) {
    const label = titleCase(ACTOR_CANONICAL[e.actors[0]] ?? e.actors[0])
    sugg.push(`Best ${label} movies`)
    const peers: Record<string, string> = {
      vijay: 'Ajith Kumar', ajith: 'Vijay', dhanush: 'Vijay Sethupathi',
      suriya: 'Vikram', rajinikanth: 'Kamal Haasan',
    }
    const peer = peers[e.actors[0]]
    if (peer) sugg.push(`${label} vs ${peer}`)
  }
  if (e.directors.length) sugg.push(`${titleCase(e.directors[0])} filmography`)
  if (e.genres.length) sugg.push(`Top ${e.genres[0]} movies`)
  if (e.years.length) sugg.push(`Top rated movies of ${e.years[0]}`)
  const fallbacks = ['Top rated Tamil films', 'Latest Tamil movies', 'Best Tamil thrillers', 'Recommend something']
  for (const f of fallbacks) {
    if (sugg.length >= 3) break
    if (!sugg.includes(f)) sugg.push(f)
  }
  return sugg.slice(0, 3)
}

// ═══════════════════════════════════════════════════════════════
// GROQ AI — SOLE FALLBACK
// Replaces Wikipedia entirely. Full error logging so you can
// see exactly what's failing in your server console.
// ═══════════════════════════════════════════════════════════════

const GROQ_SYSTEM_PROMPT = `You are TamilCinemaHub AI — an expert assistant EXCLUSIVELY for Tamil cinema (Kollywood).

You have deep knowledge of:
- Tamil movies from the 1930s to 2026 (actors, directors, plots, box office, awards)
- Music composers: AR Rahman, Anirudh, Yuvan Shankar Raja, Harris Jayaraj, Ilaiyaraaja
- Directors: Mani Ratnam, Shankar, Lokesh Kanagaraj, Vetrimaaran, Pa Ranjith, Selvaraghavan, and more
- Actors: Rajinikanth, Kamal Haasan, Vijay, Ajith, Dhanush, Vijay Sethupathi, Suriya, Vikram, and more
- OTT availability: Netflix, Amazon Prime, Hotstar, Zee5, SonyLIV, Aha
- Awards: National Awards, Filmfare, Vijay Awards
- Box office records and commercial performance

STRICT RULES:
1. ONLY discuss Tamil cinema. For anything else reply: "I specialize in Tamil cinema only! Ask me about Tamil movies, actors, directors, or music."
2. Answer in clear, simple English. No need for Tanglish.
3. Keep replies under 250 words — be specific and useful.
4. Do NOT invent facts. If you are unsure about a specific year, rating, or cast detail, say so honestly.
5. Always be helpful — if you don't know a specific movie, suggest similar ones you DO know.
6. Use emojis naturally to make responses engaging 🎬
7. End with one relevant follow-up suggestion the user might enjoy.
8. For movie recommendations, list 3-5 titles with director name and year when you know them.`

async function askGroq(
  message: string,
  history: { role: string; content: string }[],
  debugContext?: string
): Promise<{ reply: string; suggestions: string[] }> {
  const apiKey = process.env.GROQ_API_KEY

  // ── Missing API key — clear error in console ──────────────────
  if (!apiKey) {
    console.error(
      '\n╔══════════════════════════════════════════════════╗\n' +
      '║  GROQ_API_KEY is not set in your .env.local      ║\n' +
      '║  1. Go to https://console.groq.com               ║\n' +
      '║  2. Create a free API key                        ║\n' +
      '║  3. Add GROQ_API_KEY=gsk_xxx to .env.local       ║\n' +
      '║  4. Restart your dev server                      ║\n' +
      '╚══════════════════════════════════════════════════╝\n'
    )
    return {
      reply: `🎬 I'm having trouble connecting to my AI brain right now. My database doesn't have a direct match for that, but here are some things you can try:\n\n• Ask about a specific actor: "Vijay movies" or "Dhanush films"\n• Ask by genre: "best Tamil thrillers" or "top action movies"\n• Ask by year: "Tamil movies from 2023"\n• Ask what's on OTT: "movies on Netflix"\n\nWhat would you like to explore?`,
      suggestions: ['Best action movies', 'Top rated films', 'Vijay movies'],
    }
  }

  // ── Build conversation history (last 6 turns) ─────────────────
  const recentHistory = history.slice(-6).map(m => ({
    role: m.role === 'assistant' ? 'assistant' : 'user',
    content: m.content,
  }))

  const requestBody = {
    model: 'llama-3.3-70b-versatile',
    max_tokens: 500,
    temperature: 0.65,
    messages: [
      { role: 'system', content: GROQ_SYSTEM_PROMPT },
      ...recentHistory,
      { role: 'user', content: message },
    ],
  }

  console.log(`[Groq] Calling API for message: "${message.slice(0, 80)}"${debugContext ? ` | context: ${debugContext}` : ''}`)

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
      signal: AbortSignal.timeout(10000), // 10s timeout
    })

    // ── Log full error details from Groq ──────────────────────────
    if (!res.ok) {
      let errorBody: any = {}
      try { errorBody = await res.json() } catch {}

      console.error(
        `[Groq] API returned HTTP ${res.status}\n` +
        `  Error type:    ${errorBody?.error?.type ?? 'unknown'}\n` +
        `  Error message: ${errorBody?.error?.message ?? JSON.stringify(errorBody)}\n` +
        `  Possible fixes:\n` +
        (res.status === 401
          ? '  → Invalid API key. Check GROQ_API_KEY in .env.local\n'
          : res.status === 429
          ? '  → Rate limit hit. Free tier = 14,400 req/day, 30 req/min\n'
          : res.status === 503
          ? '  → Groq servers down. Try again in a moment.\n'
          : `  → Unexpected status ${res.status}\n`)
      )

      return {
        reply: getGroqErrorReply(res.status, message),
        suggestions: buildGroqSuggestions(message),
      }
    }

    const data = await res.json()

    // ── Validate response shape ───────────────────────────────────
    const content = data?.choices?.[0]?.message?.content
    if (!content || typeof content !== 'string' || content.trim().length < 5) {
      console.error('[Groq] Empty or malformed response:', JSON.stringify(data).slice(0, 300))
      return {
        reply: `🎬 I got an unexpected response. Try rephrasing your question! What Tamil movie or actor are you curious about?`,
        suggestions: buildGroqSuggestions(message),
      }
    }

    const reply = content.trim()
    console.log(`[Groq] Success — ${reply.length} chars, model: ${data?.model ?? 'unknown'}`)

    return {
      reply: `🤖 ${reply}`,
      suggestions: buildGroqSuggestions(message),
    }

  } catch (err: any) {
    // ── Network / timeout errors ──────────────────────────────────
    const isTimeout = err?.name === 'TimeoutError' || err?.message?.includes('timeout')
    const isNetwork = err?.cause?.code === 'ECONNREFUSED' || err?.message?.includes('fetch failed')

    console.error(
      `[Groq] Request failed\n` +
      `  Error name:    ${err?.name ?? 'unknown'}\n` +
      `  Error message: ${err?.message ?? 'no message'}\n` +
      `  Is timeout:    ${isTimeout}\n` +
      `  Is network:    ${isNetwork}\n` +
      (isTimeout ? '  → Increase timeout or check Groq server status\n' : '') +
      (isNetwork ? '  → Check your internet connection or firewall\n' : '')
    )

    return {
      reply: isTimeout
        ? `🎬 My AI took too long to respond. Try a shorter question like "recommend an action movie" or "who is Vijay Sethupathi?"!`
        : `🎬 I couldn't reach my AI right now. Ask me about specific actors, genres, or years — I might have it in my database!`,
      suggestions: buildGroqSuggestions(message),
    }
  }
}

// ── Human-friendly error messages per HTTP status ────────────

function getGroqErrorReply(status: number, message: string): string {
  if (status === 401)
    return `🔑 My AI key seems invalid. But I can still help — ask me about a specific actor like "Vijay movies" or a genre like "best Tamil thrillers"!`
  if (status === 429)
    return `⏳ I'm answering too many questions right now (rate limit). Try again in a minute, or ask about a specific actor or genre — I'll look it up in my database!`
  if (status === 503)
    return `🔧 The AI service is temporarily down. Ask me about specific actors, genres, or years and I'll pull from my database directly!`
  return `🎬 Something went wrong on my end. Try asking about a specific Tamil movie, actor, or genre!`
}

// ── Context-aware follow-up suggestions ─────────────────────

function buildGroqSuggestions(message: string): string[] {
  const lower = message.toLowerCase()
  if (/vijay|thalapathy/i.test(lower)) return ['Best Vijay movies', 'Vijay vs Ajith', 'Lokesh Kanagaraj films']
  if (/ajith|thala/i.test(lower)) return ['Best Ajith movies', 'Vijay vs Ajith', 'Top rated films']
  if (/rajini|superstar|thalaivar/i.test(lower)) return ['Best Rajini movies', 'Rajini vs Kamal Haasan', 'Top rated films']
  if (/dhanush/i.test(lower)) return ['Best Dhanush movies', 'Vetrimaaran films', 'National Award winners']
  if (/kamal|ulaganayagan/i.test(lower)) return ['Best Kamal movies', 'Kamal Haasan vs Rajinikanth', 'Top Tamil dramas']
  if (/comedy|funny|laugh/i.test(lower)) return ['Best Tamil comedies', 'Santhanam movies', 'Vadivelu films']
  if (/action|fight|mass/i.test(lower)) return ['Best Tamil action films', 'Top rated action movies', 'Lokesh Kanagaraj films']
  if (/thriller|suspense/i.test(lower)) return ['Best Tamil thrillers', 'Vikram Vedha style movies', 'Top rated films']
  if (/horror|scary|ghost/i.test(lower)) return ['Best Tamil horror movies', 'Karthik Subbaraj films', 'Top rated films']
  if (/director|directed/i.test(lower)) return ['Lokesh Kanagaraj movies', 'Mani Ratnam films', 'Vetrimaaran films']
  if (/netflix|hotstar|amazon|ott/i.test(lower)) return ['Movies on Netflix', 'Best OTT Tamil films', 'Latest releases']
  if (/2026|2025|latest|new|recent/i.test(lower)) return ['Latest Tamil movies', 'Top 2025 films', 'Best recent releases']
  return ['Best action movies', 'Top rated films', 'Recommend something']
}

// ═══════════════════════════════════════════════════════════════
// MAIN RESPONSE ENGINE
// ═══════════════════════════════════════════════════════════════

async function generateResponse(
  message: string,
  history: { role: string; content: string }[]
): Promise<{ reply: string; suggestions: string[] }> {
  const e = extractEntities(message)
  const intent = classifyIntent(message, e)

  console.log(`[Intent] "${message.slice(0, 60)}" → ${intent} | actors:${e.actors} genres:${e.genres} years:${e.years}`)

  // ── Greeting ──────────────────────────────────────────────
  if (intent === 'greeting') {
    return {
      reply: pick([
        `🎬 Welcome to TamilCinemaHub! I know 1,600+ Tamil movies — actors, directors, genres, OTT platforms, ratings, and more.\n\nJust ask naturally! What are you looking for today?`,
        `🌟 Hello! Ready to explore Tamil cinema?\n\nAsk me anything — "Vijay movies", "best thrillers", "what's on Netflix", "suggest something funny". What would you like to watch?`,
        `🎭 Vanakkam! Your Tamil cinema guide is here.\n\nTry asking: "top action movies", "Mani Ratnam films", "latest 2026 releases". What's on your mind?`,
      ]),
      suggestions: ['Best action movies', 'Vijay films', 'Top rated Tamil films'],
    }
  }

  // ── How are you ───────────────────────────────────────────
  if (intent === 'howru') {
    return {
      reply: pick([
        `😄 Doing great! Powered by pure Tamil cinema knowledge. What are we watching today?`,
        `🤩 All good! Always excited to talk Tamil films. What are you looking for?`,
        `😎 Fantastic! Ready to explore Tamil cinema. What's on your mind?`,
      ]),
      suggestions: ['Best 2026 movies', 'Recommend something', 'Vijay vs Ajith'],
    }
  }

  // ── Thanks ────────────────────────────────────────────────
  if (intent === 'thanks') {
    return {
      reply: pick([
        `🙏 You're welcome! Enjoy the film! 🎬`,
        `😊 Happy to help! Hope you enjoy it!`,
        `🎉 Anytime! Come back for more recommendations!`,
      ]),
      suggestions: ['More recommendations', 'Top rated films', 'Latest releases'],
    }
  }

  // ── Help ──────────────────────────────────────────────────
  if (intent === 'help') {
    return {
      reply: `📖 **What I can help with:**\n\n🎭 **Actor films** — "Vijay movies", "Dhanush films"\n🎬 **Director works** — "Lokesh Kanagaraj movies"\n🏷️ **Genre** — "best action movies", "suggest a thriller"\n📅 **Year** — "best movies of 2022", "2019 to 2023 films"\n⭐ **Rating** — "movies rated above 4"\n📺 **Streaming** — "Tamil movies on Netflix"\n🔄 **Compare** — "Vijay vs Ajith"\n🎯 **Mood** — "something funny", "something emotional"\n🌐 **Anything else** — I'll use AI to answer!\n\nJust ask naturally — I understand plain English!`,
      suggestions: ['Best thriller films', 'Vijay movies', 'Movies by Mani Ratnam'],
    }
  }

  // ── Trivia ────────────────────────────────────────────────
  if (intent === 'trivia') {
    const triviaKey = [...e.actors, ...e.directors].find(k => TRIVIA[k])
    if (triviaKey) {
      const label = titleCase(ACTOR_CANONICAL[triviaKey] ?? triviaKey)
      return {
        reply: `🎭 ${TRIVIA[triviaKey]}\n\nWould you like to see their movies?`,
        suggestions: [`${label} movies`, 'Top rated films', 'Recommend something'],
      }
    }
    // No local trivia — Groq knows the answer
    return await askGroq(message, history, 'trivia fallback')
  }

  // ── Comparison ────────────────────────────────────────────
  if (intent === 'comparison') {
    const [k1, k2] = e.actors.length >= 2 ? [e.actors[0], e.actors[1]] : [e.actors[0] ?? '', e.directors[0] ?? '']
    const [m1, m2] = await Promise.all([
      k1 ? db.byActor(k1, 4).catch(() => []) : Promise.resolve([]),
      k2 ? db.byActor(k2, 4).catch(() => []) : Promise.resolve([]),
    ])
    const fmtCompare = (key: string, movies: any[]) => {
      const label = titleCase(ACTOR_CANONICAL[key] ?? key)
      if (!movies.length) return `No results found for ${label}.`
      let s = `── ${label} ──\n`
      movies.forEach(m => {
        s += `• [${m.title}](/movies/${m.slug}) (${m.year})  ⭐ ${m.rating != null ? m.rating.toFixed(1) : 'N/A'}/5\n`
        if (m.director) s += `  🎬 ${m.director}\n`
      })
      return s
    }
    const l1 = titleCase(ACTOR_CANONICAL[k1] ?? k1)
    const l2 = titleCase(ACTOR_CANONICAL[k2] ?? k2)
    return {
      reply: `🔄 **${l1} vs ${l2}**\n\n${fmtCompare(k1, m1)}\n\n${fmtCompare(k2, m2)}\n\nWant to explore either filmography in more detail?`,
      suggestions: [`${l1} best movies`, `${l2} best movies`, 'Top rated films'],
    }
  }

  // ── OTT ───────────────────────────────────────────────────
  if (intent === 'ott') {
    const platform = e.otts[0]
    const movies = await db.byOTT(platform, 7).catch(() => [])
    if (movies.length) {
      return {
        reply: fmtList(movies, `📺 Tamil movies on ${titleCase(platform)}:`),
        suggestions: buildSuggestions(e, movies),
      }
    }
    return await askGroq(message, history, `OTT:${platform} not in DB`)
  }

  // ── Rating filter ─────────────────────────────────────────
  if (intent === 'rating_filter' && e.ratings) {
    const { min, max } = e.ratings
    const movies = await db.byRating(min, max, 7).catch(() => [])
    if (movies.length) {
      return {
        reply: fmtList(movies, `⭐ Movies rated ${min}${max < 5 ? `–${max}` : '+'}:`),
        suggestions: buildSuggestions(e, movies),
      }
    }
    return await askGroq(message, history, `rating ${min}-${max} not in DB`)
  }

  // ── Actor + Genre ─────────────────────────────────────────
  if (intent === 'actor_genre') {
    const actor = e.actors[0]
    const genre = e.genres[0]
    const actorLabel = titleCase(ACTOR_CANONICAL[actor] ?? actor)
    const movies = await db.byActorAndGenre(actor, genre, 7).catch(() => [])
    if (movies.length) {
      return {
        reply: fmtList(movies, pick([
          `🎭 ${actorLabel} in ${genre}:`,
          `🔥 Best ${genre.toLowerCase()} films starring ${actorLabel}:`,
          `🎬 ${actorLabel}'s top ${genre.toLowerCase()} movies:`,
        ])),
        suggestions: buildSuggestions(e, movies),
      }
    }
    const actorMovies = await db.byActor(actor, 7).catch(() => [])
    if (actorMovies.length) {
      return {
        reply: fmtList(actorMovies, `🎭 ${actorLabel} movies (no ${genre} filter match found):`),
        suggestions: buildSuggestions(e, actorMovies),
      }
    }
    return await askGroq(message, history, `actor_genre:${actor}+${genre} not in DB`)
  }

  // ── Actor ─────────────────────────────────────────────────
  if (intent === 'actor') {
    const actor = e.actors[0]
    const actorLabel = titleCase(ACTOR_CANONICAL[actor] ?? actor)
    if (e.years.length) {
      const all = await db.byActor(actor, 20).catch(() => [])
      const filtered = all.filter((m: any) => m.year === e.years[0])
      if (filtered.length) {
        return {
          reply: fmtList(filtered, `🎭 ${actorLabel} movies from ${e.years[0]}:`),
          suggestions: buildSuggestions(e, filtered),
        }
      }
    }
    const movies = await db.byActor(actor, 8).catch(() => [])
    if (movies.length) {
      return {
        reply: fmtList(movies, pick([
          `🎭 Movies featuring ${actorLabel}:`,
          `🌟 ${actorLabel}'s filmography:`,
          `🎬 Top ${actorLabel} movies:`,
        ])),
        suggestions: buildSuggestions(e, movies),
      }
    }
    const searched = await db.search(ACTOR_CANONICAL[actor] ?? actor, 5).catch(() => [])
    if (searched.length) {
      return {
        reply: fmtList(searched, `🔍 Results for "${actorLabel}":`),
        suggestions: buildSuggestions(e, searched),
      }
    }
    return await askGroq(message, history, `actor:${actor} not in DB`)
  }

  // ── Director ──────────────────────────────────────────────
  if (intent === 'director') {
    const dir = e.directors[0]
    const dirLabel = titleCase(dir)
    const movies = await db.byDirector(dir, 7).catch(() => [])
    if (movies.length) {
      return {
        reply: fmtList(movies, pick([
          `🎬 Filmography of ${dirLabel}:`,
          `🎥 ${dirLabel}'s movies:`,
          `🎭 Films directed by ${dirLabel}:`,
        ])),
        suggestions: buildSuggestions(e, movies),
      }
    }
    const searched = await db.search(dir, 5).catch(() => [])
    if (searched.length) {
      return {
        reply: fmtList(searched, `🔍 Results for "${dirLabel}":`),
        suggestions: buildSuggestions(e, searched),
      }
    }
    return await askGroq(message, history, `director:${dir} not in DB`)
  }

  // ── Year range ────────────────────────────────────────────
  if (intent === 'year_range' && e.yearRange) {
    const [from, to] = e.yearRange
    const movies = await db.byYearRange(from, to, 8).catch(() => [])
    if (movies.length) {
      return {
        reply: fmtList(movies, pick([
          `📅 Tamil movies from ${from} to ${to}:`,
          `🏆 Best of ${from}–${to}:`,
        ])),
        suggestions: buildSuggestions(e, movies),
      }
    }
    return await askGroq(message, history, `year_range:${from}-${to} not in DB`)
  }

  // ── Genre (+ optional year) ───────────────────────────────
  if (intent === 'genre') {
    const genre = e.genres[0]
    if (e.years.length) {
      const movies = await db.byGenreAndYear(genre, e.years[0], 7).catch(() => [])
      if (movies.length) {
        return {
          reply: fmtList(movies, `🏷️ ${genre} movies from ${e.years[0]}:`),
          suggestions: buildSuggestions(e, movies),
        }
      }
    }
    const movies = await db.byGenre(genre, 7).catch(() => [])
    if (movies.length) {
      return {
        reply: fmtList(movies, pick([
          `🏷️ Best ${genre} movies:`,
          `💥 Top ${genre.toLowerCase()} picks for you:`,
          `🎬 Must-watch ${genre.toLowerCase()} films:`,
        ])),
        suggestions: buildSuggestions(e, movies),
      }
    }
    return await askGroq(message, history, `genre:${genre} not in DB`)
  }

  // ── Year ──────────────────────────────────────────────────
  if (intent === 'year') {
    const year = e.years[0]
    const movies = await db.byYear(year, 7).catch(() => [])
    if (movies.length) {
      return {
        reply: fmtList(movies, pick([
          `📅 Tamil movies from ${year}:`,
          `🏆 Best Tamil films of ${year}:`,
        ])),
        suggestions: buildSuggestions(e, movies),
      }
    }
    return await askGroq(message, history, `year:${year} not in DB`)
  }

  // ── Top rated ─────────────────────────────────────────────
  if (intent === 'top_rated') {
    const movies = await db.topRated(8).catch(() => [])
    if (movies.length) {
      return {
        reply: fmtList(movies, pick([
          `🏆 Highest-rated Tamil movies:`,
          `🌟 The best of Tamil cinema:`,
          `💎 Tamil cinema masterpieces:`,
        ])),
        suggestions: buildSuggestions(e, movies),
      }
    }
    return await askGroq(message, history, 'top_rated DB empty')
  }

  // ── Recent ────────────────────────────────────────────────
  if (intent === 'recent') {
    const movies = await db.recent(8).catch(() => [])
    if (movies.length) {
      return {
        reply: fmtList(movies, pick([
          `🆕 Latest Tamil releases:`,
          `🎬 Fresh from Tamil cinema:`,
          `📽️ What's new in Tamil cinema:`,
        ])),
        suggestions: buildSuggestions(e, movies),
      }
    }
    return await askGroq(message, history, 'recent DB empty')
  }

  // ── Recommend ─────────────────────────────────────────────
  if (intent === 'recommend') {
    const movies = await db.topRated(7).catch(() => [])
    if (movies.length) {
      return {
        reply: fmtList(movies, pick([
          `✨ My top picks for you:`,
          `🎯 Handpicked for you:`,
          `🌟 You can't go wrong with these:`,
        ])),
        suggestions: buildSuggestions(e, movies),
      }
    }
    return await askGroq(message, history, 'recommend DB empty')
  }

  // ── Movie detail ──────────────────────────────────────────
  if (intent === 'movie_detail') {
    const q = e.keywords.join(' ') || message.trim()
    if (q) {
      const movies = await db.search(q, 3).catch(() => [])
      if (movies.length === 1) {
        return {
          reply: fmtDetail(movies[0]),
          suggestions: [
            `More ${movies[0].genre?.[0] ?? 'similar'} movies`,
            `Movies by ${movies[0].director ?? 'this director'}`,
            'Top rated films',
          ],
        }
      }
      if (movies.length > 1) {
        return {
          reply: fmtList(movies, `🔍 Found these matching "${q}":`),
          suggestions: buildSuggestions(e, movies),
        }
      }
    }
    return await askGroq(message, history, `movie_detail:${e.keywords.join(' ')} not in DB`)
  }

  // ── Keyword search ────────────────────────────────────────
  if (intent === 'search' && e.keywords.length > 0) {
    const q = e.keywords.join(' ')
    const movies = await db.search(q, 6).catch(() => [])
    if (movies.length === 1) {
      return {
        reply: fmtDetail(movies[0]),
        suggestions: [
          `More ${movies[0].genre?.[0] ?? 'similar'} movies`,
          `Movies by ${movies[0].director ?? 'this director'}`,
          'Top rated films',
        ],
      }
    }
    if (movies.length > 1) {
      return {
        reply: fmtList(movies, pick([
          `🔍 Results for "${q}":`,
          `📽️ Found these for "${q}":`,
        ])),
        suggestions: buildSuggestions(e, movies),
      }
    }
    return await askGroq(message, history, `search:${q} not in DB`)
  }

  // ── Context follow-up ("show more", "another one") ────────
  if (/\b(more|another|similar|else|other|next)\b/i.test(message) && history.length >= 2) {
    const lastAI = [...history].reverse().find(m => m.role === 'assistant')
    if (lastAI) {
      const ctx = extractEntities(lastAI.content.slice(0, 500))
      if (ctx.actors[0]) {
        const movies = await db.byActor(ctx.actors[0], 6).catch(() => [])
        const label = titleCase(ACTOR_CANONICAL[ctx.actors[0]] ?? ctx.actors[0])
        if (movies.length) return { reply: fmtList(movies, `🎭 More ${label} movies:`), suggestions: buildSuggestions(ctx, movies) }
      }
      if (ctx.genres[0]) {
        const movies = await db.byGenre(ctx.genres[0], 6).catch(() => [])
        if (movies.length) return { reply: fmtList(movies, `🏷️ More ${ctx.genres[0]} movies:`), suggestions: buildSuggestions(ctx, movies) }
      }
    }
  }

  // ── Final fallback: Groq AI ───────────────────────────────
  return await askGroq(message, history, `intent:${intent} no DB match`)
}

// ═══════════════════════════════════════════════════════════════
// RATE LIMITER (in-memory, 30 req/min per IP)
// ═══════════════════════════════════════════════════════════════

const RL_MAP = new Map<string, { count: number; start: number }>()

function checkRateLimit(ip: string): { ok: boolean; retryAfter: number } {
  const WINDOW = 60_000
  const MAX = 30
  const now = Date.now()
  const entry = RL_MAP.get(ip)
  if (!entry || now - entry.start > WINDOW) {
    RL_MAP.set(ip, { count: 1, start: now })
    return { ok: true, retryAfter: 0 }
  }
  entry.count++
  if (entry.count > MAX) {
    return { ok: false, retryAfter: Math.ceil((entry.start + WINDOW - now) / 1000) }
  }
  return { ok: true, retryAfter: 0 }
}

// ═══════════════════════════════════════════════════════════════
// DEBUG ENDPOINT — add ?debug=1 to any POST to see DB health
// Remove this in production
// ═══════════════════════════════════════════════════════════════

async function handleDebug(): Promise<NextResponse> {
  const results: Record<string, any> = {}

  try {
    results.movieCount = await db.count()
    results.topRated = (await db.topRated(3)).map((m: any) => ({ title: m.title, year: m.year, rating: m.rating }))
    results.recent = (await db.recent(3)).map((m: any) => ({ title: m.title, year: m.year }))
    results.groqKeySet = !!process.env.GROQ_API_KEY
    results.status = 'ok'
  } catch (err: any) {
    results.status = 'error'
    results.error = err?.message
    results.hint = 'Sanity client is likely misconfigured. Check projectId, dataset, and apiVersion in your sanity client file.'
  }

  return NextResponse.json(results)
}

// ═══════════════════════════════════════════════════════════════
// API ROUTE HANDLER
// ═══════════════════════════════════════════════════════════════

export async function POST(req: NextRequest) {
  // Debug mode — POST /api/chat?debug=1
  const url = new URL(req.url)
  if (url.searchParams.get('debug') === '1') {
    return await handleDebug()
  }

  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'

  const { ok, retryAfter } = checkRateLimit(ip)
  if (!ok) {
    return NextResponse.json(
      { error: `Rate limit exceeded. Please try again in ${retryAfter} seconds.`, retryAfter },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } }
    )
  }

  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 })
  }

  const { messages = [] } = body
  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: 'A non-empty messages array is required.' }, { status: 400 })
  }

  const lastMsg: string = messages.filter((m: any) => m.role === 'user').pop()?.content ?? ''
  if (!lastMsg.trim()) {
    return NextResponse.json({ error: 'Message content cannot be empty.' }, { status: 400 })
  }

  const history = messages.slice(-8)

  try {
    const { reply, suggestions } = await generateResponse(lastMsg, history)
    return NextResponse.json({ reply, suggestions, provider: 'TamilCinemaHub AI' })
  } catch (err: any) {
    console.error('[TamilCinemaHub] Unhandled error in generateResponse:', err?.message, err?.stack)
    try {
      // Last-resort Groq call with minimal context
      const fallback = await askGroq(lastMsg, [], 'top-level error recovery')
      return NextResponse.json({ ...fallback, provider: 'TamilCinemaHub AI' })
    } catch (finalErr: any) {
      console.error('[TamilCinemaHub] Final fallback also failed:', finalErr?.message)
      return NextResponse.json(
        {
          reply: `🎬 Something went wrong! Please try again.\n\nTry: "Best action movies", "Vijay films", "Movies from 2024"`,
          suggestions: ['Action movies', 'Vijay movies', 'Top rated films'],
          provider: 'TamilCinemaHub AI',
        },
        { status: 200 }
      )
    }
  }
}