-- Migration: allow media table to store URLs (Cloudinary) alongside binary data
-- 1) Make file_data nullable
-- 2) Add file_url column
-- 3) Optional: widen mime_type nullability (already nullable)

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'media' AND column_name = 'file_data'
  ) THEN
    ALTER TABLE media
      ALTER COLUMN file_data DROP NOT NULL;
  END IF;
END $$;

ALTER TABLE media
  ADD COLUMN IF NOT EXISTS file_url TEXT;
