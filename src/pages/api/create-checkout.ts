import type { APIRoute } from 'astro';
import { isValidEmail } from '../../utils/validation';

export const prerender = false;

interface CheckoutRequest {
  email: string;
  seats?: number;
}

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const data: CheckoutRequest = await request.json();

    // Validate email
    if (!data.email || !isValidEmail(data.email)) {
      return new Response(
        JSON.stringify({ message: 'Valid email is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const seats = data.seats || 1;

    // Get Stripe secret key from environment
    const runtime = locals.runtime;
    const env = runtime?.env || {};
    const STRIPE_SECRET_KEY = env.STRIPE_SECRET_KEY;

    if (!STRIPE_SECRET_KEY) {
      console.error('Stripe secret key not configured');
      return new Response(
        JSON.stringify({ message: 'Payment service not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create Stripe Checkout Session in setup mode (collect payment method, don't charge)
    const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        'mode': 'setup',
        'customer_email': data.email,
        'success_url': 'https://buoy.design/pricing?checkout=success',
        'cancel_url': 'https://buoy.design/pricing',
        'metadata[plan]': 'founding-member',
        'metadata[seats]': seats.toString(),
        'metadata[price_per_seat]': '15',
        'metadata[email]': data.email,
        'payment_method_types[0]': 'card',
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Stripe API error:', error);
      return new Response(
        JSON.stringify({ message: 'Failed to create checkout session' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const session = await response.json();

    return new Response(
      JSON.stringify({ url: session.url }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Checkout error:', error);
    return new Response(
      JSON.stringify({ message: 'An unexpected error occurred' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
