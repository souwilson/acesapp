-- Drop overly permissive policies
DROP POLICY IF EXISTS "Authenticated users can view dismissed alerts" ON public.dismissed_alerts;
DROP POLICY IF EXISTS "Authenticated users can insert dismissed alerts" ON public.dismissed_alerts;
DROP POLICY IF EXISTS "Authenticated users can delete dismissed alerts" ON public.dismissed_alerts;

-- Create secure policies following project pattern
CREATE POLICY "Allowed users can view dismissed alerts"
  ON public.dismissed_alerts
  FOR SELECT
  TO authenticated
  USING (is_allowed_user((auth.jwt() ->> 'email'::text)));

CREATE POLICY "Managers and admins can insert dismissed alerts"
  ON public.dismissed_alerts
  FOR INSERT
  TO authenticated
  WITH CHECK (get_user_role((auth.jwt() ->> 'email'::text)) = ANY (ARRAY['admin'::app_role, 'manager'::app_role]));

CREATE POLICY "Admins can delete dismissed alerts"
  ON public.dismissed_alerts
  FOR DELETE
  TO authenticated
  USING (is_admin((auth.jwt() ->> 'email'::text)));