-- Fix warn-level security issues: Restrict financial data to admin/manager roles only

-- 1. Drop and recreate collaborators SELECT policy (restrict to admin/manager)
DROP POLICY IF EXISTS "Allowed users can read collaborators" ON public.collaborators;
CREATE POLICY "Admins and managers can read collaborators"
ON public.collaborators
FOR SELECT
USING (get_user_role((auth.jwt() ->> 'email'::text)) = ANY (ARRAY['admin'::app_role, 'manager'::app_role]));

-- 2. Drop and recreate withdrawals SELECT policy (restrict to admin/manager)
DROP POLICY IF EXISTS "Allowed users can read withdrawals" ON public.withdrawals;
CREATE POLICY "Admins and managers can read withdrawals"
ON public.withdrawals
FOR SELECT
USING (get_user_role((auth.jwt() ->> 'email'::text)) = ANY (ARRAY['admin'::app_role, 'manager'::app_role]));

-- 3. Drop and recreate platforms SELECT policy (restrict to admin/manager)
DROP POLICY IF EXISTS "Allowed users can read platforms" ON public.platforms;
CREATE POLICY "Admins and managers can read platforms"
ON public.platforms
FOR SELECT
USING (get_user_role((auth.jwt() ->> 'email'::text)) = ANY (ARRAY['admin'::app_role, 'manager'::app_role]));