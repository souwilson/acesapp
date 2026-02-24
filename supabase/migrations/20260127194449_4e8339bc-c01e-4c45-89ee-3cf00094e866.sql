-- Fix: Restrict login_audit INSERT to only work via the security definer function
-- The current policy allows anon/authenticated to insert directly, bypassing the log_login_attempt function

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Allow login audit via function" ON public.login_audit;

-- The log_login_attempt function is SECURITY DEFINER, meaning it runs with the privileges
-- of the function owner (postgres/service role). By removing the permissive INSERT policy,
-- direct client inserts will be blocked while the function can still insert.
-- No new INSERT policy is needed because the function bypasses RLS as SECURITY DEFINER.