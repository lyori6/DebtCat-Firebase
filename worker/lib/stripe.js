// Stripe over plain fetch (D25): one call to make a Checkout page, and the webhook signature check.
// Stripe documents both: https://docs.stripe.com/api/checkout/sessions/create and
// https://docs.stripe.com/webhooks#verify-manually

const TOLERANCE_SECONDS = 5 * 60;

// Stripe's API takes form encoding with bracketed keys: line_items[0][price_data][currency]=usd.
export function formEncode(obj, prefix = '', out = new URLSearchParams()) {
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null) continue;
    const key = prefix ? `${prefix}[${k}]` : k;
    if (typeof v === 'object') formEncode(v, key, out);
    else out.append(key, String(v));
  }
  return out;
}

export async function createCheckout(params, secretKey) {
  const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${secretKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'Idempotency-Key': params.client_reference_id
    },
    body: formEncode(params)
  });
  if (!res.ok) {
    console.error(`Stripe status ${res.status}`); // status only, never the body
    return null;
  }
  const session = await res.json();
  return { id: session.id, url: session.url };
}

const toHex = buf => [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');

// Returns the parsed event when the Stripe-Signature header matches the raw body, else null.
export async function verifyWebhook(rawBody, header, secret, now = Date.now()) {
  if (!header || !secret) return null;
  const parts = header.split(',').map(p => p.split('='));
  const t = parts.find(([k]) => k === 't')?.[1];
  const sigs = parts.filter(([k]) => k === 'v1').map(([, v]) => v);
  if (!/^\d+$/.test(t || '') || !sigs.length) return null;
  if (Math.abs(now / 1000 - Number(t)) > TOLERANCE_SECONDS) return null;

  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const expected = toHex(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${t}.${rawBody}`)));
  if (!sigs.some(s => sameHex(s, expected))) return null;
  try { return JSON.parse(rawBody); } catch { return null; }
}

// Constant-time compare, so the check doesn't leak how many characters matched.
function sameHex(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

// Test helper: signs a body the way Stripe does.
export async function signForTest(rawBody, secret, t = Math.floor(Date.now() / 1000)) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return `t=${t},v1=${toHex(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${t}.${rawBody}`)))}`;
}
