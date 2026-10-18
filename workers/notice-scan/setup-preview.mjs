// One-pass Cloudflare setup for the preview Worker. Run it once on your machine:
//   CLOUDFLARE_API_TOKEN=... CLOUDFLARE_ACCOUNT_ID=... OPENAI_API_KEY=... TURNSTILE_SECRET=... \
//     node workers/notice-scan/setup-preview.mjs debtcat-e5451--pr3-xxxx.web.app
// Add --dry-run to check the inputs and the Turnstile widget without changing anything.
// Add --turnstile-only to only add the hostname (use `localhost` for the local preview); it then needs just the token and account ID.
// Token permissions: Workers Scripts Edit, and Turnstile Edit (Account level). Secrets never touch disk or argv.
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const SITEKEY = '0x4AAAAAAAiA6_L9K0nk7Zwy';
const WORKER_URL = 'https://notice-scan-preview.debtcatai.workers.dev';
const HOST_RE = /^(debtcat-e5451--[a-z0-9-]+\.web\.app|localhost)$/;
const API = 'https://api.cloudflare.com/client/v4';

// Returns the PUT body for the widget with the hostname added. PUT replaces the whole widget, so keep every field.
export function withHostname(widget, host) {
  const { sitekey, secret, created_on, modified_on, ...keep } = widget;
  return { ...keep, domains: [...new Set([...(widget.domains || []), host])] };
}

async function cf(path, init, token) {
  const res = await fetch(API + path, { ...init, headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.success === false) throw new Error(`Cloudflare ${init?.method || 'GET'} ${path} failed: ${res.status} ${JSON.stringify(json.errors || [])}`);
  return json.result;
}

function wrangler(args, input) {
  const r = spawnSync('npx', ['--yes', 'wrangler@4', ...args], { cwd: fileURLToPath(new URL('.', import.meta.url)), input, stdio: [input ? 'pipe' : 'inherit', 'inherit', 'inherit'] });
  if (r.status !== 0) throw new Error(`wrangler ${args.join(' ')} failed`);
}

async function main() {
  const host = process.argv.find((a) => HOST_RE.test(a));
  const dry = process.argv.includes('--dry-run');
  const { CLOUDFLARE_API_TOKEN: token, CLOUDFLARE_ACCOUNT_ID: account, OPENAI_API_KEY, TURNSTILE_SECRET } = process.env;
  const only = process.argv.includes('--turnstile-only');
  const need = only ? ['CLOUDFLARE_API_TOKEN', 'CLOUDFLARE_ACCOUNT_ID'] : ['CLOUDFLARE_API_TOKEN', 'CLOUDFLARE_ACCOUNT_ID', 'OPENAI_API_KEY', 'TURNSTILE_SECRET'];
  const missing = need.filter((k) => !process.env[k]);
  if (!host || missing.length) throw new Error(`Need a preview hostname like debtcat-e5451--pr3-abc.web.app${missing.length ? ` and env: ${missing.join(', ')}` : ''}`);

  const path = `/accounts/${account}/challenges/widgets/${SITEKEY}`;
  const widget = await cf(path, {}, token); // fails early if the token cannot reach Turnstile
  const body = withHostname(widget, host);
  console.log(`Turnstile hostnames after: ${body.domains.join(', ')}`);
  if (dry) return console.log('Dry run: nothing changed.');
  if (only) {
    await cf(path, { method: 'PUT', body: JSON.stringify(body) }, token);
    return console.log('Turnstile hostname added.');
  }

  wrangler(['deploy', '--env', 'preview']);
  wrangler(['secret', 'put', 'OPENAI_API_KEY', '--env', 'preview'], OPENAI_API_KEY);
  wrangler(['secret', 'put', 'TURNSTILE_SECRET', '--env', 'preview'], TURNSTILE_SECRET);
  await cf(path, { method: 'PUT', body: JSON.stringify(body) }, token);

  const res = await fetch(WORKER_URL, { method: 'OPTIONS', headers: { Origin: `https://${host}`, 'Access-Control-Request-Method': 'POST' } });
  console.log(`Worker answers the preview origin: HTTP ${res.status}, allow-origin ${res.headers.get('access-control-allow-origin')}`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main().catch((e) => { console.error(e.message); process.exit(1); });
