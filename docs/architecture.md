# Architecture

Updated: 2026-10-18. How DebtCat runs today, and the 2.0 target we are moving to. The build steps are in [plan-2.0.md](plan-2.0.md). The reasons are in [decisions.md](decisions.md).

## In one paragraph

DebtCat is a set of static HTML pages and a few backend calls. Today the pages are on Firebase Hosting, and about 12 small Cloudflare Workers do the backend work, most of them edited only in the Cloudflare dashboard. In 2.0, one Cloudflare Worker serves both the pages and the backend (`/api/*`), from this repo, with one deploy. The pages stay plain HTML and JS. The browser stops doing trusted work: the server fills and sends every letter.

## Today (before 2.0)

```
Browser (static pages on Firebase Hosting, debtcat.com)
  │  letter data kept in localStorage the whole time
  ├─ dispute-form ──────► glog-dspt-ml-forms   logs the full form, IP and browser
  ├─ dispute-form ──────► api.ipify.org        gets the user's IP
  ├─ forms ─────────────► address-autoc        address autocomplete
  ├─ dispute-options ───► sendgrid-pdf-v1      emails a PDF the browser built
  ├─ mail-review ───────► stripepmnt           creates Stripe Checkout ($3.99 / $9.99)
  ├─ validate (after pay)► stripe-vali         checks the session, marks it used in KV
  │                     ► my-postgrid-worker   mails a PDF the browser built
  │                     ► letter-cofirm-w-pdf  emails the user a copy
  ├─ chat ──────────────► chatgpt-integration  DebtChat (gpt-6-luna)
  └─ notice (POC, PR #3)► notice-scan          reads a notice photo (gpt-6-luna)
```

Known problems (security details are kept out of this public repo until fixed; ask the owner for the private review):

- A paid letter mails only if the user's tab stays open on `validate.html`.
- Letters are built in the browser, so the server can't check what it sends.
- Personal data sits in localStorage forever and goes to a log Worker before the user picks anything.
- The dispute letter text is copied in three places.
- Only `chatgpt-integration` and `notice-scan` have source in this repo.

## Target (2.0)

```
Browser ── debtcat.com ──► one Cloudflare Worker "debtcat"
                             │
                             ├─ static assets: public/  (the same HTML pages)
                             │
                             └─ /api/* (Worker code in worker/)
                                 ├─ POST /api/scan            notice photo → fields      → OpenAI
                                 ├─ POST /api/count           step counts only           → Analytics Engine
                                 ├─ POST /api/chat            DebtChat                   → OpenAI
                                 ├─ GET  /api/address         autocomplete               → Geoapify
                                 ├─ POST /api/letters/email   fill letter, email it      → SendGrid
                                 ├─ POST /api/letters/checkout save order, Stripe session → KV, Stripe
                                 ├─ POST /api/stripe          webhook: mail once, email  → PostGrid, SendGrid
                                 └─ GET  /api/letters/order   status for the thank-you page
```

### Rules the design keeps

- **The server decides what is sent.** Pages send fields, never a PDF to mail or email. The Worker fills the one letter template and sends it.
- **Money is handled server to server.** Stripe's webhook triggers mailing. The user's tab can close after paying.
- **Mail once.** Each order mails at most once (order id as the PostGrid idempotency key, order deleted after mailing).
- **Nothing kept that we don't need.** No notice photos, ever. Orders live up to 7 days. Counters keep a hashed key and a number.
- **Same origin.** Pages and API share debtcat.com, so there is no CORS list to keep in sync. Turnstile is still checked on the server for every public write.
- **Preview is separate from live.** Its own OpenAI key, Turnstile widget, Stripe test keys and PostGrid test key.

### Data map

| Data | Where | How long | Who else sees it |
|---|---|---|---|
| Notice photo | Worker memory, one request | Gone when the request ends | OpenAI (up to 30 days unless zero data retention is approved) |
| Letter fields while the user works | Browser sessionStorage | Cleared when the letter is done or the tab closes | Nobody |
| Mail order (fields for one paid letter) | KV, `ORDERS` | Deleted after mailing, at most 7 days | Stripe (payment only), PostGrid (the letter), SendGrid (the copy) |
| Emailed letter | Not stored | n/a | SendGrid |
| Throttle and daily caps | Durable Object `LIMITS` | Hashed key and a count, reset daily | Nobody |
| Step counts | Workers Analytics Engine | Cloudflare's retention | Nobody. Event name only, no IP or ID. |
| DebtChat messages | Not stored | n/a | OpenAI |
| Analytics and ad pixels | Third parties | Their terms | Only after cookie consent (`public/js/consent.js`) |

### Repo layout (target)

```
debtcat/                       renamed from DebtCat-Firebase
├─ public/                     the site, served as static assets
│  ├─ _headers                 cache rules and security headers (replaces firebase.json headers)
│  ├─ _redirects               old URLs (replaces firebase.json redirects)
│  └─ js/letter.js             the one dispute letter template, used by the page and the Worker
├─ worker/
│  ├─ index.js                 routes /api/* to the files below, everything else to public/
│  ├─ scan.js  count.js  chat.js  address.js  letters.js  stripe.js
│  └─ lib/                     turnstile.js, limits.js (Durable Object), json.js
├─ test/                       node --test checks and synthetic fixtures
├─ wrangler.toml               one Worker; envs: preview and production
├─ docs/
└─ AGENTS.md  CLAUDE.md  README.md
```

`public/` keeps its name so links, scripts and docs don't churn. Old dashboard Worker code is exported to the private project folder for reference, not to this public repo, because it may hold keys.

### Platform pieces

| Need | Platform feature | Why this one |
|---|---|---|
| Pages | Workers static assets | `/about` serves `about.html` and `/about.html` redirects to `/about`, same as Firebase `cleanUrls` |
| Backend | The same Worker | One deploy, one set of secrets, no CORS |
| Orders | Workers KV with a 7-day expiry | Built-in expiry. Order ids are random and written once. |
| Throttle and caps | One Durable Object class | A hard cap needs an exact shared counter. KV is not exact. |
| Burst limit | Workers rate limiting binding | Already used by the scan Worker |
| Bot check | Turnstile, checked on the server | Already used. Check `hostname` and `action` too. |
| Counts | Workers Analytics Engine | No cookies, no personal data |
| Stripe | The `stripe` npm package (already used by the old Workers) | Webhook signature checks should not be hand-written |
| PDF | jsPDF in the browser for downloads. In the Worker only if a test shows it fits the free plan's 10 ms CPU limit. | Otherwise PostGrid renders the mailed letter from its HTML template, and the email copy is HTML (D18). |
| Previews | Workers Builds preview URLs per PR | Replaces Firebase preview channels |
| DNS | Cloudflare DNS, free plan. Domain stays registered at Porkbun. | Workers can only serve a domain on Cloudflare DNS (D19) |

Cost: every piece above fits a free plan (D17). Only the OpenAI API costs money.
| Rollback | `wrangler rollback` to the last version | Seconds, no rebuild |
