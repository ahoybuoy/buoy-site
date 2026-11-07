import { defineMiddleware } from 'astro:middleware';

/*
 * Astro's built-in `security.checkOrigin` rejects every cross-site form POST.
 * That also blocks one-click unsubscribe (RFC 8058): Gmail and Yahoo POST
 * `List-Unsubscribe=One-Click` from their own servers. So the built-in check
 * is off (astro.config.mjs) and this is the same rule with one exemption.
 * /api/unsubscribe is safe to open: it only acts on a 48-hex-char secret token.
 */
const UNSAFE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
const FORM_TYPES = new Set(['application/x-www-form-urlencoded', 'multipart/form-data', 'text/plain']);
const CROSS_SITE_ALLOWED = new Set(['/api/unsubscribe', '/api/unsubscribe/']);

export const onRequest = defineMiddleware(({ request, url }, next) => {
  if (UNSAFE_METHODS.has(request.method) && !CROSS_SITE_ALLOWED.has(url.pathname)) {
    const type = (request.headers.get('content-type') ?? '').split(';')[0]!.trim().toLowerCase();
    const formLike = type === '' || FORM_TYPES.has(type);
    if (formLike && request.headers.get('origin') !== url.origin) {
      return new Response(`Cross-site ${request.method} form submissions are forbidden`, { status: 403 });
    }
  }
  return next();
});
