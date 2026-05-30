import { createAdminClient } from '@/lib/supabase/admin'
import { createClient as createServerClient } from '@/lib/supabase/server'
import type { AuditEvent } from './types'

export async function logEvent(params: {
  actor_id?: string
  action: string
  target_type?: string
  target_id?: string
  metadata?: Record<string, unknown>
  ip_address?: string
  user_agent?: string
}): Promise<boolean> {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from('audit_log')
    .insert({
      actor_id: params.actor_id ?? null,
      action: params.action,
      target_type: params.target_type ?? null,
      target_id: params.target_id ?? null,
      metadata: params.metadata ?? {},
      ip_address: params.ip_address ?? null,
      user_agent: params.user_agent ?? null,
    })

  return !error
}

export async function listAuditEvents(limit = 100): Promise<AuditEvent[]> {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('audit_log')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) return []
  return (data as AuditEvent[]) ?? []
}
