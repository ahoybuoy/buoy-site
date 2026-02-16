import { test, expect } from '@playwright/test';
import { allPages } from './fixtures/pages';

test.describe('Smoke tests — all pages load', () => {
  for (const url of allPages) {
    test(`${url} returns 200 with title and nav`, async ({ page }) => {
      const errors: string[] = [];
      page.on('pageerror', (err) => errors.push(err.message));

      const response = await page.goto(url, { waitUntil: 'domcontentloaded' });

      expect(response?.status()).toBe(200);
      await expect(page.locator('title')).not.toBeEmpty();
      await expect(page.locator('nav').first()).toBeVisible();
      expect(errors).toEqual([]);
    });
  }
});
