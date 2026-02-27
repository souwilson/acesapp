-- Add user_id foreign key to variable_expenses table
-- STORY-DB-002: Add User ID Foreign Keys
-- Sprint 1 / STORY-DB-002

-- ============================================================================
-- ADD user_id COLUMN TO VARIABLE_EXPENSES
-- ============================================================================

-- Add user_id column (nullable initially for backward compatibility)
ALTER TABLE public.variable_expenses
ADD COLUMN user_id UUID;

-- Create foreign key constraint referencing profiles table
ALTER TABLE public.variable_expenses
ADD CONSTRAINT variable_expenses_user_id_fkey
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Create index on user_id for RLS query performance
CREATE INDEX idx_variable_expenses_user_id ON public.variable_expenses(user_id);

-- ============================================================================
-- NOTES
-- ============================================================================
--
-- user_id column is NULLABLE to preserve existing data
-- FK constraint uses ON DELETE CASCADE (delete expenses when user profile deleted)
-- Index created for RLS performance (filtering by user_id is common operation)
--
-- Future: Add NOT NULL constraint after data backfill in separate migration
--
