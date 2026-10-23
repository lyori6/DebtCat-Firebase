// The two senders: PostGrid prints and mails the letter, Resend emails a copy (D24).
// Both log the status only, never the letter or the address.

const FROM_EMAIL = 'DebtCat <letters@mail.debtcat.com>';

// Mails one letter. The order id is the idempotency key, so a retry never mails twice.
// Returns PostGrid's letter id, or null if PostGrid refused or failed.
export async function mailLetter({ orderId, to, from, html, mailingClass }, apiKey) {
  const res = await fetch('https://api.postgrid.com/print-mail/v1/letters', {
    method: 'POST',
    headers: { 'x-api-key': apiKey, 'Content-Type': 'application/json', 'idempotency-key': orderId },
    body: JSON.stringify({
      to: { ...to, countryCode: 'US' },
      from: { ...from, countryCode: 'US' },
      html,
      // A blank address page in front, so the window envelope never covers the letter text.
      addressPlacement: 'insert_blank_page',
      mailingClass,
      color: false,
      doubleSided: false,
      description: `DebtCat order ${orderId}`
    })
  });
  if (!res.ok) {
    console.error(`PostGrid status ${res.status}`);
    return null;
  }
  const data = await res.json().catch(() => ({}));
  return data.id || 'unknown';
}

// Sends one email. idempotencyKey stops a repeat send if the same request runs twice.
export async function sendEmail({ to, subject, html, idempotencyKey }, apiKey) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      ...(idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {})
    },
    body: JSON.stringify({ from: FROM_EMAIL, to: [to], subject, html })
  });
  if (!res.ok) console.error(`Resend status ${res.status}`);
  return res.ok;
}
