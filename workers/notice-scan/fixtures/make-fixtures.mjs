// Builds the three synthetic test notices from the CFPB model validation notice layout.
// All names, addresses and numbers are made up. Never add real notices to this folder.
// Run: NODE_PATH=$(npm root -g) node workers/notice-scan/fixtures/make-fixtures.mjs
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';

const { chromium } = createRequire(import.meta.url)('playwright'); // NODE_PATH finds a global install

const dir = path.dirname(new URL(import.meta.url).pathname);

const notices = [
  {
    file: 'notice-1',
    style: '',
    collector: { name: 'Sample Recovery Services LLC', address: '100 Example Plaza, Suite 400', city: 'Springfield', state: 'IL', zip: '62701', phone: '(555) 010-2000' },
    consumer: { name: 'Jordan Testcase', address: '42 Placeholder Lane', city: 'Riverton', state: 'WY', zip: '82501' },
    noticeDate: '2026-10-01', currentCreditor: 'Fakebank Card Services', originalCreditor: null,
    accountNumber: '4417-2290-0013', itemizationDate: '2026-03-15', amountThen: '2234.56',
    interest: '75.00', fees: '25.00', paid: '50.00', amountNow: '2284.56', respondBy: '2026-11-10',
    court: false
  },
  {
    file: 'notice-2',
    style: '',
    collector: { name: 'Placeholder Portfolio Partners', address: '9 Demo Street', city: 'Lakeview', state: 'OH', zip: '43331', phone: '(555) 010-3100' },
    consumer: { name: 'Riley Q. Sample', address: '780 Mockingbird Court, Apt 3B', city: 'Fairhaven', state: 'MA', zip: '02719' },
    noticeDate: '2026-09-22', currentCreditor: 'Northwind Funding LLC', originalCreditor: 'Contoso Retail Bank',
    accountNumber: 'XXXX-XXXX-8812', itemizationDate: '2025-12-31', amountThen: '987.10',
    interest: '0.00', fees: '0.00', paid: '0.00', amountNow: '987.10', respondBy: '2026-10-30',
    court: false
  },
  {
    // Looks like a phone photo: tilted, a little soft, uneven light.
    file: 'notice-3',
    style: 'transform: rotate(-2.5deg) scale(0.96); filter: blur(0.6px) contrast(0.85) brightness(0.97);',
    collector: { name: 'Test Credit Collections Inc', address: 'PO Box 5550', city: 'Mesa Verde', state: 'AZ', zip: '85001', phone: '(555) 010-4422' },
    consumer: { name: 'Casey Exampleton', address: '15 Sample Road', city: 'Dover', state: 'DE', zip: '19901' },
    noticeDate: '2026-10-05', currentCreditor: 'Acme Medical Group', originalCreditor: null,
    accountNumber: 'MED-0099-3321', itemizationDate: '2026-07-01', amountThen: '412.00',
    interest: '0.00', fees: '15.00', paid: '100.00', amountNow: '327.00', respondBy: '2026-11-14',
    court: true
  }
];

const money = v => '$' + Number(v).toLocaleString('en-US', { minimumFractionDigits: 2 });
const longDate = v => new Date(v + 'T12:00:00Z').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });

function html(n) {
  const c = n.collector, p = n.consumer;
  return `<!doctype html><html><head><meta charset="utf-8"><style>
    body { margin: 0; background: ${n.style ? '#c9c4b8' : '#fff'}; }
    .page { width: 1275px; height: 1650px; box-sizing: border-box; padding: 90px 100px; background: #fff;
            font: 22px/1.4 Arial, sans-serif; color: #111; ${n.style} }
    .top { display: flex; justify-content: space-between; } h2 { font-size: 26px; margin: 28px 0 8px; }
    table { border-collapse: collapse; width: 100%; } td { padding: 4px 0; } td.r { text-align: right; }
    .box { border: 2px solid #111; padding: 20px; margin-top: 30px; } .small { font-size: 18px; }
  </style></head><body><div class="page">
    <div class="top">
      <div><b>${c.name}</b><br>${c.address}<br>${c.city}, ${c.state} ${c.zip}<br>${c.phone}<br>Mon to Fri, 8am to 6pm</div>
      <div>${longDate(n.noticeDate)}<br><br>Reference: ${n.accountNumber}</div>
    </div>
    <p style="margin-top:50px">${p.name}<br>${p.address}<br>${p.city}, ${p.state} ${p.zip}</p>
    <p>${c.name} is a debt collector. We are trying to collect a debt that you owe to <b>${n.currentCreditor}</b>.
       We will use any information you give us to help collect the debt.</p>
    <h2>Our information shows:</h2>
    <p>You had an account${n.originalCreditor ? ` with <b>${n.originalCreditor}</b>` : ''} with account number ${n.accountNumber}.</p>
    <table>
      <tr><td>As of ${longDate(n.itemizationDate)}, you owed:</td><td class="r">${money(n.amountThen)}</td></tr>
      <tr><td>Between ${longDate(n.itemizationDate)} and today:</td><td></td></tr>
      <tr><td>&nbsp;&nbsp;You were charged this amount in interest:</td><td class="r">+ ${money(n.interest)}</td></tr>
      <tr><td>&nbsp;&nbsp;You were charged this amount in fees:</td><td class="r">+ ${money(n.fees)}</td></tr>
      <tr><td>&nbsp;&nbsp;You paid or were credited this amount toward the debt:</td><td class="r">- ${money(n.paid)}</td></tr>
      <tr><td><b>Total amount of the debt now:</b></td><td class="r"><b>${money(n.amountNow)}</b></td></tr>
    </table>
    ${n.court ? `<p><b>This account is the subject of a lawsuit filed in the Kent County Court of Common Pleas.</b></p>` : ''}
    <h2>How can you dispute the debt?</h2>
    <p>Call or write to us by <b>${longDate(n.respondBy)}</b> to dispute all or part of the debt. If you do not,
       we will assume that our information is correct.</p>
    <h2>What else can you do?</h2>
    <p class="small">Write to ask for the name and address of the original creditor, if different from the current creditor.
       Go to www.cfpb.gov/debt-collection to learn more about your rights under federal law.</p>
    <div class="box small">Mail this form to: ${c.name}, ${c.address}, ${c.city}, ${c.state} ${c.zip}<br>
       ${p.name}, ${p.address}, ${p.city}, ${p.state} ${p.zip}<br>
       How do you want to respond? &#9744; I want to dispute the debt because I think: ... &#9744; I enclosed this amount: $______</div>
  </div></body></html>`;
}

function expected(n) {
  const f = value => ({ value });
  return {
    isCollectionNotice: true,
    collectorName: f(n.collector.name), collectorAddress: f(n.collector.address), collectorCity: f(n.collector.city),
    collectorState: f(n.collector.state), collectorZip: f(n.collector.zip),
    currentCreditor: f(n.currentCreditor), originalCreditor: f(n.originalCreditor), accountNumber: f(n.accountNumber),
    itemizationDate: f(n.itemizationDate), amountOnItemizationDate: f(n.amountThen), currentAmount: f(n.amountNow),
    noticeDate: f(n.noticeDate), respondByDate: f(n.respondBy),
    consumerName: f(n.consumer.name), consumerAddress: f(n.consumer.address), consumerCity: f(n.consumer.city),
    consumerState: f(n.consumer.state), consumerZip: f(n.consumer.zip),
    mentionsCourt: n.court
  };
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1275, height: 1650 } });
for (const n of notices) {
  await page.setContent(html(n));
  await page.screenshot({ path: path.join(dir, `${n.file}.jpg`), type: 'jpeg', quality: 85 });
  fs.writeFileSync(path.join(dir, `${n.file}.expected.json`), JSON.stringify(expected(n), null, 2) + '\n');
}
await browser.close();
