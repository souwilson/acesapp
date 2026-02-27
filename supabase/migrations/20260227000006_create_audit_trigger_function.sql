-- Create audit trigger function for logging all changes
-- STORY-DB-003: Implement Audit Logging
-- Sprint 1 / STORY-DB-003

-- ============================================================================
-- CREATE AUDIT TRIGGER FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION public.audit_trigger_function()
RETURNS TRIGGER AS $$
DECLARE
  v_user_id UUID;
  v_user_name TEXT;
  v_action TEXT;
  v_old_values JSONB;
  v_new_values JSONB;
  v_entity_type TEXT;
  v_entity_id UUID;
BEGIN
  -- Determine action type (INSERT, UPDATE, DELETE)
  IF TG_OP = 'INSERT' THEN
    v_action := 'create';
    v_new_values := row_to_json(NEW)::jsonb;
    v_old_values := NULL;
    v_entity_id := NEW.id;
  ELSIF TG_OP = 'UPDATE' THEN
    v_action := 'update';
    v_old_values := row_to_json(OLD)::jsonb;
    v_new_values := row_to_json(NEW)::jsonb;
    v_entity_id := NEW.id;
  ELSIF TG_OP = 'DELETE' THEN
    v_action := 'delete';
    v_old_values := row_to_json(OLD)::jsonb;
    v_new_values := NULL;
    v_entity_id := OLD.id;
  END IF;

  -- Extract user info from auth context
  v_user_id := auth.uid();

  -- Get user name from profiles table (with fallback)
  BEGIN
    SELECT name INTO v_user_name FROM public.profiles WHERE id = v_user_id LIMIT 1;
  EXCEPTION WHEN OTHERS THEN
    v_user_name := COALESCE(v_user_id::text, 'system');
  END;

  -- Default user_name if not found
  IF v_user_name IS NULL THEN
    v_user_name := COALESCE(v_user_id::text, 'system');
  END IF;

  -- Map table name to entity_type
  v_entity_type := TG_TABLE_NAME;

  -- Insert audit log record
  INSERT INTO public.audit_logs (
    user_id,
    user_name,
    action,
    entity_type,
    entity_id,
    old_values,
    new_values,
    created_at
  ) VALUES (
    v_user_id,
    v_user_name,
    v_action,
    v_entity_type,
    v_entity_id,
    v_old_values,
    v_new_values,
    now()
  );

  -- Return appropriate value based on operation
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ============================================================================
-- NOTES
-- ============================================================================
--
-- This function is called by triggers on withdrawals, taxes, and profiles tables
-- It automatically logs INSERT, UPDATE, and DELETE operations to audit_logs
--
-- Features:
-- - Captures full row data (old and new values) as JSONB
-- - Extracts user_id from auth.uid() for authentication context
-- - Gets user_name from profiles table
-- - Maps table names to entity_type for audit tracking
-- - Handles errors gracefully (user not found)
--
-- Security:
-- - SECURITY DEFINER: Function runs with table owner permissions
-- - set search_path: Prevents schema injection attacks
--
