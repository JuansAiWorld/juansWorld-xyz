export type HermesCaseStatus = 'new' | 'processing' | 'draft_ready' | 'responded' | 'closed' | 'spam'
export type HermesIntent = 'question' | 'collaboration' | 'inquiry' | 'support' | 'spam' | 'other'
export type MessageDirection = 'inbound' | 'outbound' | 'internal'

export interface HermesCase {
  id: string
  email_id: string | null
  from_address: string
  to_address: string
  subject: string
  body_text: string | null
  body_html: string | null
  intent: HermesIntent
  sentiment: string | null
  priority: number
  status: HermesCaseStatus
  draft_response: string | null
  assigned_to: string | null
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface HermesMessage {
  id: string
  case_id: string
  direction: MessageDirection
  body: string
  metadata: Record<string, unknown>
  created_at: string
}

export interface AgentAnalysis {
  intent: HermesIntent
  sentiment: string
  priority: number
  summary: string
  draftResponse: string
}
