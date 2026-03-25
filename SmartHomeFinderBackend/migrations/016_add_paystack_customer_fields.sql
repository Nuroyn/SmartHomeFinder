-- Add Paystack customer/dedicated account tracking fields
ALTER TABLE users
ADD COLUMN IF NOT EXISTS paystack_customer_code VARCHAR(120),
ADD COLUMN IF NOT EXISTS paystack_dedicated_account_id INTEGER,
ADD COLUMN IF NOT EXISTS paystack_preferred_bank VARCHAR(120);
