-- =============================================
-- SECURITY OVERHAUL: Whitelist + Audit + Roles
-- =============================================

-- 1. Create app_role enum for role-based access
CREATE TYPE public.app_role AS ENUM ('admin', 'manager', 'viewer');

-- 2. Create allowed_users (whitelist) table
CREATE TABLE public.allowed_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  role app_role NOT NULL DEFAULT 'viewer',
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Ensure email is always lowercase
CREATE OR REPLACE FUNCTION public.normalize_email()
RETURNS TRIGGER AS $$
BEGIN
  NEW.email = LOWER(TRIM(NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER normalize_allowed_users_email
  BEFORE INSERT OR UPDATE ON public.allowed_users
  FOR EACH ROW
  EXECUTE FUNCTION public.normalize_email();

-- 3. Create login_audit table for security logging
CREATE TABLE public.login_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  success BOOLEAN NOT NULL DEFAULT false,
  reason TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 4. Create helper function to check if user is in whitelist and active
CREATE OR REPLACE FUNCTION public.is_allowed_user(_email TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.allowed_users
    WHERE email = LOWER(TRIM(_email))
      AND active = true
  )
$$;

-- 5. Create helper function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(_email TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.allowed_users
    WHERE email = LOWER(TRIM(_email))
      AND role = 'admin'
      AND active = true
  )
$$;

-- 6. Create helper function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(_email TEXT)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.allowed_users
  WHERE email = LOWER(TRIM(_email))
    AND active = true
  LIMIT 1
$$;

-- 7. Create function to check rate limiting (5 attempts in 10 minutes)
CREATE OR REPLACE FUNCTION public.is_rate_limited(_email TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*) >= 5
  FROM public.login_audit
  WHERE email = LOWER(TRIM(_email))
    AND success = false
    AND created_at > NOW() - INTERVAL '10 minutes'
$$;

-- 8. Create function to log login attempt
CREATE OR REPLACE FUNCTION public.log_login_attempt(
  _email TEXT,
  _success BOOLEAN,
  _reason TEXT DEFAULT NULL,
  _ip_address TEXT DEFAULT NULL,
  _user_agent TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  INSERT INTO public.login_audit (email, success, reason, ip_address, user_agent)
  VALUES (LOWER(TRIM(_email)), _success, _reason, _ip_address, _user_agent)
  RETURNING id
$$;

-- =============================================
-- RLS POLICIES
-- =============================================

-- Enable RLS on allowed_users
ALTER TABLE public.allowed_users ENABLE ROW LEVEL SECURITY;

-- Enable RLS on login_audit
ALTER TABLE public.login_audit ENABLE ROW LEVEL SECURITY;

-- allowed_users policies
-- Only admins can see the whitelist
CREATE POLICY "Admins can view allowed_users"
  ON public.allowed_users FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.jwt() ->> 'email'));

-- Only admins can insert new allowed users
CREATE POLICY "Admins can insert allowed_users"
  ON public.allowed_users FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin(auth.jwt() ->> 'email'));

-- Only admins can update allowed users
CREATE POLICY "Admins can update allowed_users"
  ON public.allowed_users FOR UPDATE
  TO authenticated
  USING (public.is_admin(auth.jwt() ->> 'email'));

-- Only admins can delete allowed users
CREATE POLICY "Admins can delete allowed_users"
  ON public.allowed_users FOR DELETE
  TO authenticated
  USING (public.is_admin(auth.jwt() ->> 'email'));

-- login_audit policies
-- Only admins can view audit logs
CREATE POLICY "Admins can view login_audit"
  ON public.login_audit FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.jwt() ->> 'email'));

-- System can insert audit logs (via security definer function)
CREATE POLICY "System can insert login_audit"
  ON public.login_audit FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- =============================================
-- SEED INITIAL ADMIN
-- =============================================

-- Add existing user as admin (the only user in the system)
INSERT INTO public.allowed_users (email, role, active)
VALUES ('mwsfff@gmail.com', 'admin', true)
ON CONFLICT (email) DO NOTHING;

-- =============================================
-- UPDATE EXISTING TABLE POLICIES
-- =============================================

-- Update platforms policies to require whitelist
DROP POLICY IF EXISTS "Anyone can read platforms" ON public.platforms;
DROP POLICY IF EXISTS "Anyone can insert platforms" ON public.platforms;
DROP POLICY IF EXISTS "Anyone can update platforms" ON public.platforms;
DROP POLICY IF EXISTS "Anyone can delete platforms" ON public.platforms;

CREATE POLICY "Allowed users can read platforms"
  ON public.platforms FOR SELECT
  TO authenticated
  USING (public.is_allowed_user(auth.jwt() ->> 'email'));

CREATE POLICY "Managers and admins can insert platforms"
  ON public.platforms FOR INSERT
  TO authenticated
  WITH CHECK (public.get_user_role(auth.jwt() ->> 'email') IN ('admin', 'manager'));

CREATE POLICY "Managers and admins can update platforms"
  ON public.platforms FOR UPDATE
  TO authenticated
  USING (public.get_user_role(auth.jwt() ->> 'email') IN ('admin', 'manager'));

CREATE POLICY "Admins can delete platforms"
  ON public.platforms FOR DELETE
  TO authenticated
  USING (public.is_admin(auth.jwt() ->> 'email'));

-- Update tools policies
DROP POLICY IF EXISTS "Anyone can read tools" ON public.tools;
DROP POLICY IF EXISTS "Anyone can insert tools" ON public.tools;
DROP POLICY IF EXISTS "Anyone can update tools" ON public.tools;
DROP POLICY IF EXISTS "Anyone can delete tools" ON public.tools;

CREATE POLICY "Allowed users can read tools"
  ON public.tools FOR SELECT
  TO authenticated
  USING (public.is_allowed_user(auth.jwt() ->> 'email'));

CREATE POLICY "Managers and admins can insert tools"
  ON public.tools FOR INSERT
  TO authenticated
  WITH CHECK (public.get_user_role(auth.jwt() ->> 'email') IN ('admin', 'manager'));

CREATE POLICY "Managers and admins can update tools"
  ON public.tools FOR UPDATE
  TO authenticated
  USING (public.get_user_role(auth.jwt() ->> 'email') IN ('admin', 'manager'));

CREATE POLICY "Admins can delete tools"
  ON public.tools FOR DELETE
  TO authenticated
  USING (public.is_admin(auth.jwt() ->> 'email'));

-- Update collaborators policies
DROP POLICY IF EXISTS "Anyone can read collaborators" ON public.collaborators;
DROP POLICY IF EXISTS "Anyone can insert collaborators" ON public.collaborators;
DROP POLICY IF EXISTS "Anyone can update collaborators" ON public.collaborators;
DROP POLICY IF EXISTS "Anyone can delete collaborators" ON public.collaborators;

CREATE POLICY "Allowed users can read collaborators"
  ON public.collaborators FOR SELECT
  TO authenticated
  USING (public.is_allowed_user(auth.jwt() ->> 'email'));

CREATE POLICY "Managers and admins can insert collaborators"
  ON public.collaborators FOR INSERT
  TO authenticated
  WITH CHECK (public.get_user_role(auth.jwt() ->> 'email') IN ('admin', 'manager'));

CREATE POLICY "Managers and admins can update collaborators"
  ON public.collaborators FOR UPDATE
  TO authenticated
  USING (public.get_user_role(auth.jwt() ->> 'email') IN ('admin', 'manager'));

CREATE POLICY "Admins can delete collaborators"
  ON public.collaborators FOR DELETE
  TO authenticated
  USING (public.is_admin(auth.jwt() ->> 'email'));

-- Update withdrawals policies
DROP POLICY IF EXISTS "Authenticated users can read withdrawals" ON public.withdrawals;
DROP POLICY IF EXISTS "Authenticated users can insert withdrawals" ON public.withdrawals;
DROP POLICY IF EXISTS "Authenticated users can update withdrawals" ON public.withdrawals;
DROP POLICY IF EXISTS "Authenticated users can delete withdrawals" ON public.withdrawals;

CREATE POLICY "Allowed users can read withdrawals"
  ON public.withdrawals FOR SELECT
  TO authenticated
  USING (public.is_allowed_user(auth.jwt() ->> 'email'));

CREATE POLICY "Managers and admins can insert withdrawals"
  ON public.withdrawals FOR INSERT
  TO authenticated
  WITH CHECK (public.get_user_role(auth.jwt() ->> 'email') IN ('admin', 'manager'));

CREATE POLICY "Managers and admins can update withdrawals"
  ON public.withdrawals FOR UPDATE
  TO authenticated
  USING (public.get_user_role(auth.jwt() ->> 'email') IN ('admin', 'manager'));

CREATE POLICY "Admins can delete withdrawals"
  ON public.withdrawals FOR DELETE
  TO authenticated
  USING (public.is_admin(auth.jwt() ->> 'email'));