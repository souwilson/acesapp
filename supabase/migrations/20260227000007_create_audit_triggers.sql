-- Create audit triggers on withdrawals, taxes, and profiles tables
-- STORY-DB-003: Implement Audit Logging
-- Sprint 1 / STORY-DB-003

-- ============================================================================
-- CREATE AUDIT TRIGGERS ON FINANCIAL TABLES
-- ============================================================================

-- Trigger on withdrawals table (audit all financial transactions)
CREATE TRIGGER audit_trigger_withdrawals
AFTER INSERT OR UPDATE OR DELETE ON public.withdrawals
FOR EACH ROW
EXECUTE FUNCTION public.audit_trigger_function();

-- Trigger on taxes table (audit tax transactions)
CREATE TRIGGER audit_trigger_taxes
AFTER INSERT OR UPDATE OR DELETE ON public.taxes
FOR EACH ROW
EXECUTE FUNCTION public.audit_trigger_function();

-- Trigger on profiles table (audit user profile changes including role changes)
CREATE TRIGGER audit_trigger_profiles
AFTER INSERT OR UPDATE OR DELETE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.audit_trigger_function();

-- ============================================================================
-- CREATE INDEX ON AUDIT LOGS FOR QUERY PERFORMANCE
-- ============================================================================

-- Index on entity_type for quick filtering (withdrawals, taxes, profiles)
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_type_created_at
  ON public.audit_logs(entity_type, created_at DESC);

-- Index on user_id for finding all changes by a user
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id_created_at
  ON public.audit_logs(user_id, created_at DESC);

-- ============================================================================
-- NOTES
-- ============================================================================
--
-- Triggers Configuration:
-- - Fires AFTER INSERT, UPDATE, DELETE (not BEFORE)
-- - Calls audit_trigger_function() for each row
-- - Logs to public.audit_logs table
--
-- Entity Types Tracked:
-- - withdrawals: Financial transactions and withdrawal records
-- - taxes: Tax information and payments
-- - profiles: User account information and role changes
--
-- Compliance:
-- - PCI DSS: Audit trail for financial transactions
-- - GDPR: Change tracking for user data
-- - SOX: Complete audit history for financial records
--
-- Immutability:
-- - audit_logs has NO UPDATE or DELETE policies (RLS)
-- - Only INSERT is allowed (via triggers)
-- - Admin role can SELECT, others filtered by RLS from STORY-DB-001
--
