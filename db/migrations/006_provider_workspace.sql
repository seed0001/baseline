CREATE TABLE IF NOT EXISTS provider_catalog_services (
  id TEXT PRIMARY KEY,
  provider_account_id TEXT NOT NULL REFERENCES provider_accounts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  scope_items JSONB NOT NULL DEFAULT '[]'::jsonb,
  exclusions JSONB NOT NULL DEFAULT '[]'::jsonb,
  required_info JSONB NOT NULL DEFAULT '[]'::jsonb,
  required_photos JSONB NOT NULL DEFAULT '[]'::jsonb,
  price_amount NUMERIC(12,2),
  price_type TEXT NOT NULL DEFAULT 'starting_at'
    CHECK (price_type IN ('fixed', 'starting_at', 'estimate', 'hourly', 'custom')),
  duration TEXT NOT NULL DEFAULT '',
  benchmark_service_id TEXT,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'published', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS provider_catalog_services_provider_idx
  ON provider_catalog_services(provider_account_id, updated_at DESC);

CREATE TABLE IF NOT EXISTS provider_business_tools (
  id TEXT PRIMARY KEY,
  provider_account_id TEXT NOT NULL REFERENCES provider_accounts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  tool_type TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'active', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS provider_activity (
  id BIGSERIAL PRIMARY KEY,
  provider_account_id TEXT NOT NULL REFERENCES provider_accounts(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  subject TEXT NOT NULL,
  detail TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS provider_activity_provider_idx
  ON provider_activity(provider_account_id, created_at DESC);
