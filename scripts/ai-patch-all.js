require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@sanity/client')
const fetch = (...args) => import('node-fetch').then(({ default: f }) => f(...args))

// ── Sanity client ──────────────────────────────────────────────
const sanity = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_WRITE_TOKEN,
  useCdn: false,
})

const TMDB_KEY = process.env.TMDB_API_KEY
const TMDB_IMG = 'https://image.tmdb.org/t/p/w500'

function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

let textPatched = 0, imagePatched = 0, skipped = 0, failed = 0, retried = 0

// ── Fetch with retry (handles TMDB timeouts) ──────────────────
async function fetchWithRetry(url, opts = {}, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, opts)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return res
    } catch (err) {
      if (attempt < retries) {
        const delay = attempt * 2000 // 2s, 4s, 6s
        console.log(`    ⏳ Retry ${attempt}/${retries} in ${delay / 1000}s (${err.message})`)
        retried++
        await sleep(delay)
      } else {
        throw err
      }
    }
  }
}

// ── AI Providers (fallback chain) ─────────────────────────────
async function askGemini(prompt) {
  const res = await fetchWithRetry(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: prompt }] }] })
    }
  )
  const data = await res.json()
  return data.candidates[0].content.parts[0].text
}

async function askGroq(prompt) {
  const res = await fetchWithRetry('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 500,
    })
  })
  const data = await res.json()
  return data.choices[0].message.content
}

async function askCerebras(prompt) {
  const res = await fetchWithRetry('https://api.cerebras.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.CEREBRAS_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama3.1-8b',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 500,
    })
  })
  const data = await res.json()
  return data.choices[0].message.content
}

async function askOpenRouter(prompt) {
  const res = await fetchWithRetry('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'mistralai/mistral-7b-instruct:free',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 500,
    })
  })
  const data = await res.json()
  return data.choices[0].message.content
}

async function askHuggingFace(prompt) {
  const res = await fetchWithRetry(
    'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2/v1/chat/completions',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'mistralai/Mistral-7B-Instruct-v0.2',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 500,
      })
    }
  )
  const data = await res.json()
  return data.choices[0].message.content
}

async function askAI(prompt) {
  const providers = [
    { name: 'Gemini',      fn: askGemini },
    { name: 'Groq',        fn: askGroq },
    { name: 'Cerebras',    fn: askCerebras },
    { name: 'OpenRouter',  fn: askOpenRouter },
    { name: 'HuggingFace', fn: askHuggingFace },
  ]

  for (const p of providers) {
    try {
      const result = await p.fn(prompt)
      return { text: result, provider: p.name }
    } catch (err) {
      console.log(`    ${p.name} failed (${err.message}), trying next...`)
    }
  }
  throw new Error('All AI providers failed')
}

function parseJSON(text) {
  try {
    const match = text.match(/\{[\s\S]*\}/)
    if (!match) return null
    return JSON.parse(match[0])
  } catch { return null }
}

// ── AI prompt for missing text fields ─────────────────────────
function buildPrompt(movie, missing) {
  return `You are a Tamil cinema expert. Give accurate data for this Tamil movie.

Movie: "${movie.title}"
Year: ${movie.year || 'unknown'}
Fields needed: ${missing.join(', ')}

Reply ONLY in this exact JSON format, no explanation, no markdown:
{
  "director": "director full name",
  "ottPlatform": "Netflix or Amazon Prime or Disney+ Hotstar or Sun NXT or Zee5 or Aha or YouTube or unknown",
  "rating": 3.5,
  "synopsis": "2-3 sentence plot summary in English",
  "confident": true
}

IMPORTANT: If you are not sure about this specific movie, set "confident": false. Do not guess.
For OTT platform, if you know the movie is available on any streaming platform, list it. If unsure, say "unknown".`
}

// ── Image upload helper ───────────────────────────────────────
async function uploadImage(url, filename) {
  const imgRes = await fetchWithRetry(url)
  const buffer = await imgRes.buffer()
  const asset = await sanity.assets.upload('image', buffer, {
    filename,
    contentType: 'image/jpeg',
  })
  return { _type: 'image', asset: { _type: 'reference', _ref: asset._id } }
}

// ── Process one movie ─────────────────────────────────────────
async function processMovie(movie, num, total) {
  const label = `[${num}/${total}] ${movie.title} (${movie.year || '?'})`
  console.log(label)

  // --- 1. Detect missing text fields ---
  const missingText = []
  if (!movie.director || movie.director === '') missingText.push('director')
  if (!movie.ottPlatform || movie.ottPlatform === '') missingText.push('ottPlatform')
  if (!movie.rating) missingText.push('rating')
  if (!movie.synopsis || movie.synopsis === '') missingText.push('synopsis')

  // --- 2. Detect missing images ---
  const needsPoster = !movie.hasPoster
  const needsBackdrop = !movie.hasBackdrop

  if (missingText.length === 0 && !needsPoster && !needsBackdrop) {
    console.log(`  ✓ Already complete, skipping`)
    skipped++
    return
  }

  const patch = sanity.patch(movie._id)
  let didText = false
  let didImage = false

  // --- 3. AI text patching ---
  if (missingText.length > 0) {
    try {
      const { text, provider } = await askAI(buildPrompt(movie, missingText))
      const parsed = parseJSON(text)

      if (parsed && parsed.confident) {
        const patched = []
        if (missingText.includes('director') && parsed.director && parsed.director !== '') {
          patch.set({ director: parsed.director })
          patched.push('director')
        }
        if (missingText.includes('ottPlatform') && parsed.ottPlatform && parsed.ottPlatform !== 'unknown') {
          patch.set({ ottPlatform: parsed.ottPlatform })
          patched.push('ottPlatform')
        }
        if (missingText.includes('rating') && parsed.rating) {
          patch.set({ rating: parsed.rating })
          patched.push('rating')
        }
        if (missingText.includes('synopsis') && parsed.synopsis) {
          patch.set({ synopsis: parsed.synopsis })
          patched.push('synopsis')
        }
        if (patched.length > 0) {
          console.log(`  📝 [${provider}] Text: ${patched.join(', ')}`)
          didText = true
        }
      } else {
        console.log(`  ⚠️  AI not confident, skipping text fields`)
      }
    } catch (err) {
      console.log(`  ❌ AI error: ${err.message}`)
    }
  }

  // --- 4. TMDB image patching (with retry) ---
  if ((needsPoster || needsBackdrop) && movie.tmdbId) {
    try {
      await sleep(500) // rate-limit TMDB
      const tmdbRes = await fetchWithRetry(
        `https://api.themoviedb.org/3/movie/${movie.tmdbId}?api_key=${TMDB_KEY}`
      )
      const tmdbData = await tmdbRes.json()

      if (needsPoster && tmdbData.poster_path) {
        try {
          const poster = await uploadImage(
            `${TMDB_IMG}${tmdbData.poster_path}`,
            `poster-${movie.tmdbId}.jpg`
          )
          patch.set({ poster })
          console.log(`  🖼️  Poster uploaded`)
          didImage = true
          await sleep(300)
        } catch (err) {
          console.log(`  ❌ Poster failed: ${err.message}`)
        }
      }

      if (needsBackdrop && tmdbData.backdrop_path) {
        try {
          const backdrop = await uploadImage(
            `${TMDB_IMG}${tmdbData.backdrop_path}`,
            `backdrop-${movie.tmdbId}.jpg`
          )
          patch.set({ backdropImage: backdrop })
          console.log(`  🖼️  Backdrop uploaded`)
          didImage = true
          await sleep(300)
        } catch (err) {
          console.log(`  ❌ Backdrop failed: ${err.message}`)
        }
      }
    } catch (err) {
      console.log(`  ❌ TMDB error: ${err.message}`)
    }
  } else if ((needsPoster || needsBackdrop) && !movie.tmdbId) {
    console.log(`  ⚠️  No TMDB ID, cannot fetch images`)
  }

  // --- 5. Commit all patches at once ---
  if (didText || didImage) {
    try {
      await patch.commit()
      if (didText) textPatched++
      if (didImage) imagePatched++
    } catch (err) {
      console.log(`  ❌ Commit failed: ${err.message}`)
      failed++
      return
    }
  }
}

// ── Main ──────────────────────────────────────────────────────
async function main() {
  console.log('🎬 Starting AI Patch All v2 (text + images, with retry)...\n')

  if (!TMDB_KEY) {
    console.error('❌ TMDB_API_KEY not found in .env.local')
    process.exit(1)
  }

  // Fetch movies missing ANY text field OR missing images
  const movies = await sanity.fetch(`
    *[_type == "movie" && (
      !defined(director) || director == "" ||
      !defined(ottPlatform) || ottPlatform == "" ||
      !defined(rating) ||
      !defined(synopsis) || synopsis == "" ||
      !defined(poster) ||
      !defined(backdropImage)
    )] | order(year asc) {
      _id, title, year, director, ottPlatform, rating, synopsis, tmdbId,
      "hasPoster": defined(poster),
      "hasBackdrop": defined(backdropImage)
    }
  `)

  console.log(`Found ${movies.length} movies needing text or images\n`)

  if (movies.length === 0) {
    console.log('✅ All movies are complete!')
    return
  }

  // Process ONE at a time for reliability (avoids TMDB rate-limit)
  for (let i = 0; i < movies.length; i++) {
    await processMovie(movies[i], i + 1, movies.length)

    if ((i + 1) % 50 === 0) {
      console.log(`\n📊 Progress: 📝 ${textPatched} text | 🖼️ ${imagePatched} images | ⚠️ ${skipped} skipped | ❌ ${failed} failed | 🔄 ${retried} retries\n`)
    }

    await sleep(2000) // 2s between each movie — slower but reliable
  }

  console.log(`\n${'='.repeat(50)}`)
  console.log('🎉 DONE!')
  console.log(`📝 Text patched:   ${textPatched} movies`)
  console.log(`🖼️  Images patched: ${imagePatched} movies`)
  console.log(`⚠️  Skipped:       ${skipped} movies (already complete)`)
  console.log(`❌ Failed:         ${failed} movies`)
  console.log(`🔄 Retries:        ${retried} times`)
  console.log('='.repeat(50))
}

main().catch(console.error)
