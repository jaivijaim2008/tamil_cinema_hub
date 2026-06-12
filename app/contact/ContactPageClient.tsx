'use client'

import { useState } from 'react'
import { Mail, Send, CheckCircle, MessageSquare } from 'lucide-react'

export default function ContactPageClient() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('sending')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        setStatus('sent')
        setForm({ name: '', email: '', subject: '', message: '' })
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="min-h-screen pt-20 md:pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-accent-gold mb-3 block">Contact</span>
          <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-3">Get in Touch</h1>
          <p className="text-sm text-text-secondary">Have a suggestion, correction, or just want to say hi?</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Contact info */}
          <div className="space-y-4">
            <div className="bg-bg-card border border-border rounded-xl p-4">
              <Mail size={18} className="text-accent-gold mb-2" />
              <p className="text-sm font-semibold text-text-primary">Email</p>
              <p className="text-xs text-text-muted">Reach us via the contact form below.</p>
            </div>
            <div className="bg-bg-card border border-border rounded-xl p-4">
              <MessageSquare size={18} className="text-accent-gold mb-2" />
              <p className="text-sm font-semibold text-text-primary">Feedback</p>
              <p className="text-xs text-text-muted">We love hearing from our community</p>
            </div>
          </div>

          {/* Form */}
          <div className="md:col-span-2">
            {status === 'sent' ? (
              <div className="bg-bg-card border border-border rounded-2xl p-10 text-center">
                <CheckCircle size={48} className="text-success mx-auto mb-4" />
                <h3 className="text-lg font-bold text-text-primary mb-2">Message Sent!</h3>
                <p className="text-sm text-text-muted">Thank you for reaching out. We&apos;ll get back to you soon.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-bg-card border border-border rounded-2xl p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-text-muted mb-1.5">Name</label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-lg bg-bg-primary border border-border text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-gold/50 transition-colors"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-text-muted mb-1.5">Email</label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-lg bg-bg-primary border border-border text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-gold/50 transition-colors"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1.5">Subject</label>
                  <input
                    type="text"
                    required
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-lg bg-bg-primary border border-border text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-gold/50 transition-colors"
                    placeholder="What's this about?"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1.5">Message</label>
                  <textarea
                    required
                    rows={5}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-lg bg-bg-primary border border-border text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-gold/50 transition-colors resize-none"
                    placeholder="Your message…"
                  />
                </div>
                {status === 'error' && (
                  <p className="text-xs text-error">Something went wrong. Please try again.</p>
                )}
                <button
                  type="submit"
                  disabled={status === 'sending'}
                  className="flex items-center gap-2 bg-accent-gold text-text-inverse px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-accent-gold-dim disabled:opacity-50 transition-colors"
                >
                  <Send size={14} />
                  {status === 'sending' ? 'Sending…' : 'Send Message'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
