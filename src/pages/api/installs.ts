import type { APIRoute } from 'astro';

export const prerender = false;

const MAX_SPOTS = 100;

export const GET: APIRoute = async ({ locals }) => {
  try {
    const runtime = locals.runtime;
    const kv = runtime?.env?.COUNTERS;

    let installs = 0;

    if (kv) {
      const count = await kv.get('marketplace_installs');
      installs = count ? parseInt(count, 10) : 0;
    }

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
          'Cache-Control': 'public, max-age=60' // Cache for 1 minute
        }
      }
    );
  } catch (error) {
    console.error('Error fetching install count:', error);
    // Return fallback data if KV fails
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

// POST endpoint to update the count (protected, for webhook use)
export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const authHeader = request.headers.get('Authorization');
    const runtime = locals.runtime;
    const expectedToken = runtime?.env?.WEBHOOK_SECRET;

    // Simple auth check
    if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
      return new Response(
        JSON.stringify({ message: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const data = await request.json();
    const kv = runtime?.env?.COUNTERS;

    if (!kv) {
      return new Response(
        JSON.stringify({ message: 'KV not available' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Allow setting absolute count or incrementing
    if (typeof data.count === 'number') {
      await kv.put('marketplace_installs', data.count.toString());
    } else if (data.increment) {
      const current = await kv.get('marketplace_installs');
      const newCount = (current ? parseInt(current, 10) : 0) + 1;
      await kv.put('marketplace_installs', newCount.toString());
    } else if (data.decrement) {
      const current = await kv.get('marketplace_installs');
      const newCount = Math.max(0, (current ? parseInt(current, 10) : 0) - 1);
      await kv.put('marketplace_installs', newCount.toString());
    }

    const count = await kv.get('marketplace_installs');
    const installs = count ? parseInt(count, 10) : 0;

    return new Response(
      JSON.stringify({
        installs,
        remaining: Math.max(0, MAX_SPOTS - installs),
        maxSpots: MAX_SPOTS
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error updating install count:', error);
    return new Response(
      JSON.stringify({ message: 'Failed to update count' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
