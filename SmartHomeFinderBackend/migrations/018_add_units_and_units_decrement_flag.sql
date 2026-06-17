
-- Adds unit quantities for sellable properties, and a flag to ensure
-- we decrement units only once per successful Paystack payment.

ALTER TABLE properties
  ADD COLUMN units_total INTEGER NOT NULL DEFAULT 1;

ALTER TABLE properties
  ADD COLUMN units_available INTEGER NOT NULL DEFAULT 1;

-- Ensure consistency for any existing rows
UPDATE properties
SET units_available = units_total
WHERE units_available IS NULL OR units_available <> units_total;

ALTER TABLE transactions
  ADD COLUMN units_decremented BOOLEAN NOT NULL DEFAULT FALSE;
