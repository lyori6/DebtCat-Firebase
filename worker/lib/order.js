// One mail order per Durable Object (D26). It holds the letter fields between Stripe Checkout and the webhook,
// makes sure the letter mails once, and deletes itself: the fields right after mailing, everything after 7 days.
// Status: pending (waiting for payment) -> mailing -> mailed. A failed mailing goes back to pending for Stripe's retry.

const KEEP_MS = 7 * 24 * 60 * 60 * 1000;
const STUCK_MS = 5 * 60 * 1000; // a "mailing" claim older than this was cut off, so it can be claimed again

export class Order {
  constructor(state) {
    this.storage = state.storage;
  }

  async fetch(request) {
    const { op, order, letterId } = await request.json();
    const now = Date.now();
    const saved = await this.storage.get('order');

    if (op === 'create') {
      if (saved) return Response.json({ ok: false });
      await this.storage.put('order', { ...order, status: 'pending', createdAt: now });
      await this.storage.setAlarm(now + KEEP_MS);
      return Response.json({ ok: true });
    }
    if (!saved) return Response.json({ ok: false, status: 'missing' });

    if (op === 'status') return Response.json({ ok: true, status: saved.status, mailingClass: saved.mailingClass });

    // Storage calls in one fetch don't interleave with another request, so only one caller wins the claim.
    if (op === 'claim') {
      const stuck = saved.status === 'mailing' && now - saved.claimedAt > STUCK_MS;
      if (saved.status !== 'pending' && !stuck) return Response.json({ ok: false, status: saved.status });
      await this.storage.put('order', { ...saved, status: 'mailing', claimedAt: now });
      return Response.json({ ok: true, order: saved });
    }
    if (op === 'mailed') {
      // Keep only what the thank-you page needs. The letter fields are gone from here on.
      await this.storage.put('order', { status: 'mailed', mailingClass: saved.mailingClass, letterId, createdAt: saved.createdAt });
      return Response.json({ ok: true });
    }
    if (op === 'release') {
      await this.storage.put('order', { ...saved, status: 'pending' });
      return Response.json({ ok: true });
    }
    return Response.json({ ok: false }, { status: 400 });
  }

  async alarm() {
    await this.storage.deleteAll();
  }
}

// Calls the order's Durable Object. Order ids are random UUIDs, so nobody can guess another person's order.
export async function orderOp(env, id, body) {
  const stub = env.ORDERS.get(env.ORDERS.idFromName(id));
  const res = await stub.fetch('https://order/', { method: 'POST', body: JSON.stringify(body) });
  return res.json();
}
