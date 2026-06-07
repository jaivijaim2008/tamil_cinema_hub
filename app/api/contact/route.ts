import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  let body: any
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { name, email, message } = body
  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return NextResponse.json({ error: 'Name, email, and message are required.' }, { status: 400 })
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 })
  }

  // Rate limit: 3 messages per IP per 5 minutes
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'
  const now = Date.now()
  if (!(globalThis as any).__contactRL) (globalThis as any).__contactRL = new Map<string, number[]>()
  const rl: Map<string, number[]> = (globalThis as any).__contactRL
  const timestamps = rl.get(ip) ?? []
  const recent = timestamps.filter(t => now - t < 300_000)
  if (recent.length >= 3) {
    return NextResponse.json({ error: 'Too many messages. Please try again later.' }, { status: 429 })
  }
  recent.push(now)
  rl.set(ip, recent)

  const cleanName = name.trim().slice(0, 100)
  const cleanEmail = email.trim().slice(0, 200)
  const cleanMessage = message.trim().slice(0, 2000)

  // If no RESEND_API_KEY, just log the message and return success
  if (!process.env.RESEND_API_KEY) {
    console.log(`[Contact Form] ${cleanName} <${cleanEmail}>: ${cleanMessage}`)
    return NextResponse.json({ ok: true, message: 'Message received!' })
  }

  try {
    await resend.emails.send({
      from: 'TamilCinemaHub <onboarding@resend.dev>',
      to: 'tamilcinemahub@gmail.com',
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
  } catch (err: any) {
    console.error('[Contact API]', err?.message)
    return NextResponse.json({ error: 'Failed to send message. Please try again.' }, { status: 500 })
  }
}
