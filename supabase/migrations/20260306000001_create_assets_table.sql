CREATE TABLE assets (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  product      TEXT        NOT NULL,
  asset_type   TEXT        NOT NULL CHECK (asset_type IN (
                 'domain','page','pixel','ad_account',
                 'gateway','checkout','email','other')),
  name         TEXT        NOT NULL,
  country      TEXT,
  status       TEXT        NOT NULL DEFAULT 'online'
                 CHECK (status IN ('online','paused','banned','dead')),
  link_or_id   TEXT,
  notes        TEXT,
  last_checked DATE,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);
