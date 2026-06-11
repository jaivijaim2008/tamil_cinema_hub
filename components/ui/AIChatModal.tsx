'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, Bot, User } from 'lucide-react'

interface Props {
  open: boolean
  onClose: () => void
}

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const suggestedPrompts = [
  'Best thriller of 2024?',
  'Hidden gems on Netflix?',
  'Lokesh Kanagaraj films?',
  'Similar to Vikram?',
]

export default function AIChatModal({ open, onClose }: Props) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return
    const userMsg: Message = { role: 'user', content: text.trim() }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text.trim(), history: messages }),
      })
      const data = await res.json()
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply || "I couldn't process that request." }])
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' }])
    }
    setLoading(false)
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[55] bg-black/40 lg:bg-transparent"
            onClick={onClose}
          />

          {/* Desktop: side drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="hidden lg:flex fixed right-0 top-0 bottom-0 w-[420px] z-[60] flex-col glass border-l border-border-subtle"
          >
            <ChatContent
              messages={messages}
              setMessages={setMessages}
              input={input}
              setInput={setInput}
              loading={loading}
              setLoading={setLoading}
              onClose={onClose}
              chatEndRef={chatEndRef}
              sendMessage={sendMessage}
              suggestedPrompts={suggestedPrompts}
            />
          </motion.div>

          {/* Mobile: bottom sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="lg:hidden fixed inset-x-0 bottom-0 z-[60] flex flex-col glass rounded-t-3xl border-t border-border-subtle"
            style={{ height: '90svh' }}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-text-muted/40" />
            </div>
            <ChatContent
              messages={messages}
              setMessages={setMessages}
              input={input}
              setInput={setInput}
              loading={loading}
              setLoading={setLoading}
              onClose={onClose}
              chatEndRef={chatEndRef}
              sendMessage={sendMessage}
              suggestedPrompts={suggestedPrompts}
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

function ChatContent({
  messages, setMessages, input, setInput, loading, setLoading, onClose, chatEndRef, sendMessage, suggestedPrompts,
}: {
  messages: Message[]
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>
  input: string
  setInput: (v: string) => void
  loading: boolean
  setLoading: (v: boolean) => void
  onClose: () => void
  chatEndRef: React.RefObject<HTMLDivElement | null>
  sendMessage: (text: string) => void
  suggestedPrompts: string[]
}) {
  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border-subtle">
        <div>
          <p className="text-text-primary font-semibold text-sm flex items-center gap-1.5">
            <span className="text-accent-gold">🎬</span> TamilCinemaHub AI
          </p>
          <p className="text-text-muted text-xs">Knows 1,600+ films</p>
        </div>
        <button onClick={onClose} className="p-2 rounded-full hover:bg-bg-elevated transition-colors" aria-label="Close chat">
          <X size={18} className="text-text-secondary" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
            <Bot size={32} className="text-accent-gold/40" />
            <p className="text-text-secondary text-sm">Ask me about Tamil cinema!</p>
            <div className="grid grid-cols-2 gap-2 w-full max-w-xs">
              {suggestedPrompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => sendMessage(prompt)}
                  className="text-left text-xs px-3 py-2 rounded-xl border border-border-accent text-text-secondary hover:text-accent-gold hover:bg-accent-gold-muted transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-accent-gold text-text-inverse rounded-br-sm'
                  : 'bg-bg-elevated text-text-primary rounded-bl-sm'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-1 p-3 bg-bg-elevated rounded-2xl rounded-tl-sm w-fit">
            {[0, 0.2, 0.4].map((delay) => (
              <motion.div
                key={delay}
                className="w-2 h-2 rounded-full bg-text-muted"
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 0.8, repeat: Infinity, delay }}
              />
            ))}
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border-subtle p-3 safe-bottom">
        <div className="flex gap-2 items-end">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                sendMessage(input)
              }
            }}
            placeholder="Ask about Tamil films..."
            rows={1}
            className="flex-1 bg-bg-elevated text-text-primary text-base px-4 py-3 rounded-xl border border-border-subtle outline-none focus:border-accent-gold resize-none"
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || loading}
            className="bg-accent-gold rounded-xl p-3 hover:bg-accent-gold-dim disabled:opacity-40 transition-colors shrink-0"
            aria-label="Send message"
          >
            <Send size={18} className="text-text-inverse" />
          </button>
        </div>
      </div>
    </>
  )
}
