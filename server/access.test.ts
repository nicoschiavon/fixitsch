import assert from 'node:assert/strict';
import { test } from 'node:test';
import { resolveAccess } from './access.ts';

const now = new Date('2026-11-16T12:00:00.000Z');
const future = new Date('2026-11-20T12:00:00.000Z');
const past = new Date('2026-11-10T12:00:00.000Z');

function access(status: 'pending' | 'trial' | 'active' | 'expired' | 'cancelled', extra = {}) {
  return resolveAccess({
    role: 'workshop_owner',
    status,
    trialEndsAt: null,
    plan: null,
    currentPeriodEnd: null,
    now,
    ...extra,
  });
}

test('pendiente no lee ni escribe el taller', () => {
  const result = access('pending');
  assert.equal(result.canRead, false);
  assert.equal(result.canWrite, false);
  assert.equal(result.canExport, false);
});

test('prueba vigente escribe y exporta', () => {
  const result = access('trial', { trialEndsAt: future });
  assert.equal(result.reason, 'trial');
  assert.equal(result.canWrite, true);
  assert.equal(result.canExport, true);
});

test('prueba vencida queda en solo lectura con export', () => {
  const result = access('trial', { trialEndsAt: past });
  assert.equal(result.reason, 'trial_expired');
  assert.equal(result.canRead, true);
  assert.equal(result.canWrite, false);
  assert.equal(result.canExport, true);
});

test('activa sin período vencido es impaga', () => {
  const result = access('active', { plan: 'monthly', currentPeriodEnd: past });
  assert.equal(result.reason, 'past_due');
  assert.equal(result.status, 'expired');
  assert.equal(result.canWrite, false);
});

test('suspendida lee y exporta, no escribe', () => {
  const result = access('cancelled');
  assert.equal(result.reason, 'suspended');
  assert.equal(result.canRead, true);
  assert.equal(result.canWrite, false);
});

test('el dueño de plataforma no queda bloqueado por su sandbox', () => {
  const result = resolveAccess({
    role: 'platform_owner',
    status: 'sandbox',
    trialEndsAt: null,
    plan: null,
    currentPeriodEnd: null,
    now,
  });
  assert.equal(result.reason, 'sandbox');
  assert.equal(result.canWrite, true);
});
