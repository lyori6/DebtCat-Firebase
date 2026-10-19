// Compares two hosts URL by URL: status, redirect target and body.
// Usage: node test/parity.mjs <old base> <new base>
// Example: node test/parity.mjs http://localhost:5050 http://localhost:8787
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const [oldBase, newBase] = process.argv.slice(2);
const pub = path.resolve('public');
const ignored = JSON.parse(fs.readFileSync('firebase.json')).hosting.ignore;
const skip = rel => rel.startsWith('.') || rel.includes('/.') || ignored.some(g =>
  g.endsWith('/**') ? rel.startsWith(g.slice(0, -2)) : rel === g);

const files = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full); else files.push(path.relative(pub, full).split(path.sep).join('/'));
  }
})(pub);

const urls = new Set(['/', '/nope', '/articles', '/articles/', '/s/nope', '/api-nope']);
for (const rel of files.filter(f => !skip(f))) {
  const p = '/' + rel.split('/').map(encodeURIComponent).join('/');
  urls.add(p);
  if (p.endsWith('.html')) urls.add(p.replace(/(index)?\.html$/, ''));
}
for (const line of fs.readFileSync('public/_redirects', 'utf8').split('\n')) {
  if (line && !line.startsWith('#')) urls.add(line.split(' ')[0]);
}

async function get(base, u) {
  const r = await fetch(base + u, { redirect: 'manual' });
  const body = Buffer.from(await r.arrayBuffer());
  const loc = r.headers.get('location');
  return {
    kind: r.status >= 300 && r.status < 400 ? '3xx' : String(r.status),
    loc: loc ? new URL(loc, base).pathname : '',
    hash: r.status === 200 ? crypto.createHash('sha1').update(body).digest('hex') : ''
  };
}

let bad = 0;
for (const u of urls) {
  const [a, b] = await Promise.all([get(oldBase, u), get(newBase, u)]);
  if (a.kind !== b.kind || a.loc !== b.loc || a.hash !== b.hash) {
    bad++;
    console.log(`DIFF ${u}\n  old ${a.kind} ${a.loc} ${a.hash.slice(0, 8)}\n  new ${b.kind} ${b.loc} ${b.hash.slice(0, 8)}`);
  }
}
console.log(`${urls.size} URLs checked, ${bad} differ`);
process.exit(bad ? 1 : 0);
