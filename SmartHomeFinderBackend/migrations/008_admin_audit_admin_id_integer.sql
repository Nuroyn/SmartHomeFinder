-- Migration: ensure admin_audit.admin_id is UUID (matches users.id) and FK exists
-- Safe: if admin_id is not UUID, it will be dropped and re-added as UUID (data in that column is lost)

DO $$
DECLARE
  v_type TEXT;
BEGIN
  SELECT data_type INTO v_type
  FROM information_schema.columns
  WHERE table_name = 'admin_audit' AND column_name = 'admin_id'
  LIMIT 1;

  IF v_type IS NULL THEN
    ALTER TABLE admin_audit ADD COLUMN admin_id UUID;
  ELSIF v_type <> 'uuid' THEN
    ALTER TABLE admin_audit DROP COLUMN admin_id;
    ALTER TABLE admin_audit ADD COLUMN admin_id UUID;
  END IF;

  ALTER TABLE admin_audit
    DROP CONSTRAINT IF EXISTS fk_admin_audit_admin_id;

  ALTER TABLE admin_audit
    ADD CONSTRAINT fk_admin_audit_admin_id
    FOREIGN KEY (admin_id)
    REFERENCES users(id)
    ON DELETE CASCADE;
END $$;


