'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

type Message = {
  role: 'user' | 'assistant' | 'system'
  content: string
  provider?: string
}

const CHARS_PER_TICK = 3
const TICK_MS = 20

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

  // ── Typewriter streaming state ──
  const [streamingText, setStreamingText] = useState<string | null>(null)
  const [streamingProvider, setStreamingProvider] = useState<string | undefined>()
  const streamRef = useRef({ full: '', idx: 0, timer: null as any, provider: undefined as string | undefined })

  // Load feedback from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('chatbot-feedback')
      if (saved) setFeedback(JSON.parse(saved))
    } catch {}
  }, [])

  // Debounced save: only write to localStorage after 500ms of no message changes
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(() => {
      const toSave = messages.filter((m) => m.role !== 'system').slice(-50)
      try {
        localStorage.setItem('chatbot-messages', JSON.stringify(toSave))
      } catch {}
    }, 500)
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current) }
  }, [messages])
  // Save on unmount only — uses messagesRef so it never re-runs
  useEffect(() => {
    return () => {
      const toSave = messagesRef.current.filter((m) => m.role !== 'system').slice(-50)
      try {
        localStorage.setItem('chatbot-messages', JSON.stringify(toSave))
      } catch {}
    }
  }, [])

  // Keep refs in sync with state
  useEffect(() => {
    messagesRef.current = messages
  }, [messages])
  useEffect(() => {
    isLoadingRef.current = isLoading
  }, [isLoading])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading, streamingText])

  // Rate limit countdown timer
  useEffect(() => {
    if (rateLimitCountdown <= 0) return
    const timer = setInterval(() => {
      setRateLimitCountdown((prev) => (prev <= 1 ? 0 : prev - 1))
    }, 1000)
    return () => clearInterval(timer)
  }, [rateLimitCountdown])

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current.timer) clearInterval(streamRef.current.timer)
    }
  }, [])

  /** Start typewriter animation for a response */
  const startStreaming = useCallback((fullText: string, provider?: string) => {
    // Clear any existing stream
    if (streamRef.current.timer) clearInterval(streamRef.current.timer)

    streamRef.current = { full: fullText, idx: 0, timer: null, provider }
    setStreamingText('')
    setStreamingProvider(provider)
    setIsLoading(false) // Stop loading dots, show streaming instead

    const tick = () => {
      const s = streamRef.current
      s.idx = Math.min(s.idx + CHARS_PER_TICK, s.full.length)
      setStreamingText(s.full.slice(0, s.idx))

      if (s.idx >= s.full.length) {
        clearInterval(s.timer!)
        s.timer = null
        // Commit the streamed message to messages array + sync ref
        const committed = [...messagesRef.current, { role: 'assistant' as const, content: s.full, provider: s.provider }]
        messagesRef.current = committed
        setMessages(committed)
        setStreamingText(null)
        setStreamingProvider(undefined)
      }
    }

    streamRef.current.timer = setInterval(tick, TICK_MS)
  }, [])

  /** Skip to end of current stream */
  const finishStream = useCallback(() => {
    const s = streamRef.current
    if (s.timer) {
      clearInterval(s.timer)
      s.timer = null
      // Commit + sync ref so sendMessage sees the full conversation
      const committed = [...messagesRef.current, { role: 'assistant' as const, content: s.full, provider: s.provider }]
      messagesRef.current = committed
      setMessages(committed)
      setStreamingText(null)
      setStreamingProvider(undefined)
    }
  }, [])

  const sendMessage = useCallback(async () => {
    const trimmed = input.trim()
    if (!trimmed || isLoadingRef.current) return

    // If there's a stream in progress, finish it immediately
    finishStream()

    const userMessage: Message = { role: 'user', content: trimmed }
    const newMessages: Message[] = [...messagesRef.current, userMessage]
    messagesRef.current = newMessages
    setMessages(newMessages)
    setInput('')
    setIsLoading(true)

    // Filter out the welcome message and cap history to last 20 messages to avoid context limits
    const apiMessages = newMessages
      .filter((m, i) => !(i === 0 && m.role === 'assistant'))
      .slice(-20)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages }),
      })

      if (res.status === 429) {
        const data = await res.json()
        const waitSeconds = data.retryAfter || 30
        setRateLimitCountdown(waitSeconds)
        setIsLoading(false)
        // Keep the user message, add rate limit warning below it
        const rateLimitMsg: Message = {
          role: 'system',
          content: `You're sending messages too fast. Please wait a moment before trying again.`,
        }
        const updated = [...messagesRef.current, rateLimitMsg]
        messagesRef.current = updated
        setMessages(updated)
        return
      }

      if (!res.ok) throw new Error('Server error')
      const data = await res.json()
      const reply = data.reply || 'Sorry, I could not get a response. Please try again.'

      // Start typewriter effect
      startStreaming(reply, data.provider)
    } catch {
      startStreaming('All AI providers are currently busy. Please try again in a moment.')
    }
  }, [input, startStreaming, finishStream])

  function clearChat() {
    setMessages([WELCOME_MSG])
    setFeedback({})
    localStorage.removeItem('chatbot-messages')
    localStorage.removeItem('chatbot-feedback')
  }

  function handleFeedback(index: number, type: 'up' | 'down') {
    setFeedback((prev) => {
      const next = { ...prev }
      // Toggle off if same reaction clicked again
      if (next[index] === type) {
        delete next[index]
      } else {
        next[index] = type
      }
      localStorage.setItem('chatbot-feedback', JSON.stringify(next))
      return next
    })
  }

    function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  /** Parse [poster:URL] tags into thumbnails and [text](url) links into clickable elements */
  function renderMessageText(text: string) {
    // Combined regex: match [poster:URL] OR [text](url) in a single pass
    const tagRegex = /\[poster:([^\]]+)\]|\[([^\]]+)\]\(([^)]+)\)/g
    const parts: (string | React.ReactElement)[] = []
    let lastIndex = 0
    let match: RegExpExecArray | null
    while ((match = tagRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index))
      }
      if (match[1] !== undefined) {
        // [poster:URL] — render as small thumbnail
        parts.push(
          <img
            key={`poster-${match.index}`}
            src={match[1]}
            alt="Poster"
            className="inline-block w-10 h-[60px] object-cover rounded-md mr-2 mb-1 align-middle shadow-md border border-white/10"
            loading="lazy"
          />
        )
      } else {
        // [text](url) — render as clickable link
        parts.push(
          <a key={match.index} href={match[3]} className="text-violet-400 hover:text-violet-300 underline decoration-violet-400/30 hover:decoration-violet-300/50 transition-colors">
            {match[2]}
          </a>
        )
      }
      lastIndex = match.index + match[0].length
    }
    if (lastIndex < text.length) parts.push(text.slice(lastIndex))
    return parts
  }

  return (
    <div className={`fixed z-50 flex flex-col items-end ${isOpen ? 'bottom-6 right-6 max-[479px]:inset-0 max-[479px]:!bottom-0 max-[479px]:!right-0' : 'bottom-6 right-6'}`}>

      {/* ── CHAT WINDOW ── */}
      {isOpen && (
        <div className="mb-4 w-[420px] max-w-[calc(100vw-48px)] h-[520px] max-h-[calc(100vh-120px)] max-[479px]:w-full max-[479px]:h-full max-[479px]:max-w-full max-[479px]:max-h-full max-[479px]:mb-0 max-[479px]:rounded-none max-[479px]:border-0 bg-[#0d0d1a] border border-white/10 rounded-2xl shadow-[0_20px_80px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>

          {/* Header */}
          <div className="bg-gradient-to-r from-violet-700 to-indigo-700 px-4 py-3 flex items-center justify-between flex-shrink-0" style={{ paddingTop: 'calc(0.75rem + env(safe-area-inset-top, 0px))' }}>
            <div className="flex items-center gap-3">
              {/* Avatar */}
              <div className="w-9 h-9 rounded-xl bg-white/20 border border-white/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="7" width="20" height="15" rx="2" />
                  <path d="M2 11h20M2 7l4-4M8 7l4-4M14 7l4-4M20 7l2-2M2 3h20" />
                </svg>
              </div>
              <div>
                <p className="text-white text-sm font-bold leading-none">TamilCinemaHub AI</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                  <p className="text-white/70 text-xs">Online — Tamil Cinema Expert</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={clearChat}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60 hover:text-white transition-colors"
                aria-label="Clear chat"
                title="Clear conversation"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition-colors"
                aria-label="Close chat"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-[#080812]"
            style={{ scrollbarWidth: 'thin', scrollbarColor: '#3b0764 transparent' }}
          >
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'system' ? (
                  /* Rate limit / system warning */
                  <div className="w-full flex justify-center">
                    <div className="flex items-center gap-2 bg-amber-900/30 border border-amber-500/30 text-amber-200 text-xs px-3.5 py-2.5 rounded-xl max-w-[85%]">
                      <span className="text-amber-400 text-base flex-shrink-0">⏱</span>
                      <span>{msg.content}{index === messages.length - 1 && rateLimitCountdown > 0 && ` (${rateLimitCountdown}s)`}</span>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Bot avatar */}
                    {msg.role === 'assistant' && (
                      <div className="w-6 h-6 rounded-full bg-violet-700 flex items-center justify-center flex-shrink-0 mr-2 mt-1">
                        <span className="text-white text-xs">🎬</span>
                      </div>
                    )}

                    <div className={`max-w-[78%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
                      <div
                        className={`px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-line ${
                          msg.role === 'user'
                            ? 'bg-gradient-to-br from-violet-600 to-indigo-700 text-white rounded-2xl rounded-br-sm shadow-lg'
                            : 'bg-white/8 border border-white/8 text-gray-200 rounded-2xl rounded-bl-sm'
                        }`}
                      >
                        {msg.role === 'assistant' ? renderMessageText(msg.content) : msg.content}
                      </div>
                      {msg.provider && (
                        <p className="text-[10px] text-gray-600 mt-1 px-1">via {msg.provider}</p>
                      )}
                      {/* Thumbs up / down feedback */}
                      {msg.role === 'assistant' && (
                        <div className="flex items-center gap-1 mt-0.5 px-1">
                          <button
                            onClick={() => handleFeedback(index, 'up')}
                            className={`p-0.5 rounded transition-all ${
                              feedback[index] === 'up'
                                ? 'text-green-400 scale-110'
                                : 'text-gray-600 hover:text-green-400/70'
                            }`}
                            aria-label="Helpful"
                          >
                            <svg className="w-3 h-3" fill={feedback[index] === 'up' ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleFeedback(index, 'down')}
                            className={`p-0.5 rounded transition-all ${
                              feedback[index] === 'down'
                                ? 'text-red-400 scale-110'
                                : 'text-gray-600 hover:text-red-400/70'
                            }`}
                            aria-label="Not helpful"
                          >
                            <svg className="w-3 h-3" fill={feedback[index] === 'down' ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3H10zM17 2h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-3" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}

            {/* Typing indicator (before streaming starts) */}
            {isLoading && !streamingText && (
              <div className="flex justify-start">
                <div className="w-6 h-6 rounded-full bg-violet-700 flex items-center justify-center flex-shrink-0 mr-2 mt-1">
                  <span className="text-white text-xs">🎬</span>
                </div>
                <div className="bg-white/8 border border-white/8 rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1.5 items-center">
                  <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce [animation-delay:0ms]" />
                  <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce [animation-delay:150ms]" />
                  <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            )}

            {/* Streaming / typewriter message */}
            {streamingText !== null && (
              <div className="flex justify-start">
                <div className="w-6 h-6 rounded-full bg-violet-700 flex items-center justify-center flex-shrink-0 mr-2 mt-1">
                  <span className="text-white text-xs">🎬</span>
                </div>
                <div className="max-w-[78%] flex flex-col items-start">
                  <div className="px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-line bg-white/8 border border-white/8 text-gray-200 rounded-2xl rounded-bl-sm">
                    {renderMessageText(streamingText)}
                    <span className="inline-block w-0.5 h-4 bg-violet-400 ml-0.5 align-text-bottom animate-pulse" />
                  </div>
                  <button
                    onClick={finishStream}
                    className="text-[10px] text-violet-400/60 hover:text-violet-300 mt-1 px-1 transition-colors"
                  >
                    skip ▸
                  </button>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick suggestions */}
          {messages.length === 1 && (
            <div className="px-3 py-2 bg-[#080812] border-t border-white/5 flex gap-2 overflow-x-auto"
              style={{ scrollbarWidth: 'none' }}
            >
              {['Best 2024 movies', 'Vijay movies', 'Recommend thriller'].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => {
                    setInput(suggestion)
                  }}
                  className="flex-shrink-0 text-xs bg-violet-900/50 border border-violet-700/40 text-violet-300 px-3 py-1.5 rounded-full hover:bg-violet-800/50 transition-colors whitespace-nowrap"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="px-3 py-3 bg-[#0d0d1a] border-t border-white/8 flex gap-2 flex-shrink-0">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about Tamil movies..."
              disabled={isLoading || rateLimitCountdown > 0}
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm outline-none focus:border-violet-500/60 focus:bg-white/8 disabled:opacity-50 text-white placeholder:text-gray-600 transition-all"
            />
            <button
              onClick={sendMessage}
              disabled={isLoading || rateLimitCountdown > 0 || !input.trim()}
              className="w-9 h-9 bg-gradient-to-br from-violet-600 to-indigo-700 hover:from-violet-500 hover:to-indigo-600 disabled:opacity-30 text-white rounded-xl flex items-center justify-center flex-shrink-0 transition-all active:scale-95 shadow-lg shadow-violet-900/50"
              aria-label="Send message"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>

        </div>
      )}

      {/* ── FAB BUTTON ── */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-2xl shadow-[0_8px_30px_rgba(109,40,217,0.6)] flex items-center justify-center transition-all duration-300 active:scale-95 ${
          isOpen
            ? 'bg-white/10 border border-white/20 backdrop-blur-md max-[479px]:hidden'
            : 'bg-gradient-to-br from-violet-600 to-indigo-700 hover:shadow-[0_8px_40px_rgba(109,40,217,0.8)] hover:scale-105'
        }`}
        aria-label={isOpen ? 'Close chat' : 'Open TamilCinemaHub AI chat'}
      >
        {isOpen ? (
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="7" width="20" height="15" rx="2" />
            <path d="M2 11h20M2 7l4-4M8 7l4-4M14 7l4-4M20 7l2-2M2 3h20" />
          </svg>
        )}
      </button>

    </div>
  )
}