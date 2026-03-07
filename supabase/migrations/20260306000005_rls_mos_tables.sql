-- RLS for MOS tables: assets and creatives
-- Pattern: same as existing tables (admin full, manager full, viewer read-only)
-- Note: assets and creatives are shared operational tables (no per-user ownership)

-- ============================================================================
-- ENABLE RLS
-- ============================================================================

ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE creatives ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- ASSETS POLICIES
-- ============================================================================

-- Admin: full access
CREATE POLICY "admin_access_assets" ON assets
  FOR ALL USING (auth.jwt() ->> 'user_role' = 'admin');

-- Manager: full access (shared operational table)
CREATE POLICY "manager_access_assets" ON assets
  FOR ALL USING (auth.jwt() ->> 'user_role' = 'manager');

-- Viewer: read-only
CREATE POLICY "viewer_read_assets" ON assets
  FOR SELECT USING (auth.jwt() ->> 'user_role' = 'viewer');

-- ============================================================================
-- CREATIVES POLICIES
-- ============================================================================

-- Admin: full access
CREATE POLICY "admin_access_creatives" ON creatives
  FOR ALL USING (auth.jwt() ->> 'user_role' = 'admin');

-- Manager: full access (shared operational table)
CREATE POLICY "manager_access_creatives" ON creatives
  FOR ALL USING (auth.jwt() ->> 'user_role' = 'manager');

-- Viewer: read-only
CREATE POLICY "viewer_read_creatives" ON creatives
  FOR SELECT USING (auth.jwt() ->> 'user_role' = 'viewer');
