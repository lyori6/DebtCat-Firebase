// Shared dispute-letter template. Legal copy moved word for word from the
// mailed copy (generatePDF in public/validate.html). Do not reword.

export const REASONS = [
  "I want to validate this debt.",
  "I don't recognize this debt.",
  "This debt is not mine.",
  "This debt has already been paid.",
  "The amount of the debt is incorrect."
];

const FIELD_MAX = 500;
const NOTE_MAX = 2000;

function clean(v, max = FIELD_MAX) {
  if (v === undefined || v === null) return '';
  return String(v).trim().slice(0, max);
}

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function letterBlocks(d, { date = new Date(), mailed = false } = {}) {
  d = d || {};
  const f = {};
  for (const k of ['firstName', 'lastName', 'email', 'address', 'city', 'state', 'zip',
    'accountNumber', 'balance', 'collectorName', 'collectorAddress', 'collectorAddress2',
    'collectorCity', 'collectorState', 'collectorZip', 'reasonForDispute']) {
    f[k] = clean(d[k]);
  }
  const note = clean(d.disputeNote, NOTE_MAX);

  const blocks = [];
  const line = (text) => blocks.push({ kind: 'line', text });
  const blank = () => blocks.push({ kind: 'blank', text: '' });
  const para = (text) => blocks.push({ kind: 'para', text });

  const currentDate = date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const numericBalance = Number(f.balance);
  let formattedBalance = "0.00";
  if (!isNaN(numericBalance)) {
    formattedBalance = numericBalance.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  const fullName = `${f.firstName} ${f.lastName}`.trim();
  const fullAddress = `${f.address}, ${f.city}, ${f.state} ${f.zip}`.trim();

  line(`${currentDate}`);
  blank();

  let collectorName = f.collectorName;
  if (mailed) {
    collectorName = f.collectorName || 'Collector Inc.';
    let collectorAddressLine = `${f.collectorAddress}`;
    if (f.collectorAddress2 !== '') {
      collectorAddressLine += `, ${f.collectorAddress2}`;
    }
    collectorAddressLine += `, ${f.collectorCity}, ${f.collectorState} ${f.collectorZip}`.trim();
    line(`To: ${collectorName}`);
    line(`Address: ${collectorAddressLine}`);
    blank();
  }

  line(fullName);
  line(fullAddress);
  line(`${f.email}`);
  blank();

  line(`Account Number: ${f.accountNumber}`);
  line(`Account Balance: $${formattedBalance}`);
  blank();

  blocks.push({ kind: 'subject', text: 'Subject: Dispute of Debt and Request for Verification' });
  blank();

  line(collectorName
    ? `Dear ${collectorName},`
    : 'Dear To Whom It May Concern,');
  blank();

  para(`I am writing in response to your communication regarding the above-referenced account. I am exercising my rights under the Fair Debt Collection Practices Act to dispute this debt and request verification. I dispute the validity of the debt in question for the following reason(s): ${f.reasonForDispute}.`);
  para(`Under the Fair Debt Collection Practices Act (FDCPA), 15 U.S.C. § 1692g(b), I request that you provide verification of this debt. Specifically, please supply the following information:`);

  const bulletPoints = [
    '1. The amount of the debt and an itemized accounting of any interest, fees, or other charges that have been added to the original amount.',
    '2. The name and address of the original creditor.',
    '3. A copy of any judgment (if applicable).',
    '4. Proof that you are licensed to collect debts in my state.',
    '5. Proof of the last payment made on this account.'
  ];
  bulletPoints.forEach(text => blocks.push({ kind: 'item', text }));

  para(`I request that you provide this information within 30 days of receiving this letter. Until this information is provided, I request that you cease all collection activities related to this debt. If you have reported this debt to any credit reporting agencies, I also demand that you inform them of this dispute in compliance with the Fair Credit Reporting Act, 15 U.S.C. § 1681s-2.`);
  para(`Please forward all written responses to both my email address (${f.email}) and my physical address as provided above. Please note that I prefer all future communications regarding this matter to be in writing.`);
  para(`I do not authorize you to release any of my personal or financial information to any third party.`);
  para(`I am maintaining careful records of all correspondence and communications related to this matter, and I am prepared to report any violations of the FDCPA to the appropriate authorities, including the Federal Trade Commission and the Consumer Financial Protection Bureau.`);
  if (note) para(note);

  line('Sincerely,');
  blank();
  line(`${fullName}`);
  blocks.push({ kind: 'footer', text: 'Powered by DebtCat' });
  return blocks;
}

export function letterHtml(d, opts) {
  const blocks = letterBlocks(d, opts);
  const base = 'font-family:Helvetica,Arial,sans-serif;font-size:12pt;line-height:1.4;color:#000;';
  let out = `<div style="${base}max-width:6.5in;margin:0 auto;">`;
  let inList = false;
  const closeList = () => { if (inList) { out += '</ol>'; inList = false; } };
  for (const b of blocks) {
    if (b.kind !== 'item') closeList();
    switch (b.kind) {
      case 'line':
        out += `<div style="margin:0;">${esc(b.text)}</div>`;
        break;
      case 'blank':
        out += '<div style="height:1em;"></div>';
        break;
      case 'subject':
        out += `<div style="margin:0;"><strong>${esc(b.text)}</strong></div>`;
        break;
      case 'para':
        out += `<p style="margin:0 0 0.8em 0;">${esc(b.text)}</p>`;
        break;
      case 'item':
        if (!inList) { out += '<ol style="list-style:none;margin:0 0 0.8em 0;padding:0 0 0 0.4in;">'; inList = true; }
        out += `<li style="margin:0 0 0.4em 0;">${esc(b.text)}</li>`;
        break;
      case 'footer':
        out += `<div style="margin-top:2em;font-size:10pt;color:#969696;">${esc(b.text)}</div>`;
        break;
    }
  }
  closeList();
  return out + '</div>';
}
