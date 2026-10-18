# Decisions

One line per decision, newest last. Add a row when a decision is made or changed. Never edit an old row: add a new one that replaces it, and say which.

Status: **Decided** (owner approved), **Proposed** (waiting on the owner), **Replaced**.

| # | Date | Decision | Why | Status |
|---|---|---|---|---|
| D1 | 2026-10-18 | Rebuild the backend of the letter flow. Keep the static pages and patch them. | The broken parts are backend design (browser trusted with money and mail). The pages work and hold lawyer-reviewed copy. | Decided (Leo) |
| D2 | 2026-10-18 | No new front-end framework. Plain HTML and JS, as today. | A rewrite changes reviewed copy and adds a build step without fixing the real problems. Ponytail rule. | Decided |
| D3 | 2026-10-18 | Move hosting from Firebase to Cloudflare Workers static assets. | All backend is already on Cloudflare. One vendor, one deploy, same-origin API, per-PR previews, instant rollback. Needs debtcat.com DNS on Cloudflare. | Decided (Leo left it to the tech lead) |
| D4 | 2026-10-18 | One Worker (`debtcat`) serves the pages and all `/api/*` routes. One file per route in `worker/`. | Fewer deploys and secrets. No CORS lists. Same rate limit and counter code for every route. | Decided |
| D5 | 2026-10-18 | The server fills and sends every letter. Pages send fields, never a PDF to mail or email. | The server must control what goes out under DebtCat's name. | Decided |
| D6 | 2026-10-18 | One letter template file, `public/js/letter.js`, used by the download button and the Worker. Text moved word for word. | One place for the lawyer to review. Moving is not editing. | Decided |
| D7 | 2026-10-18 | Stripe webhook (`checkout.session.completed`) mails the letter. Each order mails once. | Mailing no longer depends on the user's tab. | Decided |
| D8 | 2026-10-18 | Mail orders live in KV with a 7-day expiry and are deleted after mailing. | Smallest store that survives between checkout and webhook. Privacy policy will say so. | Decided |
| D9 | 2026-10-18 | Throttle and daily caps use one Durable Object counter. Hashed key and a count only. | A hard cap needs an exact counter. Serves the letter throttle and the scan daily cap. | Decided |
| D10 | 2026-10-18 | Letter throttle (about 5 per 24 hours, hard cap) lives in the new Worker, keyed on the server-seen IP plus a hash of the email. | Replaces the earlier note to put it in `glog-dspt-ml-forms`, which is being retired. | Decided |
| D11 | 2026-10-18 | Retire `glog-dspt-ml-forms` and the `api.ipify.org` call. Counts go to `/api/count`. | They send personal data we don't need. | Decided |
| D12 | 2026-10-18 | The notice scan POC goes live on the new Worker as `/api/scan`, not as a separate live Worker on Firebase. | Avoids building a live setup we would throw away. Same code, moved. | Decided |
| D13 | 2026-10-18 | Preview gets its own OpenAI key, Turnstile widget, Stripe test keys and PostGrid test key. | Preview abuse or a leak can't hit live money or limits. | Decided |
| D14 | 2026-10-18 | Rename the repo `DebtCat-Firebase` to `debtcat`. | The name will be wrong once Firebase is gone. GitHub redirects the old URL. | Decided (Leo: keep local and remote aligned, don't break prod) |
| D15 | 2026-10-18 | Workers Paid plan (about $5 a month). | Room for PDF work and Durable Objects without hitting free-plan CPU limits. | Replaced by D17 |
| D16 | 2026-10-18 | Use the `stripe` npm package for Stripe calls and webhook checks. No other new dependencies. | Already used by the old Workers. Signature checks should not be hand-written. | Decided |
| D17 | 2026-10-18 | Stay on free plans everywhere until real traffic needs more. Only the AI API costs money. Replaces D15. | Leo's rule: zero cost outside the AI API until scale. Workers Free gives 100,000 Worker requests a day, unlimited static asset requests, SQLite Durable Objects and KV (1,000 writes a day). | Decided (Leo) |
| D18 | 2026-10-18 | No PDF building inside the Worker unless a test shows it fits the free plan's 10 ms CPU limit. Fallback: PostGrid renders the mailed letter from its HTML template, and the email copy is HTML. | Free-plan CPU limit. Waiting on OpenAI, Stripe or PostGrid doesn't count as CPU. | Decided |
| D19 | 2026-10-18 | Move debtcat.com's nameservers from Porkbun to Cloudflare (free plan). The domain stays registered at Porkbun. Copy every record first so nothing changes on the day. | Workers can only serve a domain whose DNS is on Cloudflare. Free. Doing it before the switch keeps the two steps apart. | Decided |
| D20 | 2026-10-18 | Old Worker code exports stay in the private project folder, not this public repo. | Old code may hold hardcoded keys. | Decided |
