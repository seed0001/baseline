ALTER TABLE provider_service_qualifications
  ADD COLUMN IF NOT EXISTS decision_note TEXT;

ALTER TABLE provider_service_qualifications
  ADD COLUMN IF NOT EXISTS decision_checks JSONB;

CREATE TABLE IF NOT EXISTS ai_conversations (
  id TEXT PRIMARY KEY,
  audience TEXT NOT NULL CHECK (audience IN ('staff', 'provider', 'customer')),
  subject_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (audience, subject_id)
);

CREATE TABLE IF NOT EXISTS ai_messages (
  id BIGSERIAL PRIMARY KEY,
  conversation_id TEXT NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ai_messages_conversation_idx
  ON ai_messages(conversation_id, id);
