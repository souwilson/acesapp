-- Add user_id foreign key to tools table
-- STORY-DB-002: Add User ID Foreign Keys
-- Sprint 1 / STORY-DB-002

-- ============================================================================
-- ADD user_id COLUMN TO TOOLS
-- ============================================================================

-- Add user_id column (nullable initially for backward compatibility)
ALTER TABLE public.tools
ADD COLUMN user_id UUID;

-- Create foreign key constraint referencing profiles table
ALTER TABLE public.tools
ADD CONSTRAINT tools_user_id_fkey
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Create index on user_id for RLS query performance
CREATE INDEX idx_tools_user_id ON public.tools(user_id);

-- ============================================================================
-- NOTES
-- ============================================================================
--
-- user_id column is NULLABLE to preserve existing data
-- FK constraint uses ON DELETE CASCADE (delete tools when user profile deleted)
-- Index created for RLS performance (filtering by user_id is common operation)
--
-- Future: Add NOT NULL constraint after data backfill in separate migration
--
