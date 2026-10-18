// Self-check for the notice-scan Worker. Run: node --test workers/notice-scan/test.mjs
// Always runs the request checks with a fake OpenAI and Turnstile.
// With OPENAI_API_KEY set, it also sends the three synthetic notices to the real model
// and checks every field against fixtures/*.expected.json.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import worker from './worker.js';

const dir = path.dirname(new URL(import.meta.url).pathname);
const ORIGIN = 'https://debtcat-e5451--pr3-abc123.web.app';
const realFetch = globalThis.fetch;
const jpeg = fs.readFileSync(path.join(dir, 'fixtures/notice-1.jpg')).toString('base64');

let limited = false;
let turnstilePasses = true;
let modelReply = null; // what the fake model returns, as a string
const env = {
  ALLOW_PREVIEW: 'true',
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || 'test',
  TURNSTILE_SECRET: 'test',
  RATE_LIMITER: { limit: async () => ({ success: !limited }) }
};

function fakeFetch(url, init) {
  if (url.startsWith('https://challenges.cloudflare.com/')) {
    return Promise.resolve(Response.json({ success: turnstilePasses }));
  }
  if (url.startsWith('https://api.openai.com/')) {
    if (modelReply === null) return Promise.resolve(new Response('error', { status: 500 }));
    return Promise.resolve(Response.json({ choices: [{ message: { content: modelReply } }] }));
  }
  return realFetch(url, init);
}

function scan(body, { origin = ORIGIN, method = 'POST' } = {}) {
  return worker.fetch(new Request('https://notice-scan-preview.example/', {
    method,
    headers: { 'Content-Type': 'application/json', Origin: origin, 'CF-Connecting-IP': '203.0.113.9' },
    body: method === 'POST' ? (typeof body === 'string' ? body : JSON.stringify(body)) : undefined
  }), env);
}

globalThis.fetch = fakeFetch;

test('rejects an unknown origin', async () => {
  assert.equal((await scan({}, { origin: 'https://evil.example' })).status, 403);
});
test('rejects preview origins on the live Worker', async () => {
  const res = await worker.fetch(new Request('https://x/', { method: 'POST', headers: { Origin: ORIGIN } }), { ...env, ALLOW_PREVIEW: undefined });
  assert.equal(res.status, 403);
});
test('answers the CORS preflight', async () => {
  const res = await scan(null, { method: 'OPTIONS' });
  assert.equal(res.status, 200);
  assert.equal(res.headers.get('Access-Control-Allow-Origin'), ORIGIN);
});
test('rate limits', async () => {
  limited = true;
  try { assert.equal((await scan({ image: jpeg, turnstileToken: 't' })).status, 429); } finally { limited = false; }
});
test('rejects bad JSON', async () => {
  assert.equal((await scan('not json')).status, 400);
});
test('rejects a missing token', async () => {
  assert.equal((await scan({ image: jpeg })).status, 400);
});
test('rejects a file that is not an image', async () => {
  const pdf = Buffer.from('%PDF-1.7 fake').toString('base64');
  assert.equal((await scan({ image: pdf, turnstileToken: 't' })).status, 400);
});
test('rejects an image over 4 MB', async () => {
  const big = jpeg.slice(0, 8) + 'A'.repeat(6 * 1024 * 1024);
  assert.equal((await scan({ image: big, turnstileToken: 't' })).status, 413);
});
test('rejects a failed Turnstile check', async () => {
  turnstilePasses = false;
  try { assert.equal((await scan({ image: jpeg, turnstileToken: 't' })).status, 403); } finally { turnstilePasses = true; }
});
test('returns 502 when the model fails', async () => {
  modelReply = null;
  assert.equal((await scan({ image: jpeg, turnstileToken: 't' })).status, 502);
});
test('returns 502 when the model sends invalid JSON', async () => {
  modelReply = '{not json';
  assert.equal((await scan({ image: jpeg, turnstileToken: 't' })).status, 502);
});
test('cleans the model output', async () => {
  modelReply = JSON.stringify({
    isCollectionNotice: true,
    collectorName: { value: '  Sample Recovery Services LLC ', sure: true },
    accountNumber: { value: '', sure: true },
    currentAmount: { value: null, sure: true },
    advice: 'You should dispute this.',
    mentionsCourt: 'yes'
  });
  const res = await scan({ image: jpeg, turnstileToken: 't' });
  assert.equal(res.status, 200);
  const out = await res.json();
  assert.deepEqual(out.collectorName, { value: 'Sample Recovery Services LLC', sure: true });
  assert.deepEqual(out.accountNumber, { value: null, sure: false }, 'empty is null and never sure');
  assert.deepEqual(out.currentAmount, { value: null, sure: false }, 'null is never sure');
  assert.deepEqual(out.consumerZip, { value: null, sure: false }, 'missing fields come back as null');
  assert.equal(out.advice, undefined, 'extra fields are dropped');
  assert.equal(out.mentionsCourt, false, 'only true counts as true');
  assert.equal(Object.keys(out).length, 20);
});

// Live run against the real model. Turnstile stays faked; everything else is real.
for (const n of [1, 2, 3]) {
  test(`reads synthetic notice-${n} with the real model`, { skip: !process.env.OPENAI_API_KEY && 'set OPENAI_API_KEY to run' }, async t => {
    globalThis.fetch = (url, init) => url.startsWith('https://challenges.cloudflare.com/') ? fakeFetch(url, init) : realFetch(url, init);
    t.after(() => { globalThis.fetch = fakeFetch; });
    const image = fs.readFileSync(path.join(dir, `fixtures/notice-${n}.jpg`)).toString('base64');
    const expected = JSON.parse(fs.readFileSync(path.join(dir, `fixtures/notice-${n}.expected.json`)));
    const started = Date.now();
    const res = await scan({ image, turnstileToken: 't' });
    assert.equal(res.status, 200);
    const out = await res.json();
    t.diagnostic(`${((Date.now() - started) / 1000).toFixed(1)}s`);
    for (const [k, v] of Object.entries(expected)) {
      assert.equal(typeof v === 'boolean' ? out[k] : out[k].value, typeof v === 'boolean' ? v : v.value, k);
    }
  });
}
