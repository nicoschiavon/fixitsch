import assert from 'node:assert/strict';
import { test } from 'node:test';
import { sanitizeLogoDataUrl } from './settings.ts';

const PNG = `data:image/png;base64,${'A'.repeat(40)}==`;

test('sin logo queda vacío', () => {
  assert.equal(sanitizeLogoDataUrl(undefined), '');
  assert.equal(sanitizeLogoDataUrl(''), '');
  assert.equal(sanitizeLogoDataUrl('   '), '');
});

test('acepta png, jpeg, webp y gif', () => {
  assert.equal(sanitizeLogoDataUrl(PNG), PNG);
  assert.equal(sanitizeLogoDataUrl('data:image/jpeg;base64,QQ=='), 'data:image/jpeg;base64,QQ==');
  assert.equal(sanitizeLogoDataUrl('data:image/webp;base64,QQ=='), 'data:image/webp;base64,QQ==');
  assert.equal(sanitizeLogoDataUrl('data:image/gif;base64,QQ=='), 'data:image/gif;base64,QQ==');
});

test('rechaza svg, javascript y un data url enorme', () => {
  assert.equal(sanitizeLogoDataUrl('data:image/svg+xml;base64,QQ=='), null);
  assert.equal(sanitizeLogoDataUrl('javascript:alert(1)'), null);
  assert.equal(sanitizeLogoDataUrl(`data:image/png;base64,${'A'.repeat(200_000)}`), null);
});
