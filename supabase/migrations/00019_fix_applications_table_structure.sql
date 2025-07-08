-- Fix applications table structure
-- The initial schema (00001) and applications migration (00002) have conflicting table definitions
-- This migration ensures all required columns exist

-- Add missing columns from migration 00002 that were not in 00001
ALTER TABLE public.applications 
ADD COLUMN IF NOT EXISTS availability TEXT;

ALTER TABLE public.applications 
ADD COLUMN IF NOT EXISTS experience_years INTEGER;

-- Ensure twitter_id column exists (from migration 00017)
ALTER TABLE public.applications 
ADD COLUMN IF NOT EXISTS twitter_id VARCHAR(15);

-- Ensure response_message and responded_at exist (they should from 00001)
ALTER TABLE public.applications 
ADD COLUMN IF NOT EXISTS response_message TEXT;

ALTER TABLE public.applications 
ADD COLUMN IF NOT EXISTS responded_at TIMESTAMPTZ;

-- Remove old contact_preference column if it still exists
ALTER TABLE public.applications 
DROP COLUMN IF EXISTS contact_preference;

-- Ensure the unique constraint exists
ALTER TABLE public.applications 
DROP CONSTRAINT IF EXISTS applications_post_id_user_id_key;

ALTER TABLE public.applications 
ADD CONSTRAINT applications_post_id_user_id_key UNIQUE(post_id, user_id);

-- Update column comments
COMMENT ON COLUMN public.applications.availability IS 'Applicant availability information';
COMMENT ON COLUMN public.applications.experience_years IS 'Years of relevant experience';
COMMENT ON COLUMN public.applications.twitter_id IS 'Twitter/X username without @ symbol';

-- Refresh the schema cache by creating or replacing a view
CREATE OR REPLACE VIEW applications_detail_view AS
SELECT 
  a.id,
  a.post_id,
  a.user_id,
  a.message,
  a.status,
  a.portfolio_url,
  a.experience_years,
  a.availability,
  a.twitter_id,
  a.response_message,
  a.responded_at,
  a.created_at,
  a.updated_at,
  p.title AS post_title,
  p.user_id AS post_author_id,
  u.display_name AS applicant_name,
  u.avatar_url AS applicant_avatar
FROM applications a
LEFT JOIN posts p ON a.post_id = p.id
LEFT JOIN users u ON a.user_id = u.id;