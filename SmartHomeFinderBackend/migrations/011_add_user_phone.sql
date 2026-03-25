-- Add phone column to users and enforce uniqueness
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS phone VARCHAR(50);

-- Backfill nulls to empty string if needed (optional)
-- UPDATE users SET phone = '' WHERE phone IS NULL;

-- Ensure phone is unique when provided
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'users_phone_unique'
  ) THEN
    ALTER TABLE users
      ADD CONSTRAINT users_phone_unique UNIQUE (phone);
  END IF;
END $$;
