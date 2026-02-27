-- Enable Row-Level Security (RLS) on all tables
-- CRITICAL BLOCKING ITEM: DB-001
-- Sprint 1 / STORY-DB-001

-- Enable RLS on profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Enable RLS on platforms table
ALTER TABLE platforms ENABLE ROW LEVEL SECURITY;

-- Enable RLS on ad_campaigns table
ALTER TABLE ad_campaigns ENABLE ROW LEVEL SECURITY;

-- Enable RLS on tools table
ALTER TABLE tools ENABLE ROW LEVEL SECURITY;

-- Enable RLS on variable_expenses table
ALTER TABLE variable_expenses ENABLE ROW LEVEL SECURITY;

-- Enable RLS on withdrawals table
ALTER TABLE withdrawals ENABLE ROW LEVEL SECURITY;

-- Enable RLS on taxes table
ALTER TABLE taxes ENABLE ROW LEVEL SECURITY;

-- Enable RLS on collaborators table
ALTER TABLE collaborators ENABLE ROW LEVEL SECURITY;

-- Enable RLS on audit_logs table (if exists)
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Verify RLS enabled on all tables
-- SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';
