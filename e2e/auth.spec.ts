import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should load the home page', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL('/');
  });

  test('should navigate to login page', async ({ page }) => {
    await page.goto('/');
    // This test will be expanded when login functionality is fully implemented
    await expect(page).toHaveURL('/');
  });
});

