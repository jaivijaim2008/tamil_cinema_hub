'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { X, Send, Trash2, Bot, User, Sparkles } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  suggestions?: string[]
  timestamp: number
}

const STORAGE_KEY = 'tamilcinema_chat_history'
const MAX_STORED_MESSAGES = 50

function loadHistory(): ChatMessage[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.slice(-MAX_STORED_MESSAGES)
  } catch {
    return []
  }
}

function saveHistory(messages: ChatMessage[]) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-MAX_STORED_MESSAGES)))
  } catch {}
}

/**
 * Pre-process markdown content to convert [poster:URL] syntax to real images.
 */
function cleanContent(text: string): string {
  return text
    // Convert [poster:URL] → markdown image
    .replace(/\[poster:(https?:\/\/[^\]]+)\]/g, '![]($1)')
}

/** Custom ReactMarkdown components for chat styling */
function ChatMarkdown({ content }: { content: string }) {
  const cleaned = useMemo(() => cleanContent(content), [content])

  return (
    <div className="prose prose-invert prose-sm max-w-none
      prose-a:text-accent-gold prose-a:no-underline hover:prose-a:underline
      prose-strong:text-text-primary prose-p:text-text-secondary
      prose-img:rounded-lg prose-img:my-2 prose-img:max-w-[120px]
      prose-img:shadow-md prose-img:border prose-img:border-white/10
      prose-headings:text-text-primary prose-li:text-text-secondary
    ">
      <ReactMarkdown
        components={{
          img: ({ src, alt }) => (
            <img
              src={src}
              alt={alt || 'Movie poster'}
              className="inline-block w-[80px] h-[120px] object-cover rounded-lg shadow-md border border-white/10 mr-2 mb-1 float-left"
              loading="lazy"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
          ),
        }}
      >
        {cleaned}
      </ReactMarkdown>
    </div>
  )
}

interface Props {
  open: boolean
  onClose: () => void
}

export default function AIChatModal({ open, onClose }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Load history on mount
  useEffect(() => {
    if (open) {
      const history = loadHistory()
      if (history.length > 0) {
        setMessages(history)
        const lastSuggestions = history.filter(m => m.suggestions?.length).pop()?.suggestions
        if (lastSuggestions) setSuggestions(lastSuggestions)
      }
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  // Save history when messages change
  useEffect(() => {
    if (messages.length > 0) {
      saveHistory(messages)
    }
  }, [messages])

  const sendMessage = useCallback(async (text: string) => {
    const q = text.trim()
    if (!q || loading) return
    setInput('')
    setSuggestions([])

    const userMsg: ChatMessage = { role: 'user', content: q, timestamp: Date.now() }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)

    try {
      // Send full conversation history for memory
      const historyForAPI = [...messages, userMsg].map(m => ({
        role: m.role,
        content: m.content,
      }))

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: historyForAPI }),
      })
      const data = await res.json()

      const aiMsg: ChatMessage = {
        role: 'assistant',
        content: data.reply || data.error || 'No response.',
        suggestions: data.suggestions,
        timestamp: Date.now(),
      }
      setMessages(prev => [...prev, aiMsg])
      if (data.suggestions?.length) setSuggestions(data.suggestions)
    } catch {
      const errorMsg: ChatMessage = {
        role: 'assistant',
        content: 'Something went wrong. Please try again.',
        timestamp: Date.now(),
      }
      setMessages(prev => [...prev, errorMsg])
    } finally {
      setLoading(false)
    }
  }, [messages, loading])

  const clearHistory = useCallback(() => {
    setMessages([])
    setSuggestions([])
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full sm:w-[480px] sm:max-w-lg bg-bg-primary border border-border rounded-t-2xl sm:rounded-2xl flex flex-col h-[100dvh] sm:h-auto sm:max-h-[85vh] overflow-hidden animate-slide-up shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-bg-card/50 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-accent-gold/10 flex items-center justify-center">
              <Sparkles size={14} className="text-accent-gold" />
            </div>
            <div>
              <span className="text-sm font-semibold text-text-primary">TamilCinema AI</span>
              <p className="text-[10px] text-text-muted">Your Tamil cinema guide 🎬</p>
            </div>
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-1" />
          </div>
          <div className="flex items-center gap-1">
            {messages.length > 0 && (
              <button
                onClick={clearHistory}
                className="p-1.5 text-text-muted hover:text-red-400 transition-colors rounded-lg hover:bg-white/5"
                title="Clear conversation"
              >
                <Trash2 size={14} />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-text-muted hover:text-text-primary transition-colors rounded-lg hover:bg-white/5"
              aria-label="Close chat"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 min-h-0">
          {messages.length === 0 && (
            <div className="text-center py-8">
              <div className="w-12 h-12 rounded-full bg-accent-gold/10 flex items-center justify-center mx-auto mb-3">
                <Sparkles size={20} className="text-accent-gold" />
              </div>
              <p className="text-sm font-medium text-text-primary mb-1">Ask me about Tamil cinema!</p>
              <p className="text-xs text-text-muted">I remember our conversation so ask follow-ups naturally.</p>
            </div>
          )}

          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex gap-2 max-w-[92%] sm:max-w-[88%] ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                {/* Avatar */}
                <div className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-1 ${
                  m.role === 'user'
                    ? 'bg-accent-gold/20'
                    : 'bg-bg-elevated border border-border'
                }`}>
                  {m.role === 'user'
                    ? <User size={10} className="text-accent-gold" />
                    : <Bot size={10} className="text-text-muted" />
                  }
                </div>
                {/* Message bubble */}
                <div className={`px-3 py-2 rounded-xl text-sm ${
                  m.role === 'user'
                    ? 'bg-accent-gold text-text-inverse'
                    : 'bg-bg-card text-text-primary border border-border/50'
                }`}>
                  {m.role === 'assistant' ? (
                    <ChatMarkdown content={m.content} />
                  ) : (
                    <p className="break-words">{m.content}</p>
                  )}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="flex gap-2">
                <div className="shrink-0 w-6 h-6 rounded-full bg-bg-elevated border border-border flex items-center justify-center mt-1">
                  <Bot size={10} className="text-text-muted" />
                </div>
                <div className="bg-bg-card border border-border/50 px-3 py-2.5 rounded-xl space-y-2">
                  <div className="h-3 w-32 rounded-full bg-gradient-to-r from-white/[0.04] via-white/[0.08] to-white/[0.04] animate-shimmer" />
                  <div className="h-3 w-24 rounded-full bg-gradient-to-r from-white/[0.04] via-white/[0.08] to-white/[0.04] animate-shimmer" style={{ animationDelay: '150ms' }} />
                  <div className="h-3 w-20 rounded-full bg-gradient-to-r from-white/[0.04] via-white/[0.08] to-white/[0.04] animate-shimmer" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggestions */}
        {suggestions.length > 0 && !loading && (
          <div className="px-3 sm:px-4 pb-2 flex flex-wrap gap-1.5 shrink-0">
            {suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => sendMessage(s)}
                className="text-[11px] px-2.5 py-1 rounded-full bg-accent-gold/5 border border-accent-gold/15 text-accent-gold/80 hover:bg-accent-gold/10 hover:text-accent-gold transition-colors font-medium"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="border-t border-border p-3 bg-bg-card/30 shrink-0">
          <form
            onSubmit={(e) => { e.preventDefault(); sendMessage(input) }}
            className="flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about movies, actors, directors…"
              className="flex-1 px-3 py-2.5 rounded-xl bg-bg-elevated border border-border text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-accent-gold/50 transition-colors"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-accent-gold text-text-inverse disabled:opacity-30 disabled:cursor-not-allowed hover:bg-accent-gold-dim transition-all"
              aria-label="Send message"
            >
              <Send size={15} />
            </button>
          </form>
          <p className="text-[9px] text-text-muted/40 text-center mt-1.5">
            Conversation memory enabled
          </p>
        </div>
      </div>
    </div>
  )
}
