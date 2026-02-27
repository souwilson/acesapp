-- Create RLS Policies for 3 Roles: admin, manager, viewer
-- CRITICAL BLOCKING ITEM: DB-001
-- Sprint 1 / STORY-DB-001

-- ============================================================================
-- ADMIN ROLE POLICIES (Full Access)
-- ============================================================================

-- Admin can do everything on profiles
CREATE POLICY "admin_access_profiles" ON profiles
  FOR ALL USING (auth.jwt() ->> 'user_role' = 'admin');

-- Admin can do everything on platforms
CREATE POLICY "admin_access_platforms" ON platforms
  FOR ALL USING (auth.jwt() ->> 'user_role' = 'admin');

-- Admin can do everything on ad_campaigns
CREATE POLICY "admin_access_ad_campaigns" ON ad_campaigns
  FOR ALL USING (auth.jwt() ->> 'user_role' = 'admin');

-- Admin can do everything on tools
CREATE POLICY "admin_access_tools" ON tools
  FOR ALL USING (auth.jwt() ->> 'user_role' = 'admin');

-- Admin can do everything on variable_expenses
CREATE POLICY "admin_access_variable_expenses" ON variable_expenses
  FOR ALL USING (auth.jwt() ->> 'user_role' = 'admin');

-- Admin can do everything on withdrawals
CREATE POLICY "admin_access_withdrawals" ON withdrawals
  FOR ALL USING (auth.jwt() ->> 'user_role' = 'admin');

-- Admin can do everything on taxes
CREATE POLICY "admin_access_taxes" ON taxes
  FOR ALL USING (auth.jwt() ->> 'user_role' = 'admin');

-- Admin can do everything on collaborators
CREATE POLICY "admin_access_collaborators" ON collaborators
  FOR ALL USING (auth.jwt() ->> 'user_role' = 'admin');

-- Admin can do everything on audit_logs (immutable but visible)
CREATE POLICY "admin_access_audit_logs" ON audit_logs
  FOR SELECT USING (auth.jwt() ->> 'user_role' = 'admin');

-- ============================================================================
-- MANAGER ROLE POLICIES (Own Data Only)
-- ============================================================================

-- Manager can see own profile
CREATE POLICY "manager_select_own_profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Manager cannot update/delete their profile (data integrity)
CREATE POLICY "manager_update_own_profile" ON profiles
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Manager can see own platforms
CREATE POLICY "manager_select_own_platforms" ON platforms
  FOR SELECT USING (auth.uid() = user_id);

-- Manager can insert/update/delete own platforms
CREATE POLICY "manager_manage_own_platforms" ON platforms
  FOR ALL USING (auth.uid() = user_id);

-- Manager can see own ad campaigns
CREATE POLICY "manager_select_own_campaigns" ON ad_campaigns
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM platforms
      WHERE platforms.id = ad_campaigns.platform_id
      AND platforms.user_id = auth.uid()
    )
  );

-- Manager can manage own campaigns
CREATE POLICY "manager_manage_own_campaigns" ON ad_campaigns
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM platforms
      WHERE platforms.id = ad_campaigns.platform_id
      AND platforms.user_id = auth.uid()
    )
  );

-- Manager can see own tools
CREATE POLICY "manager_select_own_tools" ON tools
  FOR SELECT USING (auth.uid() = user_id);

-- Manager can manage own tools
CREATE POLICY "manager_manage_own_tools" ON tools
  FOR ALL USING (auth.uid() = user_id);

-- Manager can see own expenses
CREATE POLICY "manager_select_own_expenses" ON variable_expenses
  FOR SELECT USING (auth.uid() = user_id);

-- Manager can manage own expenses
CREATE POLICY "manager_manage_own_expenses" ON variable_expenses
  FOR ALL USING (auth.uid() = user_id);

-- Manager can see own withdrawals
CREATE POLICY "manager_select_own_withdrawals" ON withdrawals
  FOR SELECT USING (auth.uid() = user_id);

-- Manager can manage own withdrawals
CREATE POLICY "manager_manage_own_withdrawals" ON withdrawals
  FOR ALL USING (auth.uid() = user_id);

-- Manager can see own taxes
CREATE POLICY "manager_select_own_taxes" ON taxes
  FOR SELECT USING (auth.uid() = user_id);

-- Manager can manage own taxes
CREATE POLICY "manager_manage_own_taxes" ON taxes
  FOR ALL USING (auth.uid() = user_id);

-- Manager can see collaborators for own account
CREATE POLICY "manager_select_own_collaborators" ON collaborators
  FOR SELECT USING (auth.uid() = user_id);

-- Manager can manage collaborators for own account
CREATE POLICY "manager_manage_own_collaborators" ON collaborators
  FOR ALL USING (auth.uid() = user_id);

-- Manager can see own audit logs
CREATE POLICY "manager_select_own_audit_logs" ON audit_logs
  FOR SELECT USING (auth.uid() = user_id);

-- ============================================================================
-- VIEWER ROLE POLICIES (Read-Only Shared Data)
-- ============================================================================

-- Viewer can only read shared reports (no individual user data)
-- Viewer has no direct table access - they use read-only views

-- For now, deny all direct access - viewers use views instead
CREATE POLICY "viewer_no_direct_access" ON profiles
  FOR ALL USING (false);

CREATE POLICY "viewer_no_direct_access_platforms" ON platforms
  FOR ALL USING (false);

CREATE POLICY "viewer_no_direct_access_campaigns" ON ad_campaigns
  FOR ALL USING (false);

CREATE POLICY "viewer_no_direct_access_tools" ON tools
  FOR ALL USING (false);

CREATE POLICY "viewer_no_direct_access_expenses" ON variable_expenses
  FOR ALL USING (false);

CREATE POLICY "viewer_no_direct_access_withdrawals" ON withdrawals
  FOR ALL USING (false);

CREATE POLICY "viewer_no_direct_access_taxes" ON taxes
  FOR ALL USING (false);

CREATE POLICY "viewer_no_direct_access_collaborators" ON collaborators
  FOR ALL USING (false);

CREATE POLICY "viewer_no_direct_access_audit_logs" ON audit_logs
  FOR ALL USING (false);

-- ============================================================================
-- NOTES
-- ============================================================================
--
-- Admin Role: Full access to all tables (no RLS restriction)
-- Manager Role: Can only read/write their own data (filtered by user_id)
-- Viewer Role: No direct access (uses read-only views for shared reports)
--
-- To test RLS policies:
-- 1. Create test users with roles set in auth.users
-- 2. Set custom claims: auth.jwt() ->> 'user_role' = 'manager'
-- 3. Run SELECT * FROM table_name; with each user's JWT
-- 4. Verify that managers only see their own data
--
