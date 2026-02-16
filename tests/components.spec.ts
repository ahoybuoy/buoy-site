import { test, expect } from '@playwright/test';

test.describe('Copy buttons', () => {
  test('homepage copy command swaps icon on click', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const copyBtn = page.locator('.copy-command .copy-btn').first();
    await expect(copyBtn).toBeVisible();

    // Before click: copy icon visible, no checkmark
    await expect(copyBtn.locator('.copy-icon')).toBeVisible();

    await copyBtn.click();

    // After click: checkmark path appears
    await expect(copyBtn.locator('svg path[d="M5 13l4 4L19 7"]')).toBeVisible();
  });
});

test.describe('Pricing page', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/installs', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ installs: 5, remaining: 95, maxSpots: 100 }),
      })
    );
    await page.goto('/pricing', { waitUntil: 'domcontentloaded' });
  });

  test('3 pricing tiers are visible', async ({ page }) => {
    const cards = page.locator('section .grid.md\\:grid-cols-3 > div');
    await expect(cards).toHaveCount(3);

    await expect(cards.nth(0)).toContainText('Free');
    await expect(cards.nth(1)).toContainText('Pro');
    await expect(cards.nth(2)).toContainText('Done For You');
  });

  test('FAQ details open and close', async ({ page }) => {
    const faq = page.locator('details.group').first();
    const content = faq.locator('div');

    // Initially closed
    await expect(faq).not.toHaveAttribute('open', '');

    // Open
    await faq.locator('summary').click();
    await expect(faq).toHaveAttribute('open', '');
    await expect(content).toBeVisible();

    // Close
    await faq.locator('summary').click();
    await expect(faq).not.toHaveAttribute('open', '');
  });
});
