-- Story MOS-002: Extend ad_performance with product + profit columns
-- product is nullable to preserve existing records

ALTER TABLE ad_performance
  ADD COLUMN IF NOT EXISTS product TEXT;

ALTER TABLE ad_performance
  ADD COLUMN IF NOT EXISTS profit NUMERIC
    GENERATED ALWAYS AS (revenue - investment) STORED;
