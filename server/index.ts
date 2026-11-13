import { createHash } from 'node:crypto';
import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import { pool, withTenant } from './db.ts';
import { hashPassword, newSessionToken, verifyPassword } from './password.ts';
import { emptySettings, sanitizeLogoDataUrl, type WorkshopSettings } from './settings.ts';

const PORT = Number(process.env.PORT || 4000);
const SESSION_COOKIE = 'fixitsch_session';
const SESSION_DAYS = 14;
const ADMIN_USERNAME = (process.env.ADMIN_USERNAME || 'admin').toLowerCase();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123!';

type AccountRole = 'platform_owner' | 'workshop_owner';

type Account = {
  id: string;
  username: string;
  name: string;
  role: AccountRole;
  workshopName: string;
  createdAt: string;
  tenantId: string;
};

class HttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '2mb' }));

app.get('/api/health', async (_req, res) => {
  await pool.query('SELECT 1');
  res.json({ ok: true });
});

app.post('/api/auth/login', async (req, res, next) => {
  try {
    const username = cleanUsername(req.body?.username);
    const password = String(req.body?.password || '');
    if (!username || !password) throw new HttpError(400, 'Completá usuario y contraseña.');
    if (limited(username)) throw new HttpError(429, 'Demasiados intentos. Esperá unos minutos.');

    const account = await findAccount(username);
    const hash = account?.passwordHash || DUMMY_HASH;
    const matches = await verifyPassword(password, hash);
    if (!account || !matches) {
      throw new HttpError(401, 'Usuario o contraseña incorrectos.');
    }
    clearLimit(username);
    await startSession(res, account);
    res.json({ user: publicAccount(account) });
  } catch (error) {
    next(error);
  }
});

app.post('/api/auth/register', async (req, res, next) => {
  try {
    const username = cleanUsername(req.body?.username);
    const password = String(req.body?.password || '');
    const name = String(req.body?.name || '').trim() || username;
    const workshopName = String(req.body?.workshopName || '').trim() || `Taller de ${name}`;
    if (!username || !/^[a-z0-9._-]{3,32}$/.test(username)) {
      throw new HttpError(400, 'El usuario debe tener 3 a 32 caracteres: letras, números, punto, guion o guion bajo.');
    }
    if (password.length < 8 || password.length > 128) {
      throw new HttpError(400, 'La contraseña debe tener entre 8 y 128 caracteres.');
    }
    if (name.length > 80 || workshopName.length > 80) {
      throw new HttpError(400, 'El nombre o el taller son demasiado largos.');
    }

    const passwordHash = await hashPassword(password);
    const settings = emptySettings(workshopName);
    let row;
    try {
      const result = await pool.query(
        `SELECT identity_id, username, name, role, tenant_id, workshop_name, created_at
         FROM app_register($1, $2, $3, $4, $5::jsonb)`,
        [username, passwordHash, name, workshopName, JSON.stringify(settings)]
      );
      row = result.rows[0];
    } catch (error) {
      if (errorCode(error) === '23505') throw new HttpError(409, 'Ese usuario ya existe.');
      if (errorCode(error) === '22023') throw new HttpError(400, 'Revisá el usuario y el nombre del taller.');
      throw error;
    }
    if (!row) throw new HttpError(500, 'No se pudo crear la cuenta.');

    const account = mapAccount(row);
    await startSession(res, account);
    res.status(201).json({ user: publicAccount(account) });
  } catch (error) {
    next(error);
  }
});

app.post('/api/auth/logout', async (req, res, next) => {
  try {
    const token = readCookie(req, SESSION_COOKIE);
    if (token) await pool.query('SELECT app_delete_session($1)', [tokenHash(token)]);
    clearCookie(res);
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

app.get('/api/auth/me', async (req, res, next) => {
  try {
    const account = await accountFromRequest(req);
    if (!account) throw new HttpError(401, 'Tenés que iniciar sesión.');
    res.json({ user: publicAccount(account) });
  } catch (error) {
    next(error);
  }
});

app.get('/api/workshop', async (req, res, next) => {
  try {
    const account = await requireAccount(req);
    const data = await readWorkshop(account.tenantId, account.workshopName);
    res.json(data);
  } catch (error) {
    next(error);
  }
});

app.put('/api/workshop/orders', async (req, res, next) => {
  try {
    const account = await requireAccount(req);
    const rows = asRecords(req.body?.orders, 'Órdenes');
    await replaceCollection(account.tenantId, 'repair_orders', rows);
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

app.put('/api/workshop/parts', async (req, res, next) => {
  try {
    const account = await requireAccount(req);
    const rows = asRecords(req.body?.parts, 'Repuestos');
    await replaceCollection(account.tenantId, 'inventory_parts', rows);
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

app.put('/api/workshop/donors', async (req, res, next) => {
  try {
    const account = await requireAccount(req);
    const rows = asRecords(req.body?.donors, 'Equipos');
    await replaceCollection(account.tenantId, 'donor_devices', rows);
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

app.put('/api/workshop/settings', async (req, res, next) => {
  try {
    const account = await requireAccount(req);
    const settings = asSettings(req.body?.settings, account.workshopName);
    await withTenant(account.tenantId, async (client) => {
      await client.query(
        `INSERT INTO workshop_settings (tenant_id, data)
         VALUES ($1::uuid, $2::jsonb)
         ON CONFLICT (tenant_id) DO UPDATE SET data = EXCLUDED.data`,
        [account.tenantId, JSON.stringify(settings)]
      );
    });
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

app.post('/api/workshop/clear', async (req, res, next) => {
  try {
    const account = await requireAccount(req);
    const settings = emptySettings(account.workshopName);
    await withTenant(account.tenantId, async (client) => {
      await client.query('DELETE FROM repair_orders WHERE tenant_id = $1::uuid', [account.tenantId]);
      await client.query('DELETE FROM inventory_parts WHERE tenant_id = $1::uuid', [account.tenantId]);
      await client.query('DELETE FROM donor_devices WHERE tenant_id = $1::uuid', [account.tenantId]);
      await client.query(
        `INSERT INTO workshop_settings (tenant_id, data)
         VALUES ($1::uuid, $2::jsonb)
         ON CONFLICT (tenant_id) DO UPDATE SET data = EXCLUDED.data`,
        [account.tenantId, JSON.stringify(settings)]
      );
    });
    res.json({ orders: [], parts: [], donors: [], settings });
  } catch (error) {
    next(error);
  }
});

app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (error instanceof HttpError) {
    res.status(error.status).json({ error: error.message });
    return;
  }
  console.error('request failed');
  res.status(500).json({ error: 'Error interno. Probá de nuevo.' });
});

async function main() {
  await seedAdmin();
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`api listening on ${PORT}`);
  });
}

async function seedAdmin() {
  const settings = emptySettings('Sandbox');
  const passwordHash = await hashPassword(ADMIN_PASSWORD);
  await pool.query('SELECT app_seed_admin($1, $2, $3, $4::jsonb)', [
    ADMIN_USERNAME,
    passwordHash,
    'Admin',
    JSON.stringify(settings),
  ]);
}

type AccountRow = {
  identity_id: string;
  username: string;
  password_hash?: string;
  name: string;
  role: AccountRole;
  tenant_id: string;
  workshop_name: string;
  created_at: Date | string;
};

type StoredAccount = Account & { passwordHash: string };

function mapAccount(row: AccountRow, passwordHash = ''): StoredAccount {
  return {
    id: row.identity_id,
    username: row.username,
    name: row.name,
    role: row.role,
    workshopName: row.workshop_name,
    createdAt: new Date(row.created_at).toISOString(),
    tenantId: row.tenant_id,
    passwordHash,
  };
}

function publicAccount(account: Account) {
  return {
    id: account.id,
    username: account.username,
    name: account.name,
    role: account.role,
    workshopName: account.workshopName,
    createdAt: account.createdAt,
  };
}

async function findAccount(username: string): Promise<StoredAccount | null> {
  const result = await pool.query(
    `SELECT identity_id, username, password_hash, name, role, tenant_id, workshop_name, created_at
     FROM app_login_lookup($1)`,
    [username]
  );
  const row = result.rows[0] as AccountRow | undefined;
  if (!row?.password_hash) return null;
  return mapAccount(row, row.password_hash);
}

async function accountFromRequest(req: Request): Promise<Account | null> {
  const token = readCookie(req, SESSION_COOKIE);
  if (!token) return null;
  const result = await pool.query(
    `SELECT identity_id, username, name, role, tenant_id, workshop_name, created_at
     FROM app_resolve_session($1)`,
    [tokenHash(token)]
  );
  const row = result.rows[0] as AccountRow | undefined;
  return row ? mapAccount(row) : null;
}

async function requireAccount(req: Request): Promise<Account> {
  const account = await accountFromRequest(req);
  if (!account) throw new HttpError(401, 'Tenés que iniciar sesión.');
  return account;
}

async function startSession(res: Response, account: Account) {
  const token = newSessionToken();
  const expires = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await pool.query('SELECT app_create_session($1::uuid, $2, $3::timestamptz)', [
    account.id,
    tokenHash(token),
    expires.toISOString(),
  ]);
  const maxAge = SESSION_DAYS * 24 * 60 * 60;
  res.setHeader(
    'Set-Cookie',
    `${SESSION_COOKIE}=${encodeURIComponent(token)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${maxAge}`
  );
}

function clearCookie(res: Response) {
  res.setHeader('Set-Cookie', `${SESSION_COOKIE}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0`);
}

function tokenHash(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

function readCookie(req: Request, name: string): string | null {
  const header = req.headers.cookie;
  if (!header) return null;
  for (const part of header.split(';')) {
    const separator = part.indexOf('=');
    if (separator === -1) continue;
    const key = part.slice(0, separator).trim();
    if (key !== name) continue;
    return decodeURIComponent(part.slice(separator + 1).trim());
  }
  return null;
}

function cleanUsername(value: unknown): string {
  return String(value || '').trim().toLowerCase();
}

const attempts = new Map<string, { count: number; reset: number }>();

function limited(username: string): boolean {
  const now = Date.now();
  const row = attempts.get(username);
  if (!row || row.reset < now) {
    attempts.set(username, { count: 1, reset: now + 10 * 60 * 1000 });
    return false;
  }
  row.count += 1;
  return row.count > 20;
}

function clearLimit(username: string) {
  attempts.delete(username);
}

function errorCode(error: unknown): string | undefined {
  if (error && typeof error === 'object' && 'code' in error) {
    return String((error as { code?: string }).code);
  }
  return undefined;
}

const TABLES = {
  repair_orders: 'repair_orders',
  inventory_parts: 'inventory_parts',
  donor_devices: 'donor_devices',
} as const;

async function replaceCollection(
  tenantId: string,
  table: keyof typeof TABLES,
  rows: Array<Record<string, unknown>>
) {
  const ids = new Set<string>();
  for (const row of rows) {
    const id = String(row.id);
    if (ids.has(id)) throw new HttpError(400, 'Hay identificadores repetidos.');
    ids.add(id);
  }
  await withTenant(tenantId, async (client) => {
    await client.query(`DELETE FROM ${TABLES[table]} WHERE tenant_id = $1::uuid`, [tenantId]);
    for (const [index, row] of rows.entries()) {
      await client.query(
        `INSERT INTO ${TABLES[table]} (tenant_id, position, id, data) VALUES ($1::uuid, $2, $3, $4::jsonb)`,
        [tenantId, index, String(row.id), JSON.stringify(row)]
      );
    }
  });
}

async function readWorkshop(tenantId: string, workshopName: string) {
  return withTenant(tenantId, async (client) => {
    const [orders, parts, donors, settings] = await Promise.all([
      client.query(`SELECT data FROM repair_orders WHERE tenant_id = $1::uuid ORDER BY position`, [tenantId]),
      client.query(`SELECT data FROM inventory_parts WHERE tenant_id = $1::uuid ORDER BY position`, [tenantId]),
      client.query(`SELECT data FROM donor_devices WHERE tenant_id = $1::uuid ORDER BY position`, [tenantId]),
      client.query(`SELECT data FROM workshop_settings WHERE tenant_id = $1::uuid`, [tenantId]),
    ]);
    return {
      orders: orders.rows.map((row) => row.data),
      parts: parts.rows.map((row) => row.data),
      donors: donors.rows.map((row) => row.data),
      settings: (settings.rows[0]?.data as WorkshopSettings | undefined) || emptySettings(workshopName),
    };
  });
}

function asRecords(value: unknown, label: string): Array<Record<string, unknown>> {
  if (!Array.isArray(value)) throw new HttpError(400, `${label} inválidos.`);
  if (value.length > 5000) throw new HttpError(400, `${label} supera el límite.`);
  return value.map((item) => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) {
      throw new HttpError(400, `${label} inválidos.`);
    }
    const record = item as Record<string, unknown>;
    if (typeof record.id !== 'string' || record.id.length < 1 || record.id.length > 80) {
      throw new HttpError(400, `${label} con un id inválido.`);
    }
    return record;
  });
}

function asSettings(value: unknown, fallbackName: string): WorkshopSettings {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new HttpError(400, 'Ajustes inválidos.');
  }
  const raw = value as Partial<WorkshopSettings>;
  const base = emptySettings(fallbackName);
  return {
    ...base,
    workshopName: text(raw.workshopName, fallbackName, 80),
    tagline: text(raw.tagline, '', 160),
    phone: text(raw.phone, '', 40),
    whatsapp: text(raw.whatsapp, '', 40),
    email: text(raw.email, '', 120),
    address: text(raw.address, '', 160),
    city: text(raw.city, '', 80),
    taxId: text(raw.taxId, '', 40),
    defaultWarrantyDays: numberIn(raw.defaultWarrantyDays, 0, 3650, base.defaultWarrantyDays),
    currencySymbol: text(raw.currencySymbol, base.currencySymbol, 8),
    termsConditions: text(raw.termsConditions, '', 2000),
    whatsappReadyTemplate: text(raw.whatsappReadyTemplate, base.whatsappReadyTemplate, 1000),
    whatsappBudgetTemplate: text(raw.whatsappBudgetTemplate, base.whatsappBudgetTemplate, 1000),
    logoDataUrl: logoOrReject(raw.logoDataUrl),
  };
}

function logoOrReject(value: unknown): string {
  const logo = sanitizeLogoDataUrl(value);
  if (logo === null) {
    throw new HttpError(400, 'El logo tiene que ser una imagen PNG, JPG, WebP o GIF de hasta 120 KB.');
  }
  return logo;
}

function text(value: unknown, fallback: string, max: number): string {
  if (typeof value !== 'string') return fallback;
  return value.trim().slice(0, max);
}

function numberIn(value: unknown, min: number, max: number, fallback: number): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, Math.round(parsed)));
}

const DUMMY_HASH = 'scrypt$AAAAAAAAAAAAAAAAAAAAAA==$' + 'A'.repeat(88);

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
