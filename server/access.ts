export type TenantStatus =
  | 'sandbox'
  | 'pending'
  | 'trial'
  | 'active'
  | 'expired'
  | 'cancelled';

export type AccessReason =
  | 'sandbox'
  | 'pending'
  | 'trial'
  | 'trial_expired'
  | 'active'
  | 'past_due'
  | 'suspended';

export type Plan = 'monthly' | 'yearly';

export type Access = {
  status: TenantStatus;
  reason: AccessReason;
  canRead: boolean;
  canWrite: boolean;
  canExport: boolean;
  trialEndsAt: string | null;
  plan: Plan | null;
  currentPeriodEnd: string | null;
};

export function resolveAccess(input: {
  role: 'platform_owner' | 'workshop_owner';
  status: TenantStatus;
  trialEndsAt: Date | string | null;
  plan: Plan | null;
  currentPeriodEnd: Date | string | null;
  now: Date;
}): Access {
  const trialEndsAt = toIso(input.trialEndsAt);
  const currentPeriodEnd = toIso(input.currentPeriodEnd);

  if (input.role === 'platform_owner') {
    return {
      status: 'sandbox',
      reason: 'sandbox',
      canRead: true,
      canWrite: true,
      canExport: true,
      trialEndsAt,
      plan: input.plan,
      currentPeriodEnd,
    };
  }

  const base = {
    status: input.status,
    trialEndsAt,
    plan: input.plan,
    currentPeriodEnd,
  };

  if (input.status === 'pending') {
    return { ...base, reason: 'pending', canRead: false, canWrite: false, canExport: false };
  }

  if (input.status === 'cancelled') {
    return { ...base, reason: 'suspended', canRead: true, canWrite: false, canExport: true };
  }

  if (input.status === 'trial') {
    if (isFuture(input.trialEndsAt, input.now)) {
      return { ...base, reason: 'trial', canRead: true, canWrite: true, canExport: true };
    }
    return { ...base, reason: 'trial_expired', canRead: true, canWrite: false, canExport: true };
  }

  if (input.status === 'active') {
    if (isFuture(input.currentPeriodEnd, input.now)) {
      return { ...base, reason: 'active', canRead: true, canWrite: true, canExport: true };
    }
    return { ...base, status: 'expired', reason: 'past_due', canRead: true, canWrite: false, canExport: true };
  }

  return { ...base, status: 'expired', reason: 'trial_expired', canRead: true, canWrite: false, canExport: true };
}

function isFuture(value: Date | string | null, now: Date): boolean {
  if (!value) return false;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isFinite(date.getTime()) && date.getTime() > now.getTime();
}

function toIso(value: Date | string | null): string | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isFinite(date.getTime()) ? date.toISOString() : null;
}
