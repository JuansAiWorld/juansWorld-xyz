export type UserRole = 'user' | 'admin'

export type ContentType = 'post' | 'brief' | 'update' | 'note' | 'page' | 'report'
export type ContentStatus = 'draft' | 'published' | 'archived'
export type Lang = 'en' | 'es' | 'ja'

export interface Profile {
  id: string
  username: string | null
  full_name: string | null
  avatar_url: string | null
  role: UserRole
  bio: string | null
  created_at: string
  updated_at: string
}

export interface ContentItem {
  id: string
  slug: string
  title: string
  type: ContentType
  status: ContentStatus
  body: string | null
  excerpt: string | null
  metadata: Record<string, unknown>
  lang: Lang
  author_id: string | null
  published_at: string | null
  created_at: string
  updated_at: string
}

export interface Tag {
  id: string
  name: string
  slug: string
}

export interface MediaItem {
  id: string
  filename: string
  original_name: string | null
  content_type: string | null
  size_bytes: number | null
  storage_path: string
  url: string | null
  uploaded_by: string | null
  created_at: string
}

export interface ApiKey {
  id: string
  key_hash: string
  name: string
  scopes: string[]
  revoked: boolean
  last_used_at: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface AuditEvent {
  id: string
  actor_id: string | null
  action: string
  target_type: string | null
  target_id: string | null
  metadata: Record<string, unknown>
  ip_address: string | null
  user_agent: string | null
  created_at: string
}

export interface SiteSetting {
  key: string
  value: unknown
  updated_at: string
}
