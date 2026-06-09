'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Image from 'next/image'

type Message = {
  role: 'user' | 'assistant' | 'system'
  content: string
  provider?: string
  suggestions?: string[]
}

const CHARS_PER_TICK = 4
const TICK_MS = 40

export default function TamilCinemaHubChatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const WELCOME_MSG: Message = {
    role: 'assistant',
    content: 'Welcome! I am your Tamil cinema guide. Ask me about any movie, actor, director, or get personalized recommendations!',
  }
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const saved = localStorage.getItem('chatbot-messages')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      }
    } catch {}
    return [WELCOME_MSG]
  })
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [rateLimitCountdown, setRateLimitCountdown] = useState(0)
  const [feedback, setFeedback] = useState<Record<number, 'up' | 'down'>>({})
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesRef = useRef<Message[]>(messages)
  const isLoadingRef = useRef(false)
  const [streamingText, setStreamingText] = useState<string | null>(null)
  const [streamingProvider, setStreamingProvider] = useState<string | undefined>()
  const streamRef = useRef({ full: '', idx: 0, timer: null as any, provider: undefined as string | undefined, suggestions: undefined as string[] | undefined })
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => { try { const s = localStorage.getItem('chatbot-feedback'); if (s) setFeedback(JSON.parse(s)) } catch {} }, [])
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(() => { try { localStorage.setItem('chatbot-messages', JSON.stringify(messages.filter((m) => m.role !== 'system').slice(-50))) } catch {} }, 500)
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current) }
  }, [messages])
  useEffect(() => { messagesRef.current = messages }, [messages])
  useEffect(() => { isLoadingRef.current = isLoading }, [isLoading])
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, isLoading, streamingText])
  useEffect(() => { if (rateLimitCountdown <= 0) return; const t = setInterval(() => { setRateLimitCountdown((p) => (p <= 1 ? 0 : p - 1)) }, 1000); return () => clearInterval(t) }, [rateLimitCountdown])
  useEffect(() => { return () => { if (streamRef.current.timer) clearInterval(streamRef.current.timer) } }, [])
  useEffect(() => { const h = () => setIsOpen(true); window.addEventListener('open-chatbot', h); return () => window.removeEventListener('open-chatbot', h) }, [])

  // Lock body scroll when chat is open on mobile
  useEffect(() => {
    if (!isOpen) return
    const isMobile = window.innerWidth <= 479
    if (isMobile) {
      document.body.style.overflow = 'hidden'
      document.body.style.position = 'fixed'
      document.body.style.width = '100%'
      document.body.style.top = `-${window.scrollY}px`
    }
    return () => {
      const scrollY = document.body.style.top
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.width = ''
      document.body.style.top = ''
      if (scrollY) window.scrollTo(0, parseInt(scrollY || '0') * -1)
    }
  }, [isOpen])

  const startStreaming = useCallback((fullText: string, provider?: string, suggestions?: string[]) => {
    if (streamRef.current.timer) clearInterval(streamRef.current.timer)
    streamRef.current = { full: fullText, idx: 0, timer: null, provider, suggestions }
    setStreamingText(''); setStreamingProvider(provider); setIsLoading(false)
    const tick = () => {
      const s = streamRef.current; s.idx = Math.min(s.idx + CHARS_PER_TICK, s.full.length)
      setStreamingText(s.full.slice(0, s.idx))
      if (s.idx >= s.full.length) {
        clearInterval(s.timer!); s.timer = null
        const c = [...messagesRef.current, { role: 'assistant' as const, content: s.full, provider: s.provider, suggestions: s.suggestions }]
        messagesRef.current = c; setMessages(c); setStreamingText(null); setStreamingProvider(undefined)
      }
    }
    streamRef.current.timer = setInterval(tick, TICK_MS)
  }, [])

  const finishStream = useCallback(() => {
    const s = streamRef.current
    if (s.timer) {
      clearInterval(s.timer); s.timer = null
      const c = [...messagesRef.current, { role: 'assistant' as const, content: s.full, provider: s.provider, suggestions: s.suggestions }]
      messagesRef.current = c; setMessages(c); setStreamingText(null); setStreamingProvider(undefined)
    }
  }, [])

  const stopGeneration = useCallback(() => {
    if (abortRef.current) { abortRef.current.abort(); abortRef.current = null }
    const s = streamRef.current
    if (s.timer) {
      clearInterval(s.timer); s.timer = null
      if (s.idx > 0) {
        const c = [...messagesRef.current, { role: 'assistant' as const, content: s.full.slice(0, s.idx), provider: s.provider, suggestions: s.suggestions }]
        messagesRef.current = c; setMessages(c)
      }
      setStreamingText(null); setStreamingProvider(undefined)
    }
    setIsLoading(false)
  }, [])

  const sendMessage = useCallback(async (override?: string) => {
    const trimmed = (override ?? input).trim()
    if (!trimmed || isLoadingRef.current) return
    finishStream()
    const userMessage: Message = { role: 'user', content: trimmed }
    const newMessages: Message[] = [...messagesRef.current, userMessage]
    messagesRef.current = newMessages; setMessages(newMessages); setInput(''); setIsLoading(true)
    const apiMessages = newMessages.filter((m, i) => !(i === 0 && m.role === 'assistant')).slice(-20)
    const controller = new AbortController(); abortRef.current = controller
    try {
      const res = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: apiMessages }), signal: controller.signal })
      abortRef.current = null
      if (res.status === 429) {
        const data = await res.json(); setRateLimitCountdown(data.retryAfter || 30); setIsLoading(false)
        const rlm: Message = { role: 'system', content: 'You are sending messages too fast. Please wait.' }
        const u = [...messagesRef.current, rlm]; messagesRef.current = u; setMessages(u); return
      }
      if (!res.ok) throw new Error('Server error')
      const data = await res.json()
      startStreaming(data.reply || 'Sorry, I could not get a response.', data.provider, data.suggestions || [])
    } catch (err: any) {
      abortRef.current = null
      if (err?.name === 'AbortError') { setIsLoading(false); return }
      startStreaming('All AI providers are currently busy. Please try again.')
    }
  }, [input, startStreaming, finishStream])

  function clearChat() { setMessages([WELCOME_MSG]); setFeedback({}); localStorage.removeItem('chatbot-messages'); localStorage.removeItem('chatbot-feedback') }
  function handleSuggestionClick(s: string) { requestAnimationFrame(() => setTimeout(() => sendMessage(s), 0)) }
  function handleFeedback(i: number, t: 'up' | 'down') { setFeedback((p) => { const n = { ...p }; if (n[i] === t) delete n[i]; else n[i] = t; localStorage.setItem('chatbot-feedback', JSON.stringify(n)); return n }) }
  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }

  function renderMessageText(text: string) {
    const r = /\[poster:([^\]]+)\]|(\[[^\]]+\]\([^)]+\))/g
    const parts: (string | React.ReactElement)[] = []
    let li = 0
    let m: RegExpExecArray | null
    while ((m = r.exec(text)) !== null) {
      if (m.index > li) parts.push(text.slice(li, m.index))
      if (m[1] !== undefined) {
        parts.push(<span key={`p-${m.index}`} className="inline-block w-12 h-[72px] relative rounded-md mr-2 mb-1 align-middle overflow-hidden"><Image src={m[1]} alt="Poster" fill sizes="48px" style={{ objectFit: 'cover' }} unoptimized /></span>)
      } else {
        const linkMatch = m[2]?.match(/\[([^\]]+)\]\(([^)]+)\)/)
        if (linkMatch) {
          parts.push(<a key={`l-${m.index}`} href={linkMatch[2]} className="text-indigo-400 hover:underline">{linkMatch[1]}</a>)
        } else {
          parts.push(m[0])
        }
      }
      li = m.index + m[0].length
    }
    if (li < text.length) parts.push(text.slice(li))
    return parts
  }

  return (
    <div className="fixed inset-0 z-[200] pointer-events-none">
      {isOpen && (
        <div
          className="absolute inset-0 md:inset-auto md:bottom-[88px] md:right-6 md:w-[390px] md:max-w-[calc(100vw-48px)] md:h-[min(520px,calc(100dvh-120px))] md:rounded-2xl md:shadow-[0_24px_64px_rgba(0,0,0,0.75)] flex flex-col overflow-hidden pointer-events-auto"
          style={{
            background: '#0f1117',
            border: 'none',
            paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          }}
        >
          {/* ── Header ── */}
          <div
            className="px-3 py-2.5 flex items-center justify-between flex-shrink-0"
            style={{ background: '#161820' }}
          >
            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(99,102,241,0.18)' }}
              >
                <svg className="w-4 h-4" style={{ color: '#818cf8' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="7" width="20" height="15" rx="2" />
                  <path d="M2 11h20M2 7l4-4M8 7l4-4M14 7l4-4" />
                </svg>
              </div>
              <div>
                <p className="text-white text-sm font-semibold leading-none tracking-tight">TamilCinemaHub AI</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                  <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.4)' }}>Online</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={clearChat}
                className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-white/10"
                style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.45)', border: 'none' }}
                title="Clear chat"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-white/10"
                style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.55)', border: 'none' }}
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* ── Messages ── */}
          <div
            className="overflow-y-auto px-3 py-3 space-y-3 flex-1 flex flex-col justify-start"
            style={{ background: '#0f1117', scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.06) transparent' }}
          >
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'system' ? (
                  <div className="w-full flex justify-center">
                    <div
                      className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg max-w-[85%]"
                      style={{ background: 'rgba(234,179,8,0.1)', color: 'rgba(253,224,71,0.75)', border: 'none' }}
                    >
                      <span>⏱</span>
                      <span>{msg.content}{index === messages.length - 1 && rateLimitCountdown > 0 && ` (${rateLimitCountdown}s)`}</span>
                    </div>
                  </div>
                ) : (
                  <>
                    {msg.role === 'assistant' && (
                      <div
                        className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 mr-1.5 mt-0.5"
                        style={{ background: 'rgba(99,102,241,0.18)', border: 'none' }}
                      >
                        <svg className="w-3 h-3" style={{ color: '#818cf8' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="2" y="7" width="20" height="15" rx="2" />
                          <path d="M2 11h20M2 7l4-4M8 7l4-4M14 7l4-4" />
                        </svg>
                      </div>
                    )}
                    <div className={`max-w-[78%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
                      <div
                        className={`px-3 py-2 text-[13px] leading-relaxed whitespace-pre-line ${
                          msg.role === 'user'
                            ? 'rounded-xl rounded-br-sm text-white'
                            : 'rounded-xl rounded-bl-sm'
                        }`}
                        style={
                          msg.role === 'user'
                            ? { background: '#1e2030', border: 'none', color: '#e2e4f0' }
                            : { background: '#1a1c27', border: 'none', color: 'rgba(255,255,255,0.78)' }
                        }
                      >
                        {msg.role === 'assistant' ? renderMessageText(msg.content) : msg.content}
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}

            {/* Loading dots */}
            {isLoading && !streamingText && (
              <div className="flex justify-start">
                <div
                  className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 mr-1.5 mt-0.5"
                  style={{ background: 'rgba(99,102,241,0.18)', border: 'none' }}
                >
                  <svg className="w-3.5 h-3.5" style={{ color: '#818cf8' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="7" width="20" height="15" rx="2" />
                    <path d="M2 11h20M2 7l4-4M8 7l4-4M14 7l4-4" />
                  </svg>
                </div>
                <div
                  className="rounded-xl rounded-bl-sm px-3 py-2.5 flex items-center"
                  style={{ background: '#1a1c27', border: 'none' }}
                >
                  <div className="flex gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: 'rgba(129,140,248,0.7)', animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: 'rgba(129,140,248,0.7)', animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: 'rgba(129,140,248,0.7)', animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            {/* Streaming text */}
            {streamingText !== null && (
              <div className="flex justify-start">
                <div
                  className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 mr-1.5 mt-0.5"
                  style={{ background: 'rgba(99,102,241,0.18)', border: 'none' }}
                >
                  <svg className="w-3.5 h-3.5" style={{ color: '#818cf8' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="7" width="20" height="15" rx="2" />
                    <path d="M2 11h20M2 7l4-4M8 7l4-4M14 7l4-4" />
                  </svg>
                </div>
                <div className="max-w-[78%] flex flex-col items-start">
                  <div
                    className="px-3 py-2 text-[13px] leading-relaxed whitespace-pre-line rounded-xl rounded-bl-sm"
                    style={{ background: '#1a1c27', border: 'none', color: 'rgba(255,255,255,0.78)' }}
                  >
                    {renderMessageText(streamingText)}
                    <span className="inline-block w-0.5 h-3.5 ml-0.5 align-text-bottom animate-pulse" style={{ background: '#818cf8' }} />
                  </div>
                </div>
              </div>
            )}

            {/* Suggestions */}
            {!isLoading && !streamingText && (() => {
              for (let i = messages.length - 1; i >= 0; i--) {
                const msg = messages[i]
                if (msg.role === 'assistant' && msg.suggestions && msg.suggestions.length > 0) {
                  const isLatest = !messages.slice(i + 1).some(m => m.role === 'assistant')
                  if (!isLatest) break
                  return (
                    <div className="flex justify-start pl-7.5">
                      <div className="flex flex-wrap gap-1.5 max-w-[78%]">
                        {msg.suggestions.map((s) => (
                          <button
                            key={s}
                            onClick={() => handleSuggestionClick(s)}
                            className="text-[11px] px-3 py-1.5 rounded-full transition-all whitespace-nowrap active:scale-95 hover:bg-indigo-500/20"
                            style={{ background: 'rgba(99,102,241,0.12)', border: 'none', color: '#a5b4fc' }}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  )
                }
              }
              return null
            })()}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick suggestions — first load only */}
          {messages.length === 1 && (
            <div
              className="px-3 py-2 flex gap-1.5 overflow-x-auto flex-shrink-0"
              style={{ background: '#0f1117', scrollbarWidth: 'none' }}
            >
              {['Best 2026 movies', 'Vijay movies', 'Recommend thriller'].map((s) => (
                <button
                  key={s}
                  onClick={() => setInput(s)}
                  className="flex-shrink-0 text-xs px-3 py-1.5 rounded-full whitespace-nowrap transition-colors hover:bg-indigo-500/20"
                  style={{ background: 'rgba(99,102,241,0.12)', border: 'none', color: '#a5b4fc' }}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div
            className="px-3 py-2.5 flex gap-2 flex-shrink-0"
            style={{ background: '#161820' }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isLoading || streamingText ? 'Generating...' : 'Ask about Tamil movies...'}
              disabled={isLoading || rateLimitCountdown > 0}
              className="flex-1 rounded-xl px-3.5 py-2 text-[13px] outline-none disabled:opacity-50 transition-all focus:ring-0"
              style={{
                background: '#0f1117',
                border: 'none',
                color: '#e2e4f0',
                caretColor: '#818cf8',
                outline: 'none',
                boxShadow: 'none',
              }}
            />
            {(isLoading || streamingText) ? (
              <button
                onClick={stopGeneration}
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all active:scale-95 animate-pulse"
                style={{ background: 'rgba(99,102,241,0.2)', border: 'none', color: '#a5b4fc' }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><rect x="4" y="4" width="16" height="16" rx="3" /></svg>
              </button>
            ) : (
              <button
                onClick={() => sendMessage()}
                disabled={rateLimitCountdown > 0 || !input.trim()}
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all active:scale-95 disabled:opacity-30"
                style={{ background: '#4f46e5', border: 'none', color: '#fff' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── FAB toggle ── */}
      {!isOpen && (
      <button
        onClick={() => setIsOpen(true)}
        className="absolute bottom-6 right-6 w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 active:scale-95 hover:scale-105 pointer-events-auto"
        style={{
          background: '#4f46e5',
          boxShadow: '0 8px 32px rgba(79,70,229,0.45)',
          color: '#fff',
          border: 'none',
        }}
        aria-label="Open TamilCinemaHub AI chat"
      >
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="7" width="20" height="15" rx="2" />
          <path d="M2 11h20M2 7l4-4M8 7l4-4M14 7l4-4M20 7l2-2M2 3h20" />
        </svg>
      </button>
      )}
    </div>
  )
}