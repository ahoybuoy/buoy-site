import type { APIRoute } from 'astro';

export const prerender = false;

interface SupportRequest {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const data: SupportRequest = await request.json();

    // Validate required fields
    if (!data.name || !data.email || !data.subject || !data.message) {
      return new Response(
        JSON.stringify({ message: 'All fields are required' }),
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

    // Get Mailgun credentials from environment
    const runtime = locals.runtime;
    const env = runtime?.env || {};

    const MAILGUN_API_KEY = env.MAILGUN_API_KEY;
    const MAILGUN_DOMAIN = env.MAILGUN_DOMAIN;
    const SUPPORT_EMAIL = env.SUPPORT_EMAIL || 'support@buoy.design';

    if (!MAILGUN_API_KEY || !MAILGUN_DOMAIN) {
      console.error('Mailgun credentials not configured');
      return new Response(
        JSON.stringify({ message: 'Email service not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Subject line mapping
    const subjectLabels: Record<string, string> = {
      general: 'General Question',
      bug: 'Bug Report',
      feature: 'Feature Request',
      enterprise: 'Enterprise Inquiry',
      billing: 'Billing Question',
      other: 'Other',
    };

    const subjectLine = `[Buoy Support] ${subjectLabels[data.subject] || data.subject}: from ${data.name}`;

    // Send email via Mailgun API
    const mailgunUrl = `https://api.mailgun.net/v3/${MAILGUN_DOMAIN}/messages`;

    const formData = new FormData();
    formData.append('from', `Buoy Support <noreply@${MAILGUN_DOMAIN}>`);
    formData.append('to', SUPPORT_EMAIL);
    formData.append('reply-to', data.email);
    formData.append('subject', subjectLine);
    formData.append('text', `
Name: ${data.name}
Email: ${data.email}
Subject: ${subjectLabels[data.subject] || data.subject}

Message:
${data.message}
    `.trim());
    formData.append('html', `
<h2>New Support Request</h2>
<p><strong>Name:</strong> ${escapeHtml(data.name)}</p>
<p><strong>Email:</strong> <a href="mailto:${escapeHtml(data.email)}">${escapeHtml(data.email)}</a></p>
<p><strong>Subject:</strong> ${escapeHtml(subjectLabels[data.subject] || data.subject)}</p>
<hr>
<h3>Message:</h3>
<p>${escapeHtml(data.message).replace(/\n/g, '<br>')}</p>
    `.trim());

    const response = await fetch(mailgunUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`api:${MAILGUN_API_KEY}`)}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Mailgun error:', error);
      return new Response(
        JSON.stringify({ message: 'Failed to send email' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ message: 'Message sent successfully' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Support form error:', error);
    return new Response(
      JSON.stringify({ message: 'An unexpected error occurred' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

function escapeHtml(text: string): string {
  const htmlEntities: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  return text.replace(/[&<>"']/g, (char) => htmlEntities[char]);
}
