import type { APIRoute } from 'astro';
export const prerender = false;

// Checkout belongs to the authenticated Cloud billing service so every Stripe
// subscription can be attached to an account and reconciled by signed webhooks.
// Keep this legacy public endpoint closed rather than create orphaned charges.
export const POST: APIRoute = async () => {
  return new Response(
    JSON.stringify({
      message: 'Start checkout from Buoy account settings.',
      billingUrl: 'https://app.buoy.design/settings',
    }),
    { status: 410, headers: { 'Content-Type': 'application/json' } }
  );
};
