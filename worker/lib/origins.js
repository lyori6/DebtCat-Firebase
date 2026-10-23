// Sites allowed to call this Worker from a browser. Until debtcat.com moves to this Worker (phase 4b),
// its pages on Firebase call it cross-origin.
export const allowedOrigins = [
  'https://debtcat.com',
  'https://www.debtcat.com',
  'http://localhost:5050',
  'http://127.0.0.1:5050'
];

// Firebase preview channels, so PR previews can use the API until Firebase is retired.
// shortcut: previews share live keys and caps; give them their own Worker (D13) if previews get public traffic.
const PREVIEW_ORIGIN = /^https:\/\/debtcat-e5451--[a-z0-9-]+\.web\.app$/;

export function isAllowedOrigin(origin) {
  return allowedOrigins.includes(origin) || PREVIEW_ORIGIN.test(origin || '');
}

// The site a request came from, for links back to it (Stripe success and cancel pages).
// The Worker's own address when the page is served by this Worker; debtcat.com for anything unknown.
export function siteOrigin(request) {
  const origin = request.headers.get('Origin');
  if (isAllowedOrigin(origin)) return origin;
  const self = new URL(request.url).origin;
  return origin === self ? self : 'https://debtcat.com';
}
