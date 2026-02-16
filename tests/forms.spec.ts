import { test, expect } from '@playwright/test';

test.describe('Lead magnet form', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/drift-checklist', { waitUntil: 'domcontentloaded' });
  });

  test('successful submission shows success message', async ({ page }) => {
    await page.route('**/api/subscribe', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Subscribed!' }),
      })
    );

    // Page has two instances of the form; target the first
    const form = page.locator('#lead-form-drift-checklist').first();
    await form.locator('input[name="email"]').fill('test@example.com');
    await form.locator('button[type="submit"]').click();

    await expect(page.locator('#lead-form-drift-checklist-success').first()).toBeVisible();
    await expect(form).toBeHidden();
  });

  test('failed submission shows error message', async ({ page }) => {
    await page.route('**/api/subscribe', (route) =>
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Server error' }),
      })
    );

    const form = page.locator('#lead-form-drift-checklist').first();
    await form.locator('input[name="email"]').fill('test@example.com');
    await form.locator('button[type="submit"]').click();

    await expect(page.locator('#lead-form-drift-checklist-error').first()).toBeVisible();
  });

  test('email field has required and type=email validation', async ({ page }) => {
    const emailInput = page.locator('#lead-form-drift-checklist input[name="email"]').first();
    await expect(emailInput).toHaveAttribute('required', '');
    await expect(emailInput).toHaveAttribute('type', 'email');
  });
});

test.describe('Support form', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/support', { waitUntil: 'domcontentloaded' });
  });

  test('successful submission shows success status', async ({ page }) => {
    await page.route('**/api/support', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Message sent successfully' }),
      })
    );

    await page.locator('#name').fill('Test User');
    await page.locator('#email').fill('test@example.com');
    await page.locator('#subject').selectOption('general');
    await page.locator('#message').fill('Hello, this is a test message.');
    await page.locator('#support-form button[type="submit"]').click();

    await expect(page.locator('#form-status')).toBeVisible();
    await expect(page.locator('#form-status')).toContainText('Message sent');
  });

  test('button shows Sending... during submission', async ({ page }) => {
    await page.route('**/api/support', async (route) => {
      // Delay response to observe loading state
      await new Promise((r) => setTimeout(r, 500));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Sent' }),
      });
    });

    await page.locator('#name').fill('Test User');
    await page.locator('#email').fill('test@example.com');
    await page.locator('#subject').selectOption('general');
    await page.locator('#message').fill('Test');

    const submitBtn = page.locator('#support-form button[type="submit"]');
    await submitBtn.click();

    await expect(submitBtn).toContainText('Sending...');
    await expect(submitBtn).toBeDisabled();
  });
});
