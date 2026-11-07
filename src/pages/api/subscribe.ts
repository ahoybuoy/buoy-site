import type { APIRoute } from 'astro';
import { isValidEmail } from '../../utils/validation';
import { composeEmail, markSent, oneClickUnsubscribeUrl, recordSignup, sendViaMailgun, SITE_URL, unsubscribeUrl, type ListDb } from '../../utils/email-list';

export const prerender = false;

interface SubscribeRequest {
  email: string;
  leadMagnet: string;
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

// Lead magnet metadata
const leadMagnets: Record<string, { url: string; name: string }> = {
  'drift-checklist': { url: '/downloads/drift-checklist.pdf', name: 'Design System Drift Checklist' },
  // Key kept from the old "Hall of Shame" name so existing sign-ups stay grouped.
  'hall-of-shame': { url: '/downloads/hardcoded-color-patterns.pdf', name: '10 Hardcoded Color Patterns' },
  'pr-review-cheatsheet': { url: '/downloads/pr-review-cheatsheet.pdf', name: 'PR Review Cheat Sheet' },
  'maturity-model': { url: '/downloads/maturity-model.pdf', name: 'Design System Maturity Model' },
  'why-developers-bypass': { url: '/downloads/why-developers-bypass.pdf', name: 'Why Developers Bypass Your Design System' },
  'token-migration': { url: '/downloads/token-migration.pdf', name: 'Design Token Migration Playbook' },
};

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const data: SubscribeRequest = await request.json();
    if (!data.email || !data.leadMagnet) return json({ message: 'Email and lead magnet are required' }, 400);
    if (!isValidEmail(data.email)) return json({ message: 'Invalid email address' }, 400);

    const env = (locals.runtime?.env || {}) as Record<string, unknown>;
    const db = env.DB as ListDb | undefined;
    if (!db) {
      console.error('Email list database (DB) not bound');
      return json({ message: 'Email service not configured' }, 500);
    }
    const mailgun = typeof env.MAILGUN_API_KEY === 'string' && typeof env.MAILGUN_DOMAIN === 'string'
      ? { apiKey: env.MAILGUN_API_KEY, domain: env.MAILGUN_DOMAIN, replyTo: String(env.SUPPORT_EMAIL || 'support@buoy.design') }
      : null;
    const postalAddress = typeof env.POSTAL_ADDRESS === 'string' ? env.POSTAL_ADDRESS : undefined;

    // Waitlist: join the list, short confirmation.
    if (data.leadMagnet === 'waitlist') {
      const signup = await recordSignup(db, { email: data.email, source: 'waitlist', consentText: 'Joined the Buoy waitlist on buoy.design' });
      if (mailgun && !signup.isExisting) {
        const unsub = unsubscribeUrl(signup.token);
        const content = composeEmail({
          subject: "You're on the Buoy list",
          paragraphs: ["Thanks for signing up. I'll email you when there's something worth trying, not before.", 'Dylan'],
          unsubscribeUrl: unsub,
          postalAddress,
        });
        const sent = await sendViaMailgun(mailgun, data.email, content, oneClickUnsubscribeUrl(signup.token));
        if (sent.ok) await markSent(db, data.email);
        else console.error('Mailgun waitlist error:', sent.status, sent.body);
      }
      return json({
        message: signup.isExisting && !signup.resubscribed
          ? "You're already on the waitlist! We'll email you when we launch."
          : "You're on the list! We'll email you when we launch.",
        isExistingContact: signup.isExisting,
      });
    }

    // Lead magnet: join the list, email the download link.
    const magnet = leadMagnets[data.leadMagnet] || leadMagnets['drift-checklist']!;
    const signup = await recordSignup(db, {
      email: data.email,
      source: 'lead-magnet',
      leadMagnet: data.leadMagnet,
      consentText: `Asked for "${magnet.name}" on buoy.design (form note: "No spam. Unsubscribe anytime.")`,
    });

    if (mailgun) {
      const unsub = unsubscribeUrl(signup.token);
      const content = composeEmail({
        subject: `Your ${magnet.name}`,
        paragraphs: [
          `Here's the ${magnet.name} you asked for: ${SITE_URL}${magnet.url}`,
          "If something in it doesn't match what you're seeing in your own codebase, just reply. I read everything.",
          'Dylan',
        ],
        unsubscribeUrl: unsub,
        postalAddress,
      });
      const sent = await sendViaMailgun(mailgun, data.email, content, oneClickUnsubscribeUrl(signup.token));
      if (sent.ok) await markSent(db, data.email);
      // Don't fail: they're on the list and the success page links the download.
      else console.error('Mailgun lead magnet error:', sent.status, sent.body);
    } else {
      console.error('Mailgun credentials not configured; download link shown on the page only');
    }

    return json({
      message: signup.isExisting
        ? 'Welcome back! Check your email for the download link.'
        : "Check your email for the download link (check spam if you don't see it).",
      downloadUrl: magnet.url,
      isExistingContact: signup.isExisting,
    });
  } catch (error) {
    console.error('Subscribe error:', error);
    return json({ message: 'An unexpected error occurred' }, 500);
  }
};
