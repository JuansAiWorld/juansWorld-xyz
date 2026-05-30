import { createAdminClient } from '@/lib/supabase/admin'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { randomBytes, createHash } from 'crypto'
import type { ApiKey } from './types'

function generateKey(): string {
  return 'jw_' + randomBytes(32).toString('hex')
}

function hashKey(key: string): string {
  return createHash('sha256').update(key).digest('hex')
}

export async function createApiKey(name: string, scopes: string[] = ['read']): Promise<{ key: string; record: ApiKey } | null> {
  const plainKey = generateKey()
  const keyHash = hashKey(plainKey)

  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('api_keys')
    .insert({ name, key_hash: keyHash, scopes })
    .select()
    .single()

  if (error || !data) return null

  return {
    key: plainKey,
    record: data as ApiKey,
  }
}

export async function listApiKeys(): Promise<ApiKey[]> {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('api_keys')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return []
  return (data as ApiKey[]) ?? []
}

export async function revokeApiKey(id: string): Promise<boolean> {
  const supabase = await createServerClient()
  const { error } = await supabase
    .from('api_keys')
    .update({ revoked: true })
    .eq('id', id)

  return !error
}

export async function validateApiKey(key: string): Promise<ApiKey | null> {
  const keyHash = hashKey(key)
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('api_keys')
    .select('*')
    .eq('key_hash', keyHash)
    .eq('revoked', false)
    .single()

  if (error || !data) return null

  // Update last_used_at
  await supabase
    .from('api_keys')
    .update({ last_used_at: new Date().toISOString() })
    .eq('id', data.id)

  return data as ApiKey
}
