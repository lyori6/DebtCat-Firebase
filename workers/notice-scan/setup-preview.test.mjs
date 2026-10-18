import { test } from 'node:test';
import assert from 'node:assert/strict';
import { withHostname } from './setup-preview.mjs';

test('adds the hostname, keeps existing ones and settings, drops read-only fields', () => {
  const widget = { sitekey: 'k', secret: 's', created_on: 'x', modified_on: 'y', last_modified_via: 'api', name: 'DebtCat', mode: 'managed', domains: ['debtcat.com'], region: 'world' };
  const body = withHostname(widget, 'debtcat-e5451--pr3-a.web.app');
  assert.deepEqual(body, { name: 'DebtCat', mode: 'managed', region: 'world', domains: ['debtcat.com', 'debtcat-e5451--pr3-a.web.app'] });
});

test('does not duplicate a hostname already listed', () => {
  const body = withHostname({ name: 'n', mode: 'managed', domains: ['a.web.app'] }, 'a.web.app');
  assert.deepEqual(body.domains, ['a.web.app']);
});
