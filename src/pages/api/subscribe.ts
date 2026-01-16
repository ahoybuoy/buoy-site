import type { APIRoute } from 'astro';

export const prerender = false;

interface SubscribeRequest {
  email: string;
  leadMagnet: string;
  firstName?: string;
}

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const data: SubscribeRequest = await request.json();

    // Validate required fields
    if (!data.email || !data.leadMagnet) {
      return new Response(
        JSON.stringify({ message: 'Email and lead magnet are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return new Response(
        JSON.stringify({ message: 'Invalid email address' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get Loops API key from environment
    const runtime = locals.runtime;
    const env = runtime?.env || {};
    const LOOPS_API_KEY = env.LOOPS_API_KEY;

    if (!LOOPS_API_KEY) {
      console.error('Loops API key not configured');
      return new Response(
        JSON.stringify({ message: 'Email service not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Lead magnet to PDF URL mapping
    const pdfUrls: Record<string, string> = {
      'drift-checklist': '/downloads/drift-checklist.pdf',
      'hall-of-shame': '/downloads/hall-of-shame.pdf',
      'pr-review-cheatsheet': '/downloads/pr-review-cheatsheet.pdf',
      'maturity-model': '/downloads/maturity-model.pdf',
      'why-developers-bypass': '/downloads/why-developers-bypass.pdf',
      'token-migration': '/downloads/token-migration.pdf',
      'state-of-design-systems': '/downloads/state-of-design-systems.pdf',
    };

    const downloadUrl = pdfUrls[data.leadMagnet] || pdfUrls['drift-checklist'];

    // Create or update contact in Loops
    const loopsResponse = await fetch('https://app.loops.so/api/v1/contacts/create', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOOPS_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: data.email,
        firstName: data.firstName || '',
        source: 'lead-magnet',
        leadMagnet: data.leadMagnet,
        downloadUrl: downloadUrl,
        userGroup: 'leads',
      }),
    });

    if (!loopsResponse.ok) {
      const error = await loopsResponse.text();
      console.error('Loops API error:', error);

      // If contact already exists, that's fine - trigger the event anyway
      if (!error.includes('already exists')) {
        return new Response(
          JSON.stringify({ message: 'Failed to subscribe' }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    // Trigger the lead magnet event to send the email
    const eventResponse = await fetch('https://app.loops.so/api/v1/events/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOOPS_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: data.email,
        eventName: 'leadMagnetDownload',
        eventProperties: {
          leadMagnet: data.leadMagnet,
          downloadUrl: downloadUrl,
        },
      }),
    });

    if (!eventResponse.ok) {
      const error = await eventResponse.text();
      console.error('Loops event error:', error);
      // Don't fail the request if event fails - contact was still created
    }

    return new Response(
      JSON.stringify({
        message: 'Subscribed successfully',
        downloadUrl: downloadUrl,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Subscribe error:', error);
    return new Response(
      JSON.stringify({ message: 'An unexpected error occurred' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
