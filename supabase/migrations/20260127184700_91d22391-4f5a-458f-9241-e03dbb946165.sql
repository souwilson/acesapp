-- Fix security issues for profiles and ad_performance tables

-- 1. Fix profiles table: Users should only see their own profile
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- 2. Fix ad_performance table: Replace public access with authenticated user access
DROP POLICY IF EXISTS "Anyone can read ad_performance" ON public.ad_performance;
DROP POLICY IF EXISTS "Anyone can insert ad_performance" ON public.ad_performance;
DROP POLICY IF EXISTS "Anyone can update ad_performance" ON public.ad_performance;
DROP POLICY IF EXISTS "Anyone can delete ad_performance" ON public.ad_performance;

CREATE POLICY "Authenticated users can read ad_performance"
  ON public.ad_performance FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert ad_performance"
  ON public.ad_performance FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update ad_performance"
  ON public.ad_performance FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete ad_performance"
  ON public.ad_performance FOR DELETE
  TO authenticated
  USING (true);