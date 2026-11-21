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
  status text NOT NULL DEFAULT 'pending',
  trial_started_at timestamptz,
  trial_ends_at timestamptz,
  plan text,
  current_period_end timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE tenants ADD COLUMN IF NOT EXISTS trial_started_at timestamptz;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS trial_ends_at timestamptz;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS plan text;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS current_period_end timestamptz;

-- Amplía el CHECK de estado sin recrear la tabla.
DO $$
DECLARE
  constraint_name text;
BEGIN
  FOR constraint_name IN
    SELECT c.conname
    FROM pg_constraint c
    WHERE c.conrelid = 'tenants'::regclass
      AND c.contype = 'c'
      AND pg_get_constraintdef(c.oid) LIKE '%status%'
  LOOP
    EXECUTE format('ALTER TABLE tenants DROP CONSTRAINT %I', constraint_name);
  END LOOP;
  ALTER TABLE tenants
    ADD CONSTRAINT tenants_status_check
    CHECK (status IN ('sandbox', 'pending', 'trial', 'active', 'expired', 'cancelled'));
END
$$;

-- Las cuentas creadas antes de la aprobación de la prueba quedan pendientes.
UPDATE tenants SET status = 'pending' WHERE status = 'trial' AND trial_ends_at IS NULL;

CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  amount_ars integer NOT NULL CHECK (amount_ars > 0),
  plan text NOT NULL CHECK (plan IN ('monthly', 'yearly')),
  method text NOT NULL CHECK (method IN ('transfer', 'mercadopago', 'card')),
  status text NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')),
  paid_at timestamptz NOT NULL DEFAULT now()
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

REVOKE ALL ON identities, tenants, sessions, payments FROM PUBLIC;
REVOKE ALL ON identities, tenants, sessions, payments FROM fixitsch_app;

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
  VALUES (v_id, v_workshop, 'pending')
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

DROP FUNCTION IF EXISTS app_login_lookup(text);

CREATE OR REPLACE FUNCTION app_login_lookup(p_username text)
RETURNS TABLE (
  identity_id uuid,
  username text,
  password_hash text,
  name text,
  role text,
  tenant_id uuid,
  workshop_name text,
  created_at timestamptz,
  tenant_status text,
  trial_ends_at timestamptz,
  plan text,
  current_period_end timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT i.id, i.username, i.password_hash, i.name, i.role, t.id, t.workshop_name, i.created_at,
         t.status, t.trial_ends_at, t.plan, t.current_period_end
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

DROP FUNCTION IF EXISTS app_resolve_session(text);

CREATE OR REPLACE FUNCTION app_resolve_session(p_token_hash text)
RETURNS TABLE (
  identity_id uuid,
  username text,
  name text,
  role text,
  tenant_id uuid,
  workshop_name text,
  created_at timestamptz,
  tenant_status text,
  trial_ends_at timestamptz,
  plan text,
  current_period_end timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT i.id, i.username, i.name, i.role, t.id, t.workshop_name, i.created_at,
         t.status, t.trial_ends_at, t.plan, t.current_period_end
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

-- Plano plataforma. Todas validan que el actor sea platform_owner y ninguna
-- devuelve datos del taller más allá de metadatos de suscripción.

CREATE OR REPLACE FUNCTION app_assert_platform_owner(p_actor uuid)
RETURNS void
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM identities WHERE id = p_actor AND role = 'platform_owner'
  ) THEN
    RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501';
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION app_platform_list_tenants(p_actor uuid)
RETURNS TABLE (
  tenant_id uuid,
  workshop_name text,
  owner_username text,
  owner_name text,
  status text,
  trial_started_at timestamptz,
  trial_ends_at timestamptz,
  plan text,
  current_period_end timestamptz,
  created_at timestamptz,
  last_payment_at timestamptz
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM app_assert_platform_owner(p_actor);
  RETURN QUERY
    SELECT t.id, t.workshop_name, i.username, i.name, t.status,
           t.trial_started_at, t.trial_ends_at, t.plan, t.current_period_end, t.created_at,
           (SELECT max(p.paid_at) FROM payments p
             WHERE p.tenant_id = t.id AND p.status = 'approved')
    FROM tenants t
    JOIN identities i ON i.id = t.owner_identity_id
    ORDER BY t.created_at DESC;
END;
$$;

CREATE OR REPLACE FUNCTION app_platform_start_trial(
  p_actor uuid,
  p_tenant uuid,
  p_minutes integer
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_status text;
BEGIN
  PERFORM app_assert_platform_owner(p_actor);
  SELECT status INTO v_status FROM tenants WHERE id = p_tenant FOR UPDATE;
  IF v_status IS NULL THEN
    RAISE EXCEPTION 'tenant_not_found' USING ERRCODE = 'P0002';
  END IF;
  IF v_status = 'sandbox' THEN
    RAISE EXCEPTION 'sandbox_not_allowed' USING ERRCODE = '22023';
  END IF;
  IF p_minutes IS NULL OR p_minutes < 1 OR p_minutes > 525600 THEN
    RAISE EXCEPTION 'invalid_minutes' USING ERRCODE = '22023';
  END IF;
  UPDATE tenants
     SET status = 'trial',
         trial_started_at = now(),
         trial_ends_at = now() + make_interval(mins => p_minutes),
         plan = NULL,
         current_period_end = NULL
   WHERE id = p_tenant;
END;
$$;

CREATE OR REPLACE FUNCTION app_platform_extend_trial(
  p_actor uuid,
  p_tenant uuid,
  p_days integer
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_status text;
BEGIN
  PERFORM app_assert_platform_owner(p_actor);
  SELECT status INTO v_status FROM tenants WHERE id = p_tenant FOR UPDATE;
  IF v_status IS NULL THEN
    RAISE EXCEPTION 'tenant_not_found' USING ERRCODE = 'P0002';
  END IF;
  IF v_status = 'sandbox' THEN
    RAISE EXCEPTION 'sandbox_not_allowed' USING ERRCODE = '22023';
  END IF;
  IF p_days IS NULL OR p_days < 1 OR p_days > 3650 THEN
    RAISE EXCEPTION 'invalid_days' USING ERRCODE = '22023';
  END IF;
  UPDATE tenants
     SET status = CASE WHEN status = 'active' THEN 'active' ELSE 'trial' END,
         trial_ends_at = greatest(coalesce(trial_ends_at, now()), now())
                         + make_interval(days => p_days)
   WHERE id = p_tenant;
END;
$$;

CREATE OR REPLACE FUNCTION app_platform_suspend(p_actor uuid, p_tenant uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_status text;
BEGIN
  PERFORM app_assert_platform_owner(p_actor);
  SELECT status INTO v_status FROM tenants WHERE id = p_tenant FOR UPDATE;
  IF v_status IS NULL THEN
    RAISE EXCEPTION 'tenant_not_found' USING ERRCODE = 'P0002';
  END IF;
  IF v_status = 'sandbox' THEN
    RAISE EXCEPTION 'sandbox_not_allowed' USING ERRCODE = '22023';
  END IF;
  UPDATE tenants SET status = 'cancelled' WHERE id = p_tenant;
END;
$$;

CREATE OR REPLACE FUNCTION app_platform_reactivate(p_actor uuid, p_tenant uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_status text;
  v_plan text;
  v_period timestamptz;
  v_trial timestamptz;
BEGIN
  PERFORM app_assert_platform_owner(p_actor);
  SELECT status, plan, current_period_end, trial_ends_at
    INTO v_status, v_plan, v_period, v_trial
    FROM tenants WHERE id = p_tenant FOR UPDATE;
  IF v_status IS NULL THEN
    RAISE EXCEPTION 'tenant_not_found' USING ERRCODE = 'P0002';
  END IF;
  IF v_status = 'sandbox' THEN
    RAISE EXCEPTION 'sandbox_not_allowed' USING ERRCODE = '22023';
  END IF;
  UPDATE tenants
     SET status = CASE
           WHEN v_plan IS NOT NULL AND v_period IS NOT NULL AND v_period > now() THEN 'active'
           WHEN v_trial IS NOT NULL AND v_trial > now() THEN 'trial'
           ELSE 'expired'
         END
   WHERE id = p_tenant;
END;
$$;

CREATE OR REPLACE FUNCTION app_platform_record_payment(
  p_actor uuid,
  p_tenant uuid,
  p_plan text,
  p_method text
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_status text;
  v_amount integer;
  v_days integer;
BEGIN
  PERFORM app_assert_platform_owner(p_actor);
  SELECT status INTO v_status FROM tenants WHERE id = p_tenant FOR UPDATE;
  IF v_status IS NULL THEN
    RAISE EXCEPTION 'tenant_not_found' USING ERRCODE = 'P0002';
  END IF;
  IF v_status = 'sandbox' THEN
    RAISE EXCEPTION 'sandbox_not_allowed' USING ERRCODE = '22023';
  END IF;
  IF p_plan = 'monthly' THEN
    v_amount := 30000;
    v_days := 30;
  ELSIF p_plan = 'yearly' THEN
    v_amount := 300000;
    v_days := 365;
  ELSE
    RAISE EXCEPTION 'invalid_plan' USING ERRCODE = '22023';
  END IF;
  IF p_method NOT IN ('transfer', 'mercadopago', 'card') THEN
    RAISE EXCEPTION 'invalid_method' USING ERRCODE = '22023';
  END IF;

  INSERT INTO payments (tenant_id, amount_ars, plan, method, status, paid_at)
  VALUES (p_tenant, v_amount, p_plan, p_method, 'approved', now());

  UPDATE tenants
     SET status = 'active',
         plan = p_plan,
         current_period_end = greatest(coalesce(current_period_end, now()), now())
                              + make_interval(days => v_days)
   WHERE id = p_tenant;
END;
$$;

REVOKE ALL ON FUNCTION app_seed_admin(text, text, text, jsonb) FROM PUBLIC;
REVOKE ALL ON FUNCTION app_register(text, text, text, text, jsonb) FROM PUBLIC;
REVOKE ALL ON FUNCTION app_login_lookup(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION app_create_session(uuid, text, timestamptz) FROM PUBLIC;
REVOKE ALL ON FUNCTION app_resolve_session(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION app_delete_session(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION app_assert_platform_owner(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION app_platform_list_tenants(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION app_platform_start_trial(uuid, uuid, integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION app_platform_extend_trial(uuid, uuid, integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION app_platform_suspend(uuid, uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION app_platform_reactivate(uuid, uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION app_platform_record_payment(uuid, uuid, text, text) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION app_seed_admin(text, text, text, jsonb) TO fixitsch_app;
GRANT EXECUTE ON FUNCTION app_register(text, text, text, text, jsonb) TO fixitsch_app;
GRANT EXECUTE ON FUNCTION app_login_lookup(text) TO fixitsch_app;
GRANT EXECUTE ON FUNCTION app_create_session(uuid, text, timestamptz) TO fixitsch_app;
GRANT EXECUTE ON FUNCTION app_resolve_session(text) TO fixitsch_app;
GRANT EXECUTE ON FUNCTION app_delete_session(text) TO fixitsch_app;
GRANT EXECUTE ON FUNCTION app_assert_platform_owner(uuid) TO fixitsch_app;
GRANT EXECUTE ON FUNCTION app_platform_list_tenants(uuid) TO fixitsch_app;
GRANT EXECUTE ON FUNCTION app_platform_start_trial(uuid, uuid, integer) TO fixitsch_app;
GRANT EXECUTE ON FUNCTION app_platform_extend_trial(uuid, uuid, integer) TO fixitsch_app;
GRANT EXECUTE ON FUNCTION app_platform_suspend(uuid, uuid) TO fixitsch_app;
GRANT EXECUTE ON FUNCTION app_platform_reactivate(uuid, uuid) TO fixitsch_app;
GRANT EXECUTE ON FUNCTION app_platform_record_payment(uuid, uuid, text, text) TO fixitsch_app;
