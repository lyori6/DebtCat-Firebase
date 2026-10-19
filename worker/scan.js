// Notice scan: POST /api/scan { image: base64 JPEG/PNG/WebP, turnstileToken } -> the printed fields as JSON.
// Moved from the "notice-scan" POC Worker (workers/notice-scan/worker.js on the POC branch), same prompt and schema.
// It stores nothing: no logging of the request or result, and the image is gone when the request ends.
// Added here: the Turnstile hostname check, and daily caps so a flood of scans can't run up the OpenAI bill.
import { json, clientIp } from './lib/json.js';
import { turnstileOk } from './lib/turnstile.js';
import { take } from './lib/limits.js';

const MODEL = 'gpt-6-luna';
const MAX_COMPLETION_TOKENS = 4000;
const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
const MAX_BODY_CHARS = Math.ceil(MAX_IMAGE_BYTES / 3) * 4 + 4096; // base64 image plus the token
const DAILY_CAP_ALL = 300; // scans a day for everyone together
const DAILY_CAP_IP = 20; // scans a day from one IP

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
- Dates: write them as YYYY-MM-DD, even when the page spells them out. "October 10, 2025" becomes 2025-10-10.
- Amounts: digits and one decimal point only, no $ or commas. "$1,248.32" becomes 1248.32.
- States: the two-letter code as printed. ZIP codes: as printed.
- accountNumber: exactly as printed, including any X or * masking. If there are several, use the one labeled as the account number with this collector.
- collectorAddress and consumerAddress: the street or PO Box line only (and unit, if printed). City, state and ZIP go in their own fields.
- collectorName: the company sending the letter, usually in the letterhead, the return address or the signature block. Include its suffix, like LLC or Inc.
- currentCreditor: who the debt is owed to now, only if the page says so. originalCreditor: only if the page names one. Never copy one into the other.
- itemizationDate: the date the page says it counts the debt from, such as "As of January 2, 2026, you owed". amountOnItemizationDate: the amount owed on that date. If the page gives no such date, both are null.
- currentAmount: the total amount owed now.
- noticeDate: the date of the letter, usually near the top.
- respondByDate: only a calendar date the page gives to dispute or respond by. If the page gives a number of days instead (like "within 30 days"), set it to null. Never count days.
- consumerName and the consumer address fields: the person the letter is addressed to.
- isCollectionNotice: true if the page is a letter about collecting a debt.
- mentionsCourt: true if the page mentions a lawsuit, summons, complaint, court, or judgment. Otherwise false.
- Do not add advice, summaries, or extra fields.
`;

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

export async function scan(request, env) {
  const ip = clientIp(request);
  const { success } = await env.SCAN_LIMIT.limit({ key: ip });
  if (!success) return json({ error: 'rate_limited' }, 429);

  if (Number(request.headers.get('Content-Length')) > MAX_BODY_CHARS) return json({ error: 'too_large' }, 413);
  const text = await request.text();
  if (text.length > MAX_BODY_CHARS) return json({ error: 'too_large' }, 413);

  let body;
  try { body = JSON.parse(text); } catch { return json({ error: 'bad_request' }, 400); }
  const image = typeof body.image === 'string' ? body.image : '';
  const token = typeof body.turnstileToken === 'string' ? body.turnstileToken : '';
  if (!image || !token || !/^[A-Za-z0-9+/]+={0,2}$/.test(image)) return json({ error: 'bad_request' }, 400);
  if (Math.floor(image.length * 3 / 4) > MAX_IMAGE_BYTES) return json({ error: 'too_large' }, 413);
  const type = imageType(image);
  if (!type) return json({ error: 'bad_type' }, 400);

  if (!(await turnstileOk(token, ip, env.TURNSTILE_SECRET))) return json({ error: 'turnstile' }, 403);

  // Count only checked requests, so bots can't use up the day's scans.
  if (!(await take(env, 'scan-ip:' + ip, DAILY_CAP_IP)) || !(await take(env, 'scan-all', DAILY_CAP_ALL))) {
    return json({ error: 'daily_limit' }, 429);
  }

  const fields = await readNotice(image, type, env.OPENAI_API_KEY).catch(() => null);
  if (!fields) return json({ error: 'read_failed' }, 502);
  return json(fields);
}
