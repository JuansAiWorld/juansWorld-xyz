'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function getContentItems(type?: string, status?: string) {
  const supabase = createAdminClient()

  let query = supabase
    .from('content')
    .select('*, profiles(full_name, username)')
    .order('updated_at', { ascending: false })

  if (type && type !== 'all') {
    query = query.eq('type', type)
  }
  if (status && status !== 'all') {
    query = query.eq('status', status)
  }

  const { data, error } = await query

  if (error) throw error
  return data || []
}

export async function togglePublish(id: string, currentStatus: string) {
  const supabase = createAdminClient()

  const newStatus = currentStatus === 'published' ? 'draft' : 'published'
  const publishedAt = newStatus === 'published' ? new Date().toISOString() : null

  const { error } = await supabase
    .from('content')
    .update({ status: newStatus, published_at: publishedAt })
    .eq('id', id)

  if (error) throw error

  revalidatePath('/admin/content')
  return { status: newStatus }
}

export async function deleteContent(id: string) {
  const supabase = createAdminClient()

  const { error } = await supabase.from('content').delete().eq('id', id)

  if (error) throw error

  revalidatePath('/admin/content')
  return { success: true }
}
