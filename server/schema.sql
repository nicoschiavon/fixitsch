-- Idempotent schema. The API connects as fixitsch_app, which cannot bypass RLS
-- and cannot read identities except through the functions below.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'fixitsch_app') THEN
    CREATE ROLE fixitsch_app
      LOGIN
      PASSWORD 'fixitsch_app_local'
      NOSUPERUSER
      NOCREATEDB
      NOCREATEROLE
      NOINHERIT
      NOBYPASSRLS;
  END IF;
END
$$;

CREATE TABLE IF NOT EXISTS identities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  name text NOT NULL,
  role text NOT NULL CHECK (role IN ('platform_owner', 'workshop_owner')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tenants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_identity_id uuid NOT NULL UNIQUE REFERENCES identities(id) ON DELETE CASCADE,
  workshop_name text NOT NULL,
  status text NOT NULL CHECK (status IN ('sandbox', 'trial', 'active')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  identity_id uuid NOT NULL REFERENCES identities(id) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS workshop_settings (
  tenant_id uuid PRIMARY KEY REFERENCES tenants(id) ON DELETE CASCADE,
  data jsonb NOT NULL
);

CREATE TABLE IF NOT EXISTS repair_orders (
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  position integer NOT NULL,
  id text NOT NULL,
  data jsonb NOT NULL,
  PRIMARY KEY (tenant_id, id)
);

CREATE TABLE IF NOT EXISTS inventory_parts (
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  position integer NOT NULL,
  id text NOT NULL,
  data jsonb NOT NULL,
  PRIMARY KEY (tenant_id, id)
);

CREATE TABLE IF NOT EXISTS donor_devices (
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  position integer NOT NULL,
  id text NOT NULL,
  data jsonb NOT NULL,
  PRIMARY KEY (tenant_id, id)
);

REVOKE ALL ON identities, tenants, sessions FROM PUBLIC;
REVOKE ALL ON identities, tenants, sessions FROM fixitsch_app;

GRANT USAGE ON SCHEMA public TO fixitsch_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON workshop_settings, repair_orders, inventory_parts, donor_devices TO fixitsch_app;

ALTER TABLE workshop_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE workshop_settings FORCE ROW LEVEL SECURITY;
ALTER TABLE repair_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE repair_orders FORCE ROW LEVEL SECURITY;
ALTER TABLE inventory_parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_parts FORCE ROW LEVEL SECURITY;
ALTER TABLE donor_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE donor_devices FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tenant_isolation ON workshop_settings;
CREATE POLICY tenant_isolation ON workshop_settings
  USING (tenant_id = current_setting('app.tenant_id', true)::uuid)
  WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::uuid);

DROP POLICY IF EXISTS tenant_isolation ON repair_orders;
CREATE POLICY tenant_isolation ON repair_orders
  USING (tenant_id = current_setting('app.tenant_id', true)::uuid)
  WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::uuid);

DROP POLICY IF EXISTS tenant_isolation ON inventory_parts;
CREATE POLICY tenant_isolation ON inventory_parts
  USING (tenant_id = current_setting('app.tenant_id', true)::uuid)
  WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::uuid);

DROP POLICY IF EXISTS tenant_isolation ON donor_devices;
CREATE POLICY tenant_isolation ON donor_devices
  USING (tenant_id = current_setting('app.tenant_id', true)::uuid)
  WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::uuid);

CREATE OR REPLACE FUNCTION app_seed_admin(
  p_username text,
  p_password_hash text,
  p_name text,
  p_settings jsonb
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id uuid;
  v_tenant uuid;
BEGIN
  LOCK TABLE identities IN SHARE ROW EXCLUSIVE MODE;
  IF EXISTS (SELECT 1 FROM identities WHERE role = 'platform_owner') THEN
    RETURN;
  END IF;

  INSERT INTO identities (username, password_hash, name, role)
  VALUES (lower(btrim(p_username)), p_password_hash, btrim(p_name), 'platform_owner')
  RETURNING id INTO v_id;

  INSERT INTO tenants (owner_identity_id, workshop_name, status)
  VALUES (v_id, p_settings->>'workshopName', 'sandbox')
  RETURNING id INTO v_tenant;

  INSERT INTO workshop_settings (tenant_id, data)
  VALUES (v_tenant, p_settings);
END;
$$;

CREATE OR REPLACE FUNCTION app_register(
  p_username text,
  p_password_hash text,
  p_name text,
  p_workshop_name text,
  p_settings jsonb
) RETURNS TABLE (
  identity_id uuid,
  username text,
  name text,
  role text,
  tenant_id uuid,
  workshop_name text,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_username text := lower(btrim(p_username));
  v_name text := btrim(p_name);
  v_workshop text := btrim(p_workshop_name);
  v_id uuid;
  v_tenant uuid;
  v_created timestamptz;
BEGIN
  IF v_username !~ '^[a-z0-9._-]{3,32}$' THEN
    RAISE EXCEPTION 'invalid_username' USING ERRCODE = '22023';
  END IF;
  IF v_username IN ('admin', 'root', 'system', 'postgres') THEN
    RAISE EXCEPTION 'username_taken' USING ERRCODE = '23505';
  END IF;
  IF char_length(v_name) < 1 OR char_length(v_name) > 80 THEN
    RAISE EXCEPTION 'invalid_name' USING ERRCODE = '22023';
  END IF;
  IF char_length(v_workshop) < 1 OR char_length(v_workshop) > 80 THEN
    RAISE EXCEPTION 'invalid_workshop' USING ERRCODE = '22023';
  END IF;
  IF EXISTS (SELECT 1 FROM identities i WHERE i.username = v_username) THEN
    RAISE EXCEPTION 'username_taken' USING ERRCODE = '23505';
  END IF;

  INSERT INTO identities (username, password_hash, name, role)
  VALUES (v_username, p_password_hash, v_name, 'workshop_owner')
  RETURNING identities.id, identities.created_at INTO v_id, v_created;

  INSERT INTO tenants (owner_identity_id, workshop_name, status)
  VALUES (v_id, v_workshop, 'trial')
  RETURNING id INTO v_tenant;

  INSERT INTO workshop_settings (tenant_id, data)
  VALUES (v_tenant, p_settings);

  identity_id := v_id;
  username := v_username;
  name := v_name;
  role := 'workshop_owner';
  tenant_id := v_tenant;
  workshop_name := v_workshop;
  created_at := v_created;
  RETURN NEXT;
END;
$$;

CREATE OR REPLACE FUNCTION app_login_lookup(p_username text)
RETURNS TABLE (
  identity_id uuid,
  username text,
  password_hash text,
  name text,
  role text,
  tenant_id uuid,
  workshop_name text,
  created_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT i.id, i.username, i.password_hash, i.name, i.role, t.id, t.workshop_name, i.created_at
  FROM identities i
  JOIN tenants t ON t.owner_identity_id = i.id
  WHERE i.username = lower(btrim(p_username));
$$;

CREATE OR REPLACE FUNCTION app_create_session(
  p_identity_id uuid,
  p_token_hash text,
  p_expires_at timestamptz
) RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  INSERT INTO sessions (identity_id, token_hash, expires_at)
  VALUES (p_identity_id, p_token_hash, p_expires_at);
$$;

CREATE OR REPLACE FUNCTION app_resolve_session(p_token_hash text)
RETURNS TABLE (
  identity_id uuid,
  username text,
  name text,
  role text,
  tenant_id uuid,
  workshop_name text,
  created_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT i.id, i.username, i.name, i.role, t.id, t.workshop_name, i.created_at
  FROM sessions s
  JOIN identities i ON i.id = s.identity_id
  JOIN tenants t ON t.owner_identity_id = i.id
  WHERE s.token_hash = p_token_hash
    AND s.expires_at > now();
$$;

CREATE OR REPLACE FUNCTION app_delete_session(p_token_hash text)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  DELETE FROM sessions WHERE token_hash = p_token_hash;
$$;

REVOKE ALL ON FUNCTION app_seed_admin(text, text, text, jsonb) FROM PUBLIC;
REVOKE ALL ON FUNCTION app_register(text, text, text, text, jsonb) FROM PUBLIC;
REVOKE ALL ON FUNCTION app_login_lookup(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION app_create_session(uuid, text, timestamptz) FROM PUBLIC;
REVOKE ALL ON FUNCTION app_resolve_session(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION app_delete_session(text) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION app_seed_admin(text, text, text, jsonb) TO fixitsch_app;
GRANT EXECUTE ON FUNCTION app_register(text, text, text, text, jsonb) TO fixitsch_app;
GRANT EXECUTE ON FUNCTION app_login_lookup(text) TO fixitsch_app;
GRANT EXECUTE ON FUNCTION app_create_session(uuid, text, timestamptz) TO fixitsch_app;
GRANT EXECUTE ON FUNCTION app_resolve_session(text) TO fixitsch_app;
GRANT EXECUTE ON FUNCTION app_delete_session(text) TO fixitsch_app;
