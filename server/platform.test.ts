import assert from 'node:assert/strict';
import { test } from 'node:test';
import { isPlan, planAmount, planDays } from './platform.ts';

test('el importe sale del plan, no del cliente', () => {
  assert.equal(planAmount('monthly'), 30000);
  assert.equal(planAmount('yearly'), 300000);
  assert.equal(planDays('monthly'), 30);
  assert.equal(planDays('yearly'), 365);
});

test('solo acepta los planes vigentes', () => {
  assert.equal(isPlan('monthly'), true);
  assert.equal(isPlan('yearly'), true);
  assert.equal(isPlan('weekly'), false);
  assert.equal(isPlan(null), false);
});
