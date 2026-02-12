import type { APIRoute } from 'astro';

export const prerender = false;

const MAX_SPOTS = 100;
const CACHE_TTL = 3600; // Cache for 1 hour
const MARKETPLACE_URL = 'https://github.com/marketplace/buoy-design';

async function fetchMarketplaceInstalls(kv: any): Promise<number> {
  // Check KV cache first
  if (kv) {
    const cached = await kv.get('marketplace_installs_cached', { type: 'json' });
    if (cached && Date.now() - cached.fetchedAt < CACHE_TTL * 1000) {
      return cached.count;
    }
  }

  // Fetch the marketplace page and parse install count
  try {
    const res = await fetch(MARKETPLACE_URL, {
      headers: { 'User-Agent': 'Buoy-Site/1.0' }
    });
    const html = await res.text();

    // GitHub renders marketplace as a React app with embedded JSON data
    const jsonMatch = html.match(/data-target="react-app\.embeddedData">(.*?)<\/script>/s);
    let count = 0;
    if (jsonMatch) {
      const data = JSON.parse(jsonMatch[1]);
      count = data?.payload?.listing?.installationCount ?? 0;
    }

    // Cache the result in KV
    if (kv) {
      await kv.put('marketplace_installs_cached', JSON.stringify({
        count,
        fetchedAt: Date.now()
      }));
    }

    return count;
  } catch (e) {
    console.error('Failed to fetch marketplace page:', e);

    // Fall back to stale cache if available
    if (kv) {
      const stale = await kv.get('marketplace_installs_cached', { type: 'json' });
      if (stale) return stale.count;
    }

    return 0;
  }
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
        installs: 0,
        remaining: MAX_SPOTS,
        maxSpots: MAX_SPOTS
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};
