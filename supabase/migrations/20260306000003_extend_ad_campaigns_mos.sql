-- Story MOS-003: Extend ad_campaigns for Campaign Control
-- Make ad_performance_id optional to allow standalone MOS campaigns
ALTER TABLE ad_campaigns
  ALTER COLUMN ad_performance_id DROP NOT NULL;

-- Add product and country (nullable to preserve existing records)
ALTER TABLE ad_campaigns
  ADD COLUMN IF NOT EXISTS product TEXT,
  ADD COLUMN IF NOT EXISTS country TEXT;
