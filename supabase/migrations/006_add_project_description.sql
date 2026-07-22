-- Add description column to projects table (was missing from original schema)
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS description text;
