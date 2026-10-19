// Exact daily counters in one Durable Object (D9). Each entry is a hashed key and a count, reset each UTC day.
// The scan caps use it now; the letter throttle will too.

export class Limits {
  constructor(state) {
    this.storage = state.storage;
  }

  async fetch(request) {
    const { key, limit } = await request.json();
    const today = new Date().toISOString().slice(0, 10);
    if ((await this.storage.get('day')) !== today) {
      await this.storage.deleteAll();
      await this.storage.put('day', today);
    }
    const count = (await this.storage.get(key)) || 0;
    if (count >= limit) return Response.json({ ok: false });
    await this.storage.put(key, count + 1);
    return Response.json({ ok: true });
  }
}

// Adds one to the key's count for today. Returns false, without counting, once the limit is reached.
// Keys are hashed first, so an IP or email never sits in storage.
export async function take(env, key, limit) {
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(key));
  key = [...new Uint8Array(hash)].slice(0, 16).map(b => b.toString(16).padStart(2, '0')).join('');
  const stub = env.LIMITS.get(env.LIMITS.idFromName('daily'));
  const res = await stub.fetch('https://limits/take', { method: 'POST', body: JSON.stringify({ key, limit }) });
  return (await res.json()).ok === true;
}
