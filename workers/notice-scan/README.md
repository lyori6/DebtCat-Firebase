# notice-scan Worker

Reads one photo of a debt collection notice with `gpt-6-luna` and returns the printed fields as JSON. It stores nothing. The page that calls it is `public/notice.html`.

## Deploy the preview Worker

```sh
cd workers/notice-scan
npx wrangler login
npx wrangler secret put OPENAI_API_KEY --env preview
npx wrangler secret put TURNSTILE_SECRET --env preview
npx wrangler deploy --env preview
```

This creates `notice-scan-preview.debtcatai.workers.dev`. It accepts requests from Firebase preview channels (`debtcat-e5451--*.web.app`) and the local preview on port 5050.

Turnstile only runs on hostnames listed for the widget. Add the PR's preview hostname (for example `debtcat-e5451--pr3-abc123.web.app`) to the existing widget in Cloudflare > Turnstile. The hostname stays the same for the life of the PR's channel.

### Or do it all in one command

```sh
CLOUDFLARE_API_TOKEN=... CLOUDFLARE_ACCOUNT_ID=... OPENAI_API_KEY=... TURNSTILE_SECRET=... \
  node workers/notice-scan/setup-preview.mjs debtcat-e5451--pr3-abc123.web.app
```

The token needs Workers Scripts Edit and Turnstile Edit. Add `--dry-run` to check the token and the widget first. The script deploys, sets both secrets, adds the hostname to the widget (keeping the existing ones) and checks the Worker answers.

The live Worker (`npx wrangler deploy`, no `--env`) waits for the lawyer review.

## Test

```sh
node --test workers/notice-scan/test.mjs                      # request checks, no network
OPENAI_API_KEY=sk-... node --test workers/notice-scan/test.mjs  # also reads the 3 synthetic notices with the real model
```

The fixtures are synthetic notices built by `fixtures/make-fixtures.mjs`. Never put real notices in this repo.
