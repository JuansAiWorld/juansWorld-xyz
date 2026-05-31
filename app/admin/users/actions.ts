'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function updateUserRole(formData: FormData) {
  const userId = formData.get('userId') as string
  const role = formData.get('role') as 'user' | 'admin'

  const supabase = createAdminClient()
  const { error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', userId)

  if (error) throw error

  revalidatePath('/admin/users')
}

export async function deleteUser(formData: FormData) {
  const userId = formData.get('userId') as string

  const supabase = createAdminClient()
  const { error } = await supabase.auth.admin.deleteUser(userId)

  if (error) throw error

  revalidatePath('/admin/users')
}
