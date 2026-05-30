import { createAdminClient } from '@/lib/supabase/admin'
import type { HermesCase, HermesMessage, HermesCaseStatus, HermesIntent, MessageDirection } from './types'

export async function createCase(params: {
  emailId?: string
  from: string
  to: string
  subject: string
  bodyText?: string
  bodyHtml?: string
  intent?: HermesIntent
  sentiment?: string
  priority?: number
  draftResponse?: string
  metadata?: Record<string, unknown>
}): Promise<HermesCase | null> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('hermes_cases')
    .insert({
      email_id: params.emailId ?? null,
      from_address: params.from,
      to_address: params.to,
      subject: params.subject,
      body_text: params.bodyText ?? null,
      body_html: params.bodyHtml ?? null,
      intent: params.intent ?? 'other',
      sentiment: params.sentiment ?? null,
      priority: params.priority ?? 3,
      draft_response: params.draftResponse ?? null,
      metadata: params.metadata ?? {},
    })
    .select()
    .single()

  if (error) {
    console.error('Hermes createCase error:', error)
    return null
  }

  return data as HermesCase
}

export async function addMessage(params: {
  caseId: string
  direction: MessageDirection
  body: string
  metadata?: Record<string, unknown>
}): Promise<HermesMessage | null> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('hermes_messages')
    .insert({
      case_id: params.caseId,
      direction: params.direction,
      body: params.body,
      metadata: params.metadata ?? {},
    })
    .select()
    .single()

  if (error) {
    console.error('Hermes addMessage error:', error)
    return null
  }

  return data as HermesMessage
}

export async function updateCaseStatus(
  caseId: string,
  status: HermesCaseStatus,
  updates?: Partial<Pick<HermesCase, 'draft_response' | 'assigned_to' | 'intent' | 'priority'>>
): Promise<boolean> {
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('hermes_cases')
    .update({ status, ...updates })
    .eq('id', caseId)

  return !error
}

export async function getCases(limit = 50, status?: HermesCaseStatus): Promise<HermesCase[]> {
  const supabase = createAdminClient()
  let query = supabase
    .from('hermes_cases')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (status) query = query.eq('status', status)

  const { data, error } = await query
  if (error) return []
  return (data as HermesCase[]) ?? []
}

export async function getCaseMessages(caseId: string): Promise<HermesMessage[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('hermes_messages')
    .select('*')
    .eq('case_id', caseId)
    .order('created_at', { ascending: true })

  if (error) return []
  return (data as HermesMessage[]) ?? []
}

export async function getCaseById(caseId: string): Promise<HermesCase | null> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('hermes_cases')
    .select('*')
    .eq('id', caseId)
    .single()

  if (error) return null
  return data as HermesCase
}
