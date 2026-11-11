import { RepairOrder, InventoryPart, DonorDevice, WorkshopSettings, UserAccount } from '../types';
import { INITIAL_ORDERS, INITIAL_PARTS, INITIAL_DONOR_DEVICES, INITIAL_SETTINGS } from '../data/initialData';

const STORAGE_KEYS = {
  CURRENT_USER: 'fixitsch_current_user_v2',
  USERS_LIST: 'fixitsch_users_list_v2',
  USER_DATA_PREFIX: 'fixitsch_data_user_',
  ORDERS: 'fixitsch_orders_v2',
  PARTS: 'fixitsch_parts_v2',
  DONORS: 'fixitsch_donors_v2',
  SETTINGS: 'fixitsch_settings_v2',
  THEME: 'techrepair_theme_v1'
};

export function loadStoredCurrentUser(): UserAccount | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error loading current user', e);
  }
  return null;
}

export function saveStoredCurrentUser(user: UserAccount | null): void {
  try {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
      // Save to known users list
      const users = loadStoredUsersList();
      const existingIdx = users.findIndex((u) => u.email.toLowerCase() === user.email.toLowerCase());
      if (existingIdx >= 0) {
        users[existingIdx] = user;
      } else {
        users.push(user);
      }
      localStorage.setItem(STORAGE_KEYS.USERS_LIST, JSON.stringify(users));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  } catch (e) {
    console.error('Error saving current user', e);
  }
}

export function loadStoredUsersList(): UserAccount[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USERS_LIST);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading users list', e);
  }
  return [];
}

export function loadStoredOrders(user?: UserAccount | null): RepairOrder[] {
  try {
    if (!user || !user.hasPersistence) {
      // Demo / Guest mode: Always starts from demo seed data in memory
      return INITIAL_ORDERS;
    }
    const key = `${STORAGE_KEYS.USER_DATA_PREFIX}${user.id}_orders`;
    const raw = localStorage.getItem(key);
    if (!raw) {
      saveStoredOrders(INITIAL_ORDERS, user);
      return INITIAL_ORDERS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading orders', e);
    return INITIAL_ORDERS;
  }
}

export function saveStoredOrders(orders: RepairOrder[], user?: UserAccount | null): void {
  // CRITICAL REQUIREMENT: Guest demo users have NO data persistence
  if (!user || !user.hasPersistence) {
    return;
  }
  try {
    const key = `${STORAGE_KEYS.USER_DATA_PREFIX}${user.id}_orders`;
    localStorage.setItem(key, JSON.stringify(orders));
  } catch (e) {
    console.error('Error saving orders', e);
  }
}

export function loadStoredParts(user?: UserAccount | null): InventoryPart[] {
  try {
    if (!user || !user.hasPersistence) {
      return INITIAL_PARTS;
    }
    const key = `${STORAGE_KEYS.USER_DATA_PREFIX}${user.id}_parts`;
    const raw = localStorage.getItem(key);
    if (!raw) {
      saveStoredParts(INITIAL_PARTS, user);
      return INITIAL_PARTS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading parts', e);
    return INITIAL_PARTS;
  }
}

export function saveStoredParts(parts: InventoryPart[], user?: UserAccount | null): void {
  if (!user || !user.hasPersistence) {
    return;
  }
  try {
    const key = `${STORAGE_KEYS.USER_DATA_PREFIX}${user.id}_parts`;
    localStorage.setItem(key, JSON.stringify(parts));
  } catch (e) {
    console.error('Error saving parts', e);
  }
}

export function loadStoredDonors(user?: UserAccount | null): DonorDevice[] {
  try {
    if (!user || !user.hasPersistence) {
      return INITIAL_DONOR_DEVICES;
    }
    const key = `${STORAGE_KEYS.USER_DATA_PREFIX}${user.id}_donors`;
    const raw = localStorage.getItem(key);
    if (!raw) {
      saveStoredDonors(INITIAL_DONOR_DEVICES, user);
      return INITIAL_DONOR_DEVICES;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading donors', e);
    return INITIAL_DONOR_DEVICES;
  }
}

export function saveStoredDonors(donors: DonorDevice[], user?: UserAccount | null): void {
  if (!user || !user.hasPersistence) {
    return;
  }
  try {
    const key = `${STORAGE_KEYS.USER_DATA_PREFIX}${user.id}_donors`;
    localStorage.setItem(key, JSON.stringify(donors));
  } catch (e) {
    console.error('Error saving donors', e);
  }
}

export function loadStoredSettings(user?: UserAccount | null): WorkshopSettings {
  try {
    if (!user || !user.hasPersistence) {
      return INITIAL_SETTINGS;
    }
    const key = `${STORAGE_KEYS.USER_DATA_PREFIX}${user.id}_settings`;
    const raw = localStorage.getItem(key);
    if (!raw) {
      const userSettings: WorkshopSettings = {
        ...INITIAL_SETTINGS,
        workshopName: user.workshopName || INITIAL_SETTINGS.workshopName,
        email: user.email || INITIAL_SETTINGS.email
      };
      saveStoredSettings(userSettings, user);
      return userSettings;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading settings', e);
    return INITIAL_SETTINGS;
  }
}

export function saveStoredSettings(settings: WorkshopSettings, user?: UserAccount | null): void {
  if (!user || !user.hasPersistence) {
    return;
  }
  try {
    const key = `${STORAGE_KEYS.USER_DATA_PREFIX}${user.id}_settings`;
    localStorage.setItem(key, JSON.stringify(settings));
  } catch (e) {
    console.error('Error saving settings', e);
  }
}

export function exportAllData(user?: UserAccount | null): void {
  const data = {
    user: user || { role: 'guest_demo', name: 'Demo Guest' },
    orders: loadStoredOrders(user),
    parts: loadStoredParts(user),
    donors: loadStoredDonors(user),
    settings: loadStoredSettings(user),
    exportedAt: new Date().toISOString(),
    version: '2.0-FixiTsch'
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `backup_fixitsch_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function resetAllDataToDefault(user?: UserAccount | null): void {
  if (user && user.hasPersistence) {
    saveStoredOrders(INITIAL_ORDERS, user);
    saveStoredParts(INITIAL_PARTS, user);
    saveStoredDonors(INITIAL_DONOR_DEVICES, user);
    saveStoredSettings(INITIAL_SETTINGS, user);
  }
}

export const STORAGE_KEY_TRIAL = 'fixitsch_trial_account_v2';

export function loadStoredTrial(): import('../types').TrialAccount {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TRIAL);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error reading trial account', e);
  }
  const start = new Date();
  const expires = new Date();
  expires.setDate(expires.getDate() + 15);
  const defaultTrial: import('../types').TrialAccount = {
    active: true,
    workshopName: 'FixiTsch Lab',
    ownerName: 'Nico Schiavon',
    email: 'nico.schiavon@gmail.com',
    whatsapp: '5491145678900',
    techniciansCount: 3,
    devices: ['Celulares', 'Tablets', 'Notebooks'],
    startedAt: start.toISOString(),
    expiresAt: expires.toISOString(),
    isSubscribed: false
  };
  saveStoredTrial(defaultTrial);
  return defaultTrial;
}

export function saveStoredTrial(trial: import('../types').TrialAccount): void {
  try {
    localStorage.setItem(STORAGE_KEY_TRIAL, JSON.stringify(trial));
  } catch (e) {
    console.error('Error saving trial account', e);
  }
}
