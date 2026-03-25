-- Commission settings table to make rates configurable
CREATE TABLE IF NOT EXISTS commission_settings (
  purpose VARCHAR(10) PRIMARY KEY,
  buyer_rate NUMERIC(6,4) NOT NULL,
  seller_rate NUMERIC(6,4) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed defaults if missing
INSERT INTO commission_settings (purpose, buyer_rate, seller_rate)
VALUES
  ('Rent', 0.05, 0),
  ('Sell', 0.05, 0.05)
ON CONFLICT (purpose) DO NOTHING;
