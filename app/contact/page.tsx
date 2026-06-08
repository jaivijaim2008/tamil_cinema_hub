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

  const inputStyle: React.CSSProperties = {
    width: '100%', borderRadius: 12, paddingLeft: 20, paddingRight: 20, paddingTop: 14, paddingBottom: 14,
    fontSize: 14, outline: 'none', border: '1px solid rgba(255,255,255,0.08)',
    background: 'rgba(255,255,255,0.05)', color: '#fff', fontFamily: "'DM Sans', sans-serif",
    transition: 'border-color 0.2s, box-shadow 0.2s',
  }

  return (
    <main style={{ background: 'var(--ink)', minHeight: '100vh' }}>
      {/* Hero */}
      <section style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '64px 0 40px' }}>
        <div style={{ maxWidth: 520, margin: '0 auto', padding: '0 24px', textAlign: 'center' }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 12, color: 'var(--rose-light)', fontFamily: "'Syne', sans-serif" }}>
            Get In Touch
          </p>
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 800, lineHeight: 1.05, marginBottom: 16, color: 'rgba(255,255,255,0.92)' }}>
            Contact Us
          </h1>
          <p style={{ fontSize: 16, lineHeight: 1.7, color: 'rgba(255,255,255,0.4)' }}>
            Have questions, movie suggestions, or just want to talk Tamil cinema? We read every message.
          </p>
        </div>
      </section>

      {/* Form */}
      <div style={{ maxWidth: 520, margin: '0 auto', padding: '48px 24px 96px' }}>
        {error && !submitted && (
          <div style={{ marginBottom: 24, borderRadius: 12, paddingLeft: 16, paddingRight: 16, paddingTop: 12, paddingBottom: 12, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(212,41,26,0.08)', border: '1px solid rgba(212,41,26,0.15)', color: 'var(--crimson)' }}>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            {error}
          </div>
        )}

        {submitted ? (
          <div style={{ borderRadius: 16, padding: 32, textAlign: 'center', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', background: 'rgba(13,148,136,0.12)', border: '1px solid rgba(13,148,136,0.2)' }}>
              <svg width="28" height="28" style={{ color: 'var(--teal-light)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 800, marginBottom: 8, color: 'rgba(255,255,255,0.92)' }}>Message Sent!</h3>
            <p style={{ fontSize: 14, lineHeight: 1.7, marginBottom: 28, color: 'rgba(255,255,255,0.4)' }}>
              We received your message and will get back to you within 24 hours.
            </p>
            <button onClick={() => setSubmitted(false)} className="btn-hero-secondary" style={{ fontSize: 13 }}>
              Send Another Message
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8, color: 'rgba(255,255,255,0.35)', fontFamily: "'Syne', sans-serif" }}>Your Name</label>
              <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Enter your name" style={inputStyle}
                onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(212,41,26,0.5)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(212,41,26,0.08)' }}
                onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.boxShadow = 'none' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8, color: 'rgba(255,255,255,0.35)', fontFamily: "'Syne', sans-serif" }}>Email Address</label>
              <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="you@example.com" style={inputStyle}
                onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(212,41,26,0.5)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(212,41,26,0.08)' }}
                onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.boxShadow = 'none' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8, color: 'rgba(255,255,255,0.35)', fontFamily: "'Syne', sans-serif" }}>Message</label>
              <textarea required rows={5} value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} placeholder="Write your message here..." style={{ ...inputStyle, resize: 'none' }}
                onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(212,41,26,0.5)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(212,41,26,0.08)' }}
                onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.boxShadow = 'none' }}
              />
            </div>
            <button type="submit" disabled={loading} className="btn-hero-primary" style={{ width: '100%', justifyContent: 'center', padding: '14px 24px', opacity: loading ? 0.5 : 1 }}>
              {loading ? (
                <>
                  <svg className="animate-spin" width="16" height="16" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Sending...
                </>
              ) : 'Send Message'}
            </button>
          </form>
        )}
      </div>
    </main>
  )
}
