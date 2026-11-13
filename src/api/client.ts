import { DonorDevice, InventoryPart, RepairOrder, UserAccount, WorkshopSettings } from '../types';

export type ApiAccount = {
  id: string;
  username: string;
  name: string;
  role: 'platform_owner' | 'workshop_owner';
  workshopName: string;
  createdAt: string;
};

export type WorkshopBundle = {
  orders: RepairOrder[];
  parts: InventoryPart[];
  donors: DonorDevice[];
  settings: WorkshopSettings;
};

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export function toUserAccount(user: ApiAccount): UserAccount {
  return {
    id: user.id,
    username: user.username,
    name: user.name,
    email: user.username,
    provider: 'password',
    role: user.role === 'platform_owner' ? 'admin' : 'registered_full_access',
    workshopName: user.workshopName,
    createdAt: user.createdAt,
    hasPersistence: true,
    planStatus: 'account',
  };
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(path, {
      ...init,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(init?.headers || {}),
      },
    });
  } catch {
    throw new ApiError(0, 'No se pudo conectar con el servidor.');
  }

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new ApiError(response.status, body.error || 'No se pudo completar la operación.');
  }
  return body as T;
}

export function login(username: string, password: string) {
  return request<{ user: ApiAccount }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}

export function register(input: {
  username: string;
  password: string;
  name: string;
  workshopName: string;
}) {
  return request<{ user: ApiAccount }>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function logout() {
  return request<{ ok: boolean }>('/api/auth/logout', { method: 'POST' });
}

export async function currentAccount(): Promise<ApiAccount | null> {
  try {
    const body = await request<{ user: ApiAccount }>('/api/auth/me');
    return body.user;
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return null;
    throw error;
  }
}

export function loadWorkshop() {
  return request<WorkshopBundle>('/api/workshop');
}

export function saveOrders(orders: RepairOrder[]) {
  return request<{ ok: boolean }>('/api/workshop/orders', {
    method: 'PUT',
    body: JSON.stringify({ orders }),
  });
}

export function saveParts(parts: InventoryPart[]) {
  return request<{ ok: boolean }>('/api/workshop/parts', {
    method: 'PUT',
    body: JSON.stringify({ parts }),
  });
}

export function saveDonors(donors: DonorDevice[]) {
  return request<{ ok: boolean }>('/api/workshop/donors', {
    method: 'PUT',
    body: JSON.stringify({ donors }),
  });
}

export function saveSettings(settings: WorkshopSettings) {
  return request<{ ok: boolean }>('/api/workshop/settings', {
    method: 'PUT',
    body: JSON.stringify({ settings }),
  });
}

export function clearWorkshop() {
  return request<WorkshopBundle>('/api/workshop/clear', { method: 'POST' });
}
