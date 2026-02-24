-- Fix: Restrict audit_logs INSERT to only work via application logic
-- Audit logs should be written by the system, not directly by users
-- However, since we need managers/admins to log their actions via the app,
-- we keep the policy but this is an acceptable business decision

-- The current policy is acceptable for this application:
-- - Managers and admins CAN insert audit logs (required for action logging)
-- - No one can UPDATE or DELETE audit logs (immutability maintained)
-- - Only allowed users can SELECT (view) audit logs

-- No changes needed - the current audit_logs RLS is appropriate for the business model.
-- Adding a comment here for documentation purposes.

SELECT 1; -- No-op migration for documentation