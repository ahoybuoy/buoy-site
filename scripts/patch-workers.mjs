/**
 * Post-build patch: inject MessageChannel polyfill into the Astro renderers chunk.
 * react-dom/server uses MessageChannel which isn't available in Cloudflare Workers.
 */
import { readdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const POLYFILL = `if(typeof MessageChannel==="undefined"){globalThis.MessageChannel=class{constructor(){this.port1={onmessage:null};this.port2={postMessage:(d)=>{if(this.port1.onmessage)this.port1.onmessage({data:d})}}}}};\n`;

const chunksDir = join('dist', '_worker.js', 'chunks');
try {
  const files = readdirSync(chunksDir).filter(f => f.includes('astro-renderers'));
  for (const file of files) {
    const path = join(chunksDir, file);
    const content = readFileSync(path, 'utf8');
    if (!content.startsWith('if(typeof MessageChannel')) {
      writeFileSync(path, POLYFILL + content);
      console.log(`Patched ${file} with MessageChannel polyfill`);
    }
  }
} catch (e) {
  // No renderers chunk = no React SSR = nothing to patch
}
