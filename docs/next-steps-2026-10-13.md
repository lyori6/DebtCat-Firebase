# DebtCat next steps (2026-10-13)

Work so far lives on the local branch `claude/project-thread-9xnbym`. Nothing has been pushed or deployed. A push to `main` deploys the live site.

## Part 1: Leo's checklist

Do these in order. Each step says exactly where to click.

### Step 1. Replace the OpenAI key (about 5 minutes)

1. Go to https://platform.openai.com/api-keys and sign in.
2. Click **Create new secret key**. Name it `debtcat-chat`. Copy the key (you only see it once).
3. Optional cleanup: if you see an old key ending in `pzYA`, revoke it. That's the broken one the Worker is still using.
4. Go to https://dash.cloudflare.com and sign in.
5. In the left menu, open **Workers & Pages**, then click the Worker named **chatgpt-integration**.
6. Open the **Settings** tab, then **Variables and Secrets**.
7. Find the variable that holds the OpenAI key (probably `OPENAI_API_KEY`). Click **Edit**, paste the new key, and **Deploy** or **Save**.
8. Tell Claude "key updated." Claude will send one test message to confirm the chat answers.

### Step 2. Switch the model to gpt-6-luna

Option A, the easiest:
1. Still in the **chatgpt-integration** Worker, click **Edit code** (top right).
2. Press Cmd+F and search for `model`. You'll see something like `model: "gpt-4o-mini"`.
3. Change the value in quotes to `gpt-6-luna`. Leave the rest of the line alone.
4. Click **Deploy**.
5. Copy the whole code and paste it into the thread so Claude can save a backup copy and check the instructions the bot is given (its "system prompt").

Option B, if you want Claude to do it: open Terminal on the Mac and run `npx wrangler login`. A browser window asks you to approve Cloudflare access. Then tell Claude, and it will make the change and show it to you before deploying.

### Step 3. Review the changes in the local preview

The preview runs at http://localhost:5050. Check:
- **Homepage:** the new headline, the "Ask DebtChat" card, and the cookie banner (Decline / Accept).
- **Footer:** the "Cookie Settings" link reopens the banner.
- **Privacy Policy** (`/s/privacy-policy.html`): read sections 2.3, 2.4, 2.5 (new, about DebtChat), 8.3, and the last two sections. This is legal text, so approve it or mark edits.
- **Chat page:** the disclaimer under the input box.

### Step 4. Approve or edit these wording changes (not made yet)

**Dispute page** (`start-dispute.html`). These lines overstate the law. Suggested replacements:

| Current | Suggested |
|---|---|
| Pause Collection Efforts: Once you dispute, collectors must stop all collection activities until they verify your debt. | Pause Collection Efforts: If you dispute in writing within the validation period, the collector must pause collection until it sends you verification. |
| Protect Your Finances: If the collector can't prove the debt is yours, they are required to stop pursuing it. | Ask for Proof: A dispute asks the collector to show information about the debt and who owns it. |
| Gain Peace of Mind: Take control of your financial situation without pressure. | No change needed. |
| Most collectors accept disputes at any time, which can help verify both the debt's and the collector's legitimacy. | You can send a dispute after the validation period, but the collector may not be required to pause collection. |

The repo rules say dispute-flow text should get an attorney's review. These suggestions are softer than what's there now, but they're still legal statements.

**Medical debt article** ("CFPB Rule Means No More Medical Debt on Credit Scores"). Claude believes a federal court in Texas vacated this CFPB rule in July 2025 (Cornerstone Credit Union League v. CFPB). Verify this, then choose one:
- (Recommended) Unpublish it: remove it from the articles list and sitemap.
- Add a note at the top: "Update: a federal court vacated this rule in 2025. The rule described below is not in effect."

**Optional title changes:**
- "Debt Consolidation Secrets They Don't Want You to Know" → "Debt Consolidation: What to Know Before You Sign Up"
- "Break Debt, Not Sweat" homepage tagline: fine to keep. It's a slogan, not a promise.

### Step 5. Ship it

When you're happy, tell Claude "push and open a PR." Review the PR on GitHub, then merge it. Merging to `main` deploys the live site automatically.

### Step 6. Recommended later

A one-hour review by a consumer-protection attorney of the privacy policy, terms of service, dispute page, and the chatbot's instructions. That's the real protection against lawsuits.

## Part 2: Instructions for the next Claude thread

Paste this into a new thread:

> Work in /Users/lyor/DebtCat-Firebase on branch `claude/project-thread-9xnbym`. Read CLAUDE.md, AGENTS.md, docs/legal-constraints.md, and docs/next-steps-2026-10-13.md first. Ask me before pushing, merging, deploying, or changing legal wording. Never use em dashes in messages to me.

Context for that thread:
- **Branch commits so far:** chat restored (`208e383`), cookie consent (`62f6a12`), article claim fixes, privacy policy update, repo guidance update, homepage headline fix.
- **Local preview:** `.claude/launch.json` runs `node .claude/serve.mjs . 5050`, a small server that follows the `firebase.json` redirects. The Firebase CLI needs a Google login, and `superstatic` crashes on Node 23.
- **Chat backend:** the Cloudflare Worker `chatgpt-integration.debtcatai.workers.dev`. It only allows requests from https://debtcat.com, so test it with `curl -H 'Origin: https://debtcat.com'`. Its source isn't in the repo. Ask Leo for it, or use wrangler after he logs in.
- **Analytics:** all tracking goes through `public/js/consent.js`. Never add tracking snippets to pages directly.
- **Open items:** Step 4 wording, model switch, chat test, the impeccable polish passes (the `impeccable` skill is installed globally), and the push and PR.
- **Untracked files:** `.agents/AGENTS.md` and `debtcat-strategy-handoff-2026-07-26.md`. Leave the deleted `public/article-migration-script/node_modules` files alone (pre-existing, unrelated).
