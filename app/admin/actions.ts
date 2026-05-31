'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function getUsers() {
  const supabase = createAdminClient()

  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  if (profilesError) throw profilesError

  const { data: authUsers, error: authError } =
    await supabase.auth.admin.listUsers()

  if (authError) throw authError

  const users = (profiles || []).map((p: Record<string, unknown>) => {
    const authUser = authUsers.users.find((u: any) => u.id === p.id)
    return {
      ...p,
      email: authUser?.email ?? '—',
      email_confirmed_at: authUser?.email_confirmed_at ?? null,
    }
  })

  return users
}

export async function updateUserRole(userId: string, role: 'user' | 'admin') {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', userId)

  if (error) throw error

  revalidatePath('/admin/users')
  return { success: true }
}

export async function deleteUser(userId: string) {
  const supabase = createAdminClient()
  const { error } = await supabase.auth.admin.deleteUser(userId)

  if (error) throw error

  revalidatePath('/admin/users')
  return { success: true }
}

export async function getStats() {
  const supabase = createAdminClient()

  try {
    const [usersRes, contentRes, publishedRes, apiKeysRes] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('content').select('*', { count: 'exact', head: true }),
      supabase
        .from('content')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'published'),
      supabase.from('api_keys').select('*', { count: 'exact', head: true }),
    ])

    if (usersRes.error) console.error('getStats users error:', usersRes.error)
    if (contentRes.error) console.error('getStats content error:', contentRes.error)
    if (publishedRes.error) console.error('getStats published error:', publishedRes.error)
    if (apiKeysRes.error) console.error('getStats apiKeys error:', apiKeysRes.error)

    return {
      users: usersRes.count ?? 0,
      content: contentRes.count ?? 0,
      published: publishedRes.count ?? 0,
      apiKeys: apiKeysRes.count ?? 0,
    }
  } catch (err: any) {
    console.error('getStats unexpected error:', err)
    return { users: 0, content: 0, published: 0, apiKeys: 0 }
  }
}
