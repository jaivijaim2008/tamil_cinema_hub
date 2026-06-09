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

  // ── Drag state (desktop only) — initialized from localStorage ──
  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(() => {
    if (typeof window === 'undefined') return null
    try {
      const saved = localStorage.getItem('chatbot-drag-pos')
      if (saved) {
        const p = JSON.parse(saved)
        if (p && typeof p.x === 'number' && typeof p.y === 'number') return p
      }
    } catch {}
    return null
  })
  const dragRef = useRef({ dragging: false, startX: 0, startY: 0, origX: 0, origY: 0 })
  const chatWindowRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)

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

  // ── Drag handlers (mouse + touch) ──
  const getDefaultPos = useCallback(() => ({ x: window.innerWidth - 440, y: window.innerHeight - 600 }), [])

  const startDrag = useCallback((clientX: number, clientY: number) => {
    const rect = chatWindowRef.current?.getBoundingClientRect()
    const currentPos = dragPos || (rect ? { x: rect.left, y: rect.top } : getDefaultPos())
    dragRef.current = { dragging: true, startX: clientX, startY: clientY, origX: currentPos.x, origY: currentPos.y }
    setIsDragging(true)
  }, [dragPos, getDefaultPos])

  const handleDragStart = useCallback((e: React.MouseEvent) => {
    if (window.innerWidth < 768) return // no drag on small mobile
    e.preventDefault()
    startDrag(e.clientX, e.clientY)
  }, [startDrag])

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (window.innerWidth < 768) return // no drag on small mobile
    const touch = e.touches[0]
    startDrag(touch.clientX, touch.clientY)
  }, [startDrag])

  useEffect(() => {
    if (!isDragging) return
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragRef.current.dragging) return
      const dx = e.clientX - dragRef.current.startX
      const dy = e.clientY - dragRef.current.startY
      const maxX = window.innerWidth - 80
      const maxY = window.innerHeight - 80
      const newX = Math.max(0, Math.min(maxX, dragRef.current.origX + dx))
      const newY = Math.max(0, Math.min(maxY, dragRef.current.origY + dy))
      setDragPos({ x: newX, y: newY })
    }
    const handleTouchMove = (e: TouchEvent) => {
      if (!dragRef.current.dragging) return
      const touch = e.touches[0]
      const dx = touch.clientX - dragRef.current.startX
      const dy = touch.clientY - dragRef.current.startY
      const maxX = window.innerWidth - 80
      const maxY = window.innerHeight - 80
      const newX = Math.max(0, Math.min(maxX, dragRef.current.origX + dx))
      const newY = Math.max(0, Math.min(maxY, dragRef.current.origY + dy))
      setDragPos({ x: newX, y: newY })
      e.preventDefault() // prevent scroll while dragging
    }
    const handleDragEnd = () => {
      dragRef.current.dragging = false
      setIsDragging(false)
      setDragPos((prev) => {
        if (prev) {
          try { localStorage.setItem('chatbot-drag-pos', JSON.stringify(prev)) } catch {}
        }
        return prev
      })
    }
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleDragEnd)
    document.addEventListener('touchmove', handleTouchMove, { passive: false })
    document.addEventListener('touchend', handleDragEnd)
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleDragEnd)
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleDragEnd)
    }
  }, [isDragging])

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
        parts.push(<span key={`p-${m.index}`} className="inline-block w-12 h-[72px] relative rounded mr-2 mb-1 align-middle overflow-hidden border border-white/10"><Image src={m[1]} alt="Poster" fill sizes="48px" style={{ objectFit: 'cover' }} unoptimized /></span>)
      } else {
        const linkMatch = m[2]?.match(/\[([^\]]+)\]\(([^)]+)\)/)
        if (linkMatch) {
          parts.push(<a key={`l-${m.index}`} href={linkMatch[2]} className="underline decoration-dotted" style={{ color: '#F0B429' }}>{linkMatch[1]}</a>)
        } else {
          parts.push(m[0])
        }
      }
      li = m.index + m[0].length
    }
    if (li < text.length) parts.push(text.slice(li))
    return parts
  }

  // Compute desktop position — always use left/top
  const desktopStyle: React.CSSProperties = dragPos
    ? { left: dragPos.x, top: dragPos.y }
    : { right: 20, bottom: 20 }

  return (
    <>
      {isOpen && (
        <>
          {/* Backdrop — mobile only */}
          <div
            className="fixed inset-0 z-[199] md:hidden"
            style={{ background: 'rgba(5,0,8,0.7)' }}
            onClick={() => setIsOpen(false)}
          />

          {/* Chat Window */}
          <div
            ref={chatWindowRef}
            className={`z-[200] flex flex-col overflow-hidden ${
              isDragging ? 'select-none' : ''
            } fixed inset-3 md:inset-auto md:w-[420px] md:max-w-[calc(100vw-28px)] md:h-[min(580px,calc(100dvh-80px))] md:shadow-[0_32px_100px_rgba(0,0,0,0.9)]`}
            style={{
              ...desktopStyle,
              background: '#0A0008',
              borderRadius: 16,
              paddingBottom: 'env(safe-area-inset-bottom, 0px)',
              transition: isDragging ? 'none' : undefined,
              boxShadow: '0 24px 80px rgba(0,0,0,0.85)',
            }}
          >
            {/* ── Header — draggable on desktop/tablet ── */}
            <div
              onMouseDown={handleDragStart}
              onTouchStart={handleTouchStart}
              className="relative flex items-center justify-between px-4 py-3.5 flex-shrink-0 overflow-hidden md:cursor-move"
              style={{ background: 'linear-gradient(135deg, #1a0510 0%, #2a0a18 50%, #1a0510 100%)' }}
            >
              {/* Film grain overlay */}
              <div className="absolute inset-0 opacity-20" style={{ background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.02) 2px, rgba(255,255,255,0.02) 4px)' }} />
              {/* Bottom accent line */}
              <div className="absolute bottom-0 left-0 right-0 h-[2px]" style={{ background: 'linear-gradient(90deg, #D4291A, #F0B429, #7C3AED, #F0B429, #D4291A)' }} />

              <div className="flex items-center gap-3 relative z-10">
                {/* Clapperboard icon */}
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 relative"
                  style={{ background: 'linear-gradient(135deg, #D4291A, #FF4D1C)', boxShadow: '0 4px 16px rgba(212,41,26,0.4)' }}
                >
                  <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="M2 8h20" />
                    <path d="M8 4l2 4M14 4l2 4M5 4l1.5 4M17.5 4L19 4" />
                  </svg>
                  {/* Pulse ring */}
                  <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full" style={{ background: '#2DD4BF', boxShadow: '0 0 8px rgba(45,212,191,0.6)' }} />
                </div>
                <div>
                  <h3 className="text-sm font-bold tracking-wide" style={{ fontFamily: "'Syne', sans-serif", color: '#FFF8F0' }}>
                    CINEMA AI
                  </h3>
                  <p className="text-[10px] font-medium tracking-wider uppercase" style={{ color: '#2DD4BF' }}>
                    ● Now Showing
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 relative z-10">
                <button
                  onClick={(e) => { e.stopPropagation(); clearChat() }}
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                  style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,248,240,0.4)' }}
                  title="Clear chat"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setIsOpen(false) }}
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                  style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,248,240,0.5)' }}
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* ── Messages area ── */}
            <div
              className="flex-1 overflow-y-auto relative"
              style={{ background: '#0A0008', scrollbarWidth: 'thin', scrollbarColor: 'rgba(212,41,26,0.2) transparent' }}
            >
              <div className="flex h-full">
                {/* Left film perforations */}
                <div className="hidden md:flex flex-col items-center justify-center flex-shrink-0" style={{ width: '12px' }}>
                  <div className="flex flex-col gap-1.5 py-3 px-0.5">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <div key={i} className="w-1 h-1 rounded-sm" style={{ background: 'rgba(240,180,41,0.15)' }} />
                    ))}
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 px-4 py-4 space-y-4">
                  {messages.map((msg, index) => {
                    if (msg.role === 'system') {
                      return (
                        <div key={index} className="flex justify-center">
                          <div
                            className="text-[11px] px-4 py-2 rounded-full font-medium tracking-wide"
                            style={{
                              background: 'rgba(240,180,41,0.08)',
                              color: '#F0B429',
                              border: '1px solid rgba(240,180,41,0.15)',
                            }}
                          >
                            ⏱ {msg.content}{index === messages.length - 1 && rateLimitCountdown > 0 ? ` (${rateLimitCountdown}s)` : ''}
                          </div>
                        </div>
                      )
                    }

                    const isUser = msg.role === 'user'

                    return (
                      <div key={index} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[82%] ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
                          {/* Sender label */}
                          {!isUser && (
                            <span className="text-[9px] font-bold tracking-widest uppercase mb-1 ml-1" style={{ color: 'rgba(212,41,26,0.5)' }}>
                              AI HOST
                            </span>
                          )}
                          <div
                            className={`px-4 py-3 text-[13px] leading-relaxed whitespace-pre-line ${
                              isUser ? 'rounded-2xl rounded-br-sm' : 'rounded-2xl rounded-bl-sm'
                            }`}
                            style={
                              isUser
                                ? {
                                    background: 'linear-gradient(135deg, #D4291A, #FF4D1C)',
                                    color: '#fff',
                                    boxShadow: '0 4px 20px rgba(212,41,26,0.25)',
                                  }
                                : {
                                    background: 'rgba(255,255,255,0.04)',
                                    color: 'rgba(255,248,240,0.85)',
                                    border: '1px solid rgba(255,255,255,0.06)',
                                  }
                            }
                          >
                            {isUser ? msg.content : renderMessageText(msg.content)}
                          </div>
                          {/* Feedback for assistant messages */}
                          {!isUser && msg.content && (
                            <div className="flex gap-1 mt-1 ml-1">
                              <button
                                onClick={() => handleFeedback(index, 'up')}
                                className="w-5 h-5 flex items-center justify-center rounded transition-colors"
                                style={{
                                  color: feedback[index] === 'up' ? '#2DD4BF' : 'rgba(255,248,240,0.15)',
                                }}
                              >
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14zM4 22H2V11h2v11z" /></svg>
                              </button>
                              <button
                                onClick={() => handleFeedback(index, 'down')}
                                className="w-5 h-5 flex items-center justify-center rounded transition-colors"
                                style={{
                                  color: feedback[index] === 'down' ? '#D4291A' : 'rgba(255,248,240,0.15)',
                                }}
                              >
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M10 15V19a3 3 0 003 3l4-9V2H5.72a2 2 0 00-2 1.7l-1.38 9a2 2 0 002 2.3H10zM20 2h2v11h-2V2z" /></svg>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}

                  {/* Loading */}
                  {isLoading && !streamingText && (
                    <div className="flex justify-start">
                      <div>
                        <span className="text-[9px] font-bold tracking-widest uppercase mb-1 ml-1 block" style={{ color: 'rgba(212,41,26,0.5)' }}>
                          AI HOST
                        </span>
                        <div
                          className="px-4 py-3 rounded-2xl rounded-bl-sm flex items-center gap-1.5"
                          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
                        >
                          <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: '#D4291A', animationDelay: '0ms' }} />
                          <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: '#F0B429', animationDelay: '150ms' }} />
                          <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: '#7C3AED', animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Streaming */}
                  {streamingText !== null && (
                    <div className="flex justify-start">
                      <div className="max-w-[82%]">
                        <span className="text-[9px] font-bold tracking-widest uppercase mb-1 ml-1 block" style={{ color: 'rgba(212,41,26,0.5)' }}>
                          AI HOST
                        </span>
                        <div
                          className="px-4 py-3 text-[13px] leading-relaxed whitespace-pre-line rounded-2xl rounded-bl-sm"
                          style={{ background: 'rgba(255,255,255,0.04)', color: 'rgba(255,248,240,0.85)', border: '1px solid rgba(255,255,255,0.06)' }}
                        >
                          {renderMessageText(streamingText)}
                          <span className="inline-block w-[2px] h-3.5 ml-0.5 align-text-bottom animate-pulse" style={{ background: '#F0B429' }} />
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
                          <div className="flex flex-wrap gap-2 mt-1">
                            {msg.suggestions.map((s) => (
                              <button
                                key={s}
                                onClick={() => handleSuggestionClick(s)}
                                className="text-[11px] px-3 py-1.5 rounded-full transition-all whitespace-nowrap active:scale-95 hover:scale-105 font-medium"
                                style={{
                                  background: 'rgba(212,41,26,0.08)',
                                  border: '1px solid rgba(212,41,26,0.2)',
                                  color: '#FDA4AF',
                                }}
                              >
                                {s}
                              </button>
                            ))}
                          </div>
                        )
                      }
                    }
                    return null
                  })()}

                  <div ref={messagesEndRef} />
                </div>

                {/* Right film perforations */}
                <div className="hidden md:flex flex-col items-center justify-center flex-shrink-0" style={{ width: '12px' }}>
                  <div className="flex flex-col gap-1.5 py-3 px-0.5">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <div key={`r-${i}`} className="w-1 h-1 rounded-sm" style={{ background: 'rgba(240,180,41,0.15)' }} />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* ── Quick suggestions — first load ── */}
            {messages.length === 1 && (
              <div
                className="px-4 py-2.5 flex gap-2 overflow-x-auto flex-shrink-0"
                style={{ background: '#0A0008', scrollbarWidth: 'none' }}
              >
                {[{ label: '🎬 Best 2026 movies', value: 'Best 2026 movies' }, { label: '⭐ Vijay films', value: 'Vijay movies' }, { label: '🎯 Thriller picks', value: 'Recommend thriller' }].map((s) => (
                  <button
                    key={s.value}
                    onClick={() => setInput(s.value)}
                    className="flex-shrink-0 text-[11px] px-3 py-1.5 rounded-full whitespace-nowrap transition-all hover:scale-105 active:scale-95 font-medium"
                    style={{
                      background: 'rgba(240,180,41,0.08)',
                      border: '1px solid rgba(240,180,41,0.2)',
                      color: '#F0B429',
                    }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            )}

            {/* ── Input ── */}
            <div
              className="relative flex-shrink-0"
              style={{ background: 'linear-gradient(180deg, #12000a, #0A0008)' }}
            >
              <div className="absolute top-0 left-0 right-0 h-[1px]" style={{ background: 'linear-gradient(90deg, transparent, rgba(212,41,26,0.3), rgba(240,180,41,0.2), transparent)' }} />
              <div className="px-4 py-3 flex items-center gap-3">
                <div className="flex-1 relative">
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={isLoading || streamingText ? 'Now playing...' : 'Ask about Tamil cinema...'}
                    disabled={isLoading || rateLimitCountdown > 0}
                    className="w-full rounded-xl px-4 py-2.5 text-[13px] outline-none disabled:opacity-30 transition-all font-medium"
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      color: '#FFF8F0',
                      caretColor: '#F0B429',
                      border: '1px solid rgba(255,255,255,0.08)',
                    }}
                  />
                </div>
                {(isLoading || streamingText) ? (
                  <button
                    onClick={stopGeneration}
                    className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all active:scale-90"
                    style={{ background: 'rgba(212,41,26,0.15)', color: '#D4291A', border: '1px solid rgba(212,41,26,0.2)' }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="5" y="5" width="14" height="14" rx="3" /></svg>
                  </button>
                ) : (
                  <button
                    onClick={() => sendMessage()}
                    disabled={rateLimitCountdown > 0 || !input.trim()}
                    className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all active:scale-90 disabled:opacity-15"
                    style={{
                      background: 'linear-gradient(135deg, #D4291A, #FF4D1C)',
                      color: '#fff',
                      boxShadow: '0 4px 16px rgba(212,41,26,0.35)',
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="22" y1="2" x2="11" y2="13" />
                      <polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── FAB — cinema reel button ── */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-[200] w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 active:scale-90 hover:scale-110"
          style={{
            background: 'linear-gradient(135deg, #D4291A, #FF4D1C)',
            boxShadow: '0 8px 32px rgba(212,41,26,0.5), 0 0 0 2px rgba(255,77,28,0.2)',
          }}
          aria-label="Open TamilCinemaHub AI chat"
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <path d="M2 8h20" />
            <path d="M8 4l2 4M14 4l2 4M5 4l1.5 4M17.5 4L19 4" />
          </svg>
        </button>
      )}
    </>
  )
}
