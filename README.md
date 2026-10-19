# DebtCat

DebtCat is a free self-help tool for understanding debt collection notices. It is not a law firm and does not provide legal advice.

Live at [debtcat.com](https://debtcat.com).

## How it works

Static HTML pages in `public/`, served by Firebase Hosting today. Backend work (notice scan, DebtChat, email, payments, mail) runs in Cloudflare Workers. DebtCat 2.0 moves the pages and the backend into one Cloudflare Worker built from this repo. See [docs/architecture.md](docs/architecture.md).

## Start here

1. [AGENTS.md](AGENTS.md): rules for changing code or copy.
2. [docs/legal-constraints.md](docs/legal-constraints.md): what DebtCat may and may not say or do.
3. [docs/README.md](docs/README.md): every other doc, in reading order.

## Run it

```
node .claude/serve.mjs . 5050
```

Then open http://localhost:5050. No install needed.

## Ship it

A merge to `main` deploys debtcat.com. Claude merges its own PRs once they are checked (standing OK from Leo, 2026-10-18). Other contributors get Leo's or Claude's review first. Every PR gets a preview link and screenshots at 390 and 1440 wide. Details in [docs/runbook.md](docs/runbook.md).
