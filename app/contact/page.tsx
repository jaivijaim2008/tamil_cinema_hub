'use client'

import { useState } from 'react'

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.email || !formData.message) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to send message. Please try again.')
        setLoading(false)
        return
      }
      setSubmitted(true)
      setFormData({ name: '', email: '', message: '' })
    } catch {
      setError('Network error. Please try again.')
    }
    setLoading(false)
  }

  return (
    <main className="min-h-screen" style={{ background: '#F7F7F5' }}>
      {/* ── Hero ── */}
      <section style={{ background: '#FFFFFF', borderBottom: '1px solid #E8E7E3' }}>
        <div className="mx-auto max-w-xl px-6 pt-16 pb-10 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] mb-3" style={{ color: '#D4291A' }}>
            Get In Touch
          </p>
          <h1
            className="text-4xl sm:text-5xl font-bold leading-[1.05] tracking-tight mb-4"
            style={{ fontFamily: "'Fraunces', serif", color: '#111111' }}
          >
            Contact Us
          </h1>
          <p className="text-base leading-relaxed" style={{ color: '#666666' }}>
            Have questions, movie suggestions, or just want to talk Tamil cinema? We read every message.
          </p>
        </div>
      </section>

      {/* ── Form ── */}
      <div className="mx-auto max-w-xl px-6 py-12">

        {error && !submitted && (
          <div
            className="mb-6 rounded-lg px-4 py-3 text-sm flex items-center gap-2"
            style={{ background: '#FFF5F5', border: '1px solid #D4291A33', color: '#D4291A' }}
          >
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            {error}
          </div>
        )}

        {submitted ? (
          <div
            className="rounded-xl p-8 text-center"
            style={{ background: '#FFFFFF', border: '1px solid #E8E7E3' }}
          >
            <div
              className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full"
              style={{ background: '#F0FFF4', border: '1px solid #1A8C4E33' }}
            >
              <svg className="h-7 w-7" style={{ color: '#1A8C4E' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2" style={{ fontFamily: "'Fraunces', serif", color: '#111111' }}>Message Sent!</h3>
            <p className="text-sm leading-relaxed mb-7" style={{ color: '#666666' }}>
              We received your message and will get back to you within 24 hours.
            </p>
            <button
              onClick={() => setSubmitted(false)}
              className="rounded-md px-6 py-2.5 text-xs font-semibold text-white transition-all hover:translate-y-[-1px]"
              style={{ background: '#D4291A' }}
            >
              Send Another Message
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-[11px] font-semibold uppercase tracking-[0.1em] mb-2"
                style={{ color: '#888888' }}
              >
                Your Name
              </label>
              <input
                type="text"
                id="name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter your name"
                className="w-full rounded-lg px-5 py-3.5 text-sm outline-none transition-all"
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #E8E7E3',
                  color: '#111111',
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = '#D4291A')}
                onBlur={(e) => (e.currentTarget.style.borderColor = '#E8E7E3')}
              />
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-[11px] font-semibold uppercase tracking-[0.1em] mb-2"
                style={{ color: '#888888' }}
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="you@example.com"
                className="w-full rounded-lg px-5 py-3.5 text-sm outline-none transition-all"
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #E8E7E3',
                  color: '#111111',
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = '#D4291A')}
                onBlur={(e) => (e.currentTarget.style.borderColor = '#E8E7E3')}
              />
            </div>

            {/* Message */}
            <div>
              <label
                htmlFor="message"
                className="block text-[11px] font-semibold uppercase tracking-[0.1em] mb-2"
                style={{ color: '#888888' }}
              >
                Message
              </label>
              <textarea
                id="message"
                required
                rows={5}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Write your message here..."
                className="w-full rounded-lg px-5 py-3.5 text-sm outline-none transition-all resize-none"
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #E8E7E3',
                  color: '#111111',
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = '#D4291A')}
                onBlur={(e) => (e.currentTarget.style.borderColor = '#E8E7E3')}
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg py-3.5 text-sm font-semibold text-white transition-all hover:translate-y-[-1px] disabled:opacity-50 flex items-center justify-center gap-2"
              style={{ background: '#D4291A' }}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Sending...
                </>
              ) : (
                'Send Message'
              )}
            </button>
          </form>
        )}
      </div>
    </main>
  )
}
