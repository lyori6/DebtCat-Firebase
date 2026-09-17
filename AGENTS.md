# DebtCat — repository guidance

Read [legal constraints](docs/legal-constraints.md) and [strategy](docs/strategy.md) before changing product behavior or public copy. CLAUDE.md points to this same guidance.

DebtCat is a free self-help tool for understanding debt collection notices. It is not a law firm and does not provide legal advice.

## Operating rule

Surface objective information and user-selected options. Never generate recommendations, legal strategy, case-strength assessments, outcome predictions, or custom legal arguments. Disclaimers, free access, and nonprofit status must not be treated as permission to give individualized legal advice.

- Keep users as decision-makers. Populate existing templates only from their explicit selections and supplied facts; do not select a legal response for them.
- Do not build a chatbot replacement, file documents on a user's behalf, or calculate or state statutes-of-limitations conclusions.
- Do not infer legal violations from missing extracted fields. Extraction uncertainty must remain explicit; jurisdiction-specific decisions require counsel.
- Do not change dispute-letter legal text without a separately scoped, counsel-reviewed request.

## Public copy

Never market DebtCat using “debt expert(s),” “former debt collection professionals,” “use their expertise,” “personalized advice,” lawyer-equivalence, outcome guarantees, or credit-repair framing. Do not imply that DebtCat improves credit or erases debt.

Use: “DebtCat is a free self-help tool for understanding debt collection notices. It is not a law firm and does not provide legal advice.”

Audit all Firebase-deployable HTML and metadata, including archival copies, shared components, and article templates. Do not globally strip legally necessary terminology from internal documentation, existing legal templates, or neutral educational discussion. Public legal statements require current primary sources and must stay within what those sources support.

## Repository and scope

- Firebase Hosting serves `public/`; see `firebase.json` for exclusions and routing.
- Cloudflare Workers provide backend services. Mail uses PostGrid, email uses SendGrid, and payments use Stripe. Scope backend changes separately.
- Preserve the existing dispute workflow and its user selections.
- Keep work small and reviewable. Do not infer authorization for scanner work, migrations, monetization, or redesigns from strategy notes.
- Inspect git status first, preserve unrelated work, and stage exact intended paths. Never use broad staging or destructive cleanup to prepare a commit.
- A push to `main` triggers the Firebase Hosting deployment workflow.
