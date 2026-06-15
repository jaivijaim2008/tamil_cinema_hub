import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { escapeHtml } from '@/lib/sanitize'

function getResend() {
  if (!process.env.RESEND_API_KEY) return null
  return new Resend(process.env.RESEND_API_KEY)
}

// ── Request body size limit (8KB) ──────────────────────────────────────────
const MAX_BODY_SIZE = 8 * 1024

export async function POST(req: NextRequest) {
  // Check content-length header as first line of defense
  const contentLength = parseInt(req.headers.get('content-length') || '0', 10)
  if (contentLength > MAX_BODY_SIZE) {
    return NextResponse.json({ error: 'Request too large.' }, { status: 413 })
  }

  let body: Record<string, unknown>
  try { body = await req.json() as Record<string, unknown> } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // Validate body is a plain object with expected keys only
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const { name, email, message } = body as { name?: string; email?: string; message?: string }
  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return NextResponse.json({ error: 'Name, email, and message are required.' }, { status: 400 })
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 })
  }

  // Rate limit: 3 messages per IP per 5 minutes
  // (middleware also enforces this as defense-in-depth)
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'
  const now = Date.now()
  if (!(globalThis as Record<string, unknown>).__contactRL) (globalThis as Record<string, unknown>).__contactRL = new Map<string, number[]>()
  const rl: Map<string, number[]> = (globalThis as Record<string, unknown>).__contactRL as Map<string, number[]>
  const timestamps = rl.get(ip) ?? []
  const recent = timestamps.filter(t => now - t < 300_000)
  if (recent.length >= 3) {
    return NextResponse.json({ error: 'Too many messages. Please try again later.' }, { status: 429 })
  }
  recent.push(now)
  rl.set(ip, recent)

  // Sanitize and escape all user input
  const cleanName = escapeHtml(name.trim().slice(0, 100))
  const cleanEmail = escapeHtml(email.trim().slice(0, 200))
  const cleanMessage = escapeHtml(message.trim().slice(0, 2000))

  // If no RESEND_API_KEY, just log the message and return success
  const resend = getResend()
  if (!resend) {
    console.log(`[Contact Form] ${cleanName} <${cleanEmail}>: ${cleanMessage}`)
    return NextResponse.json({ ok: true, message: 'Message received!' })
  }

  try {
    await resend.emails.send({
      from: 'TamilCinemaHub <onboarding@resend.dev>',
      to: 'jaitnea@gmail.com',
      replyTo: cleanEmail,
      subject: `📩 Contact: ${cleanName} — TamilCinemaHub`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #7c3aed;">New Contact Message</h2>
          <div style="background: #f8f8ff; border-radius: 12px; padding: 20px; margin: 16px 0;">
            <p><strong>Name:</strong> ${cleanName}</p>
            <p><strong>Email:</strong> <a href="mailto:${cleanEmail}">${cleanEmail}</a></p>
            <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 16px 0;" />
            <p style="white-space: pre-wrap; line-height: 1.6;">${cleanMessage}</p>
          </div>
          <p style="color: #888; font-size: 12px;">Sent from TamilCinemaHub Contact Form</p>
        </div>
      `,
    })

    return NextResponse.json({ ok: true, message: 'Message sent successfully!' })
  } catch (err: unknown) {
    console.error('[Contact API]', err instanceof Error ? err.message : err)
    return NextResponse.json({ error: 'Failed to send message. Please try again.' }, { status: 500 })
  }
}
