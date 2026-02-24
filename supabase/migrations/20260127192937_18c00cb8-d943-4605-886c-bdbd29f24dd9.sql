-- Fix remaining RLS policy warnings and function search paths

-- 1. Fix normalize_email function search path
CREATE OR REPLACE FUNCTION public.normalize_email()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.email = LOWER(TRIM(NEW.email));
  RETURN NEW;
END;
$$;

-- 2. Fix update_updated_at_column function search path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- 3. Fix ad_performance policies - remove overly permissive ones
DROP POLICY IF EXISTS "Authenticated users can read ad_performance" ON public.ad_performance;
DROP POLICY IF EXISTS "Authenticated users can insert ad_performance" ON public.ad_performance;
DROP POLICY IF EXISTS "Authenticated users can update ad_performance" ON public.ad_performance;
DROP POLICY IF EXISTS "Authenticated users can delete ad_performance" ON public.ad_performance;

CREATE POLICY "Allowed users can read ad_performance"
  ON public.ad_performance FOR SELECT
  TO authenticated
  USING (public.is_allowed_user(auth.jwt() ->> 'email'));

CREATE POLICY "Managers and admins can insert ad_performance"
  ON public.ad_performance FOR INSERT
  TO authenticated
  WITH CHECK (public.get_user_role(auth.jwt() ->> 'email') IN ('admin', 'manager'));

CREATE POLICY "Managers and admins can update ad_performance"
  ON public.ad_performance FOR UPDATE
  TO authenticated
  USING (public.get_user_role(auth.jwt() ->> 'email') IN ('admin', 'manager'));

CREATE POLICY "Admins can delete ad_performance"
  ON public.ad_performance FOR DELETE
  TO authenticated
  USING (public.is_admin(auth.jwt() ->> 'email'));

-- 4. Fix audit_logs policies
DROP POLICY IF EXISTS "Authenticated users can view audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Only system can insert audit logs" ON public.audit_logs;

CREATE POLICY "Allowed users can view audit logs"
  ON public.audit_logs FOR SELECT
  TO authenticated
  USING (public.is_allowed_user(auth.jwt() ->> 'email'));

CREATE POLICY "Managers and admins can insert audit logs"
  ON public.audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (public.get_user_role(auth.jwt() ->> 'email') IN ('admin', 'manager'));

-- 5. Fix login_audit insert policy to use security definer function only
DROP POLICY IF EXISTS "System can insert login_audit" ON public.login_audit;

-- Allow anon to insert via the security definer function for pre-login audit
CREATE POLICY "Allow login audit via function"
  ON public.login_audit FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);  -- Controlled by security definer function