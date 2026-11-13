import assert from 'node:assert/strict';
import { test } from 'node:test';
import { resolveShellMode, visibleSection } from './appShell.ts';

test('sin sesión ni demo solo hay inicio', () => {
  const mode = resolveShellMode({ hasAccount: false, demoActive: false, hasPortalQuery: false });
  assert.equal(mode, 'public');
  assert.equal(visibleSection(mode, 'orders'), 'landing');
  assert.equal(visibleSection(mode, 'inventory'), 'landing');
});

test('la demo abre el módulo pedido y no la landing', () => {
  const mode = resolveShellMode({ hasAccount: false, demoActive: true, hasPortalQuery: false });
  assert.equal(mode, 'demo');
  assert.equal(visibleSection(mode, 'teardown'), 'teardown');
  assert.equal(visibleSection(mode, 'landing'), 'orders');
});

test('una cuenta pisa la demo y el query de portal', () => {
  const mode = resolveShellMode({ hasAccount: true, demoActive: true, hasPortalQuery: true });
  assert.equal(mode, 'account');
  assert.equal(visibleSection(mode, 'history'), 'history');
});

test('?order= sin sesión es seguimiento, no el taller', () => {
  const mode = resolveShellMode({ hasAccount: false, demoActive: false, hasPortalQuery: true });
  assert.equal(mode, 'portal');
  assert.equal(visibleSection(mode, 'orders'), 'portal');
});
