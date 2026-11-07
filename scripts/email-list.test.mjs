// Unit tests for src/utils/email-list.ts. Run: npm run test:unit (Node 22.18+).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  composeEmail, normalizeEmail, oneClickUnsubscribeUrl, recordSignup, sendViaMailgun, unsubscribe, unsubscribeUrl,
} from '../src/utils/email-list.ts';

/** A tiny in-memory stand-in for the email_list table. */
function fakeDb() {
  const rows = [];
  const db = {
    rows,
    prepare(sql) {
      return {
        bind(...v) {
          return {
            async first() {
              // Like D1, return a copy, not the stored row.
              const copy = (r) => (r ? { ...r } : null);
              if (sql.includes('WHERE email = ?')) return copy(rows.find((r) => r.email === v[0]));
              if (sql.includes('WHERE unsubscribe_token = ?')) return copy(rows.find((r) => r.unsubscribe_token === v[0]));
              throw new Error(`unexpected first: ${sql}`);
            },
            async run() {
              if (sql.includes('INSERT INTO email_list')) {
                const [id, email, source, lead_magnets, consent_text, unsubscribe_token, created_at, updated_at, last_signup_at] = v;
                rows.push({ id, email, source, lead_magnets, consent_text, unsubscribe_token, created_at, updated_at, last_signup_at, unsubscribed_at: null, last_sent_at: null });
              } else if (sql.includes('SET lead_magnets')) {
                const r = rows.find((x) => x.id === v[4]);
                Object.assign(r, { lead_magnets: v[0], consent_text: v[1], last_signup_at: v[2], updated_at: v[3], unsubscribed_at: null });
              } else if (sql.includes('SET unsubscribed_at')) {
                Object.assign(rows.find((x) => x.id === v[2]), { unsubscribed_at: v[0], updated_at: v[1] });
              } else if (sql.includes('SET last_sent_at')) {
                Object.assign(rows.find((x) => x.email === v[1]), { last_sent_at: v[0] });
              } else throw new Error(`unexpected run: ${sql}`);
            },
          };
        },
      };
    },
  };
  return db;
}

test('a first signup is stored once, lowercased, with what they asked for', async () => {
  const db = fakeDb();
  const r = await recordSignup(db, { email: '  Ada@Example.COM ', source: 'lead-magnet', leadMagnet: 'drift-checklist', consentText: 'x' });
  assert.equal(r.isExisting, false);
  assert.match(r.token, /^[0-9a-f]{48}$/);
  assert.equal(db.rows.length, 1);
  assert.equal(db.rows[0].email, 'ada@example.com');
  assert.deepEqual(JSON.parse(db.rows[0].lead_magnets), ['drift-checklist']);
});

test('a second signup adds the new download and keeps the same unsubscribe token', async () => {
  const db = fakeDb();
  const first = await recordSignup(db, { email: 'ada@example.com', source: 'lead-magnet', leadMagnet: 'drift-checklist', consentText: 'x' });
  const second = await recordSignup(db, { email: 'ADA@example.com', source: 'lead-magnet', leadMagnet: 'token-migration', consentText: 'y' });
  assert.equal(second.isExisting, true);
  assert.equal(second.token, first.token);
  assert.equal(db.rows.length, 1);
  assert.deepEqual(JSON.parse(db.rows[0].lead_magnets), ['drift-checklist', 'token-migration']);
});

test('unsubscribe works once per token; signing up again counts as new consent', async () => {
  const db = fakeDb();
  const { token } = await recordSignup(db, { email: 'ada@example.com', source: 'waitlist', consentText: 'x' });
  assert.equal(await unsubscribe(db, 'not-a-token'), false);
  assert.equal(await unsubscribe(db, 'f'.repeat(48)), false);
  assert.equal(await unsubscribe(db, token), true);
  assert.ok(db.rows[0].unsubscribed_at);
  const again = await recordSignup(db, { email: 'ada@example.com', source: 'lead-magnet', leadMagnet: 'drift-checklist', consentText: 'y' });
  assert.equal(again.resubscribed, true);
  assert.equal(db.rows[0].unsubscribed_at, null);
});

test('emails carry an unsubscribe link, escape text, and link URLs', () => {
  const c = composeEmail({ subject: 'Your <PDF>', paragraphs: ['Here: https://buoy.design/x.pdf', 'a <b> & c'], unsubscribeUrl: unsubscribeUrl('ab'), postalAddress: '1 Main St' });
  assert.match(c.text, /Unsubscribe: https:\/\/buoy\.design\/unsubscribe\?token=ab/);
  assert.match(c.text, /1 Main St/);
  assert.match(c.html, /<a href="https:\/\/buoy\.design\/x\.pdf"/);
  assert.match(c.html, /a &lt;b&gt; &amp; c/);
  assert.doesNotMatch(c.html, /<b>/);
});

test('Mailgun gets one-click unsubscribe headers and basic auth', async () => {
  let seen;
  const fetchImpl = async (url, init) => { seen = { url, init }; return new Response('{"id":"1"}', { status: 200 }); };
  const content = composeEmail({ subject: 's', paragraphs: ['p'], unsubscribeUrl: unsubscribeUrl('ab') });
  const r = await sendViaMailgun({ apiKey: 'key', domain: 'mg.buoy.design', replyTo: 'support@buoy.design' }, 'ada@example.com', content, oneClickUnsubscribeUrl('ab'), fetchImpl);
  assert.equal(r.ok, true);
  assert.equal(seen.url, 'https://api.mailgun.net/v3/mg.buoy.design/messages');
  assert.equal(seen.init.headers.Authorization, `Basic ${btoa('api:key')}`);
  const form = seen.init.body;
  assert.equal(form.get('h:List-Unsubscribe'), '<https://buoy.design/api/unsubscribe?token=ab&one-click=1>');
  assert.equal(form.get('h:List-Unsubscribe-Post'), 'List-Unsubscribe=One-Click');
  assert.equal(form.get('h:Reply-To'), 'support@buoy.design');
});

test('normalizeEmail trims and lowercases', () => {
  assert.equal(normalizeEmail(' A@B.Co '), 'a@b.co');
});
