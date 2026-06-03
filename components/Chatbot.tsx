'use client'

import { useState, useRef, useEffect } from 'react'

type Message = {
  role: 'user' | 'assistant'
  content: string
  provider?: string
}

export default function TamilCinemaHubChatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Welcome! I am your Tamil cinema guide. Ask me about any movie, actor, director, or get personalized recommendations!',
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  async function sendMessage() {
    const trimmed = input.trim()
    if (!trimmed || isLoading) return

    const newMessages: Message[] = [...messages, { role: 'user', content: trimmed }]
    setMessages(newMessages)
    setInput('')
    setIsLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      })

      if (!res.ok) throw new Error('Server error')
      const data = await res.json()

      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content: data.reply || 'Sorry, I could not get a response. Please try again.',
          provider: data.provider,
        },
      ])
    } catch {
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content: 'All AI providers are currently busy. Please try again in a moment.',
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">

      {/* ── CHAT WINDOW ── */}
      {isOpen && (
        <div className="mb-4 w-[340px] h-[480px] bg-[#0d0d1a] border border-white/10 rounded-2xl shadow-[0_20px_80px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden">

          {/* Header */}
          <div className="bg-gradient-to-r from-violet-700 to-indigo-700 px-4 py-3 flex items-center justify-between flex-shrink-0">
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

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 bg-[#080812]"
            style={{ scrollbarWidth: 'thin', scrollbarColor: '#3b0764 transparent' }}
          >
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {/* Bot avatar */}
                {msg.role === 'assistant' && (
                  <div className="w-6 h-6 rounded-full bg-violet-700 flex items-center justify-center flex-shrink-0 mr-2 mt-1">
                    <span className="text-white text-xs">🎬</span>
                  </div>
                )}

                <div className={`max-w-[78%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
                  <div
                    className={`px-3.5 py-2.5 text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-br from-violet-600 to-indigo-700 text-white rounded-2xl rounded-br-sm shadow-lg'
                        : 'bg-white/8 border border-white/8 text-gray-200 rounded-2xl rounded-bl-sm'
                    }`}
                  >
                    {msg.content}
                  </div>
                  {msg.provider && (
                    <p className="text-[10px] text-gray-600 mt-1 px-1">via {msg.provider}</p>
                  )}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isLoading && (
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
              disabled={isLoading}
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm outline-none focus:border-violet-500/60 focus:bg-white/8 disabled:opacity-50 text-white placeholder:text-gray-600 transition-all"
            />
            <button
              onClick={sendMessage}
              disabled={isLoading || !input.trim()}
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
            ? 'bg-white/10 border border-white/20 backdrop-blur-md'
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