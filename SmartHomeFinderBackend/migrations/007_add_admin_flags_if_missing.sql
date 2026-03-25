-- Migration: ensure admin flags exist on properties
-- Adds is_approved and is_published columns if they are missing
-- Also adds indexes for fast filtering

ALTER TABLE properties
  ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_properties_is_approved ON properties(is_approved);
CREATE INDEX IF NOT EXISTS idx_properties_is_published ON properties(is_published);
