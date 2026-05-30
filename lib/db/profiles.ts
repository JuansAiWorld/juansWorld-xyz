import { createClient as createServerClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { Profile } from './types'

export async function getProfile(id: string): Promise<Profile | null> {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single()

  if (error) return null
  return data as Profile
}

export async function getProfileByUsername(username: string): Promise<Profile | null> {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single()

  if (error) return null
  return data as Profile
}

export async function updateProfile(id: string, updates: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>): Promise<Profile | null> {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) return null
  return data as Profile
}

export async function listProfiles(): Promise<Profile[]> {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return []
  return (data as Profile[]) ?? []
}

export async function setUserRole(id: string, role: 'user' | 'admin'): Promise<boolean> {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', id)

  return !error
}
