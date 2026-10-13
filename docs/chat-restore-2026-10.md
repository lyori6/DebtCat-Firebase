# DebtChat restore and legal cleanup (October 2026)

Branch: `claude/project-thread-9xnbym`. Merging to `main` deploys the site.

## What changed

### DebtChat is back
- `public/chat.html` is restored from before the September retirement, with the same design and the PDF and email transcript downloads.
- The Chat nav link, the "Debt Chat" footer link, the homepage "Ask DebtChat" card, and the `/chat` sitemap entry are back.
- Disclaimers now read "General information only, not legal advice." The page metadata no longer says "personalized debt advice."
- On localhost, the human check uses Cloudflare's always-pass Turnstile test key. The live site key only works on debtcat.com.

### Chat backend (Cloudflare Worker `chatgpt-integration`)
- The source is now in the repo: `workers/chatgpt-integration/worker.js`. The Cloudflare dashboard is still where it's deployed, so paste the file into the Worker's code editor and click Deploy.
- The model is `gpt-6-luna`. It uses `max_completion_tokens`, because the new model rejects `max_tokens`.
- The OpenAI key was replaced on 2026-10-13. It's stored as the `OPENAI_API_KEY` secret.
- The system prompt was rewritten from "debt advisor, tailored advice" to general information only. It no longer gives limitations-period conclusions, strategy, or outcome promises, and it points to the dispute tool, the CFPB, the FTC, and legal aid.
- Allowed origins: debtcat.com, www.debtcat.com, debtcat.webflow.io, and localhost:5050.
- Fixes: each message was sent to OpenAI twice, message length and history are now capped, and OpenAI error details are no longer returned to the browser.

### Cookie consent
- New `public/js/consent.js`, loaded in the `<head>` of every page that had tracking.
- Google Analytics, Microsoft Clarity, the Meta Pixel, and the Taboola pixel load only after a visitor clicks Accept. Decline is remembered.
- Pixels load only on pages that opt in with `data-meta-pixel` or `data-taboola-pixel` on the consent script tag (the same pages that had them before).
- A "Cookie Settings" footer link reopens the banner.
- Removed the old "Got it" banners, the duplicate GA snippets, the GTM noscript iframes, and an unused ipify call that sent every visitor's IP to a third party.
- The chat page's visit log (IP and browser) runs only after consent.

### Copy and legal wording
- **Privacy policy:** describes the opt-in banner, names each tracker, and adds a DebtChat section (messages go to OpenAI, transcript emails go through SendGrid).
- **Dispute page:** describes the validation-period pause accurately. It no longer says collectors "must stop pursuing" unproven debts or that collectors "accept disputes at any time."
- **Articles:** removed "Stop collector harassment within 24 hours" and "personalized guidance."
- **Medical debt article:** added an update note that the CFPB rule was vacated on July 11, 2025.
- **"Debt Consolidation Secrets They Don't Want You to Know"** is retitled "Debt Consolidation: What to Know Before You Sign Up." The URLs are unchanged.
- **Homepage headline:** "Understand debt notices, dispute a debt, and learn your rights." A CSS fix keeps the hero gradient behind the headline between 992px and 1299px.

### Clean URLs (follow-up fix)
- `firebase.json` now has `"cleanUrls": true`, so `/start-dispute`, `/dispute-form`, `/s/tos` and the other sitemap URLs load. Before, they returned 404, including the dispute link DebtChat gives out. `.html` URLs redirect to the clean version.
- Added 301 redirects: `/tos`, `/privacy-policy`, `/refund`, `/about`, `/fdcpa-checklist`, `/dispute`, and six old Webflow article slugs (such as `/articles/what-is-debt-consolidation`) that pages still link to.
- Removed the `/chat` to `/chat.html` redirect, which would loop with clean URLs.
- The legacy article files with `?` in their names (for example `Old Debt Calls?.html`) don't work with clean URLs. They aren't linked from the site; the slug versions are.

### Chat human check (follow-up fix)
- The Turnstile widget used to be wiped and re-rendered after 5 seconds, which reset interactive challenges and made people send their message twice. It now renders once and sends the message automatically after the check passes.

### Repo guidance
- `AGENTS.md`, `docs/legal-constraints.md`, and `docs/strategy.md` now allow DebtChat as a general-information tool and require tracking to go through `consent.js`.

### Local preview
- `.claude/launch.json` runs `node .claude/serve.mjs . 5050`, a small static server that follows the `firebase.json` redirects. The Firebase CLI needs a Google login, and `superstatic` crashes on Node 23.

## Still open
- Have a consumer-protection attorney review the privacy policy, terms, dispute page, and the DebtChat system prompt.
- Do polish passes with the `impeccable` design skill (installed globally) while keeping the existing designs.
- The welcome message says "Your chat is private and we don't save it." DebtCat doesn't store chats, but messages are sent to OpenAI. Consider "We don't store your chat."
- The legacy chat log Worker (`glog-cht-eml`) and SendGrid Worker only allow debtcat.com, so transcript email and visit logging fail in the local preview. That's expected.
