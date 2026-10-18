# DebtCat docs

Start here. Read in this order if you are new.

| Doc | What it covers |
|---|---|
| [../AGENTS.md](../AGENTS.md) | Rules for anyone changing code or copy, people and agents alike |
| [legal-constraints.md](legal-constraints.md) | What DebtCat may and may not say or do. Wins over everything else. |
| [strategy.md](strategy.md) | Product direction and scope |
| [architecture.md](architecture.md) | How the system works today and the 2.0 target |
| [plan-2.0.md](plan-2.0.md) | The 2.0 build phases, what's done, what's next |
| [decisions.md](decisions.md) | Every technical decision, with the reason |
| [runbook.md](runbook.md) | Run, deploy, secrets, roll back, fix |
| [chat-restore-2026-10.md](chat-restore-2026-10.md) | The October 2026 DebtChat restore and copy cleanup |

The product plan (screens, paths, copy) is the DebtCat plan doc owned by Leo. These docs cover how it's built.

## Keeping docs clean

- When a PR changes how something works, it updates the doc that describes it in the same PR.
- A new decision gets a row in `decisions.md`.
- A finished phase gets marked in `plan-2.0.md`.
- Old docs move to `archive/`. They describe the 2025 Webflow migration and may be wrong now.
- Plain words, short sentences, no em dashes.
