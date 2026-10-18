---
name: ponytail
description: Smallest complete change for DebtCat code. Reuse what exists, no new frameworks, never cut validation, security, accessibility, privacy or legal guardrails. Use on any coding or code review task in this repo.
---

# Ponytail (DebtCat cut)

Trimmed from Ponytail by Dietrich Gebert (MIT, https://github.com/DietrichGebert/ponytail). Only the core rules and the review checklist are kept. No hooks, band, board or levels.

Write the least new code that fully solves the task. Be lazy about the solution, never about reading the code or finishing the change.

AGENTS.md, docs/legal-constraints.md and docs/strategy.md come first. Where this skill and those files disagree, those files win.

## Before you write

Read the task and the code it touches. List every place the change must reach: callers, pages that share a component, the worker, firebase.json routing. Check what it could break for users: data it could expose, flows that stop working. That is scope. Extra features are not.

## The smallest complete change

Take the first option that fully works:

1. Does it need to exist? Skip features and options nobody asked for. Name them in one line.
2. Already in this repo? Reuse the helper, page pattern or worker the way the surrounding code does.
3. A browser or platform feature? Use it. A native input beats a hand-built widget.
4. An installed dependency? Use it. Never add a dependency or framework for a few lines.
5. Otherwise, the minimum plain code that works.

Rules:

- Finish every part the task needs, including callers the change breaks.
- No abstraction, wrapper, config or "for later" code nobody asked for. Deletion beats addition.
- Keep the structure the repo has: static pages in public/, Cloudflare Workers for backend.
- Bug fix: grep every caller first, then fix the root cause once in the shared code.
- Code you move keeps its error handling and validation.
- Between options of equal size, take the one that is correct on edge cases.
- Comment only the why the code cannot show, in one line.
- New logic with a branch, a parser, money or user data gets one small check. Use `node --test` or an assert script. No test framework installs.
- A shortcut with a known limit gets a comment: `shortcut: <the limit>, <when to upgrade>`.

## Never cut

- Validation of anything from users, uploads or the model's output.
- Error handling that prevents data loss or a silent wrong answer.
- Security: secrets stay out of client code, worker origin checks stay.
- Accessibility: labels, focus, contrast, keyboard use.
- Privacy: never store the notice photo. Analytics only through public/js/consent.js. Counts only, no personal data.
- Legal guardrails: disclaimers, neutral option menus, "your notice says respond by X" wording, the dispute-letter legal text.
- Anything the user asked for.

## Review mode

When asked to review a change, read the diff and the code it touches. Check in this order: correct, safe, private, legally neutral, accessible, lean.

- Every finding needs a concrete case: this input leads to this wrong result. No case, no finding.
- Flag any copy that recommends a path, predicts an outcome, or says a debt is too old.
- Propose the smallest fix. Prefer fixes that delete code.
- Group findings as Must fix, Should fix, Nice to have. Number them so the user can say "fix 2".
- Each finding gets four short parts: what this is, the problem, the fix, what happens if we skip it.
- End with `Verdict: Ship.` or `Verdict: fix 1 first.`

## End every reply

One or two lines: what you skipped or did not check, and any risk the user must know.
