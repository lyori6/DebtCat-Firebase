// Notice scan backend: Cloudflare Worker "notice-scan" (preview: "notice-scan-preview").
// Takes one photo of a debt collection notice and returns the printed fields as JSON.
// It stores nothing: no KV, R2 or D1, no logging of the request or result, and Workers logs are off
// (see wrangler.toml). The image is a local variable that is gone when the request ends.
// Secrets: OPENAI_API_KEY and TURNSTILE_SECRET. Deploy with `npx wrangler deploy --env preview`.

const MODEL = 'gpt-6-luna';
const MAX_COMPLETION_TOKENS = 4000;
const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
const MAX_BODY_CHARS = Math.ceil(MAX_IMAGE_BYTES / 3) * 4 + 4096; // base64 image plus the token

const LIVE_ORIGINS = ['https://debtcat.com', 'https://www.debtcat.com'];
// Firebase preview channels and the local preview server, allowed only when ALLOW_PREVIEW is "true".
const PREVIEW_ORIGIN = /^(https:\/\/debtcat-e5451--[a-z0-9-]+\.web\.app|http:\/\/(localhost|127\.0\.0\.1):5050)$/;

const TEXT_FIELDS = [
  'collectorName', 'collectorAddress', 'collectorCity', 'collectorState', 'collectorZip',
  'currentCreditor', 'originalCreditor', 'accountNumber',
  'itemizationDate', 'amountOnItemizationDate', 'currentAmount',
  'noticeDate', 'respondByDate',
  'consumerName', 'consumerAddress', 'consumerCity', 'consumerState', 'consumerZip'
];

const field = { type: 'object', properties: { value: { type: ['string', 'null'] }, sure: { type: 'boolean' } }, required: ['value', 'sure'], additionalProperties: false };
const schema = {
  type: 'object',
  properties: {
    isCollectionNotice: { type: 'boolean' },
    ...Object.fromEntries(TEXT_FIELDS.map(name => [name, field])),
    mentionsCourt: { type: 'boolean' }
  },
  required: ['isCollectionNotice', ...TEXT_FIELDS, 'mentionsCourt'],
  additionalProperties: false
};

const systemPrompt = `
You read one photo of a letter and copy fields from it into JSON. You copy text. You do not interpret it.

Rules:
- Copy only what is printed on the page. If a field is not printed, cut off, or not readable, set value to null. Never guess or fill in a likely value.
- sure is true only when every character of the value is clearly readable. If value is null, sure is false.
- Dates: YYYY-MM-DD. Amounts: digits and one decimal point only, no $ or commas, for example 1234.56.
- States: the two-letter code as printed. ZIP codes: as printed.
- accountNumber: exactly as printed, including any X or * masking.
- collectorAddress and consumerAddress: the street line only (and unit, if printed). City, state and ZIP go in their own fields.
- collectorName: the debt collector sending the letter. currentCreditor: who the debt is owed to now. originalCreditor: only if printed separately.
- itemizationDate: the date the itemization starts from. amountOnItemizationDate: the amount owed on that date. currentAmount: the total amount owed now.
- noticeDate: the date of the letter. respondByDate: the date the letter gives to dispute or respond by.
- consumerName and the consumer address fields: the person the letter is addressed to.
- isCollectionNotice: true if the page is a letter about collecting a debt.
- mentionsCourt: true if the page mentions a lawsuit, summons, complaint, court, or judgment. Otherwise false.
- Do not add advice, summaries, or extra fields.
`;

function allowedOrigin(origin, env) {
  return LIVE_ORIGINS.includes(origin) || (env.ALLOW_PREVIEW === 'true' && PREVIEW_ORIGIN.test(origin || ''));
}

function json(body, status, origin) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': origin,
      'Vary': 'Origin',
      'Cache-Control': 'no-store'
    }
  });
}

// Returns the image type from its first bytes, or null if it is not JPEG, PNG or WebP.
function imageType(base64) {
  let head;
  try { head = atob(base64.slice(0, 16)); } catch { return null; }
  if (head.startsWith('\xFF\xD8\xFF')) return 'image/jpeg';
  if (head.startsWith('\x89PNG')) return 'image/png';
  if (head.startsWith('RIFF') && head.slice(8, 12) === 'WEBP') return 'image/webp';
  return null;
}

// Keeps only the expected fields, in the expected shape. Anything else from the model is dropped.
export function clean(raw) {
  const out = { isCollectionNotice: raw.isCollectionNotice === true };
  for (const name of TEXT_FIELDS) {
    const f = raw[name] || {};
    const value = typeof f.value === 'string' && f.value.trim() ? f.value.trim().slice(0, 200) : null;
    out[name] = { value, sure: value !== null && f.sure === true };
  }
  out.mentionsCourt = raw.mentionsCourt === true;
  return out;
}

async function turnstileOk(token, ip, secret) {
  const form = new FormData();
  form.append('secret', secret);
  form.append('response', token);
  if (ip) form.append('remoteip', ip);
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body: form });
  const data = await res.json().catch(() => ({}));
  return data.success === true;
}

async function readNotice(image, type, apiKey) {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: MODEL,
      max_completion_tokens: MAX_COMPLETION_TOKENS,
      response_format: { type: 'json_schema', json_schema: { name: 'notice_fields', strict: true, schema } },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: [{ type: 'image_url', image_url: { url: `data:${type};base64,${image}`, detail: 'high' } }] }
      ]
    })
  });
  if (!res.ok) {
    console.error(`OpenAI status ${res.status}`); // status only, never the body
    return null;
  }
  try {
    const data = await res.json();
    return clean(JSON.parse(data.choices[0].message.content));
  } catch {
    return null;
  }
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin');
    if (!allowedOrigin(origin, env)) {
      return new Response('Forbidden', { status: 403 });
    }

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': origin,
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Max-Age': '86400',
          'Vary': 'Origin'
        }
      });
    }
    if (request.method !== 'POST') {
      return json({ error: 'method' }, 405, origin);
    }

    const ip = request.headers.get('CF-Connecting-IP') || '';
    const { success } = await env.RATE_LIMITER.limit({ key: ip });
    if (!success) {
      return json({ error: 'rate_limited' }, 429, origin);
    }

    if (Number(request.headers.get('Content-Length')) > MAX_BODY_CHARS) {
      return json({ error: 'too_large' }, 413, origin);
    }
    const text = await request.text();
    if (text.length > MAX_BODY_CHARS) {
      return json({ error: 'too_large' }, 413, origin);
    }

    let body;
    try { body = JSON.parse(text); } catch { return json({ error: 'bad_request' }, 400, origin); }
    const image = typeof body.image === 'string' ? body.image : '';
    const token = typeof body.turnstileToken === 'string' ? body.turnstileToken : '';
    if (!image || !token || !/^[A-Za-z0-9+/]+={0,2}$/.test(image)) {
      return json({ error: 'bad_request' }, 400, origin);
    }
    if (Math.floor(image.length * 3 / 4) > MAX_IMAGE_BYTES) {
      return json({ error: 'too_large' }, 413, origin);
    }
    const type = imageType(image);
    if (!type) {
      return json({ error: 'bad_type' }, 400, origin);
    }

    if (!(await turnstileOk(token, ip, env.TURNSTILE_SECRET))) {
      return json({ error: 'turnstile' }, 403, origin);
    }

    const fields = await readNotice(image, type, env.OPENAI_API_KEY);
    if (!fields) {
      return json({ error: 'read_failed' }, 502, origin);
    }
    return json(fields, 200, origin);
  }
};
