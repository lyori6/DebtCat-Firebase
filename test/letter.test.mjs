import test from 'node:test';
import assert from 'node:assert/strict';
import { letterBlocks, letterHtml, REASONS } from '../public/js/letter.js';

const DATE = new Date(2026, 0, 5);
const person = {
  firstName: 'Jane', lastName: 'Doe', email: 'jane@example.com',
  address: '1 Main St', city: 'Austin', state: 'TX', zip: '78701',
  accountNumber: '12345', balance: '1248.3',
  collectorName: 'Acme Collections', collectorAddress: '9 Oak Ave', collectorAddress2: 'Suite 4',
  collectorCity: 'Dallas', collectorState: 'TX', collectorZip: '75001',
  reasonForDispute: "I don't recognize this debt.", disputeNote: 'Please respond promptly.'
};
const texts = (d, o) => letterBlocks(d, { date: DATE, ...o }).map(b => b.text);

test('mailed letter matches validate.html copy', () => {
  assert.deepEqual(texts(person, { mailed: true }), [
    'January 5, 2026', '',
    'To: Acme Collections', 'Address: 9 Oak Ave, Suite 4, Dallas, TX 75001', '',
    'Jane Doe', '1 Main St, Austin, TX 78701', 'jane@example.com', '',
    'Account Number: 12345', 'Account Balance: $1,248.30', '',
    'Subject: Dispute of Debt and Request for Verification', '',
    'Dear Acme Collections,', '',
    "I am writing in response to your communication regarding the above-referenced account. I am exercising my rights under the Fair Debt Collection Practices Act to dispute this debt and request verification. I dispute the validity of the debt in question for the following reason(s): I don't recognize this debt..",
    'Under the Fair Debt Collection Practices Act (FDCPA), 15 U.S.C. § 1692g(b), I request that you provide verification of this debt. Specifically, please supply the following information:',
    '1. The amount of the debt and an itemized accounting of any interest, fees, or other charges that have been added to the original amount.',
    '2. The name and address of the original creditor.',
    '3. A copy of any judgment (if applicable).',
    '4. Proof that you are licensed to collect debts in my state.',
    '5. Proof of the last payment made on this account.',
    'I request that you provide this information within 30 days of receiving this letter. Until this information is provided, I request that you cease all collection activities related to this debt. If you have reported this debt to any credit reporting agencies, I also demand that you inform them of this dispute in compliance with the Fair Credit Reporting Act, 15 U.S.C. § 1681s-2.',
    'Please forward all written responses to both my email address (jane@example.com) and my physical address as provided above. Please note that I prefer all future communications regarding this matter to be in writing.',
    'I do not authorize you to release any of my personal or financial information to any third party.',
    'I am maintaining careful records of all correspondence and communications related to this matter, and I am prepared to report any violations of the FDCPA to the appropriate authorities, including the Federal Trade Commission and the Consumer Financial Protection Bureau.',
    'Please respond promptly.',
    'Sincerely,', '', 'Jane Doe',
    'Powered by DebtCat'
  ]);
});

test('download copy has no collector block', () => {
  const t = texts(person);
  assert.equal(t[2], 'Jane Doe');
  assert.ok(!t.some(x => x.startsWith('To:') || x.startsWith('Address:')));
});

test('no-name greeting', () => {
  const t = texts({ ...person, collectorName: '' });
  assert.ok(t.includes('Dear To Whom It May Concern,'));
});

test('empty and blank notes add no paragraph', () => {
  const n = texts({ ...person, disputeNote: 'x' }).length;
  assert.equal(texts({ ...person, disputeNote: '' }).length, n - 1);
  assert.equal(texts({ ...person, disputeNote: '   ' }).length, n - 1);
});

test('html escapes fields', () => {
  const h = letterHtml({ ...person, firstName: '<script>alert(1)</script>' }, { date: DATE });
  assert.ok(!h.includes('<script>'));
  assert.ok(h.includes('&lt;script&gt;'));
  assert.ok(h.includes('<strong>Subject:'));
  assert.ok(h.includes('<ol'));
});

test('balance formats', () => {
  const bal = (b) => texts({ ...person, balance: b }).find(x => x.startsWith('Account Balance'));
  assert.equal(bal('1248.3'), 'Account Balance: $1,248.30');
  assert.equal(bal(''), 'Account Balance: $0.00');
  assert.equal(bal('abc'), 'Account Balance: $0.00');
});

test('caps and reasons', () => {
  assert.equal(texts({ ...person, accountNumber: 'a'.repeat(900) }).find(x => x.startsWith('Account Number')).length, 'Account Number: '.length + 500);
  assert.equal(REASONS.length, 5);
});
