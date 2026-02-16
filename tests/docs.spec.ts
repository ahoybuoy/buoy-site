import { test, expect } from '@playwright/test';

const sidebarSections = [
  'Getting Started',
  'GitHub App',
  'buoy dock',
  'buoy drift',
  'buoy show',
  'AI Integration',
  'Concepts',
];

test.describe('Docs sidebar — desktop', () => {
  test.skip(({ isMobile }) => isMobile, 'Desktop-only tests');
  test.use({ viewport: { width: 1280, height: 720 } });

  test('sidebar shows all sections', async ({ page }) => {
    await page.goto('/docs', { waitUntil: 'domcontentloaded' });

    const sidebar = page.locator('aside').first();
    for (const section of sidebarSections) {
      await expect(sidebar.getByText(section, { exact: true })).toBeVisible();
    }
  });

  test('active page is highlighted', async ({ page }) => {
    await page.goto('/docs/installation', { waitUntil: 'domcontentloaded' });

    const activeLink = page.locator('aside a[href="/docs/installation"]').first();
    await expect(activeLink).toHaveClass(/bg-buoy/);
  });

  test('sidebar links navigate correctly', async ({ page }) => {
    await page.goto('/docs', { waitUntil: 'domcontentloaded' });

    await page.locator('aside a[href="/docs/installation"]').first().click();
    await expect(page).toHaveURL(/\/docs\/installation/);
  });
});

test.describe('Docs sidebar — mobile', () => {
  test.skip(({ isMobile }) => !isMobile, 'Mobile-only tests');

  test('toggle button opens mobile sidebar', async ({ page }) => {
    await page.goto('/docs', { waitUntil: 'domcontentloaded' });

    const toggle = page.locator('#docs-sidebar-toggle');
    const sidebar = page.locator('#docs-mobile-sidebar');

    await expect(sidebar).toBeHidden();
    await toggle.click();
    await expect(sidebar).toBeVisible();
  });

  test('backdrop closes mobile sidebar', async ({ page }) => {
    await page.goto('/docs', { waitUntil: 'domcontentloaded' });

    await page.locator('#docs-sidebar-toggle').click();
    const sidebar = page.locator('#docs-mobile-sidebar');
    await expect(sidebar).toBeVisible();

    // Click the left edge of the backdrop (not covered by the sidebar aside)
    await page.locator('#docs-sidebar-backdrop').click({ position: { x: 10, y: 200 } });
    await expect(sidebar).toBeHidden();
  });
});
