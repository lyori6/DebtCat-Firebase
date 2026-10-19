// Routes /api/* and /stats to their handlers. Everything else is served from public/ by the
// assets binding (and most requests never reach this code, see run_worker_first in wrangler.toml).
import { chat } from './chat.js';
import { address } from './address.js';
import { count, stats } from './count.js';
import { scan } from './scan.js';
import { json } from './lib/json.js';

export { Limits } from './lib/limits.js';

const routes = {
  'POST /api/chat': chat,
  'GET /api/address': address,
  'POST /api/count': count,
  'POST /api/scan': scan,
  'GET /stats': stats
};

// Until debtcat.com moves to this Worker (phase 4b), its pages on Firebase call this Worker cross-origin.
export const allowedOrigins = [
  'https://debtcat.com',
  'https://www.debtcat.com',
  'http://localhost:5050',
  'http://127.0.0.1:5050'
];

function corsHeaders(origin) {
  if (!allowedOrigins.includes(origin)) return {};
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin'
  };
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin');

    if (request.method === 'OPTIONS' && url.pathname.startsWith('/api/')) {
      const headers = corsHeaders(origin);
      return new Response(null, { status: headers['Access-Control-Allow-Origin'] ? 204 : 403, headers });
    }

    const handler = routes[`${request.method} ${url.pathname}`];
    if (!handler) {
      if (url.pathname.startsWith('/api/') || url.pathname === '/stats') return json({ error: 'Not found' }, 404);
      return env.ASSETS.fetch(request);
    }

    const response = await handler(request, env, ctx);
    const headers = new Headers(response.headers);
    for (const [k, v] of Object.entries(corsHeaders(origin))) headers.set(k, v);
    return new Response(response.body, { status: response.status, headers });
  }
};
