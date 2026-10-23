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

The live Worker (`npx wrangler deploy`, no `--env`) waits for the lawyer review.

## Test

```sh
node --test workers/notice-scan/test.mjs                      # request checks, no network
OPENAI_API_KEY=sk-... node --test workers/notice-scan/test.mjs  # also reads the 4 synthetic notices with the real model
```

Notices 1 to 3 are built by `fixtures/make-fixtures.mjs`. Notice 4 is a phone photo of a printed notice marked "SAMPLE, FICTIONAL DATA". Never put real notices in this repo.

On the preview, each scan shows a "Test report" box under the page with found, unsure or missing per field (no values). Copy it into the project thread. The box never shows on debtcat.com.
