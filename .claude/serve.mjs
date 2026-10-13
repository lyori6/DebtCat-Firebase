// Minimal local preview server approximating firebase.json hosting rules.
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
const root = process.argv[2]; const port = +process.argv[3] || 5050;
const cfg = JSON.parse(fs.readFileSync(path.join(root, 'firebase.json'))).hosting;
const pub = path.join(root, cfg.public);
const types = {'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.gif':'image/gif','.webp':'image/webp','.json':'application/json','.xml':'application/xml','.woff':'font/woff','.woff2':'font/woff2','.ttf':'font/ttf','.otf':'font/otf','.ico':'image/x-icon','.mp4':'video/mp4'};
const find = p => { for (const c of [p, p + '.html', path.join(p, 'index.html')]) { try { if (fs.statSync(c).isFile()) return c; } catch {} } };
http.createServer((req, res) => {
  let u = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  const r = (cfg.redirects || []).find(r => r.source === u);
  if (r) { res.writeHead(r.type || 302, { Location: r.destination }); return res.end(); }
  const rw = (cfg.rewrites || []).find(r => r.source === u);
  if (rw) u = rw.destination;
  // cleanUrls: /page.html redirects to /page, like Firebase Hosting.
  if (cfg.cleanUrls && u.endsWith('.html') && find(path.join(pub, path.normalize(u)))) {
    res.writeHead(301, { Location: u.replace(/(index)?\.html$/, '') }); return res.end();
  }
  const f = find(path.join(pub, path.normalize(u)));
  if (!f || !f.startsWith(pub)) { res.writeHead(404, {'Content-Type':'text/html'}); return fs.createReadStream(path.join(pub, '404.html')).pipe(res); }
  res.writeHead(200, { 'Content-Type': types[path.extname(f).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-store' });
  fs.createReadStream(f).pipe(res);
}).listen(port, () => console.log(`Preview on http://localhost:${port}`));
