# DebtCat strategy and scope

Updated: 2026-09-17. This document records product direction, not legal conclusions or authorization to build new features.

## Purpose

DebtCat is a free self-help tool for understanding debt collection notices. The user chooses which available options to explore. The product must not recommend legal responses or assess likely outcomes. See [legal constraints](legal-constraints.md) and [AGENTS.md](../AGENTS.md).

## Current priorities

1. Reduce misleading public marketing and individualized-advice surfaces.
2. Retire the legacy AI chat client and its navigation links while preserving access to the existing dispute workflow.
3. Keep maintenance small, inexpensive, and reviewable.

The retired chat URL retains a static explanation and links to the homepage, general information, and the dispute-letter tool. It does not accept messages or call the legacy AI Worker.

## Existing system

Firebase Hosting serves static files from `public/`. That includes archival-looking HTML unless explicitly excluded in `firebase.json`. Shared components and article templates can reintroduce old copy, so they belong in public-surface audits.

The remaining dispute workflow uses browser state and external Cloudflare Workers. Backend services include mail, email, and payments. Public-copy cleanup must preserve their code and the dispute-letter legal text.

## Future work is separate

Scanner development, classification, deadline calculations, platform migrations, redesigns, monetization, and backend rewrites require separate scopes. No chatbot replacement is planned. Do not infer legal conclusions from document classification or extracted fields.

Before any future legal-information feature ships, obtain appropriate jurisdiction-specific review and verify its public claims against primary sources. Historical research and market estimates are not approved public copy or current legal authority.

## Remaining review needs

Existing educational articles and the dispute template need counsel's review for current law and jurisdiction-specific statements. The legacy AI Worker remains a separately hosted endpoint; retiring the website client does not disable that endpoint. Entity formation, referrals, and payment policy remain separate decisions requiring appropriate review.
