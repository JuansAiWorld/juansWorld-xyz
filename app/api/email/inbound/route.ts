import { NextResponse } from 'next/server'
import { addEmail } from '@/lib/email-db'
import { processInboundEmail } from '@/lib/hermes/agent'

/* ─── Inbound email webhook ───
 * Optimized for Resend Inbound Routing.
 * Also compatible with ImprovMX, Cloudflare Email Routing,
 * Forward Email, Mailgun, etc.
 *
 * Resend POSTs a JSON body like:
 *   {
 *     "from": "sender@example.com",
 *     "to": ["hello@juansworld.xyz"],
 *     "subject": "Hello",
 *     "text": "...",
 *     "html": "...",
 *     "headers": [...]
 *   }
 *
 * Security:
 *   - Verify x-webhook-secret against EMAIL_WEBHOOK_SECRET
 *   - (Optional) Resend signs webhooks with x-resend-signature
 */

function extractAddress(raw: unknown): string {
  if (!raw) return 'unknown'
  if (typeof raw === 'string') return raw
  if (Array.isArray(raw) && raw.length > 0) {
    return extractAddress(raw[0])
  }
  if (typeof raw === 'object' && raw !== null) {
    const obj = raw as Record<string, unknown>
    if (typeof obj.email === 'string') return obj.email
    if (typeof obj.address === 'string') return obj.address
  }
  return String(raw)
}

function extractText(body: unknown): string | undefined {
  if (!body) return undefined
  if (typeof body === 'string') return body
  if (typeof body === 'object' && body !== null) {
    const obj = body as Record<string, unknown>
    if (typeof obj.text === 'string') return obj.text
    if (typeof obj.plain === 'string') return obj.plain
    if (typeof obj['text-plain'] === 'string') return obj['text-plain']
  }
  return undefined
}

function extractHtml(body: unknown): string | undefined {
  if (!body) return undefined
  if (typeof body === 'string') {
    if (body.trim().startsWith('<')) return body
    return undefined
  }
  if (typeof body === 'object' && body !== null) {
    const obj = body as Record<string, unknown>
    if (typeof obj.html === 'string') return obj.html
    if (typeof obj['text-html'] === 'string') return obj['text-html']
  }
  return undefined
}

export async function POST(request: Request) {
  const secret = request.headers.get('x-webhook-secret') || request.headers.get('X-Webhook-Secret')
  const expected = process.env.EMAIL_WEBHOOK_SECRET

  if (expected && secret !== expected) {
    return NextResponse.json({ error: 'Invalid webhook secret' }, { status: 401 })
  }

  try {
    const payload = await request.json().catch(() => ({} as Record<string, unknown>))

    const from =
      extractAddress(payload.from) ||
      extractAddress(payload.sender) ||
      extractAddress((payload.envelope as Record<string, unknown>)?.from) ||
      'unknown'

    const to =
      extractAddress(payload.to) ||
      extractAddress(payload.recipient) ||
      extractAddress((payload.envelope as Record<string, unknown>)?.to) ||
      'unknown'

    const subject = typeof payload.subject === 'string' ? payload.subject : '(no subject)'

    const text =
      extractText(payload.text) ||
      extractText(payload.body) ||
      extractText(payload['text-plain']) ||
      undefined

    const html =
      extractHtml(payload.html) ||
      extractHtml(payload['text-html']) ||
      undefined

    // Reject obvious noise
    const subjectLower = subject.toLowerCase()
    if (subjectLower.startsWith('auto:') || subjectLower.startsWith('out of office')) {
      return NextResponse.json({ success: true, ignored: true, reason: 'auto-reply' })
    }

    // 1. Store raw email (backward compat)
    const email = await addEmail({
      from,
      to,
      subject,
      text,
      html,
    })

    // 2. Pipe to Hermes agent
    const hermesResult = await processInboundEmail({
      emailId: email.id,
      from,
      to,
      subject,
      text,
      html,
    })

    return NextResponse.json({
      success: true,
      id: email.id,
      from,
      to,
      subject,
      hermes: hermesResult,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Webhook failed' }, { status: 500 })
  }
}
