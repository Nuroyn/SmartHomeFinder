-- Create transactions table for commissions and auditability
-- Note: properties.id is integer in current schema; adjust FK accordingly.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id INTEGER REFERENCES properties(id) ON DELETE CASCADE,
  buyer_id UUID REFERENCES users(id),
  seller_id UUID REFERENCES users(id),
  purpose VARCHAR(10) CHECK (purpose IN ('Rent', 'Sell')),
  property_price NUMERIC(12,2) NOT NULL,
  buyer_fee NUMERIC(12,2) DEFAULT 0,
  seller_fee NUMERIC(12,2) DEFAULT 0,
  total_platform_fee NUMERIC(12,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transactions_property_id ON transactions(property_id);
CREATE INDEX IF NOT EXISTS idx_transactions_buyer_id ON transactions(buyer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_seller_id ON transactions(seller_id);
