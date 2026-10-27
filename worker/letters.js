// Letters (phase 5). Pages send the letter fields; the Worker fills the one template (public/js/letter.js, D6)
// and sends it (D5). Nothing here logs the fields, and only a mail order is stored, in its own Durable Object.
//   POST /api/letters/email     email the user a copy                       -> Resend
//   POST /api/letters/checkout  save the order, make a Stripe Checkout page -> Order DO, Stripe
//   POST /api/stripe            Stripe webhook: mail once, email a copy     -> PostGrid, Resend
//   GET  /api/letters/order     status for the thank-you page
import { letterHtml, REASONS } from '../public/js/letter.js';
import { json, clientIp } from './lib/json.js';
import { turnstileOk } from './lib/turnstile.js';
import { take } from './lib/limits.js';
import { orderOp } from './lib/order.js';
import { createCheckout, verifyWebhook } from './lib/stripe.js';
import { mailLetter, sendEmail } from './lib/mail.js';
import { siteOrigin } from './lib/origins.js';

// Prices in cents, set here so the page can't change them.
export const PRODUCTS = {
  first_class: { cents: 399, name: 'Dispute letter by first class mail' },
  certified: { cents: 1099, name: 'Dispute letter by certified mail' }
};

// Throttle (D10): letters per day from one IP and to one email, emailed and mailed together.
// shortcut: counts reset at midnight UTC rather than a rolling 24 hours; fine at this volume.
const DAILY_PER_IP = 5;
const DAILY_PER_EMAIL = 5;
const DAILY_EMAILS_ALL = 90; // Resend's free plan sends 100 a day
const DAILY_ORDERS_ALL = 100;
const MAX_BODY_CHARS = 20000;
const ORDER_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

const DISCLAIMER = 'DebtCat is a free self-help tool for understanding debt collection notices. It is not a law firm and does not provide legal advice.';

// Checks and trims the letter fields. Returns { fields } or { error, field }.
export function letterFields(raw, { mailed = false } = {}) {
  if (!raw || typeof raw !== 'object') return { error: 'bad_request' };
  const s = (k, max = 200) => (typeof raw[k] === 'string' ? raw[k].trim() : '').slice(0, max);
  const f = {
    firstName: s('firstName'), lastName: s('lastName'), email: s('email').toLowerCase(),
    address: s('address'), city: s('city'), state: s('state').toUpperCase(), zip: s('zip'),
    accountNumber: s('accountNumber'), balance: s('balance', 20).replace(/[$,\s]/g, ''),
    collectorName: s('collectorName'), collectorAddress: s('collectorAddress'), collectorAddress2: s('collectorAddress2'),
    collectorCity: s('collectorCity'), collectorState: s('collectorState').toUpperCase(), collectorZip: s('collectorZip'),
    reasonForDispute: s('reasonForDispute'), disputeNote: s('disputeNote', 2000)
  };
  const checks = {
    firstName: v => v, lastName: v => v, address: v => v, city: v => v,
    email: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
    state: v => /^[A-Z]{2}$/.test(v),
    zip: v => /^\d{5}(-\d{4})?$/.test(v),
    reasonForDispute: v => REASONS.includes(v),
    balance: v => v === '' || /^\d+(\.\d{1,2})?$/.test(v)
  };
  if (mailed) {
    Object.assign(checks, {
      collectorName: v => v, collectorAddress: v => v, collectorCity: v => v,
      collectorState: v => /^[A-Z]{2}$/.test(v), collectorZip: v => /^\d{5}(-\d{4})?$/.test(v)
    });
  }
  for (const [k, ok] of Object.entries(checks)) if (!ok(f[k])) return { error: 'invalid_field', field: k };
  return { fields: f };
}

async function readBody(request) {
  if (Number(request.headers.get('Content-Length')) > MAX_BODY_CHARS) return null;
  const text = await request.text();
  if (text.length > MAX_BODY_CHARS) return null;
  try { return JSON.parse(text); } catch { return null; }
}

// Shared front door for both letter routes: rate limit, body, fields, bot check, daily throttle.
async function admit(request, env, { mailed }) {
  const ip = clientIp(request);
  if (!(await env.LETTER_LIMIT.limit({ key: ip })).success) return { res: json({ error: 'rate_limited' }, 429) };
  const body = await readBody(request);
  if (!body) return { res: json({ error: 'bad_request' }, 400) };
  const { fields, error, field } = letterFields(body.fields, { mailed });
  if (error) return { res: json({ error, field }, 400) };
  if (!(await turnstileOk(body.turnstileToken, ip, env.TURNSTILE_SECRET))) return { res: json({ error: 'turnstile' }, 403) };
  if (!(await take(env, 'letter-ip:' + ip, DAILY_PER_IP)) || !(await take(env, 'letter-email:' + fields.email, DAILY_PER_EMAIL))) {
    return { res: json({ error: 'daily_limit' }, 429) };
  }
  return { body, fields };
}

export async function emailLetter(request, env) {
  const { res, fields } = await admit(request, env, { mailed: false });
  if (res) return res;
  if (!(await take(env, 'emails-all', DAILY_EMAILS_ALL))) return json({ error: 'daily_limit' }, 429);
  const html = `<p>Here is a copy of the dispute letter you made on DebtCat.</p><hr>${letterHtml(fields)}<hr><p style="color:#666;font-size:12px;">${DISCLAIMER}</p>`;
  const sent = await sendEmail({ to: fields.email, subject: 'Your dispute letter from DebtCat', html }, env.RESEND_API_KEY).catch(() => false);
  return sent ? json({ ok: true }) : json({ error: 'send_failed' }, 502);
}

export async function checkout(request, env) {
  const { res, body, fields } = await admit(request, env, { mailed: true });
  if (res) return res;
  const product = PRODUCTS[body.mailingClass];
  if (!product) return json({ error: 'invalid_field', field: 'mailingClass' }, 400);
  if (!(await take(env, 'orders-all', DAILY_ORDERS_ALL))) return json({ error: 'daily_limit' }, 429);

  const id = crypto.randomUUID();
  const created = await orderOp(env, id, { op: 'create', order: { fields, mailingClass: body.mailingClass } });
  if (!created.ok) return json({ error: 'server' }, 500);

  const site = siteOrigin(request);
  const session = await createCheckout({
    mode: 'payment',
    client_reference_id: id,
    line_items: [{ quantity: 1, price_data: { currency: 'usd', unit_amount: product.cents, product_data: { name: product.name } } }],
    success_url: `${site}/validate.html?order=${id}`,
    cancel_url: `${site}/mail-review.html`
  }, env.STRIPE_SECRET_KEY).catch(() => null);
  if (!session?.url) return json({ error: 'checkout_failed' }, 502);
  return json({ url: session.url, order: id });
}

export async function orderStatus(request, env) {
  const id = new URL(request.url).searchParams.get('id') || '';
  if (!ORDER_ID.test(id)) return json({ error: 'bad_request' }, 400);
  const r = await orderOp(env, id, { op: 'status' });
  return json({ status: r.ok ? r.status : 'missing', mailingClass: r.mailingClass });
}

// Stripe calls this after a payment. A non-2xx answer makes Stripe retry for up to 3 days.
export async function stripeWebhook(request, env) {
  const raw = await request.text();
  const event = await verifyWebhook(raw, request.headers.get('Stripe-Signature'), env.STRIPE_WEBHOOK_SECRET);
  if (!event) return json({ error: 'signature' }, 400);

  const session = event.data?.object;
  if (event.type !== 'checkout.session.completed' || session?.payment_status !== 'paid') return json({ ok: true });
  const id = session.client_reference_id;
  if (!ORDER_ID.test(id || '')) return json({ ok: true });

  const claim = await orderOp(env, id, { op: 'claim' });
  if (!claim.ok) {
    // Missing means expired or never made: the person paid and nothing can mail, so it needs a refund by hand.
    if (claim.status === 'missing') await alert(env, `A paid order (${id}) has no letter saved. Refund it in Stripe.`);
    return json({ ok: true }); // otherwise already mailed, or another delivery is mailing it now
  }

  const { fields: f, mailingClass } = claim.order;
  const letterId = await mailLetter({
    orderId: id,
    mailingClass,
    html: letterHtml(f, { mailed: true }),
    to: { companyName: f.collectorName, addressLine1: f.collectorAddress, addressLine2: f.collectorAddress2 || undefined, city: f.collectorCity, provinceOrState: f.collectorState, postalOrZip: f.collectorZip },
    from: { firstName: f.firstName, lastName: f.lastName, addressLine1: f.address, city: f.city, provinceOrState: f.state, postalOrZip: f.zip }
  }, env.POSTGRID_API_KEY).catch(() => null);

  if (!letterId) {
    await orderOp(env, id, { op: 'release' });
    await alert(env, `PostGrid refused or failed order ${id}. Stripe will retry for 3 days; check the PostGrid dashboard.`);
    return json({ error: 'mail_failed' }, 500);
  }
  await orderOp(env, id, { op: 'mailed', letterId });

  const how = mailingClass === 'certified' ? 'certified mail' : 'first class mail';
  const html = `<p>Your dispute letter is on its way by ${how}. Here is a copy of what we mailed.</p><hr>${letterHtml(f, { mailed: true })}<hr><p style="color:#666;font-size:12px;">${DISCLAIMER}</p>`;
  if (await take(env, 'emails-all', DAILY_EMAILS_ALL)) {
    await sendEmail({ to: f.email, subject: 'Your dispute letter was mailed', html, idempotencyKey: id }, env.RESEND_API_KEY).catch(() => false);
  }
  return json({ ok: true });
}

// Tells Leo by email when a paid letter is in trouble. Order id only, no personal data.
// ALERT_EMAIL is a secret so the address stays out of the public repo.
async function alert(env, text) {
  if (!env.ALERT_EMAIL) return;
  await sendEmail({ to: env.ALERT_EMAIL, subject: 'DebtCat: a paid letter needs a look', html: `<p>${text}</p>` }, env.RESEND_API_KEY).catch(() => false);
}
