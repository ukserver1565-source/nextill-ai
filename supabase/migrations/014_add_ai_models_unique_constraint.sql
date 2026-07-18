-- Migration 014: Add UNIQUE constraint on ai_models(provider, model_name)
--
-- PROBLEM:
--   The ON CONFLICT clause in 003_seed.sql references (provider, model_name)
--   but no UNIQUE constraint exists on these columns. This causes INSERT
--   to fail with "there is no unique or exclusion constraint matching the
--   ON CONFLICT specification".
--
-- FIX:
--   Add a UNIQUE constraint on (provider, model_name) if it doesn't exist.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.ai_models'::regclass
      AND contype = 'u'
  ) THEN
    ALTER TABLE public.ai_models
      ADD CONSTRAINT ai_models_provider_model_name_unique
      UNIQUE (provider, model_name);
  END IF;
END $$;
