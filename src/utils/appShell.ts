export const WORKSHOP_TABS = [
  'orders',
  'inventory',
  'teardown',
  'history',
  'client_portal',
] as const;

export type WorkshopTab = (typeof WORKSHOP_TABS)[number];
export type AppTab = WorkshopTab | 'landing';
export type ShellMode = 'public' | 'demo' | 'account' | 'portal';

export function resolveShellMode(input: {
  hasAccount: boolean;
  demoActive: boolean;
  hasPortalQuery: boolean;
}): ShellMode {
  if (input.hasAccount) return 'account';
  if (input.demoActive) return 'demo';
  if (input.hasPortalQuery) return 'portal';
  return 'public';
}

export function visibleSection(mode: ShellMode, tab: AppTab): 'landing' | 'portal' | WorkshopTab {
  if (mode === 'public') return 'landing';
  if (mode === 'portal') return 'portal';
  if (tab === 'landing') return 'orders';
  return tab;
}
