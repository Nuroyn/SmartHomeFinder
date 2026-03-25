-- Extend transactions for payment/escrow tracking
ALTER TABLE transactions
  ADD COLUMN IF NOT EXISTS payment_status VARCHAR(30) DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS paystack_reference VARCHAR(120),
  ADD COLUMN IF NOT EXISTS currency VARCHAR(10) DEFAULT 'NGN',
  ADD COLUMN IF NOT EXISTS escrow_status VARCHAR(30) DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;

-- Uniqueness on reference if present
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'transactions_paystack_reference_key'
  ) THEN
    ALTER TABLE transactions ADD CONSTRAINT transactions_paystack_reference_key UNIQUE (paystack_reference);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_payment_status ON transactions(payment_status);
CREATE INDEX IF NOT EXISTS idx_transactions_escrow_status ON transactions(escrow_status);
