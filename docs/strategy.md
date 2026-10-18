# DebtCat strategy and scope

Updated: 2026-09-17. This document records product direction, not legal conclusions or authorization to build new features.

## Purpose

DebtCat is a free self-help tool for understanding debt collection notices. The user chooses which available options to explore. The product must not recommend legal responses or assess likely outcomes. See [legal constraints](legal-constraints.md) and [AGENTS.md](../AGENTS.md).

## Current priorities

1. Reduce misleading public marketing and individualized-advice surfaces.
2. Keep DebtChat (restored 2026-10-13) working as a general-information tool, alongside the existing dispute workflow.
3. Keep maintenance small, inexpensive, and reviewable.

DebtChat calls the `chatgpt-integration` Cloudflare Worker (model `gpt-6-luna`). A copy of its source is in `workers/chatgpt-integration/worker.js`; deploy changes by pasting it into the Cloudflare code editor. It accepts requests from debtcat.com and from the local preview on port 5050.

## Existing system

Firebase Hosting serves static files from `public/`. That includes archival-looking HTML unless explicitly excluded in `firebase.json`. Shared components and article templates can reintroduce old copy, so they belong in public-surface audits.

The remaining dispute workflow uses browser state and external Cloudflare Workers. Backend services include mail, email, and payments. Public-copy cleanup must preserve their code and the dispute-letter legal text.

## DebtCat 2.0 (approved 2026-10-18)

The owner approved rebuilding the backend of the letter flow and moving hosting off Firebase, while keeping the static pages. Scope and order are in [plan-2.0.md](plan-2.0.md). This approval covers that plan only. Legal constraints still apply in full.

## Future work is separate

Scanner development, classification, deadline calculations, platform migrations, redesigns, monetization, and backend rewrites require separate scopes. Do not infer legal conclusions from document classification or extracted fields.

Before any future legal-information feature ships, obtain appropriate jurisdiction-specific review and verify its public claims against primary sources. Historical research and market estimates are not approved public copy or current legal authority.

## Remaining review needs

Existing educational articles and the dispute template need counsel's review for current law and jurisdiction-specific statements. The DebtChat system prompt should get counsel's review along with the templates. Entity formation, referrals, and payment policy remain separate decisions requiring appropriate review.
