'use client'

import { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import {
  Mail,
  Send,
  Loader2,
  CheckCircle,
  MapPin,
  Clock,
  Globe,
  MessageCircle,
  ArrowRight,
  Sparkles,
} from 'lucide-react'
import CinemaBackground from '../../components/graphics/CinemaBackground'
import FilmStripDecoration from '../../components/graphics/FilmStripDecoration'


/* ═══════════════════════════════════════════════════════════════════════════════
   SCHEMA & TYPES
   ═══════════════════════════════════════════════════════════════════════════════ */

const schema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email required'),
  subject: z.string().min(3, 'Subject is required'),
  message: z.string().min(10, 'Message must be at least 10 characters').max(500),
})

type FormData = z.infer<typeof schema>

/* ═══════════════════════════════════════════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════════════════════════════════════════ */

const contactMethods = [
  {
    icon: Mail,
    title: 'Email',
    value: 'hello@tamilcinemahub.xyz',
    description: 'For general inquiries and feedback',
    href: 'mailto:hello@tamilcinemahub.xyz',
    iconBg: 'bg-accent-gold-muted',
    iconText: 'text-accent-gold',
  },
  {
    icon: Globe,
    title: 'Twitter',
    value: '@TamilCinemaHub',
    description: 'Follow us for updates and discussions',
    href: 'https://twitter.com',
    iconBg: 'bg-accent-blue-muted',
    iconText: 'text-accent-blue',
  },
  {
    icon: Sparkles,
    title: 'GitHub',
    value: 'tamilcinema-hub',
    description: 'Open source contributions welcome',
    href: 'https://github.com',
    iconBg: 'bg-accent-purple-muted',
    iconText: 'text-accent-purple',
  },
]

const faqItems = [
  {
    question: 'How do I suggest a film to add?',
    answer: 'Use the contact form above or reach out on Twitter. We review all suggestions and add films with complete metadata.',
  },
  {
    question: 'Can I contribute to the project?',
    answer: 'Absolutely! We welcome contributions on GitHub. Whether it\'s code, data, or documentation — every bit helps.',
  },
  {
    question: 'How often is the database updated?',
    answer: 'We add new films weekly and update existing entries as new information becomes available. Major updates happen monthly.',
  },
  {
    question: 'Is the AI recommendation free?',
    answer: 'Yes! Our AI-powered recommendation engine is completely free to use. Just click the chat button on any page.',
  },
]

/* ═══════════════════════════════════════════════════════════════════════════════
   SUB-COMPONENTS
   ═══════════════════════════════════════════════════════════════════════════════ */

/* ── Contact Method Card ───────────────────────────────────────────────────── */
function ContactMethodCard({ method, index }: { method: typeof contactMethods[0]; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -4 }}
    >
      <a
        href={method.href}
        target={method.href.startsWith('http') ? '_blank' : undefined}
        rel={method.href.startsWith('http') ? 'noopener noreferrer' : undefined}
        className="block bg-bg-card border border-border-subtle rounded-2xl p-6 card-shine group hover:border-border-accent transition-all"
      >
        <div className={`w-12 h-12 rounded-xl ${method.iconBg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
          <method.icon size={20} className={method.iconText} />
        </div>
        <h3 className="text-text-primary font-semibold text-base mb-1 group-hover:text-accent-gold transition-colors">{method.title}</h3>
        <p className="text-text-secondary text-sm mb-2">{method.value}</p>
        <p className="text-text-muted text-xs">{method.description}</p>
      </a>
    </motion.div>
  )
}

/* ── FAQ Item ──────────────────────────────────────────────────────────────── */
function FAQItem({ item, index }: { item: typeof faqItems[0]; index: number }) {
  const [open, setOpen] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left bg-bg-card border border-border-subtle rounded-xl p-5 hover:border-border-accent transition-all group"
      >
        <div className="flex items-center justify-between">
          <h4 className="text-text-primary text-sm font-medium pr-4 group-hover:text-accent-gold transition-colors">{item.question}</h4>
          <motion.div animate={{ rotate: open ? 45 : 0 }} transition={{ duration: 0.2 }}>
            <span className="text-accent-gold text-lg leading-none">+</span>
          </motion.div>
        </div>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <p className="text-text-secondary text-sm leading-relaxed mt-3 pt-3 border-t border-border-subtle">
                {item.answer}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </button>
    </motion.div>
  )
}

/* ── Confetti Burst ────────────────────────────────────────────────────────── */
function ConfettiBurst() {
  return (
    <div className="relative mt-6">
      {Array.from({ length: 12 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 1, y: 0, x: 0, scale: 1 }}
          animate={{
            opacity: 0,
            y: -80 - Math.random() * 40,
            x: (i - 6) * 15 + (Math.random() - 0.5) * 20,
            scale: 0,
            rotate: Math.random() * 360,
          }}
          transition={{ duration: 1.2, delay: 0.1, ease: 'easeOut' }}
          className="absolute left-1/2 bottom-0"
          style={{
            width: 6 + Math.random() * 4,
            height: 6 + Math.random() * 4,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
            backgroundColor: ['#E8B84B', '#C0392B', '#A855F7', '#10B981', '#F43F5E'][i % 5],
          }}
        />
      ))}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════════════════ */

export default function ContactPageClient() {
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const heroRef = useRef(null)
  const heroInView = useInView(heroRef, { once: true })

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormData>({
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
      reset()
    } catch {
      // handle error
    }
    setSubmitting(false)
  }

  return (
    <>
      {/* ═══ HERO ═══ */}
      <section ref={heroRef} className="relative min-h-[50svh] flex flex-col items-center justify-center text-center px-6 overflow-hidden">
        <CinemaBackground />

        {/* Decorative */}
        <div className="absolute top-20 left-1/4 w-48 h-48 rounded-full blob-1 opacity-20" />
        <div className="absolute bottom-20 right-1/4 w-36 h-36 rounded-full blob-2 opacity-20" />

        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={heroInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 bg-accent-gold-muted/60 backdrop-blur-sm border border-accent-gold/20 rounded-full px-4 py-2 mb-6"
          >
            <Mail size={14} className="text-accent-gold" />
            <span className="text-accent-gold text-[11px] font-mono tracking-[0.2em] uppercase">Contact</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="font-playfair text-[clamp(32px,7vw,64px)] text-text-primary leading-tight mb-5"
          >
            Get in <span className="text-gradient-gold">Touch</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={heroInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-text-secondary text-base sm:text-lg max-w-md mx-auto leading-relaxed"
          >
            Have a suggestion, correction, or just want to say hello? We&apos;d love to hear from you.
          </motion.p>
        </div>
      </section>

      <FilmStripDecoration className="opacity-30" />

      <div className="max-w-6xl mx-auto px-6 sm:px-8 py-16 sm:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-12 lg:gap-16">
          {/* ═══ FORM ═══ */}
          <div>
            <AnimatePresence mode="wait">
              {success ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-bg-card border border-border-subtle rounded-2xl p-12 text-center relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-accent-gold/5 via-transparent to-accent-emerald/5 pointer-events-none" />
                  <div className="relative z-10">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                      className="w-16 h-16 rounded-full bg-accent-emerald-muted flex items-center justify-center mx-auto mb-6"
                    >
                      <CheckCircle size={32} className="text-accent-emerald" />
                    </motion.div>
                    <h3 className="font-playfair text-2xl text-text-primary mb-3">Message Sent!</h3>
                    <p className="text-text-secondary text-sm mb-6">Thank you for reaching out. We&apos;ll get back to you as soon as possible.</p>
                    <ConfettiBurst />
                    <button
                      onClick={() => setSuccess(false)}
                      className="mt-6 text-accent-gold border border-accent-gold/30 rounded-xl px-6 py-2.5 hover:bg-accent-gold-muted transition-colors text-sm font-medium"
                    >
                      Send Another Message
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.form
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  onSubmit={handleSubmit(onSubmit)}
                  className="bg-bg-card border border-border-subtle rounded-2xl p-6 sm:p-8 space-y-6"
                >
                  <div className="mb-2">
                    <h2 className="font-playfair text-xl text-text-primary mb-1">Send a Message</h2>
                    <p className="text-text-muted text-sm">We typically respond within 24-48 hours</p>
                  </div>

                  {/* Name */}
                  <div className="relative">
                    <input
                      {...register('name')}
                      id="name"
                      type="text"
                      placeholder=" "
                      autoComplete="name"
                      className="peer w-full bg-transparent border border-border-subtle rounded-xl px-4 pt-6 pb-2 text-text-primary text-base outline-none focus:border-accent-gold focus:shadow-[0_0_0_3px_rgba(232,184,75,0.12)] transition-all"
                    />
                    <label htmlFor="name" className="absolute left-4 top-2 text-text-muted text-xs peer-focus:text-accent-gold peer-focus:text-[10px] peer-[:not(:placeholder-shown)]:text-[10px] peer-[:not(:placeholder-shown)]:text-accent-gold transition-all pointer-events-none">
                      Your Name
                    </label>
                    {errors.name && <p className="text-accent-red text-xs mt-1.5">{errors.name.message}</p>}
                  </div>

                  {/* Email */}
                  <div className="relative">
                    <input
                      {...register('email')}
                      id="email"
                      type="email"
                      placeholder=" "
                      autoComplete="email"
                      className="peer w-full bg-transparent border border-border-subtle rounded-xl px-4 pt-6 pb-2 text-text-primary text-base outline-none focus:border-accent-gold focus:shadow-[0_0_0_3px_rgba(232,184,75,0.12)] transition-all"
                    />
                    <label htmlFor="email" className="absolute left-4 top-2 text-text-muted text-xs peer-focus:text-accent-gold peer-focus:text-[10px] peer-[:not(:placeholder-shown)]:text-[10px] peer-[:not(:placeholder-shown)]:text-accent-gold transition-all pointer-events-none">
                      Email Address
                    </label>
                    {errors.email && <p className="text-accent-red text-xs mt-1.5">{errors.email.message}</p>}
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
                    {errors.subject && <p className="text-accent-red text-xs mt-1.5">{errors.subject.message}</p>}
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
                      Your Message
                    </label>
                    <div className="absolute right-4 bottom-2 flex items-center gap-2">
                      <span className={`text-[10px] font-mono ${messageValue.length > 450 ? 'text-accent-amber' : 'text-text-muted'}`}>
                        {messageValue.length}/500
                      </span>
                    </div>
                    {errors.message && <p className="text-accent-red text-xs mt-1.5">{errors.message.message}</p>}
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-accent-gold text-text-inverse font-semibold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-accent-gold-dim disabled:opacity-40 transition-all min-h-[52px] shadow-lg shadow-accent-gold/20 hover:shadow-accent-gold/30"
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

          {/* ═══ SIDEBAR ═══ */}
          <div className="space-y-6">
            {/* Contact methods */}
            {contactMethods.map((method, i) => (
              <ContactMethodCard key={method.title} method={method} index={i} />
            ))}

            {/* Response time */}
            <div className="bg-bg-card border border-border-subtle rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-accent-emerald-muted flex items-center justify-center">
                  <Clock size={14} className="text-accent-emerald" />
                </div>
                <h3 className="text-text-primary font-semibold text-sm">Response Time</h3>
              </div>
              <p className="text-text-secondary text-xs leading-relaxed">
                We typically respond within 24-48 hours. For urgent matters, reach out on Twitter for a faster response.
              </p>
            </div>

            {/* Location */}
            <div className="bg-bg-card border border-border-subtle rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-accent-gold-muted flex items-center justify-center">
                  <MapPin size={14} className="text-accent-gold" />
                </div>
                <h3 className="text-text-primary font-semibold text-sm">Based In</h3>
              </div>
              <p className="text-text-secondary text-xs leading-relaxed">
                Chennai, Tamil Nadu, India — the heart of Kollywood
              </p>
            </div>

            {/* Clapperboard decoration */}
            <div className="hidden lg:block bg-bg-card border border-border-subtle rounded-2xl p-6 flex items-center justify-center">
              <motion.svg
                viewBox="0 0 280 280"
                className="w-full max-w-[220px] text-accent-gold opacity-60"
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              >
                <rect x="20" y="80" width="240" height="180" rx="8" fill="#1A1A1A" stroke="currentColor" strokeWidth="1.5" />
                <rect x="20" y="50" width="240" height="38" rx="4" fill="#141414" stroke="currentColor" strokeWidth="1.5" />
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <line key={i} x1={32 + i * 36} y1="50" x2={20 + i * 36} y2="88" stroke="currentColor" strokeWidth="10" strokeLinecap="round" opacity="0.9" />
                ))}
                <circle cx="140" cy="68" r="8" fill="none" stroke="currentColor" strokeWidth="2" />
                <text x="140" y="170" textAnchor="middle" fill="currentColor" fontSize="16" fontFamily="Georgia,serif" opacity="0.7">TamilCinemaHub</text>
                <text x="140" y="195" textAnchor="middle" fill="rgba(232,184,75,0.4)" fontSize="11" fontFamily="Courier New">SCENE · TAKE · ROLL</text>
              </motion.svg>
            </div>
          </div>
        </div>

        {/* ═══ FAQ SECTION ═══ */}
        <section className="mt-20">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-accent-purple-muted/60 backdrop-blur-sm border border-accent-purple/20 rounded-full px-4 py-2 mb-6">
              <MessageCircle size={14} className="text-accent-purple" />
              <span className="text-accent-purple text-[11px] font-mono tracking-[0.2em] uppercase">FAQ</span>
            </div>
            <h2 className="font-playfair text-2xl md:text-3xl text-text-primary mb-3">
              Frequently Asked <span className="text-gradient-purple">Questions</span>
            </h2>
          </div>

          <div className="max-w-2xl mx-auto space-y-3">
            {faqItems.map((item, i) => (
              <FAQItem key={item.question} item={item} index={i} />
            ))}
          </div>
        </section>
      </div>
    </>
  )
}
