import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email/send'
import { processInboundEmail } from '@/lib/hermes/agent'

export async function POST(request: NextRequest) {
  const referer = request.headers.get('referer') || ''
  const isJp = referer.includes('/jp/')
  const redirectBase = isJp ? '/jp/ask-juan.html' : '/ask-juan.html'

  try {
    const formData = await request.formData()
    const name = String(formData.get('name') ?? '').trim()
    const email = String(formData.get('email') ?? '').trim()
    const reason = String(formData.get('reason') ?? 'other')
    const message = String(formData.get('message') ?? '').trim()

    if (!name || !email || !message) {
      return NextResponse.redirect(
        new URL(`${redirectBase}?error=missing`, request.url),
        303
      )
    }

    const to = process.env.CONTACT_EMAIL
    if (!to) {
      console.error('CONTACT_EMAIL env var is not set')
      return NextResponse.redirect(
        new URL(`${redirectBase}?error=config`, request.url),
        303
      )
    }

    // 1. Send notification email to admin
    const { id, error } = await sendEmail({
      to,
      subject: `New message from ${name} — ${reason}`,
      text: `From: ${name} <${email}>\nReason: ${reason}\n\n${message}`,
      replyTo: email,
    })

    if (error) {
      console.error('Send email error:', error)
      const errMsg = encodeURIComponent(error.message || 'unknown')
      return NextResponse.redirect(
        new URL(`${redirectBase}?error=resend&msg=${errMsg}`, request.url),
        303
      )
    }

    console.log('Contact email sent:', id)

    // 2. Pipe into Hermes workflow
    const hermesResult = await processInboundEmail({
      from: email,
      to: process.env.RESEND_FROM_EMAIL || to,
      subject: `Contact form: ${reason} — from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\nReason: ${reason}\n\n${message}`,
    })

    console.log('Hermes case created:', hermesResult?.caseId, 'autoReplied:', hermesResult?.autoReplied)

    return NextResponse.redirect(
      new URL(`${redirectBase}?sent=1`, request.url),
      303
    )
  } catch (err: any) {
    console.error('Contact form error:', err)
    const errMsg = encodeURIComponent(String(err?.message || 'unknown'))
    return NextResponse.redirect(
      new URL(`${redirectBase}?error=1&msg=${errMsg}`, request.url),
      303
    )
  }
}
