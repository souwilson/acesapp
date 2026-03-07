-- Story MOS-004: Creative Registry
CREATE TABLE IF NOT EXISTS creatives (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  product      TEXT        NOT NULL,
  name         TEXT        NOT NULL,
  creative_type TEXT       NOT NULL CHECK (creative_type IN ('video','image','copy','carousel','other')),
  hook         TEXT,
  platform     TEXT,
  status       TEXT        NOT NULL DEFAULT 'testing'
                 CHECK (status IN ('active','testing','paused','dead')),
  link         TEXT,
  notes        TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);
