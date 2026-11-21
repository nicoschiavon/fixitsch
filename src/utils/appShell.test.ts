import assert from 'node:assert/strict';
import { test } from 'node:test';
import { resolveShellMode, visibleSection } from './appShell.ts';

test('sin sesión ni demo solo hay inicio', () => {
  const mode = resolveShellMode({
    hasAccount: false,
    accountPending: false,
    demoActive: false,
    hasPortalQuery: false,
  });
  assert.equal(mode, 'public');
  assert.equal(visibleSection(mode, 'orders'), 'landing');
  assert.equal(visibleSection(mode, 'inventory'), 'landing');
});

test('la demo abre el módulo pedido y no la landing', () => {
  const mode = resolveShellMode({
    hasAccount: false,
    accountPending: false,
    demoActive: true,
    hasPortalQuery: false,
  });
  assert.equal(mode, 'demo');
  assert.equal(visibleSection(mode, 'teardown'), 'teardown');
  assert.equal(visibleSection(mode, 'landing'), 'orders');
  assert.equal(visibleSection(mode, 'platform'), 'orders');
});

test('una cuenta pisa la demo y el query de portal', () => {
  const mode = resolveShellMode({
    hasAccount: true,
    accountPending: false,
    demoActive: true,
    hasPortalQuery: true,
  });
  assert.equal(mode, 'account');
  assert.equal(visibleSection(mode, 'history'), 'history');
  assert.equal(visibleSection(mode, 'platform'), 'platform');
});

test('una cuenta pendiente no entra al taller', () => {
  const mode = resolveShellMode({
    hasAccount: true,
    accountPending: true,
    demoActive: false,
    hasPortalQuery: false,
  });
  assert.equal(mode, 'pending');
  assert.equal(visibleSection(mode, 'orders'), 'pending');
});

test('una cuenta pendiente puede usar el demo', () => {
  const mode = resolveShellMode({
    hasAccount: true,
    accountPending: true,
    demoActive: true,
    hasPortalQuery: false,
  });
  assert.equal(mode, 'demo');
  assert.equal(visibleSection(mode, 'orders'), 'orders');
});

test('?order= sin sesión es seguimiento, no el taller', () => {
  const mode = resolveShellMode({
    hasAccount: false,
    accountPending: false,
    demoActive: false,
    hasPortalQuery: true,
  });
  assert.equal(mode, 'portal');
  assert.equal(visibleSection(mode, 'orders'), 'portal');
});
