// Letters: field checks, Stripe signature, checkout, and the webhook mailing each order once.
import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../worker/index.js';
import { Order } from '../worker/lib/order.js';
import { letterFields } from '../worker/letters.js';
import { verifyWebhook, signForTest, formEncode } from '../worker/lib/stripe.js';

const person = {
  firstName: 'Ana', lastName: 'Diaz', email: 'Ana@Example.com', address: '1 Main St', city: 'Austin', state: 'tx', zip: '78701',
  accountNumber: 'XX1234', balance: '$1,248.32', reasonForDispute: 'This debt is not mine.', disputeNote: '',
  collectorName: 'Acme Recovery LLC', collectorAddress: 'PO Box 9', collectorCity: 'Dallas', collectorState: 'TX', collectorZip: '75201'
};

// In-memory Durable Object storage with the methods Order uses.
function memoryStorage() {
  const m = new Map();
  return {
    get: async k => structuredClone(m.get(k)), put: async (k, v) => { m.set(k, structuredClone(v)); },
    deleteAll: async () => m.clear(), setAlarm: async () => {}, map: m
  };
}
function ordersNs() {
  const objects = new Map();
  return {
    objects,
    idFromName: n => n,
    get: id => {
      if (!objects.has(id)) objects.set(id, new Order({ storage: memoryStorage() }));
      const o = objects.get(id);
      return { fetch: (url, init) => o.fetch(new Request(url, init)) };
    }
  };
}
function env(extra = {}) {
  return {
    LETTER_LIMIT: { limit: async () => ({ success: true }) },
    LIMITS: { idFromName: n => n, get: () => ({ fetch: async () => Response.json({ ok: true }) }) },
    ORDERS: ordersNs(),
    TURNSTILE_SECRET: 'ts', STRIPE_SECRET_KEY: 'sk_test', STRIPE_WEBHOOK_SECRET: 'whsec_test', POSTGRID_API_KEY: 'pg', RESEND_API_KEY: 're',
    ...extra
  };
}

// Fake upstreams. Each test reads `calls` to see what was sent where.
let calls;
function mockFetch({ postgridOk = true } = {}) {
  calls = [];
  globalThis.fetch = async (url, init = {}) => {
    const u = String(url);
    calls.push({ url: u, init });
    if (u.includes('turnstile')) return Response.json({ success: true, hostname: 'debtcat.com' });
    if (u.includes('api.stripe.com')) return Response.json({ id: 'cs_1', url: 'https://checkout.stripe.com/c/pay/cs_1' });
    if (u.includes('postgrid')) return postgridOk ? Response.json({ id: 'letter_1' }) : new Response('no', { status: 500 });
    if (u.includes('resend')) return Response.json({ id: 'email_1' });
    throw new Error('unexpected fetch ' + u);
  };
}
const post = (path, body, e, headers = {}) => worker.fetch(new Request('https://debtcat.example' + path, {
  method: 'POST', headers: { 'Content-Type': 'application/json', Origin: 'https://debtcat.com', ...headers }, body: typeof body === 'string' ? body : JSON.stringify(body)
}), e, {});

test('letterFields trims, normalizes and rejects bad fields', () => {
  const { fields } = letterFields(person, { mailed: true });
  assert.equal(fields.email, 'ana@example.com');
  assert.equal(fields.state, 'TX');
  assert.equal(fields.balance, '1248.32');
  assert.equal(letterFields({ ...person, reasonForDispute: 'Made up reason' }).field, 'reasonForDispute');
  assert.equal(letterFields({ ...person, zip: '7870' }).field, 'zip');
  assert.equal(letterFields({ ...person, collectorAddress: '' }, { mailed: true }).field, 'collectorAddress');
  assert.ok(letterFields({ ...person, collectorAddress: '' }).fields, 'emailed letters need no collector address');
});

test('formEncode uses Stripe bracket keys', () => {
  const s = formEncode({ a: 1, line_items: [{ price_data: { currency: 'usd' } }] }).toString();
  assert.equal(decodeURIComponent(s), 'a=1&line_items[0][price_data][currency]=usd');
});

test('webhook signature: good, wrong secret, old, tampered', async () => {
  const body = '{"type":"x"}';
  assert.deepEqual(await verifyWebhook(body, await signForTest(body, 's1'), 's1'), { type: 'x' });
  assert.equal(await verifyWebhook(body, await signForTest(body, 's2'), 's1'), null);
  assert.equal(await verifyWebhook(body, await signForTest(body, 's1', 1000), 's1'), null);
  assert.equal(await verifyWebhook(body + ' ', await signForTest(body, 's1'), 's1'), null);
  assert.equal(await verifyWebhook(body, undefined, 's1'), null);
});

test('email route sends the filled letter through Resend', async () => {
  mockFetch();
  const res = await post('/api/letters/email', { fields: { ...person, disputeNote: '<b>hi</b>' }, turnstileToken: 't' }, env());
  assert.equal(res.status, 200);
  const sent = JSON.parse(calls.find(c => c.url.includes('resend')).init.body);
  assert.deepEqual(sent.to, ['ana@example.com']);
  assert.match(sent.html, /This debt is not mine\./);
  assert.match(sent.html, /&lt;b&gt;hi&lt;\/b&gt;/);
});

test('letter routes refuse without the bot check or over the daily limit', async () => {
  mockFetch();
  assert.equal((await post('/api/letters/email', { fields: person }, env())).status, 403);
  const capped = env({ LIMITS: { idFromName: n => n, get: () => ({ fetch: async () => Response.json({ ok: false }) }) } });
  assert.equal((await post('/api/letters/email', { fields: person, turnstileToken: 't' }, capped)).status, 429);
});

test('checkout prices on the server and the webhook mails once', async () => {
  mockFetch();
  const e = env();
  const res = await post('/api/letters/checkout', { fields: person, mailingClass: 'certified', turnstileToken: 't', price: 1 }, e);
  assert.equal(res.status, 200);
  const { url, order } = await res.json();
  assert.equal(url, 'https://checkout.stripe.com/c/pay/cs_1');
  const stripeBody = decodeURIComponent(calls.find(c => c.url.includes('stripe')).init.body.toString());
  assert.match(stripeBody, /unit_amount\]=1099/);
  assert.match(stripeBody, new RegExp(`success_url=https://debtcat.com/validate.html\\?order=${order}`));

  const event = JSON.stringify({ type: 'checkout.session.completed', data: { object: { payment_status: 'paid', client_reference_id: order } } });
  const sig = await signForTest(event, 'whsec_test');
  assert.equal((await post('/api/stripe', event, e, { 'Stripe-Signature': sig })).status, 200);
  assert.equal((await post('/api/stripe', event, e, { 'Stripe-Signature': sig })).status, 200); // Stripe resends
  const mailed = calls.filter(c => c.url.includes('postgrid'));
  assert.equal(mailed.length, 1, 'mailed exactly once');
  const letter = JSON.parse(mailed[0].init.body);
  assert.equal(letter.mailingClass, 'certified');
  assert.equal(letter.to.companyName, 'Acme Recovery LLC');
  assert.equal(mailed[0].init.headers['idempotency-key'], order);
  assert.equal(calls.filter(c => c.url.includes('resend')).length, 1, 'one confirmation email');

  const saved = e.ORDERS.objects.get(order).storage.map.get('order');
  assert.equal(saved.status, 'mailed');
  assert.equal(saved.fields, undefined, 'letter fields deleted after mailing');
  const status = await worker.fetch(new Request(`https://debtcat.example/api/letters/order?id=${order}`), e, {});
  assert.deepEqual(await status.json(), { status: 'mailed', mailingClass: 'certified' });
});

test('a failed mailing is released so Stripe can retry', async () => {
  mockFetch({ postgridOk: false });
  const e = env({ ALERT_EMAIL: 'owner@example.com' });
  const { order } = await (await post('/api/letters/checkout', { fields: person, mailingClass: 'first_class', turnstileToken: 't' }, e)).json();
  const event = JSON.stringify({ type: 'checkout.session.completed', data: { object: { payment_status: 'paid', client_reference_id: order } } });
  const res = await post('/api/stripe', event, e, { 'Stripe-Signature': await signForTest(event, 'whsec_test') });
  assert.equal(res.status, 500);
  assert.equal(e.ORDERS.objects.get(order).storage.map.get('order').status, 'pending');
  const alertMail = JSON.parse(calls.find(c => c.url.includes('resend')).init.body);
  assert.deepEqual(alertMail.to, ['owner@example.com']);
  assert.doesNotMatch(alertMail.html, /Ana|Main St/);
});

test('webhook refuses a bad signature and ignores other events', async () => {
  mockFetch();
  const e = env();
  assert.equal((await post('/api/stripe', '{}', e, { 'Stripe-Signature': 't=1,v1=00' })).status, 400);
  const other = JSON.stringify({ type: 'charge.refunded', data: { object: {} } });
  assert.equal((await post('/api/stripe', other, e, { 'Stripe-Signature': await signForTest(other, 'whsec_test') })).status, 200);
  assert.equal(calls.length, 0);
});
