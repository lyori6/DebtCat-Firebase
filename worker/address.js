// Address autocomplete: GET /api/address?query=...&limit=5 -> Geoapify GeoJSON FeatureCollection.
// Replaces the "address-autoc" Worker. The Geoapify key is a secret (GEOAPIFY_KEY), not a plain var.
import { json, clientIp } from './lib/json.js';

export function geoapifyUrl(params, apiKey) {
  const query = (params.get('query') || '').trim();
  if (query.length < 3 || query.length > 200) return null;
  const limit = Math.min(Math.max(parseInt(params.get('limit'), 10) || 5, 1), 10);
  const url = new URL('https://api.geoapify.com/v1/geocode/autocomplete');
  url.searchParams.set('text', query);
  url.searchParams.set('limit', String(limit));
  url.searchParams.set('filter', 'countrycode:us');
  url.searchParams.set('apiKey', apiKey);
  return url;
}

export async function address(request, env) {
  const { success } = await env.ADDRESS_LIMIT.limit({ key: clientIp(request) });
  if (!success) return json({ error: 'Rate limit exceeded' }, 429);

  const url = geoapifyUrl(new URL(request.url).searchParams, env.GEOAPIFY_KEY);
  if (!url) return json({ error: 'Bad request' }, 400);

  const response = await fetch(url);
  if (!response.ok) {
    console.error(`Geoapify error: ${response.status}`);
    return json({ error: 'Address lookup failed' }, 502);
  }
  return json(await response.json());
}
