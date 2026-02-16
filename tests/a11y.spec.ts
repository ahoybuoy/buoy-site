import { test, expect } from '@playwright/test';

test.describe('Accessibility basics', () => {
  test('homepage has exactly 1 h1', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const h1s = page.locator('h1');
    await expect(h1s).toHaveCount(1);
  });

  test('all images have alt text', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const images = page.locator('img');
    const count = await images.count();

    for (let i = 0; i < count; i++) {
      const alt = await images.nth(i).getAttribute('alt');
      expect(alt, `Image ${i} missing alt attribute`).not.toBeNull();
    }
  });

  test('nav landmark exists on homepage', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('nav')).toBeVisible();
  });

  test('docs pages have main and article landmarks', async ({ page }) => {
    await page.goto('/docs', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('article')).toBeVisible();
  });
});
