// Usage counts with no personal data (D21, D22).
// POST /api/count { event, page, tester } writes one data point: event, page, live or test site, tester or real.
// GET /stats?key=... shows the last 30 days, real visitors vs tests.
import { json } from './lib/json.js';

const EVENTS = new Set(['page_view']);
const LIVE_HOSTS = new Set(['debtcat.com', 'www.debtcat.com']);
const DATASET = 'debtcat_counts';

// Returns the blobs to store, or null if the count is not valid.
export function countFields(body, origin) {
  if (!body || !EVENTS.has(body.event)) return null;
  const page = typeof body.page === 'string' ? body.page.split(/[?#]/)[0] : '';
  if (!page.startsWith('/') || page.length > 100) return null;
  let host = '';
  try { host = new URL(origin).hostname; } catch { return null; }
  const site = LIVE_HOSTS.has(host) ? 'live' : 'test';
  return [body.event, page, site, body.tester === true ? 'tester' : 'real'];
}

export async function count(request, env) {
  // Pages send counts with navigator.sendBeacon as text/plain, so no CORS preflight is needed.
  const text = await request.text();
  if (text.length > 1000) return json({ error: 'Too large' }, 413);
  let body;
  try { body = JSON.parse(text); } catch { return json({ error: 'Bad request' }, 400); }
  const blobs = countFields(body, request.headers.get('Origin'));
  if (!blobs) return json({ error: 'Bad request' }, 400);
  env.COUNTS.writeDataPoint({ blobs, doubles: [1], indexes: [blobs[0]] });
  return new Response(null, { status: 204 });
}

export const STATS_SQL = `
SELECT toDate(timestamp) AS day, blob2 AS page,
  SUM(IF(blob3 = 'live' AND blob4 = 'real', _sample_interval, 0)) AS real,
  SUM(IF(blob3 = 'live' AND blob4 = 'real', 0, _sample_interval)) AS tests
FROM ${DATASET}
WHERE blob1 = 'page_view' AND timestamp > NOW() - INTERVAL '30' DAY
GROUP BY day, page
ORDER BY day DESC, real DESC`;

const escape = s => String(s).replace(/[&<>"']/g, c => `&#${c.charCodeAt(0)};`);

export function statsHtml(rows) {
  const body = rows.length
    ? rows.map(r => `<tr><td>${escape(r.day)}</td><td>${escape(r.page)}</td><td>${Number(r.real)}</td><td>${Number(r.tests)}</td></tr>`).join('')
    : '<tr><td colspan="4">No counts yet.</td></tr>';
  return `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width">
<title>DebtCat stats</title><meta name="robots" content="noindex">
<style>body{font:14px system-ui;margin:16px}table{border-collapse:collapse}td,th{border-bottom:1px solid #ddd;padding:4px 8px;text-align:left}</style>
<h1>Page views, last 30 days</h1><p>Real: debtcat.com visitors without the tester flag. Tests: your browsers, previews and localhost.</p>
<table><tr><th>Day</th><th>Page</th><th>Real</th><th>Tests</th></tr>${body}</table>`;
}

// Compares in constant time so the key can't be guessed one character at a time.
function sameKey(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function stats(request, env) {
  const key = new URL(request.url).searchParams.get('key');
  if (!env.STATS_KEY || !sameKey(key, env.STATS_KEY)) return new Response('Not found', { status: 404 });

  const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${env.CF_ACCOUNT_ID}/analytics_engine/sql`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.CF_API_TOKEN}` },
    body: STATS_SQL
  });
  if (!response.ok) {
    console.error(`Analytics Engine error: ${response.status}`);
    return new Response('Stats are not available right now.', { status: 502 });
  }
  const { data = [] } = await response.json();
  return new Response(statsHtml(data), {
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer' }
  });
}
