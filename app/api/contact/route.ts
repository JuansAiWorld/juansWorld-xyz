import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const name = String(formData.get('name') ?? '')
    const email = String(formData.get('email') ?? '')
    const reason = String(formData.get('reason') ?? 'other')
    const message = String(formData.get('message') ?? '')

    if (!name || !email || !message) {
      return NextResponse.redirect(
        new URL('/ask-juan.html?error=missing', request.url),
        303
      )
    }

    const to = process.env.CONTACT_EMAIL
    if (!to) {
      console.error('CONTACT_EMAIL env var is not set')
      return NextResponse.redirect(
        new URL('/ask-juan.html?error=config', request.url),
        303
      )
    }

    await resend.emails.send({
      from: 'Juan\'s World <onboarding@resend.dev>',
      to,
      subject: `New message from ${name} — ${reason}`,
      text: `From: ${name} <${email}>\nReason: ${reason}\n\n${message}`,
      replyTo: email,
    })

    return NextResponse.redirect(
      new URL('/ask-juan.html?sent=1', request.url),
      303
    )
  } catch (err) {
    console.error('Contact form error:', err)
    return NextResponse.redirect(
      new URL('/ask-juan.html?error=1', request.url),
      303
    )
  }
}
