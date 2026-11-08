import type { APIRoute } from 'astro';

export const prerender = false;

/**
 * GET /install?src=<channel>
 *
 * The install link that agent plugins, the CLI and docs hand out. Counts the
 * click in the shared Analytics Engine dataset (`buoy_events`, event
 * `install_link_click`, blob6 = src) and sends the visitor on to the GitHub
 * Marketplace listing. No cookie and no personal data: just which channel
 * the click came from, so we can tell whether e.g. the Cursor plugin brings
 * GitHub App installs.
 *
 * Query by channel:
 *   SELECT blob6 AS src, SUM(_sample_interval) AS clicks FROM buoy_events
 *   WHERE blob1 = 'install_link_click' AND timestamp > NOW() - INTERVAL '30' DAY
 *   GROUP BY src ORDER BY clicks DESC
 */

const MARKETPLACE_URL = 'https://github.com/marketplace/buoy-design';
const SOURCE = /^[a-z0-9][a-z0-9-]{0,31}$/;

export function installSource(raw: string | null): string {
  const src = (raw ?? '').trim().toLowerCase();
  return SOURCE.test(src) ? src : 'unknown';
}

export const GET: APIRoute = async ({ request, locals }) => {
  const url = new URL(request.url);
  const src = installSource(url.searchParams.get('src'));
  const env = (locals as any).runtime?.env || {};
  const dataset = env.ANALYTICS as { writeDataPoint: (p: unknown) => void } | undefined;

  if (dataset) {
    try {
      // Same blob layout as /api/track and buoy-cloud's analytics.ts.
      dataset.writeDataPoint({
        indexes: [src],
        blobs: ['install_link_click', '', 'production', '', '', src, 'buoy-site', JSON.stringify({ src, host: url.host })],
        doubles: [1],
      });
    } catch (error) {
      console.error('[install] writeDataPoint failed', error);
    }
  }

  return new Response(null, {
    status: 302,
    headers: { Location: MARKETPLACE_URL, 'Cache-Control': 'no-store' },
  });
};
