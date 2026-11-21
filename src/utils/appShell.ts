export const WORKSHOP_TABS = [
  'orders',
  'inventory',
  'teardown',
  'history',
  'client_portal',
] as const;

export type WorkshopTab = (typeof WORKSHOP_TABS)[number];
export type AppTab = WorkshopTab | 'landing' | 'platform';
export type ShellMode = 'public' | 'demo' | 'pending' | 'account' | 'portal';
export type AppSection = 'landing' | 'portal' | 'pending' | 'platform' | WorkshopTab;

export function resolveShellMode(input: {
  hasAccount: boolean;
  accountPending: boolean;
  demoActive: boolean;
  hasPortalQuery: boolean;
}): ShellMode {
  if (input.hasAccount && !input.accountPending) return 'account';
  if (input.demoActive) return 'demo';
  if (input.hasAccount) return 'pending';
  if (input.hasPortalQuery) return 'portal';
  return 'public';
}

export function visibleSection(mode: ShellMode, tab: AppTab): AppSection {
  if (mode === 'public') return 'landing';
  if (mode === 'portal') return 'portal';
  if (mode === 'pending') return 'pending';
  if (mode === 'demo') return tab === 'platform' || tab === 'landing' ? 'orders' : tab;
  if (tab === 'platform') return 'platform';
  if (tab === 'landing') return 'orders';
  return tab;
}
