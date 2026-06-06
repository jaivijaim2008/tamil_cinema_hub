import { NextRequest, NextResponse } from 'next/server'

// ── In-memory rate limiter ─────────────────────────────────────────────────
// Tracks requests per IP. Sliding window: max 20 requests per 60 seconds.
const RATE_LIMIT_WINDOW_MS = 60_000
const RATE_LIMIT_MAX = 20
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

// Periodic cleanup every 5 minutes to prevent unbounded memory growth
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of rateLimitMap) {
    if (now - entry.windowStart > RATE_LIMIT_WINDOW_MS * 2) {
      rateLimitMap.delete(key)
    }
  }
}, 300_000)

// ── Structured logger for Vercel Function Logs ───────────────────────────
function log(level: 'info' | 'warn' | 'error', msg: string, data?: Record<string, any>) {
  const entry = { time: new Date().toISOString(), level, msg, ...data }
  if (level === 'error') console.error(JSON.stringify(entry))
  else if (level === 'warn') console.warn(JSON.stringify(entry))
  else console.log(JSON.stringify(entry))
}

const SYSTEM_PROMPT = `You are TamilCinemaHub AI, an expert Tamil cinema assistant.

You know every Tamil movie from 2000 to 2026 including cast, directors, plots, ratings, and OTT platforms.

Always reply in clear, simple English that anyone can understand.
Be friendly, helpful, and enthusiastic about Tamil cinema.
Give detailed and accurate information about movies, actors, and directors.
When recommending movies, explain why someone would enjoy them.
Keep responses concise but informative.

You can help with:
- Movie recommendations based on genre, actor, or director
- Movie plot summaries and reviews
- Actor and director filmographies
- OTT platform availability
- Comparing movies
- Answering trivia about Tamil cinema`

const providers = [
  {
    name: 'Gemini',
    call: async (messages: any[]) => {
      // Gemini requires contents to start with 'user' role and alternate user/model
      // Ensure first message is always 'user'
      let mapped = messages.map((m: any) => ({
        role: m.role === 'assistant' ? 'model' as const : 'user' as const,
        parts: [{ text: m.content }]
      }))
      // Drop leading model messages and merge consecutive same-role messages
      while (mapped.length > 0 && mapped[0].role !== 'user') {
        mapped = mapped.slice(1)
      }
      mapped = mapped.reduce((acc: typeof mapped, cur) => {
        if (acc.length && acc[acc.length - 1].role === cur.role) {
          acc[acc.length - 1].parts[0].text += '\n' + cur.parts[0].text
        } else {
          acc.push(cur)
        }
        return acc
      }, [])
      if (mapped.length === 0) return null // No user message to send
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
            contents: mapped
          })
        }
      )
      if (!res.ok) throw new Error(`Gemini error: ${res.status}`)
      const data = await res.json()
      return data.candidates[0].content.parts[0].text
    }
  },
  {
    name: 'Groq',
    call: async (messages: any[]) => {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
          max_tokens: 1024,
        }),
      })
      if (!res.ok) throw new Error(`Groq error: ${res.status}`)
      const data = await res.json()
      return data.choices[0].message.content
    }
  },
  {
    name: 'Cerebras',
    call: async (messages: any[]) => {
      const res = await fetch('https://api.cerebras.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.CEREBRAS_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama3.1-8b',
          messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
          max_tokens: 1024,
        }),
      })
      if (!res.ok) throw new Error(`Cerebras error: ${res.status}`)
      const data = await res.json()
      return data.choices[0].message.content
    }
  },
  {
    name: 'OpenRouter',
    call: async (messages: any[]) => {
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://tamilcinema-website.vercel.app',
          'X-Title': 'TamilCinemaHub',
        },
        body: JSON.stringify({
          model: 'mistralai/mistral-7b-instruct',
          messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
          max_tokens: 1024,
        }),
      })
      if (!res.ok) throw new Error(`OpenRouter error: ${res.status}`)
      const data = await res.json()
      return data.choices[0].message.content
    }
  },
  {
    name: 'HuggingFace',
    call: async (messages: any[]) => {
      const lastMessage = messages[messages.length - 1].content
      const res = await fetch(
        'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            inputs: `${SYSTEM_PROMPT}\n\nUser: ${lastMessage}\nAssistant:`,
            parameters: { max_new_tokens: 512, return_full_text: false }
          })
        }
      )
      if (!res.ok) throw new Error(`HuggingFace error: ${res.status}`)
      const data = await res.json()
      return data[0].generated_text
    }
  },
  {
    name: 'Replicate',
    call: async (messages: any[]) => {
      const lastMessage = messages[messages.length - 1].content
      const res = await fetch('https://api.replicate.com/v1/models/meta/meta-llama-3-8b-instruct/predictions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.REPLICATE_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: {
            prompt: lastMessage,
            system_prompt: SYSTEM_PROMPT,
            max_tokens: 512,
          }
        })
      })
      if (!res.ok) throw new Error(`Replicate error: ${res.status}`)
      const data = await res.json()
      let result = data
      while (result.status !== 'succeeded' && result.status !== 'failed') {
        await new Promise(r => setTimeout(r, 1000))
        const poll = await fetch(result.urls.get, {
          headers: { 'Authorization': `Bearer ${process.env.REPLICATE_API_TOKEN}` }
        })
        result = await poll.json()
      }
      if (result.status === 'failed') throw new Error('Replicate prediction failed')
      return result.output.join('')
    }
  }
]

export async function POST(req: NextRequest) {
  // ── Rate limit check ──
  const ip = getRateLimitKey(req)
  const { ok, retryAfter } = checkRateLimit(ip)
  if (!ok) {
    return NextResponse.json(
      { error: `Rate limit exceeded. Try again in ${retryAfter} seconds.` },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } }
    )
  }

  const { messages } = await req.json()
  const errors: { provider: string; message: string; status?: number }[] = []
  const msgCount = messages?.length ?? 0
  const lastUserMsg = messages?.filter((m: any) => m.role === 'user').pop()?.content?.slice(0, 80) ?? ''

  log('info', 'Chat request received', { ip, msgCount, lastUserMsg })

  // First attempt
  for (const provider of providers) {
    try {
      log('info', `Trying ${provider.name}`, { msgCount })
      const reply = await provider.call(messages)
      if (reply && reply.trim().length > 0) {
        log('info', `Success with ${provider.name}`, { replyLen: reply.length })
        return NextResponse.json({ reply, provider: provider.name })
      }
      throw new Error('Empty response')
    } catch (err: any) {
      const statusMatch = err.message?.match(/(\d{3})/)
      const status = statusMatch ? parseInt(statusMatch[1]) : undefined
      log('warn', `${provider.name} failed`, { error: err.message, status, attempt: 1 })
      errors.push({ provider: provider.name, message: err.message, status })
      await new Promise(r => setTimeout(r, 300))
      continue
    }
  }

  // Auto retry after 2 seconds
  log('warn', 'All providers failed on first attempt, retrying in 2s', { errors: errors.map(e => `${e.provider}: ${e.message}`) })
  await new Promise(r => setTimeout(r, 2000))

  for (const provider of providers) {
    try {
      const reply = await provider.call(messages)
      if (reply && reply.trim().length > 0) {
        log('info', `Retry success with ${provider.name}`, { replyLen: reply.length })
        return NextResponse.json({ reply, provider: provider.name })
      }
    } catch (err: any) {
      const statusMatch = err.message?.match(/(\d{3})/)
      const status = statusMatch ? parseInt(statusMatch[1]) : undefined
      log('warn', `Retry ${provider.name} failed`, { error: err.message, status, attempt: 2 })
      errors.push({ provider: provider.name, message: err.message, status })
      continue
    }
  }

  log('error', 'All providers exhausted', { errors, msgCount, lastUserMsg })
  return NextResponse.json(
    {
      error: 'All AI providers are currently busy. Please try again in a moment.',
      details: errors.map(e => `${e.provider}: ${e.message}`)
    },
    { status: 503 }
  )
}