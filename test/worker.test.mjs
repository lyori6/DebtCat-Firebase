// Unit checks for the debtcat Worker. Run: npm test
import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../worker/index.js';
import { buildMessages } from '../worker/chat.js';
import { geoapifyUrl } from '../worker/address.js';
import { countFields, statsHtml } from '../worker/count.js';

const allow = { limit: async () => ({ success: true }) };
const deny = { limit: async () => ({ success: false }) };
function env(extra = {}) {
  const points = [];
  return {
    points,
    ASSETS: { fetch: async () => new Response('asset') },
    COUNTS: { writeDataPoint: p => points.push(p) },
    CHAT_LIMIT: allow, ADDRESS_LIMIT: allow,
    OPENAI_API_KEY: 'k', GEOAPIFY_KEY: 'g', STATS_KEY: 'secret-key', CF_ACCOUNT_ID: 'a', CF_API_TOKEN: 't',
    ...extra
  };
}
const call = (url, init, e = env()) => worker.fetch(new Request('https://debtcat.example' + url, init), e, {});

test('non-API paths go to the static assets', async () => {
  assert.equal(await (await call('/chat')).text(), 'asset');
});

test('unknown API paths are 404, never assets', async () => {
  assert.equal((await call('/api/nope')).status, 404);
  assert.equal((await call('/api/chat')).status, 404); // GET is not a route
});

test('CORS allows debtcat.com only', async () => {
  const ok = await call('/api/count', { method: 'OPTIONS', headers: { Origin: 'https://debtcat.com' } });
  assert.equal(ok.status, 204);
  assert.equal(ok.headers.get('Access-Control-Allow-Origin'), 'https://debtcat.com');
  const no = await call('/api/count', { method: 'OPTIONS', headers: { Origin: 'https://evil.example' } });
  assert.equal(no.status, 403);
});

test('chat drops bad history and the duplicated last message', () => {
  const m = buildMessages({ message: ' hi ', conversationHistory: [{ role: 'system', content: 'x' }, { role: 'user', content: 'hi' }] });
  assert.equal(m.length, 2);
  assert.equal(m[0].role, 'system');
  assert.deepEqual(m[1], { role: 'user', content: 'hi' });
  assert.equal(buildMessages({ message: '  ' }), null);
});

test('chat is rate limited', async () => {
  const r = await call('/api/chat', { method: 'POST', body: '{"message":"hi"}' }, env({ CHAT_LIMIT: deny }));
  assert.equal(r.status, 429);
});

test('address builds an encoded, bounded Geoapify URL', () => {
  const u = geoapifyUrl(new URLSearchParams('query=1 Main St&limit=99&x=1'), 'g');
  assert.equal(u.searchParams.get('text'), '1 Main St');
  assert.equal(u.searchParams.get('limit'), '10');
  assert.equal(u.searchParams.get('filter'), 'countrycode:us');
  assert.equal(geoapifyUrl(new URLSearchParams('query=ab'), 'g'), null);
  assert.equal(geoapifyUrl(new URLSearchParams('query=1 Main&limit=5%26apiKey%3Dx'), 'g').searchParams.get('limit'), '5');
});

test('counts keep only event, page, site and tester flag', () => {
  assert.deepEqual(countFields({ event: 'page_view', page: '/chat?email=a@b.c', tester: false }, 'https://debtcat.com'),
    ['page_view', '/chat', 'live', 'real']);
  assert.deepEqual(countFields({ event: 'page_view', page: '/', tester: true }, 'https://www.debtcat.com'),
    ['page_view', '/', 'live', 'tester']);
  assert.equal(countFields({ event: 'page_view', page: '/' }, 'http://localhost:5050')[2], 'test');
  assert.equal(countFields({ event: 'other', page: '/' }, 'https://debtcat.com'), null);
  assert.equal(countFields({ event: 'page_view', page: 'x' }, 'https://debtcat.com'), null);
  assert.equal(countFields({ event: 'page_view', page: '/' }, null), null);
});

test('count writes one data point and returns 204', async () => {
  const e = env();
  const r = await call('/api/count', { method: 'POST', headers: { Origin: 'https://debtcat.com' }, body: '{"event":"page_view","page":"/"}' }, e);
  assert.equal(r.status, 204);
  assert.equal(e.points.length, 1);
  assert.deepEqual(e.points[0].blobs, ['page_view', '/', 'live', 'real']);
});

test('stats needs the key', async () => {
  assert.equal((await call('/stats')).status, 404);
  assert.equal((await call('/stats?key=wrong-key!')).status, 404);
  assert.equal((await call('/stats?key=x', {}, env({ STATS_KEY: undefined }))).status, 404);
});

test('stats escapes page names', () => {
  assert.ok(statsHtml([{ day: '2026-10-18', page: '/<b>', real: 1, tests: 2 }]).includes('/&#60;b&#62;'));
});
