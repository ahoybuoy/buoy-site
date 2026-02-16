import { test, expect } from '@playwright/test';

const seoPages = [
  { url: '/', titleContains: 'Buoy' },
  { url: '/pricing', titleContains: 'Pricing' },
  { url: '/docs', titleContains: 'Docs' },
  { url: '/features/drift-detection', titleContains: 'Drift' },
];

test.describe('SEO meta tags', () => {
  for (const { url, titleContains } of seoPages) {
    test(`${url} has proper meta tags`, async ({ page }) => {
      await page.goto(url, { waitUntil: 'domcontentloaded' });

      // Title contains expected text
      const title = await page.title();
      expect(title.toLowerCase()).toContain(titleContains.toLowerCase());

      // Meta description is present and >20 chars
      const description = await page.locator('meta[name="description"]').getAttribute('content');
      expect(description).toBeTruthy();
      expect(description!.length).toBeGreaterThan(20);

      // OG tags present
      await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', /.+/);
      await expect(page.locator('meta[property="og:description"]')).toHaveAttribute('content', /.+/);
      await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /.+/);
    });
  }
});
