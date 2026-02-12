import type { APIRoute } from 'astro';

export const prerender = false;

const MAX_SPOTS = 100;
const CACHE_TTL = 3600; // Cache for 1 hour
const MARKETPLACE_URL = 'https://github.com/marketplace/buoy-design';
const KNOWN_INSTALLS = 5; // Fallback: last known count as of 2026-02-12

async function fetchMarketplaceInstalls(kv: any): Promise<number> {
  // Check KV cache first
  if (kv) {
    try {
      const cached = await kv.get('marketplace_installs_cached', { type: 'json' });
      if (cached && Date.now() - cached.fetchedAt < CACHE_TTL * 1000) {
        return cached.count;
      }
    } catch {}
  }

  // Fetch the marketplace page and parse install count from embedded JSON
  try {
    const res = await fetch(MARKETPLACE_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Buoy-Site/1.0)',
        'Accept': 'text/html',
      }
    });

    if (!res.ok) {
      throw new Error(`GitHub returned ${res.status}`);
    }

    const html = await res.text();

    // GitHub embeds marketplace data as JSON in a script tag
    const jsonMatch = html.match(/data-target="react-app\.embeddedData">(\{[\s\S]*?\})<\/script>/);
    if (jsonMatch) {
      const data = JSON.parse(jsonMatch[1]);
      const count = data?.payload?.listing?.installationCount;
      if (typeof count === 'number' && count >= 0) {
        // Cache the result
        if (kv) {
          try {
            await kv.put('marketplace_installs_cached', JSON.stringify({
              count,
              fetchedAt: Date.now()
            }));
          } catch {}
        }
        return count;
      }
    }

    // If parsing failed, fall through to fallbacks
    throw new Error('Could not parse installationCount from page');
  } catch (e) {
    console.error('Marketplace fetch failed:', e);
  }

  // Fall back to stale cache
  if (kv) {
    try {
      const stale = await kv.get('marketplace_installs_cached', { type: 'json' });
      if (stale) return stale.count;
    } catch {}
  }

  // Last resort: known count
  return KNOWN_INSTALLS;
}

export const GET: APIRoute = async ({ locals }) => {
  try {
    const runtime = locals.runtime;
    const kv = runtime?.env?.COUNTERS;

    const installs = await fetchMarketplaceInstalls(kv);
    const remaining = Math.max(0, MAX_SPOTS - installs);

    return new Response(
      JSON.stringify({
        installs,
        remaining,
        maxSpots: MAX_SPOTS
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=300'
        }
      }
    );
  } catch (error) {
    console.error('Error fetching install count:', error);
    return new Response(
      JSON.stringify({
        installs: KNOWN_INSTALLS,
        remaining: MAX_SPOTS - KNOWN_INSTALLS,
        maxSpots: MAX_SPOTS
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};
