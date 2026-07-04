CREATE TABLE IF NOT EXISTS provider_applications (
  id TEXT PRIMARY KEY,
  reference TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  business_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  primary_field TEXT NOT NULL,
  experience_range TEXT NOT NULL,
  has_trade_license BOOLEAN NOT NULL DEFAULT FALSE,
  has_liability_insurance BOOLEAN NOT NULL DEFAULT FALSE,
  consents_to_background_check BOOLEAN NOT NULL DEFAULT FALSE,
  work_description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new'
    CHECK (status IN (
      'new', 'under_review', 'information_requested', 'credentials',
      'background_check', 'skill_review', 'approved', 'declined', 'withdrawn'
    )),
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS provider_applications_status_idx
  ON provider_applications(status, submitted_at DESC);

CREATE INDEX IF NOT EXISTS provider_applications_email_idx
  ON provider_applications(LOWER(email));

CREATE TABLE IF NOT EXISTS provider_application_events (
  id BIGSERIAL PRIMARY KEY,
  application_id TEXT NOT NULL REFERENCES provider_applications(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  from_status TEXT,
  to_status TEXT,
  note TEXT,
  actor TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS provider_application_events_application_idx
  ON provider_application_events(application_id, created_at DESC);

CREATE TABLE IF NOT EXISTS operations_notifications (
  id BIGSERIAL PRIMARY KEY,
  kind TEXT NOT NULL,
  subject_id TEXT NOT NULL,
  payload JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'sent', 'failed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  sent_at TIMESTAMPTZ,
  error_message TEXT
);
