import { createClient as createServerClient } from '@/lib/supabase/server'
import type { ContentItem, ContentType, ContentStatus, Lang } from './types'

export interface ContentFilters {
  type?: ContentType
  status?: ContentStatus
  lang?: Lang
  tag?: string
  author_id?: string
}

export async function getContent(slug: string, lang: Lang = 'en'): Promise<ContentItem | null> {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('content')
    .select('*, tags(id, name, slug)')
    .eq('slug', slug)
    .eq('lang', lang)
    .single()

  if (error) return null
  return data as ContentItem
}

export async function listContent(filters?: ContentFilters): Promise<ContentItem[]> {
  const supabase = await createServerClient()
  let query = supabase
    .from('content')
    .select('*, tags(id, name, slug)')
    .order('published_at', { ascending: false })

  if (filters?.type) query = query.eq('type', filters.type)
  if (filters?.status) query = query.eq('status', filters.status)
  if (filters?.lang) query = query.eq('lang', filters.lang)
  if (filters?.author_id) query = query.eq('author_id', filters.author_id)
  if (filters?.tag) {
    query = query.contains('tags.slug', [filters.tag])
  }

  const { data, error } = await query

  if (error) return []
  return (data as ContentItem[]) ?? []
}

export async function createContent(item: Omit<ContentItem, 'id' | 'created_at' | 'updated_at'>): Promise<ContentItem | null> {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('content')
    .insert(item)
    .select()
    .single()

  if (error) return null
  return data as ContentItem
}

export async function updateContent(id: string, updates: Partial<Omit<ContentItem, 'id' | 'created_at' | 'updated_at'>>): Promise<ContentItem | null> {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('content')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) return null
  return data as ContentItem
}

export async function deleteContent(id: string): Promise<boolean> {
  const supabase = await createServerClient()
  const { error } = await supabase
    .from('content')
    .delete()
    .eq('id', id)

  return !error
}
