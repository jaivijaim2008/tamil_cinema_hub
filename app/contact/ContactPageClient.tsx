'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Send, Loader2, CheckCircle, MapPin, Clock } from 'lucide-react'
import CinemaBackground from '../../components/graphics/CinemaBackground'

const schema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email required'),
  subject: z.string().min(3, 'Subject is required'),
  message: z.string().min(10, 'Message must be at least 10 characters').max(500),
})

type FormData = z.infer<typeof schema>

export default function ContactPageClient() {
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const messageValue = watch('message', '')

  const onSubmit = async (data: FormData) => {
    setSubmitting(true)
    try {
      await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      setSuccess(true)
    } catch {
      // handle error
    }
    setSubmitting(false)
  }

  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[40svh] flex flex-col items-center justify-center text-center px-6 overflow-hidden">
        <CinemaBackground />
        <div className="relative z-10">
          <p className="text-accent-gold text-[11px] font-mono tracking-[0.3em] uppercase mb-2">Contact</p>
          <h1 className="font-playfair text-[clamp(28px,6vw,56px)] text-text-primary leading-tight mb-4">
            Get in Touch
          </h1>
          <p className="text-text-secondary text-base max-w-md mx-auto">
            Have a suggestion, correction, or just want to say hello?
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-12">
          {/* Form */}
          <div>
            <AnimatePresence mode="wait">
              {success ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-bg-card border border-border-subtle rounded-2xl p-12 text-center"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                  >
                    <CheckCircle size={48} className="text-accent-gold mx-auto mb-4" />
                  </motion.div>
                  <h3 className="font-playfair text-2xl text-text-primary mb-2">Message Sent!</h3>
                  <p className="text-text-secondary text-sm">We&apos;ll get back to you as soon as possible.</p>
                  {/* Confetti */}
                  <div className="relative mt-6">
                    {Array.from({ length: 7 }).map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 1, y: 0, x: 0 }}
                        animate={{ opacity: 0, y: -60, x: (i - 3) * 20 }}
                        transition={{ duration: 1, delay: 0.2 }}
                        className="absolute left-1/2 bottom-0 w-2 h-2 bg-accent-gold rounded-sm"
                      />
                    ))}
                  </div>
                </motion.div>
              ) : (
                <motion.form
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onSubmit={handleSubmit(onSubmit)}
                  className="bg-bg-card border border-border-subtle rounded-2xl p-6 sm:p-8 space-y-6"
                >
                  {/* Name */}
                  <div className="relative">
                    <input
                      {...register('name')}
                      id="name"
                      type="text"
                      placeholder=" "
                      className="peer w-full bg-transparent border border-border-subtle rounded-xl px-4 pt-6 pb-2 text-text-primary text-base outline-none focus:border-accent-gold focus:shadow-[0_0_0_3px_rgba(232,184,75,0.12)] transition-all"
                    />
                    <label htmlFor="name" className="absolute left-4 top-2 text-text-muted text-xs peer-focus:text-accent-gold peer-focus:text-[10px] peer-[:not(:placeholder-shown)]:text-[10px] peer-[:not(:placeholder-shown)]:text-accent-gold transition-all pointer-events-none">
                      Name
                    </label>
                    {errors.name && <p className="text-accent-red text-xs mt-1">{errors.name.message}</p>}
                  </div>

                  {/* Email */}
                  <div className="relative">
                    <input
                      {...register('email')}
                      id="email"
                      type="email"
                      placeholder=" "
                      className="peer w-full bg-transparent border border-border-subtle rounded-xl px-4 pt-6 pb-2 text-text-primary text-base outline-none focus:border-accent-gold focus:shadow-[0_0_0_3px_rgba(232,184,75,0.12)] transition-all"
                    />
                    <label htmlFor="email" className="absolute left-4 top-2 text-text-muted text-xs peer-focus:text-accent-gold peer-focus:text-[10px] peer-[:not(:placeholder-shown)]:text-[10px] peer-[:not(:placeholder-shown)]:text-accent-gold transition-all pointer-events-none">
                      Email
                    </label>
                    {errors.email && <p className="text-accent-red text-xs mt-1">{errors.email.message}</p>}
                  </div>

                  {/* Subject */}
                  <div className="relative">
                    <input
                      {...register('subject')}
                      id="subject"
                      type="text"
                      placeholder=" "
                      className="peer w-full bg-transparent border border-border-subtle rounded-xl px-4 pt-6 pb-2 text-text-primary text-base outline-none focus:border-accent-gold focus:shadow-[0_0_0_3px_rgba(232,184,75,0.12)] transition-all"
                    />
                    <label htmlFor="subject" className="absolute left-4 top-2 text-text-muted text-xs peer-focus:text-accent-gold peer-focus:text-[10px] peer-[:not(:placeholder-shown)]:text-[10px] peer-[:not(:placeholder-shown)]:text-accent-gold transition-all pointer-events-none">
                      Subject
                    </label>
                    {errors.subject && <p className="text-accent-red text-xs mt-1">{errors.subject.message}</p>}
                  </div>

                  {/* Message */}
                  <div className="relative">
                    <textarea
                      {...register('message')}
                      id="message"
                      rows={5}
                      placeholder=" "
                      className="peer w-full bg-transparent border border-border-subtle rounded-xl px-4 pt-6 pb-2 text-text-primary text-base outline-none focus:border-accent-gold focus:shadow-[0_0_0_3px_rgba(232,184,75,0.12)] transition-all resize-none"
                    />
                    <label htmlFor="message" className="absolute left-4 top-2 text-text-muted text-xs peer-focus:text-accent-gold peer-focus:text-[10px] peer-[:not(:placeholder-shown)]:text-[10px] peer-[:not(:placeholder-shown)]:text-accent-gold transition-all pointer-events-none">
                      Message
                    </label>
                    <span className="absolute right-4 bottom-2 text-text-muted text-[10px]">
                      {messageValue.length}/500
                    </span>
                    {errors.message && <p className="text-accent-red text-xs mt-1">{errors.message.message}</p>}
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-accent-gold text-text-inverse font-semibold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-accent-gold-dim disabled:opacity-40 transition-colors min-h-[52px]"
                  >
                    {submitting ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <>
                        <Send size={16} />
                        Send Message
                      </>
                    )}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>

          {/* Info sidebar */}
          <div className="space-y-6">
            <div className="bg-bg-card border border-border-subtle rounded-2xl p-6">
              <h3 className="font-playfair text-lg text-text-primary mb-4">Contact Info</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Mail size={16} className="text-accent-gold mt-0.5 shrink-0" />
                  <div>
                    <p className="text-text-primary text-sm">Email</p>
                    <p className="text-text-secondary text-xs">hello@tamilcinemahub.xyz</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin size={16} className="text-accent-gold mt-0.5 shrink-0" />
                  <div>
                    <p className="text-text-primary text-sm">Location</p>
                    <p className="text-text-secondary text-xs">Chennai, Tamil Nadu, India</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock size={16} className="text-accent-gold mt-0.5 shrink-0" />
                  <div>
                    <p className="text-text-primary text-sm">Response Time</p>
                    <p className="text-text-secondary text-xs">Usually within 24-48 hours</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative clapperboard SVG */}
            <div className="hidden lg:block bg-bg-card border border-border-subtle rounded-2xl p-6 flex items-center justify-center">
              <svg viewBox="0 0 280 280" className="w-full max-w-[240px] text-accent-gold animate-floatUp opacity-70">
                <rect x="20" y="80" width="240" height="180" rx="8" fill="#1A1A1A" stroke="currentColor" strokeWidth="1.5" />
                <rect x="20" y="50" width="240" height="38" rx="4" fill="#141414" stroke="currentColor" strokeWidth="1.5" />
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <line key={i} x1={32 + i * 36} y1="50" x2={20 + i * 36} y2="88" stroke="currentColor" strokeWidth="10" strokeLinecap="round" opacity="0.9" />
                ))}
                <circle cx="140" cy="68" r="8" fill="none" stroke="currentColor" strokeWidth="2" />
                <text x="140" y="170" textAnchor="middle" fill="currentColor" fontSize="18" fontFamily="Georgia,serif" opacity="0.7">TamilCinemaHub</text>
                <text x="140" y="200" textAnchor="middle" fill="rgba(232,184,75,0.4)" fontSize="12" fontFamily="Courier New">SCENE · TAKE · ROLL</text>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
