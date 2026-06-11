'use client'

import { useState } from 'react'
import { X, Send } from 'lucide-react'

interface Props {
  open: boolean
  onClose: () => void
}

export default function AIChatModal({ open, onClose }: Props) {
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  if (!open) return null

  async function send() {
    const q = input.trim()
    if (!q || loading) return
    setInput('')
    setMessages((prev) => [...prev, { role: 'user', text: q }])
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: q }),
      })
      const data = await res.json()
      setMessages((prev) => [...prev, { role: 'ai', text: data.reply || data.error || 'No response.' }])
    } catch {
      setMessages((prev) => [...prev, { role: 'ai', text: 'Something went wrong. Try again.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-end md:items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full md:w-[440px] md:max-w-lg bg-bg-primary border border-border rounded-t-2xl md:rounded-2xl flex flex-col max-h-[80vh] overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-sm font-semibold text-text-primary">AI Assistant</span>
          </div>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary transition-colors" aria-label="Close chat">
            <X size={18} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[200px]">
          {messages.length === 0 && (
            <p className="text-sm text-text-muted text-center py-10">Ask me about Tamil cinema!</p>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[85%] px-3 py-2 rounded-xl text-sm ${
                  m.role === 'user'
                    ? 'bg-accent-gold text-text-inverse'
                    : 'bg-bg-card text-text-primary border border-border'
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-bg-card border border-border px-3 py-2 rounded-xl text-sm text-text-muted animate-pulse">
                Thinking…
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t border-border p-3">
          <form
            onSubmit={(e) => { e.preventDefault(); send() }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about movies, directors, genres…"
              className="flex-1 px-3 py-2 rounded-lg bg-bg-card border border-border text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-gold/50"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="w-9 h-9 flex items-center justify-center rounded-lg bg-accent-gold text-text-inverse disabled:opacity-40 disabled:cursor-not-allowed hover:bg-accent-gold-dim transition-colors"
              aria-label="Send message"
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
