import { NextResponse } from 'next/server'

// ── Lightweight health check for chat API providers ─────────────────────────
// GET /api/health → returns which keys are set and which providers respond

const PROVIDERS = [
  {
    name: 'Gemini',
    key: 'GEMINI_API_KEY',
    check: async (key: string) => {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`,
        { method: 'GET' }
      )
      return { ok: res.ok, status: res.status }
    },
  },
  {
    name: 'Groq',
    key: 'GROQ_API_KEY',
    check: async (key: string) => {
      const res = await fetch('https://api.groq.com/openai/v1/models', {
        headers: { Authorization: `Bearer ${key}` },
      })
      return { ok: res.ok, status: res.status }
    },
  },
  {
    name: 'Cerebras',
    key: 'CEREBRAS_API_KEY',
    check: async (key: string) => {
      const res = await fetch('https://api.cerebras.ai/v1/models', {
        headers: { Authorization: `Bearer ${key}` },
      })
      return { ok: res.ok, status: res.status }
    },
  },
  {
    name: 'OpenRouter',
    key: 'OPENROUTER_API_KEY',
    check: async (key: string) => {
      const res = await fetch('https://openrouter.ai/api/v1/models', {
        headers: { Authorization: `Bearer ${key}` },
      })
      return { ok: res.ok, status: res.status }
    },
  },
  {
    name: 'HuggingFace',
    key: 'HUGGINGFACE_API_KEY',
    check: async (key: string) => {
      const res = await fetch('https://huggingface.co/api/whoami-v2', {
        headers: { Authorization: `Bearer ${key}` },
      })
      return { ok: res.ok, status: res.status }
    },
  },
  {
    name: 'Replicate',
    key: 'REPLICATE_API_TOKEN',
    check: async (key: string) => {
      const res = await fetch('https://api.replicate.com/v1/account', {
        headers: { Authorization: `Bearer ${key}` },
      })
      return { ok: res.ok, status: res.status }
    },
  },
]

export async function GET() {
  const results = await Promise.all(
    PROVIDERS.map(async (p) => {
      const key = process.env[p.key]
      const configured = !!key && key.length > 0

      if (!configured) {
        return { name: p.name, configured: false, reachable: false, status: null }
      }

      try {
        const result = await Promise.race([
          p.check(key),
          new Promise<{ ok: boolean; status: number }>((_, reject) =>
            setTimeout(() => reject(new Error('timeout')), 5000)
          ),
        ])
        return { name: p.name, configured: true, reachable: result.ok, status: result.status }
      } catch (err: unknown) {
        return { name: p.name, configured: true, reachable: false, status: String(err instanceof Error ? err.message : err ?? 'error') }
      }
    })
  )

  const healthy = results.filter((r) => r.reachable).length
  const configured = results.filter((r) => r.configured).length

  return NextResponse.json({
    status: healthy > 0 ? 'ok' : 'degraded',
    summary: `${healthy}/${results.length} providers reachable, ${configured} configured`,
    providers: results,
    timestamp: new Date().toISOString(),
  })
}
