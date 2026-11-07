import type { APIRoute } from 'astro';
import { unsubscribe, type ListDb } from '../../utils/email-list';

export const prerender = false;

/**
 * POST /api/unsubscribe?token=…
 *
 * Handles both the one-click request mail clients send (RFC 8058, body
 * `List-Unsubscribe=One-Click`) and the button on /unsubscribe. There is no
 * GET: link scanners open every link in an email, and a GET that unsubscribes
 * would drop people who never asked.
 */
export const POST: APIRoute = async ({ request, url, locals, redirect }) => {
  const env = (locals.runtime?.env || {}) as Record<string, unknown>;
  const db = env.DB as ListDb | undefined;
  let token = url.searchParams.get('token') ?? '';
  const fromForm = (request.headers.get('content-type') ?? '').includes('form');
  if (!token && fromForm) {
    const form = await request.formData().catch(() => null);
    token = String(form?.get('token') ?? '');
  }
  const ok = db ? await unsubscribe(db, token).catch((err) => { console.error('Unsubscribe error:', err); return false; }) : false;

  // The button on /unsubscribe gets a page back; mail clients just need a 200.
  if (fromForm && !url.searchParams.has('one-click')) {
    return redirect(`/unsubscribe?done=${ok ? '1' : '0'}`, 303);
  }
  return new Response(ok ? 'Unsubscribed' : 'Unknown link', { status: ok ? 200 : 404 });
};
