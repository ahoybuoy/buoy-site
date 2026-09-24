// @ts-check
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://buoy.design',
  adapter: cloudflare(),
  integrations: [
    react(),
    // Indexable pages only: no API routes, downloads, on-demand scan results or 404.
    sitemap({
      filter: (page) => !/\/(api|downloads)\//.test(page) && !/\/scan\/[^/]+\/[^/]+/.test(page) && !page.endsWith('/404/'),
    }),
  ],
  vite: {
    plugins: [tailwindcss()]
  }
});