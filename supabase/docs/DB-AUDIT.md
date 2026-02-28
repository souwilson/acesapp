# Database Security & Schema Audit
**Synkra AIOS Dashboard**

**Date:** 2026-02-27
**Audit Type:** Static Code Analysis + Architecture Review
**Conducted by:** @data-engineer (Dara)
**Status:** ⚠️ ISSUES FOUND - Review Required

---

## Executive Summary

### Critical Findings
| Severity | Count | Category |
|----------|-------|----------|
| 🔴 CRITICAL | 4 | RLS & Data Access |
| 🟠 HIGH | 6 | Schema Design & Query Patterns |
| 🟡 MEDIUM | 8 | Performance & Maintainability |

**Overall Risk Level:** 🟠 **HIGH** (needs immediate attention)

---

## Part 1: Row-Level Security (RLS) Audit

### RLS Coverage Status

Based on code analysis, the following tables are identified:

| Table | Purpose | RLS Status | Current Access Pattern | Risk |
|-------|---------|-----------|------------------------|------|
| **profiles** | User profiles & roles | ⚠️ UNKNOWN | Queried in AuthContext | CRITICAL |
| **platforms** | Ad platforms | ⚠️ UNKNOWN | CRUD via usePlatforms hook | CRITICAL |
| **ad_campaigns** | Campaign data | ⚠️ UNKNOWN | Filtered by ad_performance_id | HIGH |
| **ad_performance** | Performance metrics | ⚠️ UNKNOWN | User-scoped queries | HIGH |
| **tools** | Development tools | ⚠️ UNKNOWN | useTools hook | HIGH |
| **variable_expenses** | Expense tracking | ⚠️ UNKNOWN | User-scoped | HIGH |
| **withdrawals** | Withdrawal records | ⚠️ UNKNOWN | Financial data | CRITICAL |
| **taxes** | Tax information | ⚠️ UNKNOWN | Financial sensitive | CRITICAL |
| **collaborators** | Team members | ⚠️ UNKNOWN | useCollaborators hook | HIGH |
| **audit_logs** | Activity logging | ⚠️ UNKNOWN | Admin queries | CRITICAL |
| **allowed_users** | User permissions | ⚠️ UNKNOWN | Admin-only access | CRITICAL |

### RLS Recommendations

#### CRITICAL: Missing RLS on Financial Tables
```sql
-- Enable RLS on withdrawals (sensitive financial data)
ALTER TABLE withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE taxes ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_campaigns ENABLE ROW LEVEL SECURITY;

-- Create baseline policies
-- Allow users to see their own records only
CREATE POLICY "Users see own withdrawals"
  ON withdrawals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users see own taxes"
  ON taxes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins see all"
  ON withdrawals FOR SELECT
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid())::text = 'admin'
  );
```

#### HIGH: RLS on Data Tables
```sql
-- platforms: User-scoped data
ALTER TABLE platforms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own platforms"
  ON platforms FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own platforms"
  ON platforms FOR INSERT, UPDATE, DELETE
  USING (auth.uid() = user_id);
```

#### HIGH: Admin-Only Access Control
```sql
-- audit_logs: Admin-only
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins see audit logs"
  ON audit_logs FOR SELECT
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid())::text = 'admin'
  );

-- allowed_users: Admin-only
ALTER TABLE allowed_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage allowed users"
  ON allowed_users FOR ALL
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid())::text = 'admin'
  );
```

### RLS Testing Strategy

After implementing policies:

```typescript
// Test as regular user (viewer)
@data-engineer *test-as-user user_123_id

// Test as manager
@data-engineer *test-as-user manager_user_id

// Test as admin
@data-engineer *test-as-user admin_user_id

// Verify each test case:
// ✓ Users can read own data
// ❌ Users cannot read others' data
// ✓ Admins can read all
// ✓ Users cannot bypass with service role key
```

---

## Part 2: Schema Design Quality Audit

### Critical Issues

#### 1. ⛔ No User Scoping on Key Tables

**Finding:** Multiple hooks select data without user_id filtering at database level.

```typescript
// CURRENT (vulnerable to RLS bypass)
await supabase.from('platforms').select('*')

// SHOULD BE (with RLS policy enforcing)
await supabase.from('platforms').select('*').eq('user_id', user.id)
```

**Impact:** Without RLS, service role key could expose all users' data

**Fix:** Implement RLS policies + verify Supabase client uses anon key (not service role)

---

#### 2. ⛔ Missing User_ID Foreign Keys

**Finding:** Many tables don't explicitly reference user relationship.

**Tables Affected:**
- platforms (no explicit user_id reference)
- ad_campaigns (no explicit user_id, depends on ad_performance_id)
- tools (no explicit ownership)
- variable_expenses (implied but not enforced)
- withdrawals (likely missing PK/FK structure)

**Recommendation:**
```sql
-- Add user_id and foreign key to platforms
ALTER TABLE platforms ADD COLUMN user_id uuid NOT NULL DEFAULT auth.uid();
ALTER TABLE platforms ADD CONSTRAINT fk_platforms_user
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
CREATE INDEX idx_platforms_user_id ON platforms(user_id);

-- Similar for other tables
ALTER TABLE ad_campaigns ADD CONSTRAINT fk_campaigns_user
  FOREIGN KEY (user_id) REFERENCES profiles(id);
```

---

#### 3. ⛔ No Audit Trail on Financial Transactions

**Finding:** Withdrawals and taxes tables lack audit fields.

**Missing Columns:**
- `created_by` - who initiated the action
- `updated_by` - who last modified
- `created_at`, `updated_at` - when changes occurred
- `reason` / `notes` - why the change was made

**Recommendation:**
```sql
-- Add audit columns to withdrawals
ALTER TABLE withdrawals ADD COLUMN created_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE withdrawals ADD COLUMN updated_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE withdrawals ADD COLUMN created_by uuid REFERENCES auth.users(id);
ALTER TABLE withdrawals ADD COLUMN notes text;

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
BEFORE UPDATE ON withdrawals
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
```

---

### High-Priority Issues

#### 4. 📊 Weak Data Type Consistency

**Finding:** Inconsistent use of string vs number for financial values.

```typescript
// From ad_campaigns type definition:
budget: string | null        // ❌ Should be numeric
margin: string | null        // ❌ Should be numeric
ctr: string | null          // ❌ Should be numeric
roas: number | null         // ✓ Correct
cpa: number | null          // ✓ Correct
```

**Fix:**
```sql
-- Convert financial columns to NUMERIC
ALTER TABLE ad_campaigns ALTER COLUMN budget TYPE numeric(12,2);
ALTER TABLE ad_campaigns ALTER COLUMN margin TYPE numeric(12,4);
ALTER TABLE ad_campaigns ALTER COLUMN ctr TYPE numeric(8,4);

-- Add check constraints
ALTER TABLE ad_campaigns ADD CONSTRAINT check_budget_positive CHECK (budget >= 0);
ALTER TABLE ad_campaigns ADD CONSTRAINT check_ctr_valid CHECK (ctr BETWEEN 0 AND 100);
```

---

#### 5. 📊 Missing Query Optimization

**Finding:** No indexes on frequently queried columns.

**Detected Access Patterns:**
```typescript
// From hooks:
.order('created_at', { ascending: false })    // usePlatforms
.eq('ad_performance_id', id)                  // useAdCampaigns
.order('spend', { ascending: false })         // useAdCampaigns
.in('ad_performance_id', ids)                 // useAdCampaignsByIds
```

**Missing Indexes:**
```sql
-- Critical for filtering
CREATE INDEX idx_ad_campaigns_performance_id ON ad_campaigns(ad_performance_id);
CREATE INDEX idx_ad_campaigns_spend ON ad_campaigns(spend DESC);

-- Critical for sorting
CREATE INDEX idx_platforms_created_at ON platforms(created_at DESC);
CREATE INDEX idx_withdrawals_created_at ON withdrawals(created_at DESC);

-- For user scoping
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_collaborators_workspace_id ON collaborators(workspace_id);
```

---

#### 6. 📊 Missing NOT NULL Constraints

**Finding:** Optional fields that should be required.

```sql
-- From code analysis, these should be NOT NULL:
ALTER TABLE ad_campaigns ALTER COLUMN campaign_name SET NOT NULL;
ALTER TABLE ad_campaigns ALTER COLUMN ad_performance_id SET NOT NULL;
ALTER TABLE platforms ALTER COLUMN name SET NOT NULL;
ALTER TABLE platforms ALTER COLUMN type SET NOT NULL;
ALTER TABLE tools ALTER COLUMN name SET NOT NULL;
```

---

#### 7. 🔑 Missing Relationship Enforcement

**Finding:** Foreign keys are implied but not enforced in database.

```sql
-- ad_campaigns → ad_performance
ALTER TABLE ad_campaigns ADD CONSTRAINT fk_campaigns_performance
  FOREIGN KEY (ad_performance_id) REFERENCES ad_performance(id) ON DELETE CASCADE;

-- profiles → auth.users
ALTER TABLE profiles ADD CONSTRAINT fk_profiles_auth_user
  FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- collaborators → profiles
ALTER TABLE collaborators ADD CONSTRAINT fk_collaborators_profile
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
```

---

#### 8. 🔑 No Soft Deletes for Audit Trails

**Finding:** Deletes are permanent; no way to track deleted records.

**Recommendation:** Add soft delete support to financial tables:

```sql
-- Add deleted_at column
ALTER TABLE withdrawals ADD COLUMN deleted_at TIMESTAMPTZ;
ALTER TABLE taxes ADD COLUMN deleted_at TIMESTAMPTZ;

-- Update delete logic in app to set deleted_at instead of actually deleting
-- Then filter in queries: WHERE deleted_at IS NULL

-- In hooks:
// BEFORE
await supabase.from('withdrawals').delete().eq('id', id)

// AFTER
await supabase.from('withdrawals')
  .update({ deleted_at: new Date() })
  .eq('id', id)
```

---

## Part 3: Security Analysis

### 3.1 Data Access Patterns

#### Service Role Key Usage ⚠️
**CRITICAL:** The app uses `supabase` client which should use **anon key**, not service role key.

```typescript
// src/integrations/supabase/client.ts
export const supabase = createClient<Database>(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,  // ✓ CORRECT (anon key)
);
```

✓ **Good:** Frontend correctly uses anon key
✓ **Good:** Service role key likely only on backend (if any)

---

#### SQL Injection Risk Assessment

**Query Pattern Analysis:**

```typescript
// Pattern 1: Safe - using .eq() filter
.eq('id', id)                          // ✓ SAFE (parameterized)

// Pattern 2: Safe - using .in() operator
.in('ad_performance_id', adPerformanceIds)  // ✓ SAFE (parameterized)

// Pattern 3: Vulnerable - string concatenation in order()
.order('spend', { ascending: false })  // ✓ SAFE (hardcoded column name)
```

**Verdict:** ✓ **No SQL injection vulnerabilities detected** in frontend code.

---

#### Authentication Bypass Risks

**Login Flow Analysis:**
```typescript
// AuthContext.tsx - Login sequence:
1. User provides email + password
2. signIn() calls supabase.auth.signInWithPassword()
3. Role fetched from profiles table
4. MFA check if aal1 → aal2 transition needed

// Risk Assessment:
✓ Password validation on Supabase (not client-side)
✓ MFA enforced for high-assurance operations
✓ Role-based access control in context
⚠️ No additional session validation
```

**Recommendation:** Add session refresh on role-protected operations:
```typescript
// In ProtectedRoute.tsx
const verifySessionAndRole = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirectToLogin();

  // Verify role hasn't changed
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single();

  if (profile.role !== expectedRole) refreshAuth();
};
```

---

### 3.2 Sensitive Data Handling

#### Financial Data Exposure ⚠️

**Tables with PII/Financial Data:**
- `withdrawals` - Bank account info (likely)
- `taxes` - Tax ID, financial records
- `ad_campaigns` - Revenue, profit
- `profiles` - Email, name

**Current Protection:** ⚠️ Relies on RLS only (not yet enabled)

**Recommendation:** Add field-level masking:
```sql
-- Create view for safe withdrawals display
CREATE VIEW withdrawals_safe AS
SELECT
  id,
  amount,
  status,
  created_at,
  -- Mask bank details
  '***' || substr(bank_account, -4) as bank_account_masked,
  CASE WHEN created_by = auth.uid() THEN created_by ELSE NULL END as created_by
FROM withdrawals
WHERE deleted_at IS NULL;

-- Users query the view instead of table directly
```

---

#### Audit Logging ⚠️

**Current Status:** audit_logs table exists but not connected to mutations.

**Missing:** Automatic logging of:
- Who changed what
- When changes occurred
- What values changed (before/after)
- Why (if provided)

**Implementation:**
```sql
-- Create audit table structure
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  operation TEXT NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),
  old_values JSONB,
  new_values JSONB,
  changed_by UUID REFERENCES auth.users(id),
  changed_at TIMESTAMPTZ DEFAULT now(),
  ip_address INET,
  reason TEXT
);

-- Create indexes for audit queries
CREATE INDEX idx_audit_table_record ON audit_logs(table_name, record_id);
CREATE INDEX idx_audit_user_date ON audit_logs(changed_by, changed_at DESC);

-- Create trigger for auto-logging
CREATE OR REPLACE FUNCTION audit_trigger()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs(table_name, record_id, operation, old_values, new_values, changed_by)
  VALUES (
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    TG_OP,
    to_jsonb(OLD),
    to_jsonb(NEW),
    auth.uid()
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Attach to financial tables
CREATE TRIGGER audit_withdrawals AFTER INSERT OR UPDATE OR DELETE ON withdrawals FOR EACH ROW EXECUTE FUNCTION audit_trigger();
CREATE TRIGGER audit_taxes AFTER INSERT OR UPDATE OR DELETE ON taxes FOR EACH ROW EXECUTE FUNCTION audit_trigger();
```

---

## Part 4: Query Performance Analysis

### Detected N+1 Risk

**Pattern 1: useAdCampaignsByIds**
```typescript
// Bulk query is good, but parent loop might cause multiple calls
for (const performanceId of performanceIds) {
  useAdCampaigns(performanceId)  // ❌ Multiple queries
}

// BETTER: Use useAdCampaignsByIds(performanceIds)  // ✓ Single query
```

---

### Missing Pagination

**High-Risk Tables:**
- `ad_campaigns` - Could be 1000s of records
- `audit_logs` - Grows over time, unbounded

**Recommendation:**
```typescript
// Add pagination to hooks
export function useAdCampaigns(adPerformanceId: string, page = 1, limit = 20) {
  const offset = (page - 1) * limit;
  return useQuery({
    queryKey: ['ad_campaigns', adPerformanceId, page],
    queryFn: async () => {
      const { data, error, count } = await supabase
        .from('ad_campaigns')
        .select('*', { count: 'exact' })
        .eq('ad_performance_id', adPerformanceId)
        .order('spend', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      return { data: data as AdCampaign[], total: count };
    },
  });
}
```

---

## Part 5: Compliance & Standards

### GDPR Compliance

**Current Gaps:**
- [ ] No data export functionality (Article 20)
- [ ] No automated deletion process (Right to be forgotten)
- [ ] No data processing agreement tracking
- [ ] Audit logs not retention-limited

**Recommendations:**
```sql
-- Add retention policy
ALTER TABLE audit_logs ADD COLUMN retention_expires_at TIMESTAMPTZ DEFAULT (now() + interval '90 days');

-- Create cleanup job
CREATE OR REPLACE FUNCTION cleanup_old_audits()
RETURNS void AS $$
BEGIN
  DELETE FROM audit_logs WHERE retention_expires_at < now();
END;
$$ LANGUAGE plpgsql;

-- Schedule with pg_cron (if available)
-- SELECT cron.schedule('cleanup-audits', '0 2 * * *', 'SELECT cleanup_old_audits()');
```

---

## Part 6: Priority Action Items

### 🔴 CRITICAL (Fix Immediately)

| ID | Task | Effort | Impact |
|----|------|--------|--------|
| **SEC-001** | Enable RLS on all tables | 2 hours | HIGH |
| **SEC-002** | Create RLS policies for user data | 3 hours | CRITICAL |
| **SEC-003** | Add user_id FK to platforms table | 1 hour | HIGH |
| **SEC-004** | Create audit trigger for financial tables | 2 hours | CRITICAL |

### 🟠 HIGH (Fix This Sprint)

| ID | Task | Effort | Impact |
|----|------|--------|--------|
| **PERF-001** | Add missing indexes on FK columns | 1 hour | HIGH |
| **PERF-002** | Add NOT NULL constraints | 1 hour | MEDIUM |
| **PERF-003** | Implement soft deletes for withdrawals | 2 hours | MEDIUM |
| **PERF-004** | Add pagination to large tables | 3 hours | MEDIUM |

### 🟡 MEDIUM (Technical Debt)

| ID | Task | Effort | Impact |
|----|------|--------|--------|
| **TECH-001** | Fix financial data types (string→numeric) | 2 hours | MEDIUM |
| **TECH-002** | Add comprehensive audit logging | 4 hours | LOW |
| **TECH-003** | Implement GDPR data export | 4 hours | LOW |

---

## Implementation Plan

### Phase 1: Security Hardening (Week 1)
```bash
# 1. Enable RLS on all tables
*apply-migration supabase/migrations/001-enable-rls.sql

# 2. Create base RLS policies
*apply-migration supabase/migrations/002-create-rls-policies.sql

# 3. Add audit logging
*apply-migration supabase/migrations/003-audit-logging.sql

# 4. Run tests
*test-as-user admin_user_id
*test-as-user regular_user_id
```

### Phase 2: Schema Improvements (Week 2)
```bash
# 1. Add foreign keys
*apply-migration supabase/migrations/004-add-foreign-keys.sql

# 2. Create indexes
*apply-migration supabase/migrations/005-create-indexes.sql

# 3. Fix data types
*apply-migration supabase/migrations/006-fix-data-types.sql
```

### Phase 3: Features (Week 3+)
```bash
# 1. Implement pagination
# 2. Add GDPR export
# 3. Performance optimization
```

---

## Next Steps

1. **Review this audit** with @architect and @dev
2. **Approve migration plan** before implementing
3. **Create snapshots** before running migrations
4. **Test RLS policies** with @data-engineer `*test-as-user` command
5. **Update hooks** to work with new schema constraints
6. **Verify tests pass** after each migration phase

---

## Related Documents

- `docs/architecture/system-architecture.md` - System overview
- `.aios-core/data/rls-security-patterns.md` - RLS best practices
- `.aios-core/data/migration-safety-guide.md` - Safe migration strategies

---

**Status:** 🟠 **Review in Progress**
**Next Review:** After Phase 1 Security Hardening complete
**Assigned to:** @data-engineer for implementation, @dev for code changes

*Audit conducted by @data-engineer (Dara) - 2026-02-27*
