import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('landing page loads', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /careerlens/i })).toBeVisible();
  });

  test('login link works', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /log in/i }).first().click();
    await expect(page).toHaveURL(/\/login/);
  });

  test('register link works', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /get started/i }).first().click();
    await expect(page).toHaveURL(/\/register/);
  });

  test('404 page for unknown routes', async ({ page }) => {
    await page.goto('/nonexistent-route');
    await expect(page.getByText(/not found/i)).toBeVisible();
  });
});
