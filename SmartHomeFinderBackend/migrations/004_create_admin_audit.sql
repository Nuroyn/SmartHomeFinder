-- Migration: Create admin_audit table to record admin actions

CREATE TABLE IF NOT EXISTS admin_audit (
  id SERIAL PRIMARY KEY,
  admin_id UUID NOT NULL,
  property_id INTEGER,
  action VARCHAR(100) NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_audit_admin_id ON admin_audit(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_property_id ON admin_audit(property_id);
