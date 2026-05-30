import { sendEmail } from '@/lib/email/send'
import { logEvent } from '@/lib/db/audit-log'
import { createCase, addMessage, updateCaseStatus } from './db'
import type { HermesIntent, AgentAnalysis } from './types'

function detectIntent(subject: string, body: string): HermesIntent {
  const text = `${subject} ${body}`.toLowerCase()

  if (/unsubscribe|opt.out|remove me|stop emailing|no longer want/i.test(text)) {
    return 'spam'
  }

  if (/collaborat|partner|work together|join forces|team up/i.test(text)) {
    return 'collaboration'
  }

  if (/question|how do|how to|what is|why does|can you explain|curious about/i.test(text)) {
    return 'question'
  }

  if (/bug|error|broken|not working|issue|problem|support|help/i.test(text)) {
    return 'support'
  }

  if (/book|order|purchase|buy|pricing|cost|rate|service|hire/i.test(text)) {
    return 'inquiry'
  }

  return 'other'
}

function detectSentiment(text: string): string {
  const lower = text.toLowerCase()
  if (/angry|frustrat|terrible|awful|hate|worst|broken|useless/i.test(lower)) {
    return 'negative'
  }
  if (/love|amazing|great|excellent|perfect|thank|appreciate/i.test(lower)) {
    return 'positive'
  }
  return 'neutral'
}

function calculatePriority(intent: HermesIntent, sentiment: string, subject: string): number {
  let score = 3

  if (intent === 'support') score += 1
  if (intent === 'inquiry') score += 1
  if (intent === 'collaboration') score += 1
  if (sentiment === 'negative') score += 1
  if (/urgent|asap|emergency|critical/i.test(subject)) score += 1

  return Math.min(5, Math.max(1, score))
}

function generateDraftResponse(analysis: AgentAnalysis, subject: string, body: string): string {
  const greeting = 'Hello,'
  const closing = '\n\nBest,\nJuan\n'

  switch (analysis.intent) {
    case 'question':
      return `${greeting}\n\nThanks for reaching out with your question about "${subject}".\n\nI've received your message and will get back to you with a thoughtful response within 24 hours.\n\nIn the meantime, feel free to explore the Terminal or check the Tao section for more context on how this system works.${closing}`

    case 'collaboration':
      return `${greeting}\n\nThanks for your interest in collaborating. Your message about "${subject}" has been flagged for my attention.\n\nI review all collaboration inquiries personally. I'll be in touch within 48 hours to discuss how we might work together.\n\nIf you have a specific project in mind, feel free to include any links or details in a follow-up email.${closing}`

    case 'inquiry':
      return `${greeting}\n\nThank you for your inquiry regarding "${subject}".\n\nI've logged your request and will respond with specific information within 24 hours.\n\nIf this is time-sensitive, please note that in your reply and I'll prioritize accordingly.${closing}`

    case 'support':
      return `${greeting}\n\nI'm sorry you're experiencing an issue. Your report about "${subject}" has been logged as priority support.\n\nI'll investigate and get back to you within 12 hours with either a fix or a detailed update on progress.\n\nThank you for your patience.${closing}`

    default:
      return `${greeting}\n\nThanks for reaching out. I've received your message about "${subject}" and will respond as soon as possible.\n\nIf you need immediate assistance, please indicate that in your reply.${closing}`
  }
}

export async function processInboundEmail(params: {
  emailId?: string
  from: string
  to: string
  subject: string
  text?: string
  html?: string
}): Promise<{ caseId?: string; autoReplied?: boolean; error?: string }> {
  const bodyText = params.text || ''
  const bodyHtml = params.html || ''

  // Run analysis
  const intent = detectIntent(params.subject, bodyText)
  const sentiment = detectSentiment(bodyText)
  const priority = calculatePriority(intent, sentiment, params.subject)

  const analysis: AgentAnalysis = {
    intent,
    sentiment,
    priority,
    summary: `Incoming ${intent} from ${params.from}: "${params.subject}"`,
    draftResponse: '',
  }

  analysis.draftResponse = generateDraftResponse(analysis, params.subject, bodyText)

  // Create case
  const caseRecord = await createCase({
    emailId: params.emailId,
    from: params.from,
    to: params.to,
    subject: params.subject,
    bodyText: bodyText || undefined,
    bodyHtml: bodyHtml || undefined,
    intent: analysis.intent,
    sentiment: analysis.sentiment,
    priority: analysis.priority,
    draftResponse: analysis.draftResponse,
    metadata: {
      hermes_version: '1.0',
      auto_processed: true,
    },
  })

  if (!caseRecord) {
    return { error: 'Failed to create Hermes case' }
  }

  // Log inbound message
  await addMessage({
    caseId: caseRecord.id,
    direction: 'inbound',
    body: bodyText || '(no text body)',
    metadata: { source: 'email_webhook', subject: params.subject },
  })

  // Log to audit
  await logEvent({
    action: 'hermes_email_received',
    target_type: 'hermes_case',
    target_id: caseRecord.id,
    metadata: {
      from: params.from,
      subject: params.subject,
      intent: analysis.intent,
      priority: analysis.priority,
    },
  })

  // Auto-reply for non-spam
  let autoReplied = false
  if (intent !== 'spam' && process.env.HERMES_AUTO_REPLY === 'true') {
    const { id, error } = await sendEmail({
      to: params.from,
      subject: `Re: ${params.subject}`,
      text: analysis.draftResponse,
      replyTo: params.to,
      from: process.env.RESEND_FROM_EMAIL,
    })

    if (!error && id) {
      autoReplied = true
      await addMessage({
        caseId: caseRecord.id,
        direction: 'outbound',
        body: analysis.draftResponse,
        metadata: { type: 'auto_reply', resend_id: id },
      })
      await updateCaseStatus(caseRecord.id, 'responded')
    }
  }

  // Mark spam as closed
  if (intent === 'spam') {
    await updateCaseStatus(caseRecord.id, 'spam')
  }

  return { caseId: caseRecord.id, autoReplied }
}

export async function sendCaseResponse(caseId: string, body: string, fromAddress?: string): Promise<boolean> {
  const { getCaseById } = await import('./db')
  const caseRecord = await getCaseById(caseId)
  if (!caseRecord) return false

  const { id, error } = await sendEmail({
    to: caseRecord.from_address,
    subject: `Re: ${caseRecord.subject}`,
    text: body,
    replyTo: fromAddress || caseRecord.to_address,
    from: process.env.RESEND_FROM_EMAIL,
  })

  if (error) {
    console.error('Hermes send response error:', error)
    return false
  }

  await addMessage({
    caseId,
    direction: 'outbound',
    body,
    metadata: { type: 'manual_reply', resend_id: id },
  })

  await updateCaseStatus(caseId, 'responded')

  await logEvent({
    action: 'hermes_email_sent',
    target_type: 'hermes_case',
    target_id: caseId,
    metadata: { to: caseRecord.from_address, resend_id: id },
  })

  return true
}
