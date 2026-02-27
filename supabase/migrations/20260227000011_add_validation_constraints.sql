-- Add validation constraints (CHECK) for data integrity
-- STORY-DB-006: Validation Constraints
-- Sprint 1 / STORY-DB-006

-- ============================================================================
-- AMOUNT VALIDATION CONSTRAINTS (>= 0)
-- ============================================================================

-- Platforms: balance must be non-negative
ALTER TABLE public.platforms
  ADD CONSTRAINT chk_platforms_balance_non_negative CHECK (balance >= 0);

-- Tools: monthly_value must be non-negative
ALTER TABLE public.tools
  ADD CONSTRAINT chk_tools_monthly_value_non_negative CHECK (monthly_value >= 0);

-- Collaborators: monthly_value must be non-negative
ALTER TABLE public.collaborators
  ADD CONSTRAINT chk_collaborators_monthly_value_non_negative CHECK (monthly_value >= 0);

-- Variable Expenses: amount must be non-negative
ALTER TABLE public.variable_expenses
  ADD CONSTRAINT chk_variable_expenses_amount_non_negative CHECK (amount >= 0);

-- Taxes: amount must be non-negative
ALTER TABLE public.taxes
  ADD CONSTRAINT chk_taxes_amount_non_negative CHECK (amount >= 0);

-- ============================================================================
-- WITHDRAWAL VALIDATION CONSTRAINTS (> 0, strictly positive)
-- ============================================================================

-- Withdrawals: amount must be strictly positive (cannot be zero or negative)
ALTER TABLE public.withdrawals
  ADD CONSTRAINT chk_withdrawals_amount_positive CHECK (amount > 0);

-- ============================================================================
-- AD PERFORMANCE METRICS VALIDATION CONSTRAINTS (>= 0)
-- ============================================================================

-- Ad Performance: investment must be non-negative
ALTER TABLE public.ad_performance
  ADD CONSTRAINT chk_ad_performance_investment_non_negative CHECK (investment >= 0);

-- Ad Performance: revenue must be non-negative
ALTER TABLE public.ad_performance
  ADD CONSTRAINT chk_ad_performance_revenue_non_negative CHECK (revenue >= 0);

-- Ad Performance: sales must be non-negative
ALTER TABLE public.ad_performance
  ADD CONSTRAINT chk_ad_performance_sales_non_negative CHECK (sales >= 0);

-- ============================================================================
-- AD CAMPAIGNS METRICS VALIDATION CONSTRAINTS (>= 0)
-- ============================================================================

-- Ad Campaigns: spend must be non-negative
ALTER TABLE public.ad_campaigns
  ADD CONSTRAINT chk_ad_campaigns_spend_non_negative CHECK (spend >= 0);

-- Ad Campaigns: revenue must be non-negative
ALTER TABLE public.ad_campaigns
  ADD CONSTRAINT chk_ad_campaigns_revenue_non_negative CHECK (revenue >= 0);

-- Ad Campaigns: profit must be non-negative
ALTER TABLE public.ad_campaigns
  ADD CONSTRAINT chk_ad_campaigns_profit_non_negative CHECK (profit >= 0);

-- Ad Campaigns: sales must be non-negative
ALTER TABLE public.ad_campaigns
  ADD CONSTRAINT chk_ad_campaigns_sales_non_negative CHECK (sales >= 0);

-- Ad Campaigns: impressions must be non-negative
ALTER TABLE public.ad_campaigns
  ADD CONSTRAINT chk_ad_campaigns_impressions_non_negative CHECK (impressions >= 0);

-- Ad Campaigns: clicks must be non-negative
ALTER TABLE public.ad_campaigns
  ADD CONSTRAINT chk_ad_campaigns_clicks_non_negative CHECK (clicks >= 0);

-- Ad Campaigns: rejected_sales must be non-negative
ALTER TABLE public.ad_campaigns
  ADD CONSTRAINT chk_ad_campaigns_rejected_sales_non_negative CHECK (rejected_sales >= 0);

-- Ad Campaigns: ic (customer initiation count) must be non-negative
ALTER TABLE public.ad_campaigns
  ADD CONSTRAINT chk_ad_campaigns_ic_non_negative CHECK (ic >= 0);

-- ============================================================================
-- NOTES
-- ============================================================================
--
-- Check Constraints by Table:
-- ===========================
--
-- platforms:
--   - balance >= 0 (non-negative account balance)
--
-- tools:
--   - monthly_value >= 0 (subscription/tool cost must be non-negative)
--
-- collaborators:
--   - monthly_value >= 0 (team member cost must be non-negative)
--
-- variable_expenses:
--   - amount >= 0 (expense amount must be non-negative)
--
-- taxes:
--   - amount >= 0 (tax amount must be non-negative)
--
-- withdrawals:
--   - amount > 0 (withdrawal must be positive; zero withdrawal is invalid)
--
-- ad_performance:
--   - investment >= 0 (ad spend must be non-negative)
--   - revenue >= 0 (revenue must be non-negative)
--   - sales >= 0 (sales count must be non-negative)
--
-- ad_campaigns:
--   - spend >= 0 (campaign spend must be non-negative)
--   - revenue >= 0 (campaign revenue must be non-negative)
--   - profit >= 0 (profit must be non-negative)
--   - sales >= 0 (sales count must be non-negative)
--   - impressions >= 0 (ad impressions must be non-negative)
--   - clicks >= 0 (ad clicks must be non-negative)
--   - rejected_sales >= 0 (rejected sales must be non-negative)
--   - ic >= 0 (customer initiation count must be non-negative)
--
-- Design Principles:
-- - Amount fields: >= 0 (allow zero for "no transaction yet")
-- - Withdrawal amounts: > 0 (must be positive; zero withdrawal invalid)
-- - Metrics (sales, impressions): >= 0 (allow zero for "no activity yet")
-- - Financial amounts: >= 0 (allow zero)
--
-- Performance Impact:
-- - Constraint checking is O(1) operation per CHECK
-- - INSERT/UPDATE penalty: ~0.05-0.1ms per constraint
-- - No index required (constraints evaluated inline)
-- - Minimal impact on overall query performance
--
-- Compliance:
-- - Data Integrity: Enforces business rules at database layer
-- - Defense-in-Depth: Validation at multiple layers (app + database)
-- - GDPR: Prevents data quality issues that could expose PII
--
-- Error Handling:
-- - Constraint violation: PostgreSQL error with constraint name
-- - Example: ERROR:  new row for relation "withdrawals" violates check
--           constraint "chk_withdrawals_amount_positive"
-- - Application layer can catch and provide user-friendly error messages
--
