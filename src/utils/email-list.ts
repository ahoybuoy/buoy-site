/**
 * Buoy's own email list (replaces Loops).
 *
 * Signups are stored in the `email_list` table of the buoy_platform D1
 * database (schema: buoy-cloud/migrations/0048_email_list.sql) and emails go
 * out through Mailgun. Every email carries an unsubscribe link and the
 * one-click List-Unsubscribe headers.
 */

/** The slice of D1 this module uses, so it runs against a fake in tests. */
export interface ListDb {
  prepare(sql: string): {
    bind(...values: unknown[]): {
      first<T = Record<string, unknown>>(): Promise<T | null>;
      run(): Promise<unknown>;
    };
  };
}

export const SITE_URL = 'https://buoy.design';

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function newToken(): string {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export interface SignupInput {
  email: string;
  source: 'lead-magnet' | 'waitlist' | 'xray' | 'import';
  leadMagnet?: string;
  consentText: string;
  now?: Date;
}

export interface SignupResult {
  token: string;
  isExisting: boolean;
  /** They had unsubscribed and signed up again, which counts as new consent. */
  resubscribed: boolean;
}

/** Add someone to the list, or record another signup for someone already on it. */
export async function recordSignup(db: ListDb, input: SignupInput): Promise<SignupResult> {
  const email = normalizeEmail(input.email);
  const now = (input.now ?? new Date()).toISOString();
  const existing = await db.prepare(
    'SELECT id, lead_magnets, unsubscribe_token, unsubscribed_at FROM email_list WHERE email = ?',
  ).bind(email).first<{ id: string; lead_magnets: string; unsubscribe_token: string; unsubscribed_at: string | null }>();

  if (!existing) {
    const token = newToken();
    await db.prepare(`
      INSERT INTO email_list (id, email, source, lead_magnets, consent_text, unsubscribe_token, created_at, updated_at, last_signup_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      crypto.randomUUID(), email, input.source, JSON.stringify(input.leadMagnet ? [input.leadMagnet] : []),
      input.consentText, token, now, now, now,
    ).run();
    return { token, isExisting: false, resubscribed: false };
  }

  let magnets: string[] = [];
  try { magnets = JSON.parse(existing.lead_magnets) as string[]; } catch { magnets = []; }
  if (input.leadMagnet && !magnets.includes(input.leadMagnet)) magnets.push(input.leadMagnet);
  await db.prepare(`
    UPDATE email_list SET lead_magnets = ?, consent_text = ?, last_signup_at = ?, updated_at = ?, unsubscribed_at = NULL
    WHERE id = ?
  `).bind(JSON.stringify(magnets), input.consentText, now, now, existing.id).run();
  return { token: existing.unsubscribe_token, isExisting: true, resubscribed: existing.unsubscribed_at !== null };
}

/** Unsubscribe by token. True when the token matched someone. */
export async function unsubscribe(db: ListDb, token: string, now: Date = new Date()): Promise<boolean> {
  if (!/^[0-9a-f]{48}$/.test(token)) return false;
  const row = await db.prepare('SELECT id, unsubscribed_at FROM email_list WHERE unsubscribe_token = ?')
    .bind(token).first<{ id: string; unsubscribed_at: string | null }>();
  if (!row) return false;
  if (!row.unsubscribed_at) {
    const at = now.toISOString();
    await db.prepare('UPDATE email_list SET unsubscribed_at = ?, updated_at = ? WHERE id = ?').bind(at, at, row.id).run();
  }
  return true;
}

export async function markSent(db: ListDb, email: string, now: Date = new Date()): Promise<void> {
  await db.prepare('UPDATE email_list SET last_sent_at = ? WHERE email = ?').bind(now.toISOString(), normalizeEmail(email)).run();
}

/** The link people click in the footer: a page with an Unsubscribe button. */
export function unsubscribeUrl(token: string): string {
  return `${SITE_URL}/unsubscribe?token=${token}`;
}

/** The List-Unsubscribe target mail clients POST to for one-click unsubscribe. */
export function oneClickUnsubscribeUrl(token: string): string {
  return `${SITE_URL}/api/unsubscribe?token=${token}&one-click=1`;
}

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));

export interface EmailContent { subject: string; text: string; html: string }

/** Short plain emails in Dylan's voice. Paragraphs are separated by blank lines; URLs become links. */
export function composeEmail(input: { subject: string; paragraphs: string[]; unsubscribeUrl: string; postalAddress?: string }): EmailContent {
  const footerText = `You're getting this because you signed up at buoy.design.\nUnsubscribe: ${input.unsubscribeUrl}${input.postalAddress ? `\n${input.postalAddress}` : ''}`;
  const linkify = (p: string) => esc(p).replace(/https?:\/\/[^\s<]+/g, (u) => `<a href="${u}" style="color:#2563eb">${u}</a>`);
  const html = `<!doctype html><html><body style="margin:0;padding:24px 16px;background:#ffffff;color:#1f2937;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:15px;line-height:1.6"><div style="max-width:560px">${
    input.paragraphs.map((p) => `<p style="margin:0 0 16px">${linkify(p)}</p>`).join('')
  }<p style="margin:24px 0 0;font-size:12px;line-height:1.5;color:#9ca3af">You're getting this because you signed up at buoy.design. <a href="${esc(input.unsubscribeUrl)}" style="color:#9ca3af">Unsubscribe</a>${
    input.postalAddress ? `<br>${esc(input.postalAddress)}` : ''
  }</p></div></body></html>`;
  return { subject: input.subject, text: `${input.paragraphs.join('\n\n')}\n\n--\n${footerText}`, html };
}

export interface MailgunConfig { apiKey: string; domain: string; replyTo: string }

/** Send one email through Mailgun with one-click unsubscribe headers (RFC 8058). */
export async function sendViaMailgun(
  config: MailgunConfig,
  to: string,
  content: EmailContent,
  /** `oneClickUnsubscribeUrl(token)`. */
  listUnsubscribeUrl: string,
  fetchImpl: typeof fetch = fetch,
): Promise<{ ok: boolean; status: number; body: string }> {
  const form = new FormData();
  form.append('from', `Dylan at Buoy <hello@${config.domain}>`);
  form.append('to', to);
  form.append('subject', content.subject);
  form.append('text', content.text);
  form.append('html', content.html);
  form.append('h:Reply-To', config.replyTo);
  form.append('h:List-Unsubscribe', `<${listUnsubscribeUrl}>`);
  form.append('h:List-Unsubscribe-Post', 'List-Unsubscribe=One-Click');
  const response = await fetchImpl(`https://api.mailgun.net/v3/${config.domain}/messages`, {
    method: 'POST',
    headers: { Authorization: `Basic ${btoa(`api:${config.apiKey}`)}` },
    body: form,
  });
  return { ok: response.ok, status: response.status, body: await response.text() };
}
