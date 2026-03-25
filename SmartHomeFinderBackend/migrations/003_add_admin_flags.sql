-- Migration: Add admin flags to properties table

ALTER TABLE properties
ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT FALSE;

ALTER TABLE properties
ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT FALSE;

-- Indexes for quick filtering
CREATE INDEX IF NOT EXISTS idx_properties_is_approved ON properties(is_approved);
CREATE INDEX IF NOT EXISTS idx_properties_is_published ON properties(is_published);
