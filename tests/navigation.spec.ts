import { test, expect } from '@playwright/test';

test.describe('Desktop navigation', () => {
  test.skip(({ isMobile }) => isMobile, 'Desktop-only tests');
  test.use({ viewport: { width: 1280, height: 720 } });

  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
  });

  test('logo links to homepage', async ({ page }) => {
    const logo = page.locator('nav a[href="/"]').first();
    await expect(logo).toBeVisible();
    await expect(logo).toHaveAttribute('href', '/');
  });

  test('Features dropdown opens on hover and contains expected link', async ({ page }) => {
    const trigger = page.locator('nav .relative.group').filter({ hasText: 'Features' });
    const dropdown = trigger.locator('.absolute');

    await expect(dropdown).not.toBeVisible();
    await trigger.hover();
    await expect(dropdown).toBeVisible();
    await expect(dropdown.locator('a[href="/features/drift-detection"]')).toBeVisible();
  });

  test('Integrations dropdown opens on hover and contains expected link', async ({ page }) => {
    const trigger = page.locator('nav .relative.group').filter({ hasText: 'Integrations' });
    const dropdown = trigger.locator('.absolute');

    await trigger.hover();
    await expect(dropdown).toBeVisible();
    await expect(dropdown.locator('a[href="/integrations/react"]')).toBeVisible();
  });

  test('Use Cases dropdown opens on hover and contains expected link', async ({ page }) => {
    const trigger = page.locator('nav .relative.group').filter({ hasText: 'Use Cases' });
    const dropdown = trigger.locator('.absolute');

    await trigger.hover();
    await expect(dropdown).toBeVisible();
    await expect(dropdown.locator('a[href="/one-command"]')).toBeVisible();
  });

  test('Compare dropdown opens on hover and contains expected link', async ({ page }) => {
    const trigger = page.locator('nav .relative.group').filter({ hasText: 'Compare' });
    const dropdown = trigger.locator('.absolute');

    await trigger.hover();
    await expect(dropdown).toBeVisible();
    await expect(dropdown.locator('a[href="/compare/llm-code-review"]')).toBeVisible();
  });

  test('Docs and Pricing are direct links', async ({ page }) => {
    const desktopNav = page.locator('.hidden.md\\:flex');
    await expect(desktopNav.locator('a[href="/docs"]')).toBeVisible();
    await expect(desktopNav.locator('a[href="/pricing"]')).toBeVisible();
  });

  test('Get Started CTA is visible', async ({ page }) => {
    await expect(page.locator('nav a[href="/demo"]').first()).toBeVisible();
  });
});

test.describe('Mobile navigation', () => {
  test.skip(({ isMobile }) => !isMobile, 'Mobile-only tests');

  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
  });

  test('mobile menu button toggles menu visibility', async ({ page }) => {
    const button = page.locator('#mobile-menu-button');
    const menu = page.locator('#mobile-menu');

    await expect(menu).toBeHidden();
    await button.click();
    await expect(menu).toBeVisible();
    await button.click();
    await expect(menu).toBeHidden();
  });

  test('mobile menu shows section headers and links', async ({ page }) => {
    await page.locator('#mobile-menu-button').click();
    const menu = page.locator('#mobile-menu');

    await expect(menu).toBeVisible();
    await expect(menu.getByText('Features', { exact: true })).toBeVisible();
    await expect(menu.getByText('Integrations', { exact: true })).toBeVisible();
    await expect(menu.getByText('Use Cases', { exact: true })).toBeVisible();
    await expect(menu.getByText('Compare', { exact: true })).toBeVisible();
    await expect(menu.locator('a[href="/docs"]')).toBeVisible();
    await expect(menu.locator('a[href="/pricing"]')).toBeVisible();
  });
});

test.describe('Footer', () => {
  test('contains key links', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const footer = page.locator('footer');

    await expect(footer.locator('a[href="/privacy"]')).toBeVisible();
    await expect(footer.locator('a[href="/terms"]')).toBeVisible();
    await expect(footer.locator('a[href="/support"]')).toBeVisible();
  });
});
