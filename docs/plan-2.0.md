# DebtCat 2.0 build plan

Updated: 2026-10-23. Owner: Leo. Tech lead: Claude. Cost rule: free plans only, except the AI API (D17).

What we build and in what order. The target design is in [architecture.md](architecture.md). The reasons are in [decisions.md](decisions.md). Product scope (screens, paths, copy) is in the DebtCat plan doc, which stays the source of truth for the product.

## Goal

One Cloudflare Worker serves debtcat.com: the same pages, plus a backend we can read, test and trust. A paid letter always mails. The notice scan goes live on it.

## Phases

Each phase is one or two small PRs. Nothing changes on debtcat.com until phase 4b, so every earlier phase is safe to merge.

| Phase | What | Done when | Leo does |
|---|---|---|---|
| 0. Groundwork | These docs. Stop deploying archive and test pages. Remove console logs of form and address data. | PR merged | Review and merge |
| 1. Inventory | Export every dashboard Worker's code (`npx wrangler init --from-dash <name>`) to the private project folder, not this repo. List each one's secrets and bindings by name, not value. | All live Workers are readable by the team | Approve the export on your Mac (approved 2026-10-18) |
| 2. New Worker, site only | `wrangler.toml`, `worker/index.js`, `public/_headers`, `public/_redirects`. The site runs on a workers.dev URL and on per-PR preview URLs. Page by page check against Firebase. Move `chat` and `address` in. Add `/api/count` and `/stats` (D21 to D23); Firebase pages call them until the switch. Code is in `worker/` and `wrangler.toml`. Deployed to debtcat.debtcatai.workers.dev on 2026-10-19, and the pages call its chat, address and count routes (`public/js/count.js` sets `DC_API`). | Every page and redirect matches Firebase on the preview | Connect the repo to Workers Builds |
| 3. Notice scan on the new Worker | Move the scan code from `workers/notice-scan/` to `worker/scan.js`. Add the daily cap, and the Turnstile hostname and action checks. Fix the open code review items. Status 2026-10-19: `/api/scan` built with the hostname check and daily caps (20 per IP, 300 in total); the notice page still calls the POC Worker. | The POC works end to end on the preview URL | Test on the preview |
| 4a. Move DNS | Add debtcat.com to Cloudflare (free), copy every record (site, email, Resend, verification; the old SendGrid records can go), then change the nameservers at Porkbun. The site still points at Firebase, so nothing changes for users. | Every record answers the same from Cloudflare, email still works | Change the nameservers at Porkbun |
| 4b. Switch debtcat.com | Point debtcat.com at the Worker. Firebase stays up as the fallback for 2 weeks. | Live on the Worker, nothing broken for a week | Approve the switch |
| 5. Letters backend | `public/js/letter.js`, `/api/letters/email`, `/api/letters/checkout`, `/api/stripe`, `/api/letters/order`. Throttle. sessionStorage instead of localStorage. Thank-you page shows mail status. Status 2026-10-23: Worker side and the shared letter template built (D25 to D27); pages still call the old Workers. Setup steps are in the runbook. | A Stripe test payment mails a PostGrid test letter with the tab closed | Set up Stripe webhook, test keys |
| 6. Clean up | Retire the old Workers and the Firebase project. Update the privacy policy for orders and OpenAI. | Only the `debtcat` Worker is left | Delete old Workers, OK the policy copy |

Order notes:

- Phases 2 and 3 can run while the POC design work continues. The POC page keeps working on its Firebase preview until phase 3 moves it.
- Phase 5 must land before the POC sends anyone to paid mail.
- Lawyer review (stop letter, new page copy, letter moved into one file) can start any time and must finish before the POC paths go live.

## Rollback

| Phase | How to undo |
|---|---|
| 0 to 3 | Revert the PR. debtcat.com is still on Firebase. |
| 4a | Set the nameservers at Porkbun back. Records are unchanged, so nothing else moves. |
| 4b | Point debtcat.com back at Firebase. Pages are the same files. |
| 5 | `wrangler rollback`. Old Workers stay up until phase 6. |

## Open questions

| Question | Blocks |
|---|---|
| Who does the lawyer review, and when? | POC paths going live |
