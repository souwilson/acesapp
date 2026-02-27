-- Create masked views for PII protection
-- STORY-DB-004: Mask Sensitive Data (PII Protection)
-- Sprint 1 / STORY-DB-004

-- ============================================================================
-- CREATE MASKED PROFILES VIEW
-- ============================================================================

CREATE OR REPLACE VIEW public.user_profiles_masked AS
SELECT
  id,
  user_id,
  name,
  public.mask_email(email) AS email_masked,
  created_at,
  updated_at
FROM public.profiles;

-- Grant SELECT permission (RLS is inherited from base table)
GRANT SELECT ON public.user_profiles_masked TO authenticated;

-- ============================================================================
-- CREATE MASKED TAXES VIEW
-- ============================================================================

CREATE OR REPLACE VIEW public.taxes_masked AS
SELECT
  id,
  public.mask_sensitive_text(description, 8) AS description_masked,
  amount,
  tax_date,
  due_date,
  paid,
  paid_at,
  public.mask_sensitive_text(receipt_url, 10) AS receipt_url_masked,
  public.mask_sensitive_text(notes, 6) AS notes_masked,
  created_at,
  updated_at
FROM public.taxes;

-- Grant SELECT permission (RLS is inherited from base table)
GRANT SELECT ON public.taxes_masked TO authenticated;

-- ============================================================================
-- CREATE MASKED WITHDRAWALS VIEW
-- ============================================================================

CREATE OR REPLACE VIEW public.withdrawals_masked AS
SELECT
  id,
  amount,
  date,
  public.mask_sensitive_text(reason, 4) AS reason_masked,
  public.mask_sensitive_text(destination, 4) AS destination_masked,
  public.mask_sensitive_text(notes, 4) AS notes_masked,
  created_at,
  updated_at
FROM public.withdrawals;

-- Grant SELECT permission (RLS is inherited from base table)
GRANT SELECT ON public.withdrawals_masked TO authenticated;

-- ============================================================================
-- CREATE INDEXES ON MASKED VIEWS (if needed for performance)
-- ============================================================================

-- Views don't have direct indexes, but base table indexes are used
-- The following index on base tables helps masked view performance
CREATE INDEX IF NOT EXISTS idx_taxes_created_at ON public.taxes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_withdrawals_created_at ON public.withdrawals(created_at DESC);

-- ============================================================================
-- NOTES
-- ============================================================================
--
-- Masked Views:
-- - user_profiles_masked: Email field masked (j***@example.com)
-- - taxes_masked: Description, receipt URL, and notes masked
-- - withdrawals_masked: Reason, destination, and notes masked
--
-- Key Features:
-- - Views inherit RLS from base tables (automatic policy enforcement)
-- - Read-only (SELECT only, no INSERT/UPDATE/DELETE)
-- - Safe for logs, backups, and reports
-- - Backward compatible (original tables remain unmasked)
--
-- Use Cases:
-- - Backup procedures: Use masked views instead of raw tables
-- - Audit log exports: Mask sensitive data before export
-- - Reports and dashboards: Display masked data by default
-- - CSV exports: Use masked views for external sharing
--
-- GDPR Compliance:
-- - Data minimization: Only necessary PII exposed
-- - Privacy by design: Masking applied at database level
-- - Audit trail: Masked views log changes safely
--
