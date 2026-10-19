// Unit checks for the debtcat Worker. Run: npm test
import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../worker/index.js';
import { buildMessages } from '../worker/chat.js';
import { geoapifyUrl } from '../worker/address.js';
import { countFields, statsHtml } from '../worker/count.js';
import { turnstileOk, makePass, passOk } from '../worker/lib/turnstile.js';

const allow = { limit: async () => ({ success: true }) };
const deny = { limit: async () => ({ success: false }) };
function env(extra = {}) {
  const points = [];
  return {
    points,
    ASSETS: { fetch: async () => new Response('asset') },
    COUNTS: { writeDataPoint: p => points.push(p) },
    CHAT_LIMIT: allow, ADDRESS_LIMIT: allow,
    OPENAI_API_KEY: 'k', TURNSTILE_SECRET: 'ts', GEOAPIFY_KEY: 'g', STATS_KEY: 'secret-key', CF_ACCOUNT_ID: 'a', CF_API_TOKEN: 't',
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

test('chat needs a Turnstile token or a valid pass', async () => {
  const realFetch = globalThis.fetch;
  globalThis.fetch = async url => String(url).includes('siteverify')
    ? Response.json({ success: true, hostname: 'debtcat.com' })
    : Response.json({ choices: [{ message: { content: 'Hi there' } }] });
  try {
    const post = body => call('/api/chat', { method: 'POST', body: JSON.stringify(body) });
    assert.equal((await post({ message: 'hi' })).status, 403);
    const first = await (await post({ message: 'hi', turnstileToken: 'tok' })).json();
    assert.equal(first.response, 'Hi there');
    assert.ok(first.chatPass);
    const next = await (await post({ message: 'again', chatPass: first.chatPass })).json();
    assert.equal(next.response, 'Hi there');
    assert.equal(next.chatPass, undefined);
  } finally {
    globalThis.fetch = realFetch;
  }
});

test('passes expire and are tied to the secret and purpose', async () => {
  const pass = await makePass('chat', 's');
  assert.equal(await passOk(pass, 'chat', 's'), true);
  assert.equal(await passOk(pass, 'chat', 'other'), false);
  assert.equal(await passOk(pass, 'scan', 's'), false);
  assert.equal(await passOk(pass, 'chat', 's', Date.now() + 3 * 3600 * 1000), false);
  assert.equal(await passOk('123.abc', 'chat', 's'), false);
});

test('Turnstile check rejects other hostnames', async () => {
  const realFetch = globalThis.fetch;
  globalThis.fetch = async () => Response.json({ success: true, hostname: 'evil.example' });
  try {
    assert.equal(await turnstileOk('tok', '1.2.3.4', 'real-secret'), false);
    assert.equal(await turnstileOk('', '1.2.3.4', 'real-secret'), false);
  } finally {
    globalThis.fetch = realFetch;
  }
});

import { Limits } from '../worker/lib/limits.js';
import { clean } from '../worker/scan.js';

// An in-memory stand-in for the LIMITS Durable Object binding.
function fakeLimits() {
  const map = new Map();
  const storage = {
    get: async k => map.get(k), put: async (k, v) => { map.set(k, v); },
    deleteAll: async () => map.clear()
  };
  const obj = new Limits({ storage });
  return { map, idFromName: n => n, get: () => ({ fetch: (url, init) => obj.fetch(new Request(url, init)) }) };
}

const JPEG = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0, 0x10, 0x4a, 0x46, 0x49, 0x46, 0, 1, 1, 0, 0, 1]).toString('base64');

test('scan checks Turnstile, then the daily caps, then reads the notice', async () => {
  const realFetch = globalThis.fetch;
  let pass = true;
  globalThis.fetch = async url => String(url).includes('siteverify')
    ? Response.json({ success: pass, hostname: 'debtcat.com' })
    : Response.json({ choices: [{ message: { content: JSON.stringify({ isCollectionNotice: true, collectorName: { value: 'ABC LLC', sure: true }, extra: 1 }) } }] });
  const e = env({ SCAN_LIMIT: allow, LIMITS: fakeLimits() });
  const post = body => call('/api/scan', { method: 'POST', headers: { 'CF-Connecting-IP': '203.0.113.9' }, body: JSON.stringify(body) }, e);
  try {
    assert.equal((await post({ image: JPEG })).status, 400);
    assert.equal((await post({ image: 'aGVsbG8gd29ybGQh', turnstileToken: 't' })).status, 400);
    pass = false;
    assert.equal((await post({ image: JPEG, turnstileToken: 't' })).status, 403);
    assert.equal(e.LIMITS.map.size, 0); // failed checks don't use up the caps
    pass = true;
    const ok = await post({ image: JPEG, turnstileToken: 't' });
    assert.equal(ok.status, 200);
    const fields = await ok.json();
    assert.deepEqual(fields.collectorName, { value: 'ABC LLC', sure: true });
    assert.equal(fields.extra, undefined);
    for (let i = 1; i < 20; i++) await post({ image: JPEG, turnstileToken: 't' });
    assert.equal((await post({ image: JPEG, turnstileToken: 't' })).status, 429); // 21st scan from one IP
    assert.ok([...e.LIMITS.map.keys()].every(k => !k.includes('203.0.113.9'))); // IPs are hashed
  } finally {
    globalThis.fetch = realFetch;
  }
});

test('clean keeps only known fields and drops unsure blanks', () => {
  const out = clean({ collectorName: { value: '  ', sure: true }, mentionsCourt: 'yes' });
  assert.deepEqual(out.collectorName, { value: null, sure: false });
  assert.equal(out.mentionsCourt, false);
});
