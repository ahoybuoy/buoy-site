import type { APIRoute } from 'astro';
import { isValidEmail } from '../../utils/validation';

export const prerender = false;

interface SubscribeRequest {
  email: string;
  leadMagnet: string;
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
    if (!isValidEmail(data.email)) {
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

    // Lead magnet metadata
    const leadMagnets: Record<string, { url: string; name: string; type: 'quick' | 'nurture' }> = {
      'drift-checklist': {
        url: '/downloads/drift-checklist.pdf',
        name: 'Design System Drift Checklist',
        type: 'quick',
      },
      'hall-of-shame': {
        url: '/downloads/hall-of-shame.pdf',
        name: 'Hardcoded Color Hall of Shame',
        type: 'quick',
      },
      'pr-review-cheatsheet': {
        url: '/downloads/pr-review-cheatsheet.pdf',
        name: 'PR Review Cheat Sheet',
        type: 'quick',
      },
      'maturity-model': {
        url: '/downloads/maturity-model.pdf',
        name: 'Design System Maturity Model',
        type: 'nurture',
      },
      'why-developers-bypass': {
        url: '/downloads/why-developers-bypass.pdf',
        name: 'Why Developers Bypass Your Design System',
        type: 'nurture',
      },
      'token-migration': {
        url: '/downloads/token-migration.pdf',
        name: 'Design Token Migration Playbook',
        type: 'nurture',
      },
      'state-of-design-systems': {
        url: '/downloads/state-of-design-systems.pdf',
        name: 'State of Design Systems 2026',
        type: 'nurture',
      },
    };

    const magnet = leadMagnets[data.leadMagnet] || leadMagnets['drift-checklist'];
    const downloadUrl = magnet.url;

    // Create or update contact in Loops
    let isExistingContact = false;
    const loopsResponse = await fetch('https://app.loops.so/api/v1/contacts/create', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOOPS_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: data.email,
        source: 'lead-magnet',
        leadMagnet: data.leadMagnet,
        leadMagnetName: magnet.name,
        leadMagnetType: magnet.type,
        userGroup: 'leads',
      }),
    });

    if (!loopsResponse.ok) {
      const error = await loopsResponse.text();
      console.error('Loops API error:', error);

      // If contact already exists, update them instead
      if (error.includes('already') || error.includes('already exists')) {
        isExistingContact = true;
        await fetch('https://app.loops.so/api/v1/contacts/update', {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${LOOPS_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: data.email,
            leadMagnet: data.leadMagnet,
            leadMagnetName: magnet.name,
            leadMagnetType: magnet.type,
          }),
        });
      } else {
        return new Response(
          JSON.stringify({ message: 'Failed to subscribe' }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    // Send transactional email with PDF immediately
    const transactionalResponse = await fetch('https://app.loops.so/api/v1/transactional', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOOPS_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        transactionalId: 'cmkh92n1x0l7n0izrhzdd9itn',
        email: data.email,
        dataVariables: {
          leadMagnetName: magnet.name,
          downloadUrl: `https://buoy.design${downloadUrl}`,
        },
      }),
    });

    if (!transactionalResponse.ok) {
      const error = await transactionalResponse.text();
      console.error('Loops transactional error:', error);
      // Don't fail - contact was still created, they can download from success page
    }

    // Trigger event for nurture sequence (starts after transactional)
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
          leadMagnetName: magnet.name,
          leadMagnetType: magnet.type,
          downloadUrl: downloadUrl,
        },
      }),
    });

    if (!eventResponse.ok) {
      const error = await eventResponse.text();
      console.error('Loops event error:', error);
      // Don't fail - transactional already sent
    }

    return new Response(
      JSON.stringify({
        message: isExistingContact
          ? 'Welcome back! Check your email for the download link.'
          : 'Subscribed successfully',
        downloadUrl: downloadUrl,
        isExistingContact,
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
