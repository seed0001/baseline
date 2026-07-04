CREATE TABLE IF NOT EXISTS provider_ai_personas (
  provider_account_id TEXT NOT NULL REFERENCES provider_accounts(id) ON DELETE CASCADE,
  persona_key TEXT NOT NULL
    CHECK (persona_key IN ('manager', 'finance', 'marketing', 'analyst')),
  display_name TEXT NOT NULL,
  communication_style TEXT NOT NULL DEFAULT '',
  custom_instructions TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (provider_account_id, persona_key)
);

CREATE TABLE IF NOT EXISTS provider_ai_memories (
  id BIGSERIAL PRIMARY KEY,
  provider_account_id TEXT NOT NULL REFERENCES provider_accounts(id) ON DELETE CASCADE,
  category TEXT NOT NULL DEFAULT 'business',
  content TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'provider',
  pinned BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS provider_ai_memories_provider_idx
  ON provider_ai_memories(provider_account_id, pinned DESC, updated_at DESC);
