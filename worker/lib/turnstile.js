// Server-side Turnstile check, plus a short-lived signed pass so one check covers a whole chat.
const HOSTS = ['debtcat.com', 'www.debtcat.com', 'debtcat.debtcatai.workers.dev'];
const PASS_SECONDS = 2 * 60 * 60;

export async function turnstileOk(token, ip, secret) {
  if (!token || !secret) return false;
  const form = new FormData();
  form.append('secret', secret);
  form.append('response', token);
  if (ip) form.append('remoteip', ip);
  let data = {};
  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body: form });
    data = await res.json();
  } catch {
    return false; // Cloudflare unreachable: fail closed
  }
  // Cloudflare's test secret (local dev only) reports a placeholder hostname, so skip that check for it.
  const testSecret = secret.startsWith('1x0000000000000000000000000000000');
  return data.success === true && (testSecret || HOSTS.includes(data.hostname));
}

async function hmacKey(secret) {
  return crypto.subtle.importKey('raw', new TextEncoder().encode('pass:' + secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
}

const toHex = buf => [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');

// A pass is "<expiry seconds>.<hex HMAC of purpose and expiry>". It holds no personal data.
export async function makePass(purpose, secret, now = Date.now()) {
  const exp = Math.floor(now / 1000) + PASS_SECONDS;
  const sig = await crypto.subtle.sign('HMAC', await hmacKey(secret), new TextEncoder().encode(`${purpose}:${exp}`));
  return `${exp}.${toHex(sig)}`;
}

export async function passOk(pass, purpose, secret, now = Date.now()) {
  const m = typeof pass === 'string' && pass.match(/^(\d{1,12})\.([0-9a-f]{64})$/);
  if (!m || !secret || Number(m[1]) < now / 1000) return false;
  const sig = new Uint8Array(m[2].match(/../g).map(h => parseInt(h, 16)));
  return crypto.subtle.verify('HMAC', await hmacKey(secret), sig, new TextEncoder().encode(`${purpose}:${m[1]}`));
}
