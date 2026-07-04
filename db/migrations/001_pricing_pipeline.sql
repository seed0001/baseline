CREATE TABLE IF NOT EXISTS pricing_catalog (
  service_id TEXT PRIMARY KEY,
  baseline_price NUMERIC(12, 2) NOT NULL CHECK (baseline_price >= 0),
  price_unit TEXT NOT NULL,
  market_range TEXT NOT NULL,
  price_basis TEXT NOT NULL,
  sources JSONB NOT NULL CHECK (jsonb_typeof(sources) = 'array'),
  last_verified DATE NOT NULL,
  published_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  published_by TEXT NOT NULL DEFAULT 'initial-research'
);

CREATE TABLE IF NOT EXISTS pricing_refresh_runs (
  id BIGSERIAL PRIMARY KEY,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  finished_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'running'
    CHECK (status IN ('running', 'completed', 'failed')),
  services_checked INTEGER NOT NULL DEFAULT 0,
  sources_checked INTEGER NOT NULL DEFAULT 0,
  sources_changed INTEGER NOT NULL DEFAULT 0,
  sources_failed INTEGER NOT NULL DEFAULT 0,
  error_message TEXT
);

CREATE TABLE IF NOT EXISTS pricing_source_checks (
  id BIGSERIAL PRIMARY KEY,
  run_id BIGINT NOT NULL REFERENCES pricing_refresh_runs(id) ON DELETE CASCADE,
  service_id TEXT NOT NULL,
  source_label TEXT NOT NULL,
  source_url TEXT NOT NULL,
  checked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  http_status INTEGER,
  content_hash TEXT,
  content_changed BOOLEAN NOT NULL DEFAULT FALSE,
  observed_prices JSONB NOT NULL DEFAULT '[]'::jsonb,
  error_message TEXT
);

CREATE INDEX IF NOT EXISTS pricing_source_checks_service_idx
  ON pricing_source_checks(service_id, checked_at DESC);

CREATE INDEX IF NOT EXISTS pricing_source_checks_run_idx
  ON pricing_source_checks(run_id);

CREATE TABLE IF NOT EXISTS pricing_publications (
  id BIGSERIAL PRIMARY KEY,
  service_id TEXT NOT NULL,
  published_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  published_by TEXT NOT NULL,
  previous_record JSONB,
  published_record JSONB NOT NULL
);
