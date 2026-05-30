-- Base schema for juansworld-xyz
-- Run with: npx supabase db push

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- PROFILES (extends auth.users)
-- ============================================================
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  bio TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- CONTENT (flexible container for posts, briefs, updates, etc.)
-- ============================================================
CREATE TABLE content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'post' CHECK (type IN ('post', 'brief', 'update', 'note', 'page', 'report')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  body TEXT,
  excerpt TEXT,
  metadata JSONB NOT NULL DEFAULT '{}',
  lang TEXT NOT NULL DEFAULT 'en' CHECK (lang IN ('en', 'es', 'ja')),
  author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(slug, lang)
);

CREATE INDEX idx_content_type ON content(type);
CREATE INDEX idx_content_status ON content(status);
CREATE INDEX idx_content_lang ON content(lang);
CREATE INDEX idx_content_published_at ON content(published_at);

-- ============================================================
-- TAGS
-- ============================================================
CREATE TABLE tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE
);

-- ============================================================
-- CONTENT_TAGS (junction)
-- ============================================================
CREATE TABLE content_tags (
  content_id UUID REFERENCES content(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (content_id, tag_id)
);

-- ============================================================
-- MEDIA
-- ============================================================
CREATE TABLE media (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  filename TEXT NOT NULL,
  original_name TEXT,
  content_type TEXT,
  size_bytes BIGINT,
  storage_path TEXT NOT NULL,
  url TEXT,
  uploaded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- API KEYS
-- ============================================================
CREATE TABLE api_keys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key_hash TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  scopes JSONB NOT NULL DEFAULT '["read"]',
  revoked BOOLEAN NOT NULL DEFAULT FALSE,
  last_used_at TIMESTAMPTZ,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- AUDIT LOG
-- ============================================================
CREATE TABLE audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  target_type TEXT,
  target_id TEXT,
  metadata JSONB NOT NULL DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_log_actor ON audit_log(actor_id);
CREATE INDEX idx_audit_log_action ON audit_log(action);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at);

-- ============================================================
-- SITE SETTINGS
-- ============================================================
CREATE TABLE site_settings (
  key TEXT NOT NULL PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- RLS POLICIES
-- ============================================================

-- Profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT USING (TRUE);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- Content
ALTER TABLE content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published content is viewable by everyone"
  ON content FOR SELECT USING (status = 'published');

CREATE POLICY "Admins can manage all content"
  ON content FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Authors can manage own content"
  ON content FOR ALL USING (author_id = auth.uid());

-- Tags
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tags are viewable by everyone"
  ON tags FOR SELECT USING (TRUE);

CREATE POLICY "Admins can manage tags"
  ON tags FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Content Tags
ALTER TABLE content_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Content tags are viewable by everyone"
  ON content_tags FOR SELECT USING (TRUE);

CREATE POLICY "Admins can manage content tags"
  ON content_tags FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Media
ALTER TABLE media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Media is viewable by everyone"
  ON media FOR SELECT USING (TRUE);

CREATE POLICY "Admins can manage media"
  ON media FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Users can upload media"
  ON media FOR INSERT WITH CHECK (auth.uid() = uploaded_by);

-- API Keys
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage API keys"
  ON api_keys FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Audit Log
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit log"
  ON audit_log FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "System can insert audit log"
  ON audit_log FOR INSERT WITH CHECK (TRUE);

-- Site Settings
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Site settings are viewable by everyone"
  ON site_settings FOR SELECT USING (TRUE);

CREATE POLICY "Admins can update site settings"
  ON site_settings FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_content_updated_at
  BEFORE UPDATE ON content
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_api_keys_updated_at
  BEFORE UPDATE ON api_keys
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
