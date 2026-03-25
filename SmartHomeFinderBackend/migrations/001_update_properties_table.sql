-- Migration: Add missing columns to properties table
-- This adds support for property purpose (Rent/Sell) and property documentation

-- Add purpose column if it doesn't exist
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS purpose TEXT;

-- Add property_doc column if it doesn't exist
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS property_doc TEXT;
