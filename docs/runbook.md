# Runbook

Updated: 2026-10-18. How to run, deploy and roll back DebtCat. "Today" is how it works now. "2.0" fills in as each phase of [plan-2.0.md](plan-2.0.md) lands.

## Run locally

```
node .claude/serve.mjs . 5050   # serves public/ at http://localhost:5050 with the firebase.json rules
```

The `debtcat` Worker (phase 2), pages and `/api/*` together:

```
npx wrangler dev --local --port 8787       # http://localhost:8787, secrets from .dev.vars if you add one
node test/parity.mjs http://localhost:5050 http://localhost:8787   # same status, redirect and body per URL
```

Run `parity.mjs` against `https://debtcat.com` and the workers.dev URL before the switch (phase 4b).

Tests use Node's built-in runner, no install: `npm test` (the notice scan checks are on the POC branch in `workers/notice-scan/test.mjs` until phase 3).

## Deploy

| | Today | 2.0 |
|---|---|---|
| Site | Merge to `main`. GitHub Actions (`.github/workflows/firebase-hosting-merge.yml`) deploys `public/` to Firebase Hosting. | Merge to `main`. Workers Builds deploys the `debtcat` Worker with `public/` as static assets. |
| PR previews | Firebase preview channel per PR (workflow on the POC branch) | Workers preview URL per PR |
| Backend | Each Worker on its own: pasted into the Cloudflare dashboard, or `npx wrangler deploy` from its folder | Same deploy as the site |

**A merge to `main` deploys debtcat.com.** Leo gave Claude a standing OK to merge on 2026-10-18. Check the preview first, and know the rollback before you merge.

## Secrets

Set with `npx wrangler secret put <NAME>` (add `--env preview` for preview). Never in the repo, never in chat. Names only here.

| Secret | Used by | Preview value |
|---|---|---|
| `OPENAI_API_KEY` | scan, chat | Separate OpenAI project with its own spend limit |
| `TURNSTILE_SECRET` | scan, chat, letters | Separate widget that lists preview hosts and localhost |
| `STRIPE_SECRET_KEY` | letters, stripe | Stripe test key |
| `STRIPE_WEBHOOK_SECRET` | stripe | Test-mode webhook secret |
| `POSTGRID_API_KEY` | stripe | PostGrid test key (no real mail) |
| `RESEND_API_KEY` | letters, stripe | Same account, separate key |
| `GEOAPIFY_KEY` | address | Same key |
| `STATS_KEY` | /stats | Any long random string. Open `/stats?key=<it>`. |
| `CF_ACCOUNT_ID`, `CF_API_TOKEN` | /stats | Token with only "Account Analytics: Read" |

Today each old Worker holds its own copies. Phase 1 lists them by name.

First deploy of the `debtcat` Worker (from a clone of this repo, logged in with `npx wrangler login`): `npx wrangler deploy`, then `npx wrangler secret put` for `OPENAI_API_KEY`, `GEOAPIFY_KEY`, `STATS_KEY`, `CF_ACCOUNT_ID` and `CF_API_TOKEN`. It goes live at `https://debtcat.debtcatai.workers.dev`. debtcat.com is not affected until phase 4b.

## Roll back

| | Today | 2.0 |
|---|---|---|
| Site | Revert the commit on `main`, or roll back in the Firebase console (Hosting, release history) | `npx wrangler rollback` |
| A Worker | Redeploy the last good code in the dashboard | `npx wrangler rollback` |

## When something breaks

| Symptom | First check |
|---|---|
| A user paid but no letter arrived | Stripe payment, then PostGrid dashboard for the letter. Today this has no alert. Phase 5 adds one. |
| Notice scan says "something went wrong" | Is the scan Worker deployed for that host? Preview pages call the preview Worker. |
| Turnstile buttons stay grey on a preview | The preview hostname isn't listed on the Turnstile widget |
| Chat stops answering | OpenAI key and spend limit on the chat Worker |

## Rename the repo to `debtcat` (D14)

Safe at any time between merges. Prod keeps deploying, because the deploy secret belongs to the repo and survives a rename.

1. GitHub: Settings, General, Repository name: `debtcat`. GitHub redirects the old URL, so open PRs and old links keep working.
2. Every local clone: `git remote set-url origin https://github.com/lyori6/debtcat.git`, then `git fetch` to check.
3. Claude project settings: point the repository at `lyori6/debtcat`.
4. Merge one small PR and check that the Firebase deploy action still runs green.
