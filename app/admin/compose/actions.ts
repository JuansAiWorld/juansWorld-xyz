'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClientFromHeaders } from '@/lib/supabase/server-headers'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function getContentItem(id: string) {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('content')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function saveContent(formData: FormData) {
  const id = formData.get('id') as string | null
  const title = formData.get('title') as string
  const slug = formData.get('slug') as string
  const type = formData.get('type') as string
  const body = formData.get('body') as string
  const excerpt = formData.get('excerpt') as string
  const lang = formData.get('lang') as string
  const status = formData.get('status') as string

  if (!title || !slug) {
    throw new Error('Title and slug are required')
  }

  // Get current user for author
  const authClient = await createClientFromHeaders()
  const { data: { user } } = await authClient.auth.getUser()

  const supabase = createAdminClient()

  const payload = {
    title,
    slug,
    type,
    body,
    excerpt: excerpt || null,
    lang,
    status,
    author_id: user?.id || null,
    ...(status === 'published' && !id ? { published_at: new Date().toISOString() } : {}),
  }

  if (id) {
    // Update existing
    const { error } = await supabase
      .from('content')
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) throw error
  } else {
    // Create new
    const { error } = await supabase.from('content').insert(payload)
    if (error) throw error
  }

  revalidatePath('/admin/content')
  redirect('/admin/content')
}
