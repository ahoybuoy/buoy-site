#!/usr/bin/env node
/**
 * Tell IndexNow engines (Bing, Yandex, Seznam, Naver; Bing also feeds ChatGPT
 * search) that pages changed, so they are recrawled in hours, not weeks.
 *
 *   node scripts/indexnow.mjs                 # every URL in the built sitemap
 *   node scripts/indexnow.mjs /scan/ /guides/ # just these paths
 *
 * The key file lives in public/<key>.txt; IndexNow checks it before accepting.
 */
import { readFileSync, readdirSync } from 'node:fs';

const HOST = 'buoy.design';
const keyFile = readdirSync(new URL('../public/', import.meta.url)).find((f) => /^[0-9a-f]{32}\.txt$/.test(f));
if (!keyFile) throw new Error('No IndexNow key file in public/');
const key = keyFile.replace('.txt', '');

const args = process.argv.slice(2);
const urls = args.length
  ? args.map((p) => `https://${HOST}${p.startsWith('/') ? p : `/${p}`}`)
  : [...readFileSync(new URL('../dist/sitemap-0.xml', import.meta.url), 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);

const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host: HOST, key, keyLocation: `https://${HOST}/${keyFile}`, urlList: urls.slice(0, 10000) }),
});
console.log(`IndexNow: ${res.status} for ${urls.length} URL(s)`);
if (res.status >= 400) process.exit(1);
