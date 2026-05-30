'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getCurrentAdmin() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') return null

  return { user, profile }
}

export async function getUsers() {
  const admin = await getCurrentAdmin()
  if (!admin) throw new Error('Unauthorized')

  const supabase = createAdminClient()

  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  if (profilesError) throw profilesError

  // Also fetch auth users for email info
  const { data: authUsers, error: authError } =
    await supabase.auth.admin.listUsers()

  if (authError) throw authError

  const users = profiles.map((p: Record<string, unknown>) => {
    const authUser = authUsers.users.find((u) => u.id === p.id)
    return {
      ...p,
      email: authUser?.email ?? '—',
      email_confirmed_at: authUser?.email_confirmed_at ?? null,
    }
  })

  return users
}

export async function updateUserRole(userId: string, role: 'user' | 'admin') {
  const admin = await getCurrentAdmin()
  if (!admin) throw new Error('Unauthorized')

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
  const admin = await getCurrentAdmin()
  if (!admin) throw new Error('Unauthorized')

  // Prevent self-deletion
  if (userId === admin.user.id) {
    throw new Error('Cannot delete yourself')
  }

  const supabase = createAdminClient()
  const { error } = await supabase.auth.admin.deleteUser(userId)

  if (error) throw error

  revalidatePath('/admin/users')
  return { success: true }
}

export async function getStats() {
  const admin = await getCurrentAdmin()
  if (!admin) throw new Error('Unauthorized')

  const supabase = createAdminClient()

  const [
    { count: userCount },
    { count: contentCount },
    { count: publishedCount },
    { count: apiKeyCount },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('content').select('*', { count: 'exact', head: true }),
    supabase
      .from('content')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'published'),
    supabase.from('api_keys').select('*', { count: 'exact', head: true }),
  ])

  return {
    users: userCount ?? 0,
    content: contentCount ?? 0,
    published: publishedCount ?? 0,
    apiKeys: apiKeyCount ?? 0,
  }
}
