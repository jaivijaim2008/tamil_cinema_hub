import { NextRequest, NextResponse } from 'next/server'

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
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
            contents: messages.map((m: any) => ({
              role: m.role === 'assistant' ? 'model' : 'user',
              parts: [{ text: m.content }]
            }))
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
  const { messages } = await req.json()
  const errors: string[] = []

  // First attempt
  for (const provider of providers) {
    try {
      console.log(`Trying ${provider.name}...`)
      const reply = await provider.call(messages)
      if (reply && reply.trim().length > 0) {
        console.log(`Success with ${provider.name}`)
        return NextResponse.json({ reply, provider: provider.name })
      }
      throw new Error('Empty response')
    } catch (err: any) {
      const msg = `${provider.name} failed: ${err.message}`
      console.warn(msg)
      errors.push(msg)
      await new Promise(r => setTimeout(r, 300))
      continue
    }
  }

  // Auto retry after 2 seconds
  console.log('All failed, retrying in 2s...')
  await new Promise(r => setTimeout(r, 2000))

  for (const provider of providers) {
    try {
      const reply = await provider.call(messages)
      if (reply && reply.trim().length > 0) {
        console.log(`Retry success with ${provider.name}`)
        return NextResponse.json({ reply, provider: provider.name })
      }
    } catch {
      continue
    }
  }

  return NextResponse.json(
    {
      error: 'All AI providers are currently busy. Please try again in a moment.',
      details: errors
    },
    { status: 503 }
  )
}