-- Migration: Create properties table with all required columns
-- This is the initial schema for the properties table

CREATE TABLE IF NOT EXISTS properties (
  id SERIAL PRIMARY KEY,
  landlord_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(15,2) NOT NULL,
  location VARCHAR(255),
  property_type VARCHAR(50),
  purpose VARCHAR(50),
  year_built INTEGER,
  num_bedrooms INTEGER,
  num_bathrooms INTEGER,
  land_size INTEGER,
  verify_location TEXT,
  has_garage BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for fast lookup by landlord
CREATE INDEX IF NOT EXISTS idx_properties_landlord_id ON properties(landlord_id);
