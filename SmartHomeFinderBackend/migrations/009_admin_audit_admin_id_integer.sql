-- Migration: align admin_audit.admin_id type with users.id
-- If users.id is UUID (current schema), ensure admin_audit.admin_id is UUID and FK set
-- If users.id is INTEGER (legacy), fall back to integer. Data in admin_id may be dropped during type changes.

DO $$
DECLARE
  v_users_type TEXT;
  v_admin_type TEXT;
  v_castable BOOLEAN := TRUE;
BEGIN
  SELECT data_type INTO v_users_type
  FROM information_schema.columns
  WHERE table_name = 'users' AND column_name = 'id'
  LIMIT 1;

  SELECT data_type INTO v_admin_type
  FROM information_schema.columns
  WHERE table_name = 'admin_audit' AND column_name = 'admin_id'
  LIMIT 1;

  IF v_users_type IS NULL THEN
    RAISE NOTICE 'users.id missing; skipping admin_audit admin_id migration';
    RETURN;
  END IF;

  -- Determine target type based on users.id
  IF v_users_type = 'uuid' THEN
    -- Ensure admin_id exists as UUID
    IF v_admin_type IS NULL THEN
      ALTER TABLE admin_audit ADD COLUMN admin_id UUID;
    ELSE
      BEGIN
        ALTER TABLE admin_audit ALTER COLUMN admin_id TYPE UUID USING admin_id::uuid;
      EXCEPTION WHEN others THEN
        v_castable := FALSE;
      END;
      IF NOT v_castable THEN
        ALTER TABLE admin_audit DROP COLUMN admin_id;
        ALTER TABLE admin_audit ADD COLUMN admin_id UUID;
      END IF;
    END IF;
  ELSE
    -- users.id is not UUID; assume integer fallback
    IF v_admin_type IS NULL THEN
      ALTER TABLE admin_audit ADD COLUMN admin_id INTEGER;
    ELSE
      BEGIN
        ALTER TABLE admin_audit ALTER COLUMN admin_id TYPE INTEGER USING admin_id::integer;
      EXCEPTION WHEN others THEN
        v_castable := FALSE;
      END;
      IF NOT v_castable THEN
        ALTER TABLE admin_audit DROP COLUMN admin_id;
        ALTER TABLE admin_audit ADD COLUMN admin_id INTEGER;
      END IF;
    END IF;
  END IF;

  -- Recreate FK to users(id)
  ALTER TABLE admin_audit DROP CONSTRAINT IF EXISTS fk_admin_audit_admin_id;
  ALTER TABLE admin_audit
    ADD CONSTRAINT fk_admin_audit_admin_id
    FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE;
END $$;
