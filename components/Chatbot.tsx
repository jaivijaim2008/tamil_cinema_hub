'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

type Message = {
  role: 'user' | 'assistant' | 'system'
  content: string
  provider?: string
  suggestions?: string[]
}

const CHARS_PER_TICK = 3
const TICK_MS = 20

export default function TamilCinemaHubChatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const WELCOME_MSG: Message = {
    role: 'assistant',
    content: 'Welcome! Ask me about any Tamil movie, actor, director, or get recommendations!',
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
        parts.push(<img key={`p-${m.index}`} src={m[1]} alt="Poster" className="inline-block w-12 h-[72px] object-cover rounded-md mr-2 mb-1 align-middle shadow-sm border border-[#E8E7E3]" loading="lazy" />)
      } else {
        const linkMatch = m[2]?.match(/\[([^\]]+)\]\(([^)]+)\)/)
        if (linkMatch) {
          parts.push(<a key={`l-${m.index}`} href={linkMatch[2]} className="text-[#D4291A] hover:underline">{linkMatch[1]}</a>)
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
    <div className={`fixed z-50 flex flex-col items-end ${isOpen ? 'bottom-6 right-6 max-[479px]:inset-0 max-[479px]:!bottom-0 max-[479px]:!right-0' : 'bottom-6 right-6'}`}>
      {isOpen && (
        <div className="mb-4 w-[420px] max-w-[calc(100vw-48px)] h-[520px] max-h-[calc(100vh-120px)] max-[479px]:w-full max-[479px]:h-full max-[479px]:max-w-full max-[479px]:max-h-full max-[479px]:mb-0 max-[479px]:rounded-none max-[479px]:border-0 bg-white border border-[#E8E7E3] rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] flex flex-col overflow-hidden" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
          <div className="px-4 py-3 flex items-center justify-between flex-shrink-0" style={{ background: '#D4291A', paddingTop: 'calc(0.75rem + env(safe-area-inset-top, 0px))' }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center"><svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="15" rx="2" /><path d="M2 11h20M2 7l4-4M8 7l4-4M14 7l4-4M20 7l2-2M2 3h20" /></svg></div>
              <div><p className="text-white text-sm font-bold leading-none">TamilCinemaHub AI</p><div className="flex items-center gap-1.5 mt-0.5"><span className="w-1.5 h-1.5 bg-green-400 rounded-full" /><p className="text-white/70 text-xs">Online</p></div></div>
            </div>
            <div className="flex items-center gap-1.5">
              <button onClick={clearChat} className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60 hover:text-white transition-colors"><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
              <button onClick={() => setIsOpen(false)} className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition-colors"><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-[#F7F7F5]" style={{ scrollbarWidth: 'thin' }}>
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'system' ? (
                  <div className="w-full flex justify-center">
                    <div className="flex items-center gap-2 bg-[#FFF8EE] border border-[#FDE68A] text-[#92400E] text-xs px-3.5 py-2.5 rounded-lg max-w-[85%]">
                      <span>&#x23F1;</span>
                      <span>{msg.content}{index === messages.length - 1 && rateLimitCountdown > 0 && ` (${rateLimitCountdown}s)`}</span>
                    </div>
                  </div>
                ) : (
                  <>
                    {msg.role === 'assistant' && (<div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mr-2 mt-1" style={{ background: '#D4291A' }}><span className="text-white text-xs">&#x1F3AC;</span></div>)}
                    <div className={`max-w-[78%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
                      <div className={`px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-line rounded-xl ${msg.role === 'user' ? 'text-white rounded-br-sm shadow-sm' : 'bg-white border border-[#E8E7E3] text-[#444] rounded-bl-sm'}`} style={msg.role === 'user' ? { background: '#D4291A' } : undefined}>{msg.role === 'assistant' ? renderMessageText(msg.content) : msg.content}</div>
                      {msg.provider && <p className="text-[10px] text-[#aaa] mt-1 px-1">via {msg.provider}</p>}
                    </div>
                  </>
                )}
              </div>
            ))}
            {isLoading && !streamingText && (<div className="flex justify-start"><div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mr-2 mt-1" style={{ background: '#D4291A' }}><span className="text-white text-xs">&#x1F3AC;</span></div><div className="bg-white border border-[#E8E7E3] rounded-xl rounded-bl-sm px-4 py-3 flex gap-2 items-center"><div className="flex gap-1.5"><span className="w-2 h-2 rounded-full animate-bounce" style={{ background: '#D4291A', animationDelay: '0ms' }} /><span className="w-2 h-2 rounded-full animate-bounce" style={{ background: '#D4291A', animationDelay: '150ms' }} /><span className="w-2 h-2 rounded-full animate-bounce" style={{ background: '#D4291A', animationDelay: '300ms' }} /></div></div></div>)}
            {streamingText !== null && (<div className="flex justify-start"><div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mr-2 mt-1" style={{ background: '#D4291A' }}><span className="text-white text-xs">&#x1F3AC;</span></div><div className="max-w-[78%] flex flex-col items-start"><div className="px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-line bg-white border border-[#E8E7E3] text-[#444] rounded-xl rounded-bl-sm">{renderMessageText(streamingText)}<span className="inline-block w-0.5 h-4 ml-0.5 align-text-bottom animate-pulse" style={{ background: '#D4291A' }} /></div></div></div>)}
            {!isLoading && !streamingText && (() => { for (let i = messages.length - 1; i >= 0; i--) { const msg = messages[i]; if (msg.role === 'assistant' && msg.suggestions && msg.suggestions.length > 0) { const isLatest = !messages.slice(i + 1).some(m => m.role === 'assistant'); if (!isLatest) break; return (<div className="flex justify-start pl-8"><div className="flex flex-wrap gap-1.5 max-w-[78%]">{msg.suggestions.map((s) => (<button key={s} onClick={() => handleSuggestionClick(s)} className="text-[11px] bg-[#FFF5F5] border border-[#FECACA] text-[#D4291A] px-3 py-1.5 rounded-full hover:bg-red-50 transition-all whitespace-nowrap active:scale-95">{s}</button>))}</div></div>) } } return null })()}
            <div ref={messagesEndRef} />
          </div>
          {messages.length === 1 && (<div className="px-3 py-2 bg-[#F7F7F5] border-t border-[#E8E7E3] flex gap-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>{['Best 2026 movies', 'Vijay movies', 'Recommend thriller'].map((s) => (<button key={s} onClick={() => setInput(s)} className="flex-shrink-0 text-xs bg-[#FFF5F5] border border-[#FECACA] text-[#D4291A] px-3 py-1.5 rounded-full hover:bg-red-50 transition-colors whitespace-nowrap">{s}</button>))}</div>)}
          <div className="px-3 py-3 bg-white border-t border-[#E8E7E3] flex gap-2 flex-shrink-0">
            <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown} placeholder={isLoading || streamingText ? 'Generating...' : 'Ask about Tamil movies...'} disabled={isLoading || rateLimitCountdown > 0} className="flex-1 bg-[#F7F7F5] border border-[#E8E7E3] rounded-lg px-4 py-2 text-sm outline-none focus:border-[#D4291A] disabled:opacity-50 text-[#111] placeholder:text-[#aaa] transition-all" />
            {(isLoading || streamingText) ? (<button onClick={stopGeneration} className="w-9 h-9 bg-[#D4291A] hover:bg-[#B01F12] text-white rounded-lg flex items-center justify-center flex-shrink-0 transition-all active:scale-95 animate-pulse"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="4" y="4" width="16" height="16" rx="3" /></svg></button>) : (<button onClick={() => sendMessage()} disabled={rateLimitCountdown > 0 || !input.trim()} className="w-9 h-9 text-white rounded-lg flex items-center justify-center flex-shrink-0 transition-all active:scale-95 disabled:opacity-30" style={{ background: '#D4291A' }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg></button>)}
          </div>
        </div>
      )}
      <button onClick={() => setIsOpen(!isOpen)} className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 active:scale-95 ${isOpen ? 'bg-[#F7F7F5] border border-[#E8E7E3] shadow-md max-[479px]:hidden' : 'text-white shadow-lg hover:scale-105'}`} style={!isOpen ? { background: '#D4291A', boxShadow: '0 8px 30px rgba(212,41,26,0.4)' } : undefined} aria-label={isOpen ? 'Close chat' : 'Open TamilCinemaHub AI chat'}>
        {isOpen ? (<svg className="w-5 h-5 text-[#444]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>) : (<svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="15" rx="2" /><path d="M2 11h20M2 7l4-4M8 7l4-4M14 7l4-4M20 7l2-2M2 3h20" /></svg>)}
      </button>
    </div>
  )
}
