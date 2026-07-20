-- ============================================================
-- MIGRATION 014: Blog columns + Tool status columns
-- Run this in Supabase SQL Editor to apply schema changes
-- that were added to schema.sql but never applied to the live DB.
-- ============================================================

-- 1. Blog posts: add missing columns (idempotent)
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS featured_image_url text;
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS author_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL;
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS published_at timestamptz;
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS view_count integer DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON public.blog_posts(published_at);
CREATE INDEX IF NOT EXISTS idx_blog_posts_author_id ON public.blog_posts(author_id);

-- 2. Workflow settings: add Coming Soon status columns (idempotent)
ALTER TABLE public.workflow_settings ADD COLUMN IF NOT EXISTS status text DEFAULT 'coming_soon' CHECK (status IN ('coming_soon', 'published', 'maintenance'));
ALTER TABLE public.workflow_settings ADD COLUMN IF NOT EXISTS api_verified boolean DEFAULT false;
ALTER TABLE public.workflow_settings ADD COLUMN IF NOT EXISTS last_tested_at timestamptz;
ALTER TABLE public.workflow_settings ADD COLUMN IF NOT EXISTS last_test_result text;

-- 3. Backfill: any existing workflow_settings rows with NULL status -> 'coming_soon'
UPDATE public.workflow_settings SET status = 'coming_soon' WHERE status IS NULL;
