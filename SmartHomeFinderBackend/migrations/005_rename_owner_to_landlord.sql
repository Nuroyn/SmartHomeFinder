-- Migration: align properties owner column to landlord_id
-- Safely rename owner_id -> landlord_id if present; add landlord_id if neither exists

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'properties' AND column_name = 'owner_id'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'properties' AND column_name = 'landlord_id'
  ) THEN
    ALTER TABLE properties RENAME COLUMN owner_id TO landlord_id;
  END IF;
END $$;

-- Add landlord_id if still missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'properties' AND column_name = 'landlord_id'
  ) THEN
    ALTER TABLE properties ADD COLUMN landlord_id UUID;
  END IF;
END $$;

-- Ensure index is on landlord_id
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relkind = 'i' AND c.relname = 'idx_properties_owner_id'
  ) THEN
    ALTER INDEX idx_properties_owner_id RENAME TO idx_properties_landlord_id;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_properties_landlord_id ON properties(landlord_id);
