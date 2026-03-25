-- Migration: align admin_audit ids to UUID (users.id, properties.id are UUID)
-- If columns cannot be cast, they are dropped/re-added (data loss for those columns)

DO $$
DECLARE
  has_admin_id boolean;
  has_property_id boolean;
BEGIN
  -- admin_id to UUID
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'admin_audit' AND column_name = 'admin_id'
  ) INTO has_admin_id;

  IF has_admin_id THEN
    BEGIN
      EXECUTE 'ALTER TABLE admin_audit ALTER COLUMN admin_id TYPE UUID USING admin_id::uuid';
    EXCEPTION WHEN others THEN
      EXECUTE 'ALTER TABLE admin_audit DROP COLUMN IF EXISTS admin_id';
      EXECUTE 'ALTER TABLE admin_audit ADD COLUMN admin_id UUID';
    END;
  ELSE
    EXECUTE 'ALTER TABLE admin_audit ADD COLUMN admin_id UUID';
  END IF;

  -- property_id to UUID
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'admin_audit' AND column_name = 'property_id'
  ) INTO has_property_id;

  IF has_property_id THEN
    BEGIN
      EXECUTE 'ALTER TABLE admin_audit ALTER COLUMN property_id TYPE UUID USING property_id::uuid';
    EXCEPTION WHEN others THEN
      EXECUTE 'ALTER TABLE admin_audit DROP COLUMN IF EXISTS property_id';
      EXECUTE 'ALTER TABLE admin_audit ADD COLUMN property_id UUID';
    END;
  ELSE
    EXECUTE 'ALTER TABLE admin_audit ADD COLUMN property_id UUID';
  END IF;

  -- Recreate FKs
  EXECUTE 'ALTER TABLE admin_audit DROP CONSTRAINT IF EXISTS fk_admin_audit_admin_id';
  EXECUTE 'ALTER TABLE admin_audit DROP CONSTRAINT IF EXISTS admin_audit_property_id_fkey';
  EXECUTE 'ALTER TABLE admin_audit DROP CONSTRAINT IF EXISTS fk_admin_audit_property_id';

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_admin_audit_admin_id') THEN
    EXECUTE 'ALTER TABLE admin_audit ADD CONSTRAINT fk_admin_audit_admin_id FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_admin_audit_property_id') THEN
    EXECUTE 'ALTER TABLE admin_audit ADD CONSTRAINT fk_admin_audit_property_id FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE';
  END IF;
END $$;