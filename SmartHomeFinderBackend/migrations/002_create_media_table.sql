-- Migration: Add media table and update properties table
-- This creates a separate media table for storing binary files (images, videos, docs)
-- and adds columns to properties to reference media IDs

-- Create media table for storing binary files
CREATE TABLE IF NOT EXISTS media (
  id SERIAL PRIMARY KEY,
  property_id INTEGER REFERENCES properties(id) ON DELETE CASCADE,
  file_type VARCHAR(50), -- 'image', 'video', 'document'
  mime_type VARCHAR(100), -- 'image/jpeg', 'video/mp4', etc.
  file_size INTEGER,
  file_data BYTEA NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for fast lookup by property
CREATE INDEX IF NOT EXISTS idx_media_property_id ON media(property_id);

-- Add purpose column if it doesn't exist
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS purpose TEXT;

-- Add property_doc_id column to reference media table (for Sell documents)
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS property_doc_id INTEGER REFERENCES media(id);
