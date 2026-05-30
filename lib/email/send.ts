import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export interface SendEmailOptions {
  to: string | string[]
  subject: string
  text?: string
  html?: string
  replyTo?: string
  from?: string
}

export async function sendEmail(options: SendEmailOptions): Promise<{ id?: string; error?: Error }> {
  if (!process.env.RESEND_API_KEY) {
    return { error: new Error('RESEND_API_KEY is not configured') }
  }

  const from = options.from || process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'

  try {
    const payload: any = {
      from,
      to: options.to,
      subject: options.subject,
    }
    if (options.text) payload.text = options.text
    if (options.html) payload.html = options.html
    if (options.replyTo) payload.replyTo = options.replyTo

    const { data, error } = await resend.emails.send(payload)

    if (error) {
      return { error: new Error(error.message) }
    }

    return { id: data?.id }
  } catch (err) {
    return { error: err instanceof Error ? err : new Error(String(err)) }
  }
}
