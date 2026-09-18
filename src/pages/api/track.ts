import type { APIRoute } from 'astro';

export const prerender = false;

/**
 * POST /api/track
 *
 * Records a marketing-site event in the shared Cloudflare Analytics Engine
 * dataset (`buoy_events`). Layout matches buoy-cloud's `src/lib/analytics.ts`
 * so both can be queried together:
 *   blob1 event, blob2 distinct_id, blob3 environment, blob4 account_id,
 *   blob5 repo, blob6 utm_campaign, blob7 lib, blob8 properties JSON.
 *
 * The visitor id is an anonymous per-browser cookie; no personal data is stored.
 */

const EVENT_NAME = /^[a-z0-9_$][a-z0-9_.-]{0,63}$/i;
const VISITOR_COOKIE = 'buoy_vid';
const MAX_PROPERTIES_BYTES = 4000;

function readCookie(header: string | null, name: string): string | null {
  if (!header) return null;
  for (const part of header.split(';')) {
    const [k, ...rest] = part.trim().split('=');
    if (k === name) return decodeURIComponent(rest.join('='));
  }
  return null;
}

function sanitize(input: unknown): Record<string, unknown> {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return {};
  const out: Record<string, unknown> = {};
  let n = 0;
  for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
    if (n++ >= 30) break;
    if (/email|token|secret|password/i.test(key)) continue;
    if (typeof value === 'string') out[key] = value.slice(0, 500);
    else if (typeof value === 'number' || typeof value === 'boolean' || value === null) out[key] = value;
  }
  return out;
}

export const POST: APIRoute = async ({ request, locals }) => {
  let body: { event?: unknown; properties?: unknown };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 });
  }

  const event = typeof body.event === 'string' ? body.event.trim() : '';
  if (!EVENT_NAME.test(event)) {
    return new Response(JSON.stringify({ error: 'Invalid event name' }), { status: 400 });
  }

  const env = (locals as any).runtime?.env || {};
  const dataset = env.ANALYTICS as { writeDataPoint: (p: unknown) => void } | undefined;

  const headers = new Headers();
  let visitorId = readCookie(request.headers.get('cookie'), VISITOR_COOKIE);
  if (!visitorId) {
    visitorId = crypto.randomUUID();
    headers.set('Set-Cookie', `${VISITOR_COOKIE}=${visitorId}; Path=/; Max-Age=31536000; SameSite=Lax; Secure`);
  }

  const properties = sanitize(body.properties);
  const url = new URL(request.url);
  const referer = request.headers.get('referer');
  const utm = String(properties.utm_campaign || (referer ? new URL(referer).searchParams.get('utm_campaign') : '') || '');
  let json = JSON.stringify({ ...properties, path: referer ? new URL(referer).pathname : undefined, host: url.host });
  if (json.length > MAX_PROPERTIES_BYTES) json = json.slice(0, MAX_PROPERTIES_BYTES - 1) + '…';

  if (dataset) {
    try {
      dataset.writeDataPoint({
        indexes: [visitorId],
        blobs: [event, visitorId, 'production', '', '', utm, 'buoy-site', json],
        doubles: [1],
      });
    } catch (error) {
      console.error('[track] writeDataPoint failed', error);
    }
  }

  return new Response(null, { status: 204, headers });
};
