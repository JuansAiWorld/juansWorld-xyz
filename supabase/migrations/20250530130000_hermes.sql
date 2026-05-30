-- Hermes email agent tables

CREATE TYPE hermes_case_status AS ENUM ('new', 'processing', 'draft_ready', 'responded', 'closed', 'spam');
CREATE TYPE hermes_intent AS ENUM ('question', 'collaboration', 'inquiry', 'support', 'spam', 'other');

CREATE TABLE hermes_cases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email_id TEXT,
  from_address TEXT NOT NULL,
  to_address TEXT NOT NULL,
  subject TEXT NOT NULL,
  body_text TEXT,
  body_html TEXT,
  intent hermes_intent NOT NULL DEFAULT 'other',
  sentiment TEXT,
  priority INTEGER NOT NULL DEFAULT 3 CHECK (priority BETWEEN 1 AND 5),
  status hermes_case_status NOT NULL DEFAULT 'new',
  draft_response TEXT,
  assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_hermes_cases_status ON hermes_cases(status);
CREATE INDEX idx_hermes_cases_intent ON hermes_cases(intent);
CREATE INDEX idx_hermes_cases_created_at ON hermes_cases(created_at);
CREATE INDEX idx_hermes_cases_from ON hermes_cases(from_address);

CREATE TABLE hermes_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID NOT NULL REFERENCES hermes_cases(id) ON DELETE CASCADE,
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound', 'internal')),
  body TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_hermes_messages_case ON hermes_messages(case_id);

-- RLS
ALTER TABLE hermes_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE hermes_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage hermes cases"
  ON hermes_cases FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can manage hermes messages"
  ON hermes_messages FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Trigger
CREATE TRIGGER set_hermes_cases_updated_at
  BEFORE UPDATE ON hermes_cases
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
