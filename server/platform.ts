export type Plan = 'monthly' | 'yearly';

export const PLAN_AMOUNT_ARS: Record<Plan, number> = {
  monthly: 30000,
  yearly: 300000,
};

export const PLAN_DAYS: Record<Plan, number> = {
  monthly: 30,
  yearly: 365,
};

export function isPlan(value: unknown): value is Plan {
  return value === 'monthly' || value === 'yearly';
}

export function planAmount(plan: Plan): number {
  return PLAN_AMOUNT_ARS[plan];
}

export function planDays(plan: Plan): number {
  return PLAN_DAYS[plan];
}
